import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import type { Smartphone } from '@/types/smartphone';
import type { UserPreferences, SmartphoneScore } from './types';
import Link from 'next/link';

interface SmartphoneRecommendationProps {
  smartphone: Smartphone;
  score: SmartphoneScore;
  preferences: UserPreferences;
}

export const SmartphoneRecommendation: React.FC<SmartphoneRecommendationProps> = ({
  smartphone,
  score,
  preferences
}) => {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-4">
        <div className="w-32 h-32 relative flex-shrink-0">
          <img
            src={smartphone.imageUrl || '/images/smartphone-default.png'}
            alt={`${smartphone.brand} ${smartphone.model}`}
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold">{smartphone.brand} {smartphone.model}</h3>
              <p className="text-sm text-gray-600">
                {smartphone.storage}GB - {smartphone.color}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {score.matchPercentage}%
              </div>
              <div className="text-sm text-gray-600">
                de correspondance
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Scores détaillés */}
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(score.scores).map(([category, value]) => (
                <div key={category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{category}</span>
                    <span>{Math.round(value * 100)}%</span>
                  </div>
                  <Progress value={value * 100} />
                </div>
              ))}
            </div>

            {/* Raisons de la recommandation */}
            <div>
              <h4 className="font-medium mb-2">Pourquoi ce smartphone ?</h4>
              <ul className="text-sm space-y-1">
                {score.reasons.map((reason, index) => (
                  <li key={index} className="flex items-center text-gray-600">
                    <span className="mr-2">✓</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>

            {/* Budget */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-600">Prix total</div>
                  <div className="text-lg font-bold">
                    {smartphone.upfrontPrices?.proximus?.price || 0}€
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Budget max</div>
                  <div className="text-lg font-bold text-green-600">
                    {preferences.budget.max}€
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button 
                asChild 
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <Link href={`/search?phone=${smartphone.id}`}>
                  Voir les offres
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
