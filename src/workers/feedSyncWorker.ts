import fs from 'fs/promises';
import path from 'path';

interface UpfrontPrice {
  price: number;
  conditions: string;
  url?: string;
}

interface Smartphone {
  id: string;
  brand: string;
  model: string;
  price: number;
  storage: string;
  image?: string;
  colors?: string[];
  upfrontPrices?: {
    [provider: string]: UpfrontPrice;
  };
}

interface PriceConfig {
  field: string;
  suffix?: string;
}

interface ProviderPriceConfig {
  price: PriceConfig;
  conditions: PriceConfig;
  url?: PriceConfig;
}

interface UpfrontPriceMapping {
  [provider: string]: ProviderPriceConfig;
}

interface FieldTransform {
  field: string;
  transform?: string | string[];
}

interface FieldMappings {
  [key: string]: string | FieldTransform | { [key: string]: any } | UpfrontPriceMapping;
}

interface FeedMapping {
  format: string;
  rootPath?: string;
  idMapping: {
    fields: string[];
    separator: string;
    normalize: boolean;
    transformers?: {
      [key: string]: string | string[];
    };
  };
  fieldMappings: FieldMappings;
}

interface ProviderConfig {
  [provider: string]: FeedMapping;
}

type TransformerFunction = (value: any) => any;

interface Transformers {
  [key: string]: TransformerFunction;
}

export class FeedSyncWorker {
  private config: ProviderConfig;
  private readonly smartphonesPath: string;
  private readonly CHUNK_SIZE = 100;
  private readonly transformers: Transformers;

  constructor() {
    this.smartphonesPath = path.join(__dirname, '../data/smartphones.json');
    this.config = {};
    this.transformers = {
      extractNumericStorage: this.extractNumericStorage.bind(this),
      generateVooUrl: this.generateVooUrl.bind(this),
      price: this.transformPrice.bind(this),
      removeGoSuffix: this.removeGoSuffix.bind(this)
    };
  }

  private async loadConfig() {
    const configPath = path.join(__dirname, '../config/feedMappings.json');
    const configContent = await fs.readFile(configPath, 'utf-8');
    this.config = JSON.parse(configContent).providers;
  }

  private extractNumericStorage(value: any): string {
    if (value === undefined || value === null) return '';
    
    // Convertir en chaîne pour faciliter l'extraction
    const stringValue = String(value).toLowerCase();
    
    // Extraire le nombre de Go/GB
    const numMatch = stringValue.match(/(\d+)\s*(?:go|gb)/i);
    
    if (numMatch) {
      return numMatch[1];  // Retourne uniquement le nombre
    }
    
    // Si aucun format Go/GB n'est trouvé, essayer d'extraire un nombre
    const fallbackMatch = stringValue.match(/(\d+)/);
    
    if (fallbackMatch) {
      return fallbackMatch[1];
    }
    
    return '';
  }

  private generateVooUrl(baseProductCode: string): string {
    return `https://www.voo.be/fr/mobile/smartphones/${baseProductCode}`;
  }

  private transformPrice(value: any): number {
    return parseFloat(value) || 0;
  }

  private removeGoSuffix(value: any): string {
    if (Array.isArray(value)) {
      return value[0].replace(/-go$/, '');
    }
    return value.replace(/-go$/, '');
  }

  private transformValue(value: any, transform?: string | string[]): any {
    if (!transform) return value;

    const transforms = Array.isArray(transform) ? transform : [transform];
    
    return transforms.reduce((result, currentTransform) => {
      switch (currentTransform) {
        case 'toLowerCase':
          return typeof result === 'string' ? result.toLowerCase() : result;
        case 'extractBaseModel':
          if (typeof result !== 'string') return result;
          // Remove variants and storage info from model name
          return result.replace(/\s*\([^)]*\)/g, '').trim();
        case 'extractNumericStorage':
          if (typeof result !== 'string') return result;
          const match = result.match(/(\d+)\s*(?:GB|Go)/i);
          return match ? `${match[1]} GB` : result;
        case 'brand':
          return typeof result === 'string' ? result.trim() : result;
        case 'model':
          return typeof result === 'string' ? result.trim() : result;
        case 'storage':
          if (typeof result !== 'string') return result;
          const storageMatch = result.match(/(\d+)\s*(?:GB|Go)/i);
          return storageMatch ? `${storageMatch[1]} GB` : result;
        case 'generateVooUrl':
          return this.generateVooUrl(result);
        case 'price':
          return this.transformPrice(result);
        case 'removeGoSuffix':
          return this.removeGoSuffix(result);
        default:
          return result;
      }
    }, value);
  }

  private generateId(data: any, mapping: FeedMapping): string {
    const { fields, separator, transformers } = mapping.idMapping;
    
    const values = fields.map(field => {
      let value = this.getNestedValue(data, field);
      if (transformers && transformers[field]) {
        value = this.transformValue(value, transformers[field]);
      }
      return value;
    });

    // Filter out undefined values and join with separator
    const id = values.filter(v => v !== undefined).join(separator);
    
    // Remove special characters and normalize spaces
    return id.toLowerCase()
             .replace(/[^\w\s-]/g, '')
             .replace(/\s+/g, '-')
             .replace(/-+/g, '-')
             .replace(/^-+|-+$/g, '');
  }

  private getNestedValue(obj: any, path: string): any {
    if (!obj) return undefined;
    if (path.includes('[')) {
      const [arrayPath, indexStr] = path.split('[');
      const index = parseInt(indexStr);
      const array = arrayPath.split('.').reduce((current, key) => current?.[key], obj);
      return array?.[index];
    }
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      current[key] = current[key] || {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  private async* readJsonStream(filePath: string, mapping: FeedMapping): AsyncGenerator<any> {
    console.log(`Lecture du fichier: ${filePath}`);
    const fileStream = require('fs').createReadStream(filePath, { encoding: 'utf-8' });
    const rl = require('readline').createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let buffer = '';
    let inArray = false;
    let bracketCount = 0;
    let itemCount = 0;
    let rootPath = mapping.rootPath || '';

    // Lire tout le fichier en mémoire pour les petits fichiers
    const content = await fs.readFile(filePath, 'utf-8');
    
    try {
      // Essayer de parser le fichier entier
      const data = JSON.parse(content);
      
      // Si c'est un tableau
      if (Array.isArray(data)) {
        for (const item of data) {
          itemCount++;
          if (itemCount % 10 === 0) {
            console.log(`Traité ${itemCount} éléments`);
          }
          yield item;
        }
      }
      // Si c'est un objet avec un rootPath
      else if (rootPath) {
        // Extraire les données en suivant le chemin
        let items = data;
        const pathParts = rootPath.split('.');
        for (const part of pathParts) {
          // Gérer les tableaux avec index
          if (part.includes('[') && part.includes(']')) {
            const [arrayName, indexStr] = part.split('[');
            const index = parseInt(indexStr.replace(']', ''));
            items = items[arrayName][index];
          } else {
            items = items[part];
          }
          if (!items) {
            console.log(`Chemin ${rootPath} non trouvé dans le fichier`);
            return;
          }
        }

        // Vérifier si on a un tableau
        if (Array.isArray(items)) {
          for (const item of items) {
            itemCount++;
            if (itemCount % 10 === 0) {
              console.log(`Traité ${itemCount} éléments`);
            }
            yield item;
          }
        } else {
          console.log(`Les données à ${rootPath} ne sont pas un tableau`);
          return;
        }
      }
      
      console.log(`Total d'éléments lus: ${itemCount}`);
      return;
    } catch (error) {
      console.log(`Erreur lors du parsing du fichier entier: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.log('Tentative de parsing ligne par ligne...');
    }

    // Si le parsing du fichier entier a échoué, on essaie ligne par ligne
    for await (const line of rl) {
      const trimmedLine = line.trim();
      
      // Si on a un rootPath, on attend de le trouver
      if (rootPath && !inArray && trimmedLine.includes(`"${rootPath}"`)) {
        inArray = true;
        continue;
      }
      
      // Si pas de rootPath, on commence dès qu'on trouve un tableau
      if (!rootPath && !inArray && trimmedLine.startsWith('[')) {
        inArray = true;
      }

      if (!inArray) continue;

      // Ignorer les lignes qui ne font pas partie des données
      if (trimmedLine.startsWith('"facets"') || trimmedLine.startsWith('"paginationData"')) {
        break;
      }

      buffer += line;

      // Compter les accolades ouvrantes et fermantes
      for (const char of line) {
        if (char === '{') bracketCount++;
        if (char === '}') bracketCount--;
      }

      // Si nous avons un objet complet
      if (bracketCount === 0 && buffer.trim()) {
        try {
          // Nettoyer le buffer des virgules trailing et crochets
          let cleanBuffer = buffer.trim()
            .replace(/,\s*$/, '')
            .replace(/^\[/, '')
            .replace(/\]$/, '')
            .replace(/,$/, '');

          if (cleanBuffer && cleanBuffer !== '{' && !cleanBuffer.includes('"facets"')) {
            const obj = JSON.parse(cleanBuffer);
            itemCount++;
            if (itemCount % 10 === 0) {
              console.log(`Traité ${itemCount} éléments`);
            }
            yield obj;
          }
        } catch (error) {
          console.log(`Erreur lors du parsing d'un objet: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        buffer = '';
        bracketCount = 0;
      }
    }

    console.log(`Total d'éléments lus: ${itemCount}`);
  }

  private async transformProviderData(providerData: any, mapping: FeedMapping): Promise<Smartphone> {
    const smartphone: Smartphone = {
      id: this.generateId(providerData, mapping),
      brand: '',
      model: '',
      storage: '',
      price: 0,
      upfrontPrices: {}
    };

    // Parcourir tous les champs définis dans le mapping
    for (const [field, sourceField] of Object.entries(mapping.fieldMappings)) {
      if (field === 'upfrontPrices') continue; // Géré séparément

      let value;
      if (typeof sourceField === 'string') {
        value = this.getNestedValue(providerData, sourceField);
      } else if (sourceField && typeof sourceField === 'object' && 'field' in sourceField) {
        const fieldTransform = sourceField as FieldTransform;
        value = this.getNestedValue(providerData, fieldTransform.field);
        
        // Appliquer le transformateur si défini
        if (fieldTransform.transform) {
          value = this.transformValue(value, fieldTransform.transform);
        }

        // Ajouter le suffixe si défini
        if ('suffix' in sourceField && sourceField.suffix && value !== undefined) {
          value = `${value}${sourceField.suffix}`;
        }
      }

      // Gérer les cas spéciaux
      if (field === 'colors' && value) {
        // Si c'est une chaîne unique, la convertir en tableau
        value = Array.isArray(value) ? value : [value];
      } else if (field === 'price' && value) {
        // S'assurer que le prix est un nombre
        value = parseFloat(value) || 0;
      } else if (field === 'storage' && value) {
        // Normaliser le stockage en format "XX GB"
        const storageNum = parseInt(value.toString());
        if (!isNaN(storageNum)) {
          value = `${storageNum} GB`;
        }
      }

      if (value !== undefined) {
        this.setNestedValue(smartphone, field, value);
      }
    }

    // Gérer les prix spécifiques aux providers
    const upfrontPriceMapping = mapping.fieldMappings.upfrontPrices as UpfrontPriceMapping;
    if (upfrontPriceMapping) {
      for (const [provider, priceConfig] of Object.entries(upfrontPriceMapping)) {
        const upfrontPrice: UpfrontPrice = {
          price: 0,
          conditions: ''
        };

        // Prix
        if (priceConfig.price) {
          let priceValue = this.getNestedValue(providerData, priceConfig.price.field);
          if (priceValue !== undefined) {
            upfrontPrice.price = parseFloat(priceValue) || 0;
          }
        }

        // Conditions
        if (priceConfig.conditions) {
          let conditionsValue = this.getNestedValue(providerData, priceConfig.conditions.field);
          if (conditionsValue !== undefined) {
            upfrontPrice.conditions = `${conditionsValue}${priceConfig.conditions.suffix || ''}`;
          }
        }

        // URL
        if (priceConfig.url) {
          let urlValue = this.getNestedValue(providerData, priceConfig.url.field);
          if (urlValue !== undefined) {
            upfrontPrice.url = urlValue.toString();
          }
        }

        if (!smartphone.upfrontPrices) {
          smartphone.upfrontPrices = {};
        }
        smartphone.upfrontPrices[provider] = upfrontPrice;
      }
    }

    // Validation finale
    if (!smartphone.brand || !smartphone.model) {
      throw new Error(`Invalid smartphone data: missing brand or model for ID ${smartphone.id}`);
    }

    return smartphone;
  }

  private async processProviderChunk(
    chunk: any[],
    mapping: FeedMapping,
    smartphonesMap: Map<string, Smartphone>,
    provider: string
  ) {
    let updatedCount = 0;
    let newCount = 0;
    let errorCount = 0;

    for (const item of chunk) {
      try {
        const transformed = await this.transformProviderData(item, mapping);
        console.log(`Traitement de: ${transformed.brand} ${transformed.model} (${transformed.storage})`);
        
        if (smartphonesMap.has(transformed.id)) {
          // Mettre à jour les données existantes
          const existing = smartphonesMap.get(transformed.id) as Smartphone;
          const updatedUpfrontPrices = {
            ...existing.upfrontPrices
          };

          if (transformed.upfrontPrices?.[provider]) {
            updatedUpfrontPrices[provider] = transformed.upfrontPrices[provider];
          }

          smartphonesMap.set(transformed.id, {
            ...existing,
            ...transformed,
            upfrontPrices: updatedUpfrontPrices
          });
          updatedCount++;
        } else {
          // Ajouter un nouveau smartphone
          const upfrontPrices: { [key: string]: UpfrontPrice } = {};
          if (transformed.upfrontPrices?.[provider]) {
            upfrontPrices[provider] = transformed.upfrontPrices[provider];
          }

          smartphonesMap.set(transformed.id, {
            ...transformed,
            upfrontPrices
          });
          newCount++;
        }
      } catch (error) {
        console.error(`Erreur lors de la transformation d'un élément:`, error);
        console.error('Données source:', JSON.stringify(item, null, 2));
        errorCount++;
      }
    }

    console.log(`Résultats du chunk:
    - Mis à jour: ${updatedCount}
    - Nouveaux: ${newCount}
    - Erreurs: ${errorCount}`);
  }

  public getProviderMapping(provider: string): FeedMapping {
    const config = require('../config/feedMappings.json');
    return config.providers[provider];
  }

  public async syncFeeds() {
    try {
      await this.loadConfig();
      
      // Charger les smartphones existants
      const existingData = JSON.parse(
        await fs.readFile(this.smartphonesPath, 'utf-8')
      ) as { smartphones: Smartphone[] };

      // Créer un Map pour un accès rapide par ID
      const smartphonesMap = new Map(
        existingData.smartphones.map(phone => [phone.id, phone])
      );

      // Pour chaque provider
      for (const [provider, mapping] of Object.entries(this.config)) {
        try {
          console.log(`Traitement du provider ${provider}...`);
          let currentChunk: any[] = [];
          
          // Lire le fichier en streaming
          for await (const item of this.readJsonStream(path.join(__dirname, `../data/${provider}.json`), mapping)) {
            currentChunk.push(item);
            
            // Traiter le chunk quand il atteint la taille maximale
            if (currentChunk.length >= this.CHUNK_SIZE) {
              await this.processProviderChunk(currentChunk, mapping, smartphonesMap, provider);
              console.log(`Traité ${currentChunk.length} éléments de ${provider}`);
              currentChunk = [];
            }
          }
          
          // Traiter le dernier chunk s'il reste des éléments
          if (currentChunk.length > 0) {
            await this.processProviderChunk(currentChunk, mapping, smartphonesMap, provider);
            console.log(`Traité les ${currentChunk.length} derniers éléments de ${provider}`);
          }
          
        } catch (error) {
          console.error(`Erreur lors du traitement du provider ${provider}:`, error);
        }
      }

      // Sauvegarder les données mises à jour
      await fs.writeFile(
        this.smartphonesPath,
        JSON.stringify({ smartphones: Array.from(smartphonesMap.values()) }, null, 2)
      );

      console.log('Synchronisation terminée avec succès');
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      throw error;
    }
  }

  public async syncSmartphones() {
    const providers = ['orange', 'proximus', 'voo'];
    const dataPath = path.join(__dirname, '../data');
    let existingData: Smartphone[] = [];
    try {
      const existingFileData = await fs.readFile(this.smartphonesPath, 'utf-8');
      existingData = JSON.parse(existingFileData).smartphones || [];
    } catch (error) {
      console.warn('Could not read existing smartphones data:', error);
    }

    const smartphonesMap = new Map<string, Smartphone>();
    existingData.forEach(smartphone => smartphonesMap.set(smartphone.id, smartphone));

    for (const provider of providers) {
      console.log(`\nProcessing provider: ${provider}`);
      const filePath = path.join(dataPath, `${provider}.json`);
      const providerData = await fs.readFile(filePath, 'utf-8');
      const parsedData = JSON.parse(providerData);
      const mapping = this.getProviderMapping(provider);
      
      // Obtenir les données des smartphones en fonction de la structure du provider
      let smartphonesData;
      if (mapping.rootPath) {
        console.log(`Using rootPath: ${mapping.rootPath}`);
        const pathParts = mapping.rootPath.split('.');
        let currentData = parsedData;
        
        for (const part of pathParts) {
          if (part.includes('[') && part.includes(']')) {
            const [arrayName, indexStr] = part.split('[');
            const index = parseInt(indexStr.replace(']', ''));
            currentData = currentData[arrayName][index];
          } else {
            currentData = currentData[part];
          }
          
          if (!currentData) {
            console.error(`Could not find data at path ${part} in ${mapping.rootPath}`);
            break;
          }
        }
        smartphonesData = currentData;
      } else {
        smartphonesData = parsedData;
      }

      if (!Array.isArray(smartphonesData)) {
        console.error(`Invalid data structure for provider ${provider}. Expected array, got:`, typeof smartphonesData);
        console.error('Available keys:', Object.keys(parsedData));
        continue;
      }

      console.log(`Found ${smartphonesData.length} items for ${provider}`);

      for (const item of smartphonesData) {
        try {
          const transformedPhone = await this.transformProviderData(item, mapping);
          const existingPhone = smartphonesMap.get(transformedPhone.id);

          if (existingPhone) {
            // Update existing phone
            smartphonesMap.set(transformedPhone.id, {
              ...existingPhone,
              ...transformedPhone,
              upfrontPrices: {
                ...existingPhone.upfrontPrices,
                ...transformedPhone.upfrontPrices
              }
            });
          } else {
            // Add new phone
            smartphonesMap.set(transformedPhone.id, transformedPhone);
          }
        } catch (error) {
          console.error(`Error processing item from ${provider}:`, error);
          if (error instanceof Error) {
            console.error('Error details:', error.message);
          }
          console.error('Problematic item:', JSON.stringify(item, null, 2));
          continue;
        }
      }
    }

    // Écrire le résultat dans smartphones.json
    const outputPath = path.join(dataPath, 'smartphones.json');
    await fs.writeFile(outputPath, JSON.stringify({ smartphones: Array.from(smartphonesMap.values()) }, null, 2));

    console.log('\nSynchronisation des smartphones terminée avec succès');
    console.log(`Total smartphones: ${smartphonesMap.size}`);
  }
}

// Exécuter le worker
const feedSyncWorker = new FeedSyncWorker();
feedSyncWorker.syncSmartphones().catch(console.error);
