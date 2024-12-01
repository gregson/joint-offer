import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { quizQuestions } from '@/data/quiz-questions';
import type { QuizQuestion, UserPreferences } from './types';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (preferences: UserPreferences) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  
  // Réinitialiser l'état quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      // Initialiser la réponse par défaut pour la question de budget
      setAnswers({
        budget: 300 // Valeur par défaut du slider
      });
    }
  }, [isOpen]);

  const currentQuestion = quizQuestions[currentStep];
  const progress = ((currentStep + 1) / quizQuestions.length) * 100;

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentStep < quizQuestions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      const preferences = calculatePreferences(answers);
      onComplete(preferences);
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const calculatePreferences = (answers: Record<string, any>): UserPreferences => {
    // Logique de calcul des préférences basée sur les réponses
    const preferences: UserPreferences = {
      budget: {
        max: answers.budget || 300,
        upfront: answers.budget * 0.4,
        monthly: (answers.budget * 0.6) / 24
      },
      priorities: {
        performance: 0,
        photo: 0,
        battery: 0,
        screen: 0,
        storage: 0
      },
      usage: {
        gaming: 0,
        photo: 0,
        video: 0,
        social: 0,
        professional: 0
      }
    };

    // Calculer les priorités basées sur les réponses
    Object.entries(answers).forEach(([questionId, answer]) => {
      const question = quizQuestions.find(q => q.id === questionId);
      if (!question) return;

      if (Array.isArray(answer)) {
        // Réponses multiples
        answer.forEach(ans => {
          const option = question.options.find(opt => opt.id === ans);
          if (option?.weight) {
            Object.entries(option.weight).forEach(([key, value]) => {
              if (key in preferences.priorities) {
                preferences.priorities[key as keyof typeof preferences.priorities] += value;
              }
            });
          }
        });
      } else {
        // Réponse unique
        const option = question.options.find(opt => opt.id === answer);
        if (option?.weight) {
          Object.entries(option.weight).forEach(([key, value]) => {
            if (key in preferences.priorities) {
              preferences.priorities[key as keyof typeof preferences.priorities] = value;
            }
          });
        }
      }
    });

    return preferences;
  };

  const renderQuestion = (question: QuizQuestion) => {
    switch (question.type) {
      case 'single':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.options.map(option => (
              <Button
                key={option.id}
                onClick={() => handleAnswer(question.id, option.id)}
                variant={answers[question.id] === option.id ? 'default' : 'outline'}
                className="p-6 h-auto flex flex-col items-center justify-center text-center"
              >
                {option.icon && <span className="text-2xl mb-2">{option.icon}</span>}
                <span className="font-medium">{option.label}</span>
              </Button>
            ))}
          </div>
        );

      case 'multiple':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.options.map(option => {
              const isSelected = (answers[question.id] || []).includes(option.id);
              return (
                <Button
                  key={option.id}
                  onClick={() => {
                    const current = answers[question.id] || [];
                    const updated = isSelected
                      ? current.filter((id: string) => id !== option.id)
                      : [...current, option.id];
                    handleAnswer(question.id, updated);
                  }}
                  variant={isSelected ? 'default' : 'outline'}
                  className="p-6 h-auto"
                >
                  {option.icon && <span className="mr-2">{option.icon}</span>}
                  {option.label}
                </Button>
              );
            })}
          </div>
        );

      case 'budget':
        return (
          <div className="space-y-8">
            <div className="relative flex w-full touch-none select-none items-center">
              <Slider
                defaultValue={[300]}
                min={0}
                max={1200}
                step={50}
                onValueChange={([value]) => handleAnswer(question.id, value)}
                className="w-full"
              />
            </div>
            <div className="text-center text-xl font-medium">
              {answers[question.id] || 300}€
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            Trouvez votre smartphone idéal
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <Progress value={progress} className="mb-6" />
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              {currentQuestion.question}
            </h2>
            {currentQuestion.description && (
              <p className="text-gray-600 mb-4">{currentQuestion.description}</p>
            )}
          </div>

          <div className="mb-8">
            {renderQuestion(currentQuestion)}
          </div>

          <div className="flex justify-between mt-8">
            <Button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              variant="outline"
            >
              Précédent
            </Button>
            <Button
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]}
            >
              {currentStep === quizQuestions.length - 1 ? 'Terminer' : 'Suivant'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
