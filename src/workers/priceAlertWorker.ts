import { getAlerts } from '../utils/priceAlerts';
import { sendSmartphonePriceChangeEmail } from '../utils/emailSender';
import fs from 'fs/promises';
import path from 'path';
import smartphonesData from '../data/smartphones.json';
import type { SmartphonePriceHistory, PriceHistoryData } from '../types/priceHistory';
import type { Provider } from '../types/priceAlert';
import type { Smartphone } from '../types/smartphone';
import type { SmartphonePriceChangeEmailData } from '../types/emailData';

const PRICE_HISTORY_PATH = path.join(process.cwd(), 'src/data/price-history.json');
const smartphones = smartphonesData as Smartphone[];

async function loadPriceHistory(): Promise<PriceHistoryData> {
  try {
    const content = await fs.readFile(PRICE_HISTORY_PATH, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

async function savePriceHistory(history: PriceHistoryData): Promise<void> {
  await fs.writeFile(PRICE_HISTORY_PATH, JSON.stringify(history, null, 2));
}

async function checkPriceChanges() {
  console.log('Début de la vérification des changements de prix...');
  
  try {
    // Charger les données nécessaires
    const [alerts, priceHistory] = await Promise.all([
      getAlerts(),
      loadPriceHistory()
    ]);

    const today = new Date().toISOString().split('T')[0];
    const updatedHistory: PriceHistoryData = [...priceHistory];

    // Pour chaque smartphone
    for (const smartphone of smartphones) {
      let historyEntry = updatedHistory.find(h => h.smartphoneId === smartphone.id);
      
      if (!historyEntry) {
        // Première entrée pour ce smartphone
        historyEntry = {
          smartphoneId: smartphone.id,
          prices: {
            proximus: [],
            orange: [],
            voo: []
          }
        };
        updatedHistory.push(historyEntry);
      }

      // Vérifier les prix pour chaque opérateur
      for (const provider of ['proximus', 'orange', 'voo'] as Provider[]) {
        const currentPrice = smartphone.upfrontPrices[provider]?.price;
        
        if (currentPrice !== undefined) {
          const providerHistory = historyEntry.prices[provider];
          const lastPrice = providerHistory[providerHistory.length - 1]?.price;

          if (lastPrice !== undefined && currentPrice !== lastPrice) {
            // Prix modifié, ajouter à l'historique
            providerHistory.push({
              price: currentPrice,
              date: today
            });

            // Vérifier les alertes pour ce smartphone et ce provider
            const relevantAlerts = alerts.alerts.filter(
              alert => alert.smartphoneId === smartphone.id && 
                      alert.provider === provider
            );

            for (const alert of relevantAlerts) {
              const shouldNotify = 
                alert.preferences.notifyOnAnyChange ||
                (alert.preferences.notifyOnPriceDecrease && currentPrice < lastPrice);

              if (shouldNotify) {
                const emailData: SmartphonePriceChangeEmailData = {
                  email: alert.email,
                  smartphone: {
                    id: smartphone.id,
                    brand: smartphone.brand,
                    model: smartphone.model,
                    storage: smartphone.storage,
                    imageUrl: smartphone.imageUrl,
                    upfrontPrices: {
                      [provider]: smartphone.upfrontPrices[provider]
                    }
                  },
                  provider,
                  oldPrice: lastPrice,
                  newPrice: currentPrice,
                  alert
                };
                await sendSmartphonePriceChangeEmail(emailData);
              }
            }
          }
        }
      }
    }

    // Sauvegarder l'historique mis à jour
    await savePriceHistory(updatedHistory);
    console.log('Vérification des prix terminée avec succès');

  } catch (error) {
    console.error('Erreur lors de la vérification des prix:', error);
  }
}

// Si exécuté directement (pas importé comme module)
if (require.main === module) {
  checkPriceChanges()
    .then(() => {
      console.log('Vérification des prix terminée');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erreur lors de la vérification des prix:', error);
      process.exit(1);
    });
}
