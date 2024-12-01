import { filterPlans } from '@/utils/dataLoader';
import { useEffect, useState } from 'react';

interface TestResult {
  title: string;
  plans: any[];
}

export default function TestFilters() {
  const [results, setResults] = useState<TestResult[]>([]);

  useEffect(() => {
    // Test du filtre de prix
    const priceFilteredPlans = filterPlans({ priceRange: [20, 30] });
    
    // Test du filtre de data
    const dataFilteredPlans = filterPlans({ data: 100 });
    
    // Test des forfaits illimités
    const unlimitedDataPlans = filterPlans({ data: -1 });
    
    // Test du filtre réseau 5G
    const network5GPlans = filterPlans({ network: '5G' });
    
    // Test combiné
    const combinedFilterPlans = filterPlans({
      
      data: -1,
      calls: -1
    });

    setResults([
      {
        title: '1. Test du filtre de prix (20-30€)',
        plans: priceFilteredPlans
      },
      {
        title: '2. Test du filtre de data (>= 100Go)',
        plans: dataFilteredPlans
      },
      {
        title: '3. Test du filtre des forfaits data illimités',
        plans: unlimitedDataPlans
      },
      {
        title: '4. Test du filtre réseau 5G',
        plans: network5GPlans
      },
      {
        title: '5. Test combiné (prix: 20-40€, data >= 100Go, 5G, calls illimités)', 
        plans: combinedFilterPlans
      }
    ]);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Tests des filtres de forfaits</h1>
      
      {results.map((result, index) => (
        <div key={index} className="mb-8 p-4 border rounded-lg">
          <h2 className="font-bold mb-2">{result.title}</h2>
          <p className="mb-2">Nombre de forfaits trouvés: {result.plans.length}</p>
          
          <div className="space-y-2">
            {result.plans.map((plan, planIndex) => (
              <div key={planIndex} className="ml-4">
                - {plan.name} ({plan.price}€, {plan.details?.internet?.dataFrance?.value}, Appels: {plan.details?.communications?.calls?.value || 'Non spécifié'}, {plan.networkType.join(', ')})
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
