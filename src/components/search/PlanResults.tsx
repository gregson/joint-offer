'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import * as gtag from '@/lib/gtag';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FacebookShareButton,
  WhatsappShareButton,
  FacebookIcon,
  WhatsappIcon,
} from 'react-share';
import { Plan } from '@/types/plan';
import { Smartphone } from '@/types/smartphone';
import DonutGauge from './DonutGauge';
import { PriceAlertModal } from "@/components/alerts/PriceAlertModal";
import type { SortOption } from '@/utils/dataLoader';
import type { Provider } from '@/types/priceAlert';
import { Bell, TrendingDown, ArrowUpDown, Mail } from "lucide-react";

interface PlanResultsProps {
  plans: Plan[];
  selectedPhone: Smartphone | null;
}

const PlanResults: React.FC<PlanResultsProps> = ({ plans, selectedPhone }) => {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isPriceAlertOpen, setIsPriceAlertOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('lowest-price');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [upfrontPrice, setUpfrontPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const parseValue = (value: any): number => {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    const strValue = String(value);
    if (strValue.toLowerCase().includes('illimité') || strValue.toLowerCase().includes('unlimited')) return -1;
    const match = strValue.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  // Fonction pour extraire la valeur numérique du volume de données
  const parseDataValue = (dataStr: any): number => {
    if (!dataStr) return 0;
    if (typeof dataStr === 'number') return dataStr;
    const strValue = String(dataStr).toLowerCase();
    
    // Cas des données illimitées
    if (strValue.includes('illimité')) return -1;
    
    // Extraire le nombre
    const match = strValue.match(/(\d+)/);
    return match ? parseInt(match[0], 10) : 0;
  };

  const parseMinutesValue = (minutes: any): number => {
    if (!minutes) return 0;
    if (typeof minutes === 'number') return minutes;
    const strValue = String(minutes).toLowerCase();
    
    // Cas des minutes illimitées
    if (strValue.includes('illimité')) return -1;
    
    // Extraire le nombre
    const match = strValue.match(/(\d+)/);
    return match ? parseInt(match[0], 10) : 0;
  };

  // Fonction de tri des plans avec animation de chargement
  const sortPlans = useCallback((plansToSort: Plan[]): Plan[] => {
    // Ne pas déclencher setIsLoading ici car cela causerait un re-render
    const result = [...plansToSort].sort((a, b) => {
      switch (sortBy) {
        case 'lowest-price':
          return a.price - b.price;
        case 'lowest-upfront':
          return (selectedPhone?.upfrontPrices?.[a.provider.toLowerCase() as keyof Smartphone['upfrontPrices']]?.price || 0) -
                 (selectedPhone?.upfrontPrices?.[b.provider.toLowerCase() as keyof Smartphone['upfrontPrices']]?.price || 0);
        case 'most-data':
          return parseDataValue(b.data) - parseDataValue(a.data);
        case 'most-calls':
          return parseMinutesValue(b.calls) - parseMinutesValue(a.calls);
        case '24-month-cost':
          return (b.price * 24) - (a.price * 24);
        default:
          return 0;
      }
    });
    return result;
  }, [sortBy, selectedPhone]);

  // Effet pour gérer l'animation de chargement lors du tri
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [sortBy]); // Se déclenche uniquement quand l'option de tri change

  const sortedPlans = useMemo(() => {
    return sortPlans(plans.filter(plan => {
      if (!selectedPhone) return true;
      const provider = plan.provider.toLowerCase();
      return selectedPhone.upfrontPrices?.[provider as keyof Smartphone['upfrontPrices']]?.price !== undefined;
    }));
  }, [plans, selectedPhone, sortPlans]);

  // Fonction pour déterminer la meilleure offre
  const getBestPlan = (plans: Plan[]) => {
    if (!plans.length) return null;
    
    // Système de points pour évaluer les offres
    const scorePlan = (plan: Plan) => {
      let score = 0;
      
      // Prix mensuel (plus bas = meilleur)
      const basePrice = typeof plan.price === 'number' ? plan.price : parseFloat(String(plan.price));
      score -= basePrice * 2; // Le prix a un poids important
      
      // Data (plus = meilleur)
      const dataGB = parseDataValue(plan.data);
      score += Math.min(dataGB, 100); // Plafond à 100Go pour ne pas surpondérer
      
      // Promotion (bonus)
      if (plan.promotion) {
        score += 20;
      }
      
      // Réseau 5G (bonus)
      if (Array.isArray(plan.networkType) && plan.networkType.includes('5G')) {
        score += 15;
      }
      
      return score;
    };

    // Trouver le plan avec le meilleur score
    return plans.reduce((best, current) => {
      return scorePlan(current) > scorePlan(best) ? current : best;
    }, plans[0]);
  };

  const bestPlan = getBestPlan(plans);

  // Calcul de la valeur maximale de data pour les jauges
  const maxDataValue = Math.max(50, ...sortedPlans.map(plan => {
    const value = parseDataValue(plan.data);
    return value === -1 ? 50 : value;
  }));

  const maxCallsValue = Math.max(60, ...sortedPlans.map(plan => {
    const callsValue = parseMinutesValue(plan.calls);
    return callsValue === -1 ? 60 : callsValue;
  }));

  return (
    <div className="space-y-4 py-4">
      {/* En-tête avec tri */}
      <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-lg shadow">
        <div className="text-sm text-gray-600">
          {sortedPlans.length} forfait{sortedPlans.length > 1 ? 's' : ''} trouvé{sortedPlans.length > 1 ? 's' : ''}
          {selectedPhone && (
            <span> avec le smartphone {selectedPhone.brand} {selectedPhone.model} {selectedPhone.storage}GB</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <label htmlFor="sort" className="text-sm text-gray-600">Trier par:</label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="border rounded-lg px-3 py-1.5 text-sm bg-white"
          >
            <option value="lowest-price">Prix mensuel le plus bas</option>
            <option value="lowest-upfront">Coût initial le plus bas</option>
            <option value="most-data">Plus de données</option>
            <option value="most-calls">Plus d'appels</option>
            <option value="24-month-cost">Coût 24 mois le plus bas</option>
          </select>
        </div>
      </div>

      {/* Animation de chargement */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Liste des forfaits */}
      <div className={`space-y-4 transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
        {sortedPlans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row transition-all duration-200 hover:shadow-lg">
            {/* Section image */}
            <div className="w-full md:w-[160px] flex-shrink-0 p-4 flex justify-center">
              <div className="flex flex-col items-center">
                {selectedPhone ? (
                  <>
                    <div className="relative w-24 h-24 mb-2">
                      <Image
                        src={selectedPhone.imageUrl || '/images/default-phone.png'}
                        alt={`${selectedPhone.brand} ${selectedPhone.model}`}
                        className="w-full h-full object-contain"
                        width={96}
                        height={96}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">Coût initial</p>
                      <p className="font-semibold text-blue-600">
                        {selectedPhone.upfrontPrices?.[plan.provider.toLowerCase() as keyof Smartphone['upfrontPrices']]?.price}€
                      </p>
                      {selectedPhone.upfrontPrices?.[plan.provider.toLowerCase() as keyof Smartphone['upfrontPrices']]?.condition && (
                        <p className="text-xs text-gray-500">
                          {selectedPhone.upfrontPrices[plan.provider.toLowerCase() as keyof Smartphone['upfrontPrices']]?.condition}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="w-24 h-24 flex items-center justify-center">
                    <Image
                      src={`/images/${plan.provider.toLowerCase()}-logo.svg`}
                      alt={`${plan.provider} logo`}
                      width={96}
                      height={32}
                      className="h-8 w-auto"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Section description */}
            <div className="flex-1 p-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Image
                    src={`/images/${plan.provider.toLowerCase()}-logo.svg`}
                    alt={`${plan.provider} logo`}
                    width={96}
                    height={32}
                    className="h-8 w-auto"
                  />
                  <h3 className="text-xl font-bold text-blue-600">{plan.name}</h3>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  {/* Liste des caractéristiques */}
                  <div className="flex-1 bg-gray-50 rounded-lg p-4">
                    <ul className="space-y-2">
                      {plan.features?.map((feature, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                      <li className="text-sm text-gray-700 flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>
                          {parseDataValue(plan.data) === -1 
                            ? "Data illimitée" 
                            : `${parseDataValue(plan.data)} GB de données mobiles`}
                        </span>
                      </li>
                      <li className="text-sm text-gray-700 flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>
                          {parseMinutesValue(plan.calls) === -1 
                            ? "Appels illimités" 
                            : `${parseMinutesValue(plan.calls)} minutes d'appel`}
                        </span>
                      </li>
                      <li className="text-sm text-gray-700 flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Réseau {plan.networkType.join(" + ")}</span>
                      </li>
                    </ul>
                  </div>

                  {/* Jauges et réseau */}
                  <div className="flex flex-col gap-4 md:w-[240px]">
                    {/* Jauges */}
                    <div className="flex justify-around">
                      <div className="flex flex-col items-center justify-center">
                        <DonutGauge
                          value={parseMinutesValue(plan.calls)}
                          maxValue={maxCallsValue}
                          label="Appels"
                          color="#22c55e"
                          displayText={parseMinutesValue(plan.calls) === -1 ? "∞" : `${parseMinutesValue(plan.calls)}min`}
                          tooltip={`${parseMinutesValue(plan.calls) === -1 ? 'Appels illimités' : `${parseMinutesValue(plan.calls)} minutes d'appel`} inclus dans ce forfait`}
                        />
                      </div>
                      <div className="flex flex-col items-center justify-center">
                        <DonutGauge
                          value={parseDataValue(plan.data)}
                          maxValue={maxDataValue}
                          label="Data"
                          color="#3b82f6"
                          displayText={parseDataValue(plan.data) === -1 ? "∞" : `${parseDataValue(plan.data)}GB`}
                          tooltip={`${parseDataValue(plan.data) === -1 ? 'Data illimitée' : `${parseDataValue(plan.data)} GB de données mobiles`} inclus dans ce forfait`}
                        />
                      </div>
                    </div>

                    {/* Réseau */}
                    <div className="flex flex-col items-center">
                      <span className="text-sm text-gray-500 mb-2">Réseau</span>
                      <div className="flex flex-wrap justify-center gap-1">
                        {plan.networkType.map(type => (
                          <span
                            key={type}
                            className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section prix */}
            <div className="flex-1 flex flex-col items-center p-4 gap-2">
              {plan.promotion && (
                <span className="inline-block bg-red-100 text-red-600 text-sm px-3 py-1 rounded-full">
                  {plan.promotion.description}
                </span>
              )}
              <div className="text-3xl font-bold text-blue-600">
                {plan.price}€<span className="text-sm font-normal">/mois</span>
              </div>
              {selectedPhone?.upfrontPrices?.[plan.provider.toLowerCase() as keyof Smartphone['upfrontPrices']]?.condition && (
                <div className="text-sm text-gray-600 text-center">
                  {selectedPhone?.upfrontPrices?.[plan.provider.toLowerCase() as keyof Smartphone['upfrontPrices']]?.condition}
                </div>
              )}
              <div className="flex flex-col w-full gap-3">
                <div className="flex gap-2">
                  {selectedPhone?.upfrontPrices?.[plan.provider.toLowerCase() as keyof Smartphone['upfrontPrices']]?.url ? (
                    <a
                      href={selectedPhone?.upfrontPrices?.[plan.provider.toLowerCase() as keyof Smartphone['upfrontPrices']]?.url || plan.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg text-center"
                      onClick={() => {
                        gtag.event({
                          action: 'view_offer',
                          category: 'engagement',
                          label: `${plan.provider} - ${plan.name}${selectedPhone ? ` avec ${selectedPhone.brand} ${selectedPhone.model}` : ''}`,
                          value: Math.round(plan.price)
                        });
                      }}
                    >
                      Voir offre
                    </a>
                  ) : (
                    <Link
                      href={`/plan/${plan.id}`}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg text-center"
                      onClick={() => {
                        gtag.event({
                          action: 'view_plan_details',
                          category: 'engagement',
                          label: `${plan.provider} - ${plan.name}`,
                          value: Math.round(plan.price)
                        });
                      }}
                    >
                      Voir offre
                    </Link>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded-lg transition-colors duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem asChild>
                        <FacebookShareButton
                          url={`${window.location.origin}/plan/${plan.id}`}
                          hashtag="#JointOffer"
                          onClick={() => {
                            gtag.event({
                              action: "share",
                              category: "Social",
                              label: "Facebook",
                              value: plan.price
                            });
                          }}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <FacebookIcon size={24} round />
                            <span>Partager sur Facebook</span>
                          </div>
                        </FacebookShareButton>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a
                          href={`https://twitter.com/intent/tweet?url=${window.location.origin}/search${selectedPhone ? `?phone=${selectedPhone.id}` : ''}&text=${encodeURIComponent(
                            selectedPhone 
                              ? `J'ai trouvé la meilleure offre pour le ${selectedPhone.brand} ${selectedPhone.model} !\n${plan.price}€/mois avec ${plan.provider} (${plan.name}) - Prix du téléphone : ${selectedPhone.upfrontPrices?.[plan.provider.toLowerCase() as keyof Smartphone['upfrontPrices']]?.price}€\n\n#JointOffer #ComparaisonPrix #Smartphone #BonPlan #${plan.provider} #Mobile #Belgique`
                              : `J'ai trouvé un super forfait sur JointOffer : ${plan.name} à ${plan.price}€/mois !\n\n#JointOffer #ComparaisonPrix #Smartphone #BonPlan #${plan.provider} #Mobile #Belgique`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            gtag.event({
                              action: "share",
                              category: "Social",
                              label: "X",
                              value: plan.price
                            });
                          }}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 p-0.5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                            <span>Partager sur X</span>
                          </div>
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <WhatsappShareButton
                          url={`${window.location.origin}/plan/${plan.id}`}
                          title={selectedPhone && selectedPhone.upfrontPrices?.[plan.provider.toLowerCase() as keyof Smartphone['upfrontPrices']]
                            ? `J'ai trouvé la meilleure offre pour le ${selectedPhone.brand} ${selectedPhone.model} !\n${plan.price}€/mois avec ${plan.provider} (${plan.name}) - Prix du téléphone : ${selectedPhone.upfrontPrices[plan.provider.toLowerCase() as keyof Smartphone['upfrontPrices']]?.price}€`
                            : `J'ai trouvé un super forfait sur JointOffer : ${plan.name} à ${plan.price}€/mois !`
                          }
                          onClick={() => {
                            gtag.event({
                              action: "share",
                              category: "Social",
                              label: "WhatsApp",
                              value: plan.price
                            });
                          }}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <WhatsappIcon size={24} round />
                            <span>Partager sur WhatsApp</span>
                          </div>
                        </WhatsappShareButton>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {!!selectedPhone?.upfrontPrices?.[plan.provider.toLowerCase() as keyof Smartphone['upfrontPrices']] && (
                  <button
                    onClick={() => {
                      setSelectedProvider(plan.provider as Provider);
                      setUpfrontPrice(selectedPhone.upfrontPrices?.[plan.provider.toLowerCase() as keyof Smartphone['upfrontPrices']]?.price || 0);
                      setIsPriceAlertOpen(true);
                    }}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-600 font-bold py-2 px-4 rounded-lg flex justify-center items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" stroke="currentColor">
                      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    </svg>
                    Alerte de prix
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal d'alerte de prix */}
      {selectedPhone && selectedProvider && upfrontPrice !== null && (
        <PriceAlertModal
          isOpen={isPriceAlertOpen}
          onClose={() => setIsPriceAlertOpen(false)}
          smartphone={selectedPhone}
          provider={selectedProvider}
          upfrontPrice={upfrontPrice}
        />
      )}
    </div>
  );
};

export default PlanResults;
