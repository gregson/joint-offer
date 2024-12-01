import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { getAlerts } from '../src/utils/priceAlerts';
import { sendPriceChangeEmail } from '../src/utils/emailSender';
import { Smartphone } from '../src/types/smartphone';
import { Provider } from '../src/types/priceAlert';

interface PriceHistory {
  smartphoneId: string;
  provider: Provider;
  prices: {
    price: number;
    date: string;
  }[];
}

const PRICE_HISTORY_PATH = path.join(process.cwd(), 'src/data/smartphone-price-history.json');
const SMARTPHONES_PATH = path.join(process.cwd(), 'src/data/smartphones.json');

function loadPriceHistory(): PriceHistory[] {
  try {
    const content = readFileSync(PRICE_HISTORY_PATH, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

function savePriceHistory(history: PriceHistory[]): void {
  writeFileSync(PRICE_HISTORY_PATH, JSON.stringify(history, null, 2));
}

function loadSmartphones(): Smartphone[] {
  const content = readFileSync(SMARTPHONES_PATH, 'utf-8');
  return JSON.parse(content);
}

async function checkPriceChanges() {
  console.log('Début de la vérification des changements de prix des smartphones...');
  
  try {
    // Charger les données nécessaires
    const [alerts, priceHistory, smartphones] = await Promise.all([
      getAlerts(),
      loadPriceHistory(),
      loadSmartphones()
    ]);

    const today = new Date().toISOString().split('T')[0];
    const updatedHistory: PriceHistory[] = [...priceHistory];

    // Pour chaque smartphone
    for (const smartphone of smartphones) {
      // Pour chaque fournisseur disponible
      for (const provider of ['proximus', 'orange', 'voo'] as Provider[]) {
        const currentPrice = smartphone.upfrontPrices[provider]?.price;
        
        // Si le prix n'existe pas pour ce fournisseur, on passe
        if (currentPrice === undefined) continue;

        let historyEntry = updatedHistory.find(
          h => h.smartphoneId === smartphone.id && h.provider === provider
        );
        
        if (!historyEntry) {
          // Première entrée pour ce smartphone et ce fournisseur
          historyEntry = {
            smartphoneId: smartphone.id,
            provider,
            prices: [{
              price: currentPrice,
              date: today
            }]
          };
          updatedHistory.push(historyEntry);
          continue;
        }

        const lastPrice = historyEntry.prices[historyEntry.prices.length - 1].price;
        
        // Si le prix a changé
        if (lastPrice !== currentPrice) {
          console.log(`Changement de prix détecté pour ${smartphone.brand} ${smartphone.model} (${provider}): ${lastPrice}€ -> ${currentPrice}€`);
          
          // Ajouter le nouveau prix à l'historique
          historyEntry.prices.push({
            price: currentPrice,
            date: today
          });

          // Trouver les alertes concernées
          const relevantAlerts = alerts.alerts.filter(alert => 
            alert.smartphoneId === smartphone.id &&
            alert.provider === provider &&
            (alert.preferences.notifyOnAnyChange || 
             (alert.preferences.notifyOnPriceDecrease && currentPrice < lastPrice))
          );

          // Envoyer les notifications
          for (const alert of relevantAlerts) {
            console.log(`Envoi d'une notification à ${alert.email} pour ${smartphone.brand} ${smartphone.model}`);
            await sendPriceChangeEmail({
              alert,
              smartphone,
              provider,
              oldPrice: lastPrice,
              newPrice: currentPrice
            });
          }
        }
      }
    }

    // Sauvegarder l'historique mis à jour
    savePriceHistory(updatedHistory);
    console.log('Vérification terminée avec succès.');
  } catch (error) {
    console.error('Erreur lors de la vérification des prix:', error);
    throw error;
  }
}

// Exécuter le script
checkPriceChanges()
  .then(() => {
    console.log('Script terminé avec succès');
    process.exit(0);
  })
  .catch(error => {
    console.error('Erreur dans le script:', error);
    process.exit(1);
  });
