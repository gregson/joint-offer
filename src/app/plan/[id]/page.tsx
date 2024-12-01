'use client';

import React from 'react';
import { getPlanById, getReviewsForPlan } from '@/utils/dataLoader';
import PlanOverview from '@/components/plan/PlanOverview';
import PlanDetails from '@/components/plan/PlanDetails';
import UserReviews from '@/components/plan/UserReviews';

export default function PlanPage({ params }: { params: { id: string } }) {
  const plan = getPlanById(params.id);
  const reviews = getReviewsForPlan(params.id);

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Forfait non trouvé
            </h1>
            <p className="text-gray-600">
              Désolé, le forfait que vous recherchez n'existe pas ou n'est plus disponible.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const detailSections = [
    {
      title: 'Internet mobile',
      items: [
        {
          label: 'Data en France',
          value: plan.data,
          info: 'Volume de données en France métropolitaine'
        },
        {
          label: 'Data en Europe/DOM',
          value: plan.dataEurope,
          info: 'Volume de données en Europe et DOM'
        },
        {
          label: 'Réseau',
          value: plan.networkType.join(', '),
          info: 'Types de réseaux disponibles'
        }
      ]
    },
    {
      title: 'Communications',
      items: [
        {
          label: 'Appels',
          value: plan.calls,
          info: 'Volume d\'appels en France métropolitaine'
        },
        {
          label: 'SMS/MMS',
          value: plan.sms,
          info: 'Volume de SMS/MMS en France métropolitaine'
        },
        {
          label: 'International',
          value: plan.internationalCalls,
          info: 'Appels internationaux inclus'
        }
      ]
    },
    {
      title: 'Engagement et options',
      items: [
        {
          label: 'Engagement',
          value: plan.commitment,
          info: 'Durée d\'engagement du forfait'
        },
        {
          label: 'Prix mensuel',
          value: `${plan.price}€`,
          info: 'Prix mensuel du forfait'
        },
        {
          label: 'Options incluses',
          value: plan.features?.join(', ') || 'Aucune option',
          info: 'Options et services inclus dans le forfait'
        }
      ]
    }
  ];

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="space-y-8">
          <PlanOverview plan={plan} />
          <PlanDetails sections={detailSections} />
          <UserReviews reviews={reviews} />
        </div>
      </div>
    </main>
  );
}
