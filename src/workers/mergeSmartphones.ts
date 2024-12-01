import fs from 'fs';
import path from 'path';

interface ProximusPhone {
    id: string;
    title: string;
    brand: string;
    model: string;
    capacity: string;
    price_jo: string;
    info_dp: string;
    link: string;
    image_link: string;
    // ... autres champs
}

interface VooPhone {
    code: string;
    baseProductCode: string;
    name: string;
    priceAlteration: number;
    dataOption: string;
    optionPrice: string;
    // ... autres champs
}

interface OrangePhone {
    objectID: string;
    description: string;
    hardDisk: number;
    priceRecurringInitial: number;
    priceRecurringQuota: number;
    href: string;
    // ... autres champs
}

interface SmartphoneData {
    id: string;
    brand: string;
    model: string;
    storage: number;
    imageUrl: string;
    upfrontPrices: {
        proximus?: {
            price: number;
            condition?: string;
            url?: string;
        };
        voo?: {
            price: number;
            condition?: string;
            url?: string;
        };
        orange?: {
            price: number;
            condition?: string;
            url?: string;
        };
    };
}

function normalizeString(str: string | null | undefined): string {
    if (!str) return '';
    return str.toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, ' ')
        .trim()
        .replace(/\s+/g, '-');
}

function extractStorage(title: string): number {
    const tbMatch = title.match(/(\d+)\s*(?:TB|To)/i);
    if (tbMatch) {
        return parseInt(tbMatch[1]) * 1024; // Convertir TB en GB
    }
    const gbMatch = title.match(/(\d+)\s*(?:GB|go|Go)/i);
    return gbMatch ? parseInt(gbMatch[1]) : 0;
}

function cleanModel(model: string): string {
    return model
        .replace(/\d+\s*(?:GB|go|Go)/gi, '') // Enlever les mentions de stockage
        .replace(/\s+/g, ' ')                 // Normaliser les espaces
        .replace(/\([^)]*\)/g, '')            // Enlever les parenthèses et leur contenu
        .replace(/\+[^+]*$/g, '')             // Enlever tout ce qui suit un +
        .trim();
}

function extractBrandAndModel(title: string): { brand: string, model: string } {
    const parts = title.split(' ').filter(p => p.trim() !== '');
    const brand = parts[0];
    
    // Trouver l'index où commence la capacité de stockage
    let storageIndex = parts.findIndex(p => p.match(/\d+\s*(?:GB|go|Go)/i));
    if (storageIndex === -1) storageIndex = parts.length - 2;
    
    // Prendre tous les éléments entre la marque et le stockage
    const modelParts = parts.slice(1, storageIndex);
    const model = cleanModel(modelParts.join(' '));
    
    return {
        brand: brand.trim(),
        model: model
    };
}

function createStandardId(brand: string, model: string, storage: number): string {
    return `${normalizeString(brand)}-${normalizeString(model)}-${storage}`;
}

function processProximusPhones(proximusData: ProximusPhone[]): Map<string, SmartphoneData> {
    const phonesMap = new Map<string, SmartphoneData>();

    proximusData
        .filter(phone => phone.price_jo && parseFloat(phone.price_jo) > 0)
        .forEach(phone => {
            try {
                const storage = extractStorage(phone.capacity);
                const standardId = createStandardId(phone.brand, phone.model, storage);
                console.log('Proximus ID:', standardId, 'Price:', phone.price_jo, 'Condition:', phone.info_dp, 'URL:', phone.link);

                phonesMap.set(standardId, {
                    id: standardId,
                    brand: phone.brand,
                    model: phone.model,
                    storage: storage,
                    imageUrl: phone.image_link,
                    upfrontPrices: {
                        proximus: {
                            price: parseFloat(phone.price_jo) || 0,
                            condition: phone.info_dp || undefined,
                            url: phone.link || undefined
                        }
                    }
                });
            } catch (error) {
                console.error('Erreur lors du traitement du téléphone Proximus:', phone.title, error);
            }
        });

    return phonesMap;
}

function matchVooPhones(phonesMap: Map<string, SmartphoneData>, vooData: VooPhone[]): void {
    vooData.forEach(vooPhone => {
        const parts = vooPhone.baseProductCode.split('_').filter(p => p.trim() !== '');
        if (parts.length < 2) return;

        const brand = parts[0];
        const storage = extractStorage(vooPhone.name);
        const modelParts = parts.slice(1);
        const model = cleanModel(modelParts.join(' '));

        const standardId = createStandardId(brand, model, storage);
        const condition = vooPhone.dataOption && vooPhone.optionPrice 
            ? `Avec ${vooPhone.dataOption} pour ${vooPhone.optionPrice}€/mois`
            : undefined;
        const url = `https://hardware.mobile.voo.be/fr/handset/Smartphone/smartphone-medium-plus/${vooPhone.baseProductCode}/p/${vooPhone.code}`;
            
        console.log('VOO ID:', standardId, 'Price:', vooPhone.priceAlteration, 'Condition:', condition, 'URL:', url);
        
        const existingPhone = phonesMap.get(standardId);
        if (existingPhone) {
            existingPhone.upfrontPrices.voo = {
                price: vooPhone.priceAlteration || 0,
                condition: condition,
                url: url
            };
        }
    });
}

function matchOrangePhones(phonesMap: Map<string, SmartphoneData>, orangeData: any): void {
    orangeData.results[0].hits.forEach((orangePhone: any) => {
        const [brand, ...modelParts] = orangePhone.configurableSku.split('-');
        const model = cleanModel(modelParts.join(' '));
        const storage = orangePhone.hardDisk || 0;

        const standardId = createStandardId(brand, model, storage);
        const condition = orangePhone.priceRecurringQuota 
            ? `Avec Option Data à ${orangePhone.priceRecurringQuota}€/mois`
            : undefined;
            
        console.log('Orange ID:', standardId, 'Price:', orangePhone.priceRecurringInitial, 'Condition:', condition, 'URL:', orangePhone.href);
        
        const existingPhone = phonesMap.get(standardId);
        if (existingPhone) {
            existingPhone.upfrontPrices.orange = {
                price: orangePhone.priceRecurringInitial || 0,
                condition: condition,
                url: orangePhone.href || undefined
            };
        }
    });
}

async function mergeSmartphones() {
    try {
        // Lire les fichiers
        const proximusData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/data/proximus.json'), 'utf8'));
        const vooData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/data/voo.json'), 'utf8')).smartphones;
        const orangeData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/data/orange.json'), 'utf8'));

        // Traiter les données
        const phonesMap = processProximusPhones(proximusData);
        matchVooPhones(phonesMap, vooData);
        matchOrangePhones(phonesMap, orangeData);

        // Convertir la Map en tableau
        const smartphones = Array.from(phonesMap.values());

        // Écrire le fichier final
        fs.writeFileSync(
            path.join(process.cwd(), 'src/data/smartphones.json'),
            JSON.stringify(smartphones, null, 2)
        );

        console.log('Fusion des smartphones terminée avec succès !');
    } catch (error) {
        console.error('Erreur lors de la fusion des smartphones:', error);
    }
}

mergeSmartphones();
