import { QuizQuestion } from '@/components/recommendation/types';

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'budget',
    question: 'Quel est votre budget maximum ?',
    description: 'Incluant le prix du téléphone et le forfait mensuel',
    type: 'budget',
    category: 'budget',
    options: [
      { id: 'budget_low', label: 'Économique', value: 500 },
      { id: 'budget_mid', label: 'Milieu de gamme', value: 1000 },
      { id: 'budget_high', label: 'Haut de gamme', value: 2000 },
      { id: 'budget_custom', label: 'Personnalisé', value: 0 }
    ]
  },
  {
    id: 'usage_primary',
    question: 'Quelle sera votre utilisation principale ?',
    type: 'single',
    category: 'usage',
    options: [
      {
        id: 'gaming',
        label: 'Jeux mobiles',
        value: 'gaming',
        icon: '🎮',
        weight: {
          performance: 0.9,
          battery: 0.8,
          screen: 0.7
        }
      },
      {
        id: 'photo',
        label: 'Photo/Vidéo',
        value: 'photo',
        icon: '📸',
        weight: {
          camera: 0.9,
          storage: 0.7,
          screen: 0.6
        }
      },
      {
        id: 'social',
        label: 'Réseaux sociaux',
        value: 'social',
        icon: '📱',
        weight: {
          battery: 0.7,
          camera: 0.6,
          performance: 0.5
        }
      },
      {
        id: 'professional',
        label: 'Usage professionnel',
        value: 'professional',
        icon: '💼',
        weight: {
          performance: 0.7,
          battery: 0.8,
          storage: 0.6
        }
      }
    ]
  },
  {
    id: 'photo_importance',
    question: 'Quelle importance accordez-vous à la qualité photo ?',
    type: 'single',
    category: 'photo',
    options: [
      {
        id: 'photo_basic',
        label: 'Photos occasionnelles',
        value: 'basic',
        weight: { camera: 0.3 }
      },
      {
        id: 'photo_hobby',
        label: 'Amateur passionné',
        value: 'hobby',
        weight: { camera: 0.7 }
      },
      {
        id: 'photo_pro',
        label: 'Qualité professionnelle',
        value: 'pro',
        weight: { camera: 0.9 }
      }
    ]
  },
  {
    id: 'performance_needs',
    question: 'Quels sont vos besoins en performance ?',
    type: 'multiple',
    category: 'performance',
    options: [
      {
        id: 'perf_multitask',
        label: 'Multitâche intensif',
        value: 'multitask',
        weight: { performance: 0.8 }
      },
      {
        id: 'perf_gaming',
        label: 'Jeux 3D',
        value: 'gaming',
        weight: { performance: 0.9, gpu: 0.8 }
      },
      {
        id: 'perf_video',
        label: 'Édition vidéo',
        value: 'video',
        weight: { performance: 0.7, storage: 0.8 }
      }
    ]
  },
  {
    id: 'battery_importance',
    question: 'Quelle autonomie recherchez-vous ?',
    type: 'single',
    category: 'preference',
    options: [
      {
        id: 'battery_standard',
        label: 'Une journée suffit',
        value: 'standard',
        weight: { battery: 0.5 }
      },
      {
        id: 'battery_long',
        label: 'Plus de 2 jours',
        value: 'long',
        weight: { battery: 0.8 }
      },
      {
        id: 'battery_max',
        label: 'Maximum possible',
        value: 'max',
        weight: { battery: 1.0 }
      }
    ]
  }
];
