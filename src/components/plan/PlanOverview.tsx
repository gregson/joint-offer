import React from 'react';
import { Plan } from '@/types/plan';

interface PlanOverviewProps {
  plan: Plan;
}

const PlanOverview: React.FC<PlanOverviewProps> = ({ plan }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div className="flex items-center gap-4">
          <img
            src={`/images/${plan.provider}-logo.svg`}
            alt={`Logo ${plan.provider}`}
            className="h-12 w-auto"
          />
          <div>
            <h1 className="text-3xl font-bold text-blue-600 mb-2">
              {plan.provider} - {plan.name}
            </h1>
            <p className="text-gray-600">{plan.commitment}</p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 text-center">
          {plan.promotion && (
            <div className="bg-red-100 text-red-600 px-4 py-2 rounded-full mb-2">
              <p className="font-semibold">{plan.promotion.description}</p>
              <p className="text-sm">Jusqu'au {plan.promotion.endDate}</p>
            </div>
          )}
          <div className="text-4xl font-bold text-blue-600">
            {plan.price}€<span className="text-lg font-normal">/mois</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Données et réseau */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Internet Mobile</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600">Data</p>
              <p className="text-2xl font-bold">{plan.data}</p>
            </div>
            <div>
              <p className="text-gray-600">Réseau</p>
              <div className="flex gap-2">
                {plan.networkType.map(type => (
                  <span
                    key={type}
                    className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-semibold"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Avantages */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Avantages inclus</h2>
          {plan.features && plan.features.length > 0 ? (
            <ul className="space-y-3">
              {plan.features.map(feature => (
                <li key={feature} className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Aucun avantage spécifique listé</p>
          )}
        </div>

        {/* CTA */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Souscrire</h2>
          <a
            href={plan.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 mb-4 text-center"
          >
            Commander maintenant
          </a>
          <div className="text-sm text-gray-600">
            <p className="mb-2"> Sans engagement</p>
            <p className="mb-2"> Activation immédiate</p>
            <p> Satisfaction garantie</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanOverview;
