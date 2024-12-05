import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../../.env.local') });

import { getAlerts } from '../utils/priceAlerts';
import { sendSmartphonePriceChangeEmail } from '../utils/emailSender';
import fs from 'fs/promises';
import path from 'path';
import smartphonesData from '../data/smartphones.json';
import type { SmartphonePriceHistory, PriceHistoryData } from '../types/priceHistory';
import type { Provider } from '../types/priceAlert';
import type { Smartphone } from '../types/smartphone';
import type { SmartphonePriceChangeEmailData } from '../types/emailData';

const PRICE_HISTORY_PATH = path.join(__dirname, '../data/price-history.json');
const smartphones = smartphonesData.smartphones as Smartphone[];

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
      console.log(`\nVérification du smartphone: ${smartphone.brand} ${smartphone.model}`);
      let historyEntry = updatedHistory.find(h => h.smartphoneId === smartphone.id);
      
      if (!historyEntry) {
        console.log('Première entrée pour ce smartphone');
        const today = new Date().toISOString().split('T')[0];
        historyEntry = {
          smartphoneId: smartphone.id,
          prices: {
            proximus: smartphone.upfrontPrices.proximus?.price ? [{ price: smartphone.upfrontPrices.proximus.price, date: today }] : [],
            orange: smartphone.upfrontPrices.orange?.price ? [{ price: smartphone.upfrontPrices.orange.price, date: today }] : [],
            voo: smartphone.upfrontPrices.voo?.price ? [{ price: smartphone.upfrontPrices.voo.price, date: today }] : []
          }
        };
        updatedHistory.push(historyEntry);
        console.log(`Prix initial enregistré pour ${smartphone.brand} ${smartphone.model}`);
        continue;
      }

      // Vérifier les prix pour chaque opérateur
      for (const provider of ['proximus', 'orange', 'voo'] as Provider[]) {
        // Get the current price for this provider
        const currentPrice = smartphone.upfrontPrices[provider]?.price;
        if (currentPrice === undefined) continue;

        // Get price history for this smartphone and provider
        const history = priceHistory.find(h => h.smartphoneId === smartphone.id);
        if (!history || !history.prices[provider] || history.prices[provider].length === 0) {
          console.log(`No price history for ${smartphone.brand} ${smartphone.model} (${provider})`);
          continue;
        }

        // Get the last recorded price
        const lastPriceEntry = history.prices[provider][0];
        const lastPrice = lastPriceEntry.price;

        // Skip if price hasn't changed
        if (currentPrice === lastPrice) {
          console.log(`Skipping ${smartphone.brand} ${smartphone.model} (${provider}) - Price unchanged`);
          continue;
        }

        // Log price change
        const priceChange = currentPrice - lastPrice;
        console.log(`\nPrice change detected for:`, {
          smartphone: `${smartphone.brand} ${smartphone.model}`,
          id: smartphone.id,
          provider,
          currentPrice,
          lastPrice,
          priceChange
        });

        // Add new price to history if it's different
        if (!historyEntry.prices[provider]) {
          historyEntry.prices[provider] = [];
        }
        historyEntry.prices[provider].unshift({
          price: currentPrice,
          date: today
        });

        // Find alerts matching this smartphone and provider
        const matchingAlerts = alerts.alerts.filter((alert: any) => {
          const matchesSmartphone = alert.smartphoneId === smartphone.id;
          const matchesProvider = (alert.provider === provider) || 
                                (alert.providers && alert.providers.includes(provider));
          return matchesSmartphone && matchesProvider;
        });

        if (matchingAlerts.length > 0) {
          console.log(`Found ${matchingAlerts.length} matching alerts for ${smartphone.brand} ${smartphone.model} (${provider})`);
          for (const alert of matchingAlerts) {
            const shouldNotify = 
              (alert.preferences.notifyOnAnyChange && priceChange !== 0) ||
              (alert.preferences.notifyOnPriceDecrease && priceChange < 0);

            console.log('\nProcessing alert:', {
              alertId: alert.id,
              email: alert.email,
              priceChange,
              shouldNotify,
              preferences: alert.preferences
            });

            if (shouldNotify) {
              console.log('\nSending price alert notification:', {
                alertId: alert.id,
                email: alert.email,
                smartphone: `${smartphone.brand} ${smartphone.model}`,
                provider,
                oldPrice: lastPrice,
                newPrice: currentPrice,
                priceChange
              });

              try {
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
                console.log(`Email sent successfully to ${alert.email}`);
              } catch (error) {
                console.error('Error sending email:', error);
              }
            } else {
              console.log(`Skipping notification for alert ${alert.id} - Price change doesn't match preferences`);
            }
          }
        } else {
          console.log(`No matching alerts found for ${smartphone.brand} ${smartphone.model} (${provider})`);
        }
      }
    }

    // Sauvegarder l'historique des prix mis à jour
    await savePriceHistory(updatedHistory);
    console.log('Historique des prix sauvegardé');
    console.log('Vérification des prix terminée');

  } catch (error) {
    console.error('Erreur lors de la vérification des prix:', error);
  }
}

// Execute only if run directly (not imported as module)
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
