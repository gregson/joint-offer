import { Plan } from '@/types/plan';
import { Smartphone } from '@/types/smartphone';
import plansData from '@/data/plans.json';
import smartphonesData from '@/data/smartphones.json';
import reviewsData from '@/data/reviews.json';

interface Reviews {
  [key: string]: {
    id: string;
    author: string;
    rating: number;
    date: string;
    comment: string;
    pros: string[];
    cons: string[];
    verified: boolean;
  }[];
}

export function loadReviews(): Reviews {
  return reviewsData.reviews;
}

export function getReviewsForPlan(planId: string): Reviews[keyof Reviews] {
  const reviews = loadReviews();
  return reviews[planId] || [];
}

export function loadPlans(): Plan[] {
  return plansData.plans;
}

export function loadSmartphones(): Smartphone[] {
  return smartphonesData;
}

// Alias pour la compatibilité avec le code existant
export const getSmartphones = loadSmartphones;

export function getSmartphoneById(id: string): Smartphone | undefined {
  const smartphones = loadSmartphones();
  return smartphones.find(s => s.id === id);
}

export function getPlanById(id: string): Plan | undefined {
  const plans = loadPlans();
  return plans.find(p => p.id === id);
}

// Retourner directement le tableau de plans
export const getPlans = () => loadPlans();

// Fonctions de filtrage
export const filterSmartphones = ({
  brand,
  maxPrice,
  storage
}: {
  brand?: string;
  maxPrice?: number;
  storage?: string;
}) => {
  return loadSmartphones().filter(phone => {
    if (brand && phone.brand !== brand) return false;
    if (maxPrice && phone.upfrontPrices.proximus && phone.upfrontPrices.proximus.price > maxPrice) return false;
    if (storage && phone.storage.toString() !== storage) return false;
    return true;
  });
};

// Fonction helper pour extraire la valeur numérique
const extractNumericValue = (value: string | number | undefined): number => {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  
  // Extraire le nombre de la chaîne
  const numericMatch = value.match(/(\d+)\s*(go|min|sms)?/i);
  console.log('Extracting numeric value:', { value, match: numericMatch });
  
  if (numericMatch) {
    return parseInt(numericMatch[1]);
  }
  return 0;
};

// Fonction helper pour vérifier si une valeur est illimitée
const isUnlimited = (value: string | number | undefined): boolean => {
  if (!value || typeof value === 'number') return false;
  
  const normalizedValue = value.toLowerCase();
  console.log('Checking if unlimited:', { value, normalizedValue });
  
  return normalizedValue.includes('illimité') ||
         normalizedValue.includes('illimitée') ||
         normalizedValue.includes('illimités') ||
         normalizedValue.includes('unlimited');
};

// Fonction helper pour formater l'affichage des minutes
const formatMinutes = (value: string | number | undefined): { value: number, display: string } => {
  if (!value) return { value: 0, display: '0 min' };
  if (isUnlimited(value)) return { value: -1, display: 'Illimités' };
  const minutes = extractNumericValue(value);
  return { value: minutes, display: `${minutes} min` };
};

// Fonction helper pour formater l'affichage des données
const formatData = (value: string | number | undefined): { value: number, display: string } => {
  if (!value) return { value: 0, display: '0 Go' };
  if (isUnlimited(value)) return { value: -1, display: 'Illimitée' };
  const data = extractNumericValue(value);
  return { value: data, display: `${data} Go` };
};

export type SortOption = 
  | 'lowest-price'
  | 'lowest-upfront'
  | 'most-minutes'
  | 'most-data'
  | '24-month-cost';

export const sortPlans = (plans: any[], sortBy: SortOption, selectedPhone: any = null) => {
  const extractNumericMinutes = (plan: any) => {
    const minutes = plan.details?.communications?.calls?.value || plan.calls;
    return isUnlimited(minutes) ? -1 : extractNumericValue(minutes);
  };

  const extractNumericData = (plan: any) => {
    const data = plan.details?.internet?.dataFrance?.value || plan.data;
    return isUnlimited(data) ? -1 : extractNumericValue(data);
  };

  const get24MonthCost = (plan: any) => {
    const monthlyPrice = plan.price;
    const upfrontCost = selectedPhone?.upfrontPrices?.[plan.provider.toLowerCase()]?.price || 0;
    return (monthlyPrice * 24) + upfrontCost;
  };

  const getUpfrontCost = (plan: any) => {
    return selectedPhone?.upfrontPrices?.[plan.provider.toLowerCase()]?.price || 0;
  };

  return [...plans].sort((a, b) => {
    switch (sortBy) {
      case 'lowest-price':
        return a.price - b.price;
      
      case 'lowest-upfront':
        return getUpfrontCost(a) - getUpfrontCost(b);
      
      case 'most-minutes':
        const aMinutes = extractNumericMinutes(a);
        const bMinutes = extractNumericMinutes(b);
        // Si l'un est illimité (-1), il doit être en premier
        if (aMinutes === -1) return -1;
        if (bMinutes === -1) return 1;
        // Sinon, tri décroissant
        return bMinutes - aMinutes;
      
      case 'most-data':
        const aData = extractNumericData(a);
        const bData = extractNumericData(b);
        // Si l'un est illimité (-1), il doit être en premier
        if (aData === -1) return -1;
        if (bData === -1) return 1;
        // Sinon, tri décroissant
        return bData - aData;
      
      case '24-month-cost':
        return get24MonthCost(a) - get24MonthCost(b);
      
      default:
        return 0;
    }
  });
};

export function getPromotions() {
  const plans = loadPlans();
  return plans
    .filter(plan => plan.promotion)
    .map(plan => ({
      id: plan.id,
      provider: plan.provider,
      name: plan.name,
      price: plan.price,
      description: plan.promotion?.description || '',
      endDate: plan.promotion?.endDate || '',
      url: plan.url
    }))
    .sort((a, b) => a.price - b.price);
}

export function filterPlans(filters: {
  priceRange?: [number, number];
  networkType?: string[];
  minData?: number | string;
  calls?: number | string;
  messages?: number | string;
  features?: string[];
}) {
  console.log('=== Début du filtrage ===');
  console.log('Filtres reçus:', filters);

  // Vérification de sécurité
  if (!loadPlans()) {
    console.error('Plans data is not properly loaded');
    return [];
  }

  const filteredPlans = loadPlans().filter(plan => {
    console.log('\nAnalyse du plan:', plan.name);
    let passesDataFilter = true;
    let passesCallsFilter = true;
    let passesMessagesFilter = true;

    // Vérifier le prix
    if (filters.priceRange) {
      const [minPrice, maxPrice] = filters.priceRange;
      if (plan.price < minPrice || plan.price > maxPrice) {
        console.log(`${plan.name} exclu: prix ${plan.price} hors limites [${minPrice}, ${maxPrice}]`);
        return false;
      }
    }

    // Vérifier le type de réseau
    if (filters.networkType && filters.networkType.length > 0) {
      if (!filters.networkType.some(network => plan.networkType.includes(network))) {
        console.log(`${plan.name} exclu: réseau non compatible`);
        return false;
      }
    }

    // Filtrage des données
    let dataPass = true;
    if (filters.minData !== undefined) {
      console.log('\n=== Filtrage des données ===');
      console.log('Plan:', { name: plan.name, data: plan.data });
      
      if (isUnlimited(filters.minData)) {
        if (!isUnlimited(plan.data)) {
          console.log(`${plan.name} exclu: demande data illimitée mais plan limité`);
          dataPass = false;
        }
      } else {
        if (!isUnlimited(plan.data)) {
          const filterDataValue = typeof filters.minData === 'string'
            ? parseInt(filters.minData)
            : filters.minData;

          const planData = extractNumericValue(plan.data);
          console.log('Comparaison data:', {
            planData,
            filterDataValue,
            planDataRaw: plan.data,
            filterDataRaw: filters.minData
          });
          
          if (planData < filterDataValue) {
            console.log(`${plan.name} exclu: ${planData} Go < ${filterDataValue} Go demandés`);
            dataPass = false;
          }
        }
      }
    }

    // Vérifier les appels
    if (filters.calls !== undefined) {
      if (isUnlimited(filters.calls)) {
        if (!isUnlimited(plan.calls)) {
          console.log(`${plan.name} exclu: demande appels illimités mais plan limité`);
          passesCallsFilter = false;
        }
      } else {
        if (!isUnlimited(plan.calls)) {
          const filterCallsValue = typeof filters.calls === 'string'
            ? parseInt(filters.calls)
            : filters.calls;

          const planMinutes = extractNumericValue(plan.calls);
          console.log('Comparaison calls:', {
            planMinutes,
            filterCallsValue,
            planCallsRaw: plan.calls,
            filterCallsRaw: filters.calls
          });
          
          if (planMinutes < filterCallsValue) {
            console.log(`${plan.name} exclu: ${planMinutes} minutes < ${filterCallsValue} minutes demandées`);
            passesCallsFilter = false;
          }
        }
      }
    }

    // Vérifier les messages
    if (filters.messages !== undefined) {
      if (isUnlimited(filters.messages)) {
        if (!isUnlimited(plan.sms)) {
          console.log(`${plan.name} exclu: demande SMS illimités mais plan limité`);
          passesMessagesFilter = false;
        }
      } else {
        if (!isUnlimited(plan.sms)) {
          const filterMessagesValue = typeof filters.messages === 'string'
            ? parseInt(filters.messages)
            : filters.messages;

          const planSms = extractNumericValue(plan.sms);
          if (planSms < filterMessagesValue) {
            console.log(`${plan.name} exclu: ${planSms} SMS < ${filterMessagesValue} SMS demandés`);
            passesMessagesFilter = false;
          }
        }
      }
    }

    // Combiner tous les filtres avec ET logique
    const passes = dataPass && passesCallsFilter && passesMessagesFilter;
    console.log(`${plan.name} ${passes ? 'accepté' : 'exclu'} (data: ${dataPass}, calls: ${passesCallsFilter}, messages: ${passesMessagesFilter})`);
    return passes;
  });

  console.log('\n=== Résultats du filtrage ===');
  console.log('Plans retenus:', filteredPlans.map(p => p.name));

  return filteredPlans.map(plan => {
    const formattedData = formatData(plan.data);
    const formattedCalls = formatMinutes(plan.calls);
    
    return {
      ...plan,
      data: formattedData.value,
      dataDisplay: formattedData.display,
      calls: formattedCalls.value,
      callsDisplay: formattedCalls.display,
      network: plan.networkType
    };
  });
};
