import React from 'react';
import { getPlans } from '@/utils/dataLoader';
import { Plan } from '@/types/plan';

const QuickCompare = () => {
  const allPlans: Plan[] = getPlans();
  // Prendre les 4 premiers plans pour l'affichage rapide
  const plans = allPlans.slice(0, 4);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Comparaison rapide
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
            >
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold">{plan.provider}</h3>
                <p className="text-gray-600">{plan.name}</p>
              </div>
              <div className="text-center mb-6">
                <span className="text-3xl font-bold text-blue-600">{plan.price}€</span>
                <span className="text-gray-500">/mois</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-gray-600">Data :</span>
                  <span className="font-semibold">{plan.data}</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-2">
                  {plan.features?.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6">
                <a
                  href={plan.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Voir l'offre
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickCompare;
