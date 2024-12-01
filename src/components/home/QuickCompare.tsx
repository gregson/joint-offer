import React from 'react';
import { getPlans } from '@/utils/dataLoader';

interface Plan {
  id: number;
  provider: string;
  name: string;
  price: number;
  data: string;
  features: string[];
}

const QuickCompare = () => {
  const allPlans: Plan[] = getPlans();
  // Prendre les 4 premiers plans pour l'affichage rapide
  const plans = allPlans.slice(0, 4);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Meilleures offres Internet
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
            >
              <div className="text-lg font-bold text-blue-600 mb-2">
                {plan.provider}
              </div>
              <h3 className="text-xl font-semibold mb-4">{plan.name}</h3>
              <div className="text-3xl font-bold mb-4">
                {plan.price}€<span className="text-sm font-normal">/mois</span>
              </div>
              <div className="text-gray-600 mb-4">
                Jusqu'à {plan.data}
              </div>
              <ul className="space-y-2">
                {plan.features.slice(0, 3).map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickCompare;
