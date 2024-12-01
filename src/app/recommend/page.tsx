'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { QuizModal } from '@/components/recommendation/QuizModal';
import { SmartphoneRecommendation } from '@/components/recommendation/SmartphoneRecommendation';
import { getSmartphones } from '@/utils/dataLoader';
import type { UserPreferences, SmartphoneScore } from '@/components/recommendation/types';
import type { Smartphone } from '@/types/smartphone';

export default function RecommendPage() {
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [recommendations, setRecommendations] = useState<Array<{ phone: Smartphone; score: SmartphoneScore }>>([]);

  const calculateRecommendations = (preferences: UserPreferences) => {
    const smartphones = getSmartphones();
    
    const scored = smartphones
      .map(phone => {
        const score: SmartphoneScore = {
          phoneId: phone.id,
          totalScore: 0,
          scores: {},
          matchPercentage: 0,
          reasons: []
        };

        // Vérifier le budget
        const price = phone.upfrontPrices?.proximus?.price || 0;
        if (price > preferences.budget.max) {
          return null; // Ignorer les smartphones hors budget
        }

        // Calculer les scores par critère
        let totalWeight = 0;
        Object.entries(preferences.priorities).forEach(([criterion, weight]) => {
          let criterionScore = 0;
          
          switch (criterion) {
            case 'performance':
              criterionScore = calculatePerformanceScore(phone);
              break;
            case 'photo':
              criterionScore = calculatePhotoScore(phone);
              break;
            case 'battery':
              criterionScore = calculateBatteryScore(phone);
              break;
            // Ajouter d'autres critères...
          }

          score.scores[criterion] = criterionScore;
          score.totalScore += criterionScore * weight;
          totalWeight += weight;

          // Ajouter des raisons
          if (criterionScore > 0.8) {
            score.reasons.push(getReasonForCriterion(criterion, phone));
          }
        });

        // Calculer le pourcentage de correspondance
        score.matchPercentage = Math.round((score.totalScore / totalWeight) * 100);

        return { phone, score };
      })
      .filter((item): item is { phone: Smartphone; score: SmartphoneScore } => 
        item !== null && item.score.matchPercentage > 50
      )
      .sort((a, b) => b.score.matchPercentage - a.score.matchPercentage)
      .slice(0, 3); // Top 3 des recommandations

    setRecommendations(scored);
  };

  const calculatePerformanceScore = (phone: Smartphone): number => {
    // Logique de scoring basée sur les specs du téléphone
    // À adapter selon les données disponibles
    return 0.8; // Exemple
  };

  const calculatePhotoScore = (phone: Smartphone): number => {
    // Logique de scoring pour la photo
    return 0.7; // Exemple
  };

  const calculateBatteryScore = (phone: Smartphone): number => {
    // Logique de scoring pour la batterie
    return 0.9; // Exemple
  };

  const getReasonForCriterion = (criterion: string, phone: Smartphone): string => {
    // Générer des raisons personnalisées selon le critère
    switch (criterion) {
      case 'performance':
        return 'Excellent pour les applications exigeantes';
      case 'photo':
        return 'Appareil photo de haute qualité';
      case 'battery':
        return 'Grande autonomie de batterie';
      default:
        return '';
    }
  };

  const handleQuizComplete = (preferences: UserPreferences) => {
    setUserPreferences(preferences);
    calculateRecommendations(preferences);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Trouvez votre smartphone idéal
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Répondez à quelques questions pour découvrir les smartphones qui correspondent le mieux à vos besoins
        </p>
        
        {!userPreferences && (
          <Button
            onClick={() => setIsQuizOpen(true)}
            size="lg"
            className="animate-bounce"
          >
            Commencer le quiz
          </Button>
        )}
      </div>

      {/* Résultats */}
      {recommendations.length > 0 ? (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold mb-6">
            Nos recommandations pour vous
          </h2>
          
          <div className="grid gap-6">
            {recommendations.map(({ phone, score }) => (
              <SmartphoneRecommendation
                key={phone.id}
                smartphone={phone}
                score={score}
                preferences={userPreferences!}
              />
            ))}
          </div>

          <div className="text-center mt-8">
            <Button
              onClick={() => setIsQuizOpen(true)}
              variant="outline"
            >
              Refaire le quiz
            </Button>
          </div>
        </div>
      ) : userPreferences && (
        <div className="text-center py-12 px-4">
          <div className="max-w-md mx-auto space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Aucune recommandation trouvée
            </h3>
            <p className="text-gray-600">
              Désolé, nous n'avons pas trouvé de smartphones correspondant à vos critères. 
              Essayez de modifier vos préférences pour obtenir plus de résultats.
            </p>
            <Button
              onClick={() => setIsQuizOpen(true)}
              variant="default"
              className="mt-4"
            >
              Modifier mes préférences
            </Button>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onComplete={handleQuizComplete}
      />
    </div>
  );
}
