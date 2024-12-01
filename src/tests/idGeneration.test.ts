import { FeedSyncWorker } from '../workers/feedSyncWorker';
import { FeedMapping } from '../types/FeedMapping';

async function runTest() {
  const worker = new FeedSyncWorker();
  
  const testCases = [
    {
      provider: 'voo',
      phone: {
        "brand": "Apple",
        "model": "iPhone 14 (128GB)",
        "storage": "128 GB",
        "price": 689,
        "colors": ["#2C75FF"],
        "upfrontPrices": {
          "voo": {
            "price": 79,
            "conditions": "9 Gb"
          }
        }
      }
    },
    {
      provider: 'orange',
      phone: {
        "brand": "Apple",
        "model": "iPhone 14",
        "storage": "128 GB",
        "price": 689.95,
        "colors": "#080808",
        "upfrontPrices": {
          "orange": {
            "price": 79,
            "conditions": "25€/mois pendant 24 mois"
          }
        }
      }
    },
    {
      provider: 'proximus',
      phone: {
        "brand": "Apple",
        "model": "iPhone 14",
        "storage": "128 GB",
        "price": 689.95,
        "upfrontPrices": {
          "proximus": {
            "price": 149,
            "conditions": "Avec DataPhone 2,5 GB : €25/mois."
          }
        }
      }
    }
  ];

  console.log('Test de génération d\'IDs:\n');
  
  const results = new Map<string, string>();
  
  for (const testCase of testCases) {
    const mapping = worker.getProviderMapping(testCase.provider);
    const id = worker.generateId(testCase.phone, mapping);
    results.set(testCase.provider, id);
    
    console.log(`Provider: ${testCase.provider}`);
    console.log(`Input:`);
    console.log(JSON.stringify(testCase.phone, null, 2));
    console.log(`Generated ID: ${id}\n`);
  }

  // Vérifier si tous les IDs sont identiques
  const ids = Array.from(results.values());
  const allSame = ids.every(id => id === ids[0]);
  
  console.log('Résultat du test:');
  console.log(allSame ? '✅ Tous les IDs sont identiques!' : '❌ Les IDs sont différents!');
  
  if (!allSame) {
    console.log('\nIDs uniques trouvés:');
    ids.forEach((id, index) => {
      console.log(`${testCases[index].provider}: ${id}`);
    });
  } else {
    console.log(`\nID commun: ${ids[0]}`);
  }
}

runTest().catch(console.error);
