'use client';

import Link from 'next/link';
import { Plan } from '@/types/plan';
import { getPlans } from '@/utils/dataLoader';

export default function PopularPlans() {
  const allPlans = getPlans();
  
  // Sélectionner les plans populaires
  const popularPlans = [
    allPlans.find(p => p.id === 'voo-15'),        // Meilleur prix
    allPlans.find(p => p.id === 'Orange-Medium-50'), // Meilleur rapport data/prix
    allPlans.find(p => p.id === 'Proximus-Maxi-70')  // Plus de data
  ].filter(Boolean) as Plan[];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {popularPlans.map((plan) => (
        <div key={plan.id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <img 
              src={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/images/${plan.provider.toLowerCase()}-logo.svg`}
              alt={`${plan.provider} logo`}
              className="w-12 h-12 object-contain"
            />
            <div>
              <h3 className="font-semibold">{plan.name}</h3>
              <p className="text-sm text-gray-600">{plan.data} - Appels illimités</p>
            </div>
          </div>
          
          {plan.promotion && (
            <div className="mb-4">
              <span className="inline-block bg-red-100 text-red-600 text-sm px-2 py-1 rounded-full">
                {plan.promotion.description}
              </span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-blue-600">
              {plan.price}€<span className="text-sm font-normal">/mois</span>
            </div>
            <Link 
              href={`/plan/${plan.id}`}
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              Voir l'offre
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
