import type { Plan } from '@/types/plan';
import { getPlans } from './dataLoader';

interface PlanFeatures {
  data: number;
  calls: number;
  price: number;
  networkTypes: Set<string>;
  features: Set<string>;
}

function extractFeatures(plan: Plan): PlanFeatures {
  // Convertit les données en nombres pour la comparaison
  const parseValue = (value: string): number => {
    if (value === 'Unlimited' || value === 'Illimité') return 999;
    const match = value.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  return {
    data: parseValue(plan.data),
    calls: parseValue(plan.calls),
    price: plan.price,
    networkTypes: new Set(plan.networkType),
    features: new Set(plan.features),
  };
}

function calculateSimilarityScore(planA: PlanFeatures, planB: PlanFeatures): number {
  // Poids pour chaque critère
  const weights = {
    data: 0.3,
    calls: 0.15,
    price: 0.25,
    network: 0.15,
    features: 0.15,
  };

  // Score pour les données mobiles (plus proche = meilleur score)
  const dataScore = 1 - Math.min(Math.abs(planA.data - planB.data) / Math.max(planA.data, 100), 1);

  // Score pour les appels
  const callsScore = 1 - Math.min(Math.abs(planA.calls - planB.calls) / Math.max(planA.calls, 100), 1);

  // Score pour le prix (tolérance de 30%)
  const priceScore = 1 - Math.min(Math.abs(planA.price - planB.price) / (planA.price * 0.3), 1);

  // Score pour le type de réseau
  const networkIntersection = new Set([...planA.networkTypes].filter(x => planB.networkTypes.has(x)));
  const networkScore = networkIntersection.size / Math.max(planA.networkTypes.size, planB.networkTypes.size);

  // Score pour les fonctionnalités
  const featureIntersection = new Set([...planA.features].filter(x => planB.features.has(x)));
  const featureScore = featureIntersection.size / Math.max(planA.features.size, planB.features.size);

  // Score final pondéré
  return (
    weights.data * dataScore +
    weights.calls * callsScore +
    weights.price * priceScore +
    weights.network * networkScore +
    weights.features * featureScore
  );
}

export function findSimilarPlans(
  targetPlan: Plan,
  options: {
    maxResults?: number;
    priceRange?: { min: number; max: number };
    minSimilarityScore?: number;
    excludeProviders?: string[];
  } = {}
): { plan: Plan; similarityScore: number }[] {
  const {
    maxResults = 3,
    priceRange = { min: 0, max: Infinity },
    minSimilarityScore = 0.6,
    excludeProviders = [],
  } = options;

  const allPlans = getPlans();
  const targetFeatures = extractFeatures(targetPlan);
  
  const similarPlans = allPlans
    .filter(plan => 
      plan.id !== targetPlan.id && 
      plan.price >= priceRange.min &&
      plan.price <= priceRange.max &&
      !excludeProviders.includes(plan.provider)
    )
    .map(plan => ({
      plan,
      similarityScore: calculateSimilarityScore(targetFeatures, extractFeatures(plan))
    }))
    .filter(({ similarityScore }) => similarityScore >= minSimilarityScore)
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, maxResults);

  return similarPlans;
}

export function explainSimilarity(targetPlan: Plan, similarPlan: Plan): string {
  const targetFeatures = extractFeatures(targetPlan);
  const similarFeatures = extractFeatures(similarPlan);

  const differences = [];
  const similarities = [];

  // Données mobiles
  const dataDiff = similarFeatures.data - targetFeatures.data;
  if (Math.abs(dataDiff) <= 20) {
    similarities.push(`Volume de données similaire (${similarPlan.data})`);
  } else {
    differences.push(
      `${Math.abs(dataDiff)}Go ${dataDiff > 0 ? 'de plus' : 'de moins'} de données`
    );
  }

  // Prix
  const priceDiff = similarFeatures.price - targetFeatures.price;
  const pricePercent = (Math.abs(priceDiff) / targetFeatures.price) * 100;
  if (Math.abs(pricePercent) <= 10) {
    similarities.push('Prix comparable');
  } else {
    differences.push(
      `${Math.abs(priceDiff.toFixed(2))}€ ${priceDiff > 0 ? 'plus cher' : 'moins cher'} (${pricePercent.toFixed(1)}%)`
    );
  }

  // Réseau
  const commonNetworks = [...targetFeatures.networkTypes].filter(x => 
    similarFeatures.networkTypes.has(x)
  );
  if (commonNetworks.length > 0) {
    similarities.push(`Même type de réseau (${commonNetworks.join(', ')})`);
  }

  // Fonctionnalités communes
  const commonFeatures = [...targetFeatures.features].filter(x => 
    similarFeatures.features.has(x)
  );
  if (commonFeatures.length > 0) {
    similarities.push(`${commonFeatures.length} fonctionnalités en commun`);
  }

  let explanation = `Ce forfait est intéressant car :\n`;
  if (similarities.length > 0) {
    explanation += `✓ ${similarities.join('\n✓ ')}\n`;
  }
  if (differences.length > 0) {
    explanation += `\nDifférences notables :\n• ${differences.join('\n• ')}`;
  }

  return explanation;
}
