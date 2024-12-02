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
        {sortedPlans.map((plan) => {
          const isBestPlan = bestPlan?.id === plan.id;
          const upfrontPrice = selectedPhone && selectedPhone.upfrontPrices?.[plan.provider.toLowerCase() as keyof Smartphone['upfrontPrices']];
          console.log('Debug upfront price:', {
            provider: plan.provider,
            providerLower: plan.provider.toLowerCase(),
            upfrontPrices: selectedPhone?.upfrontPrices,
            upfrontPrice
          });
          const dataValue = parseDataValue(plan.data);
          const callsValue = parseMinutesValue(plan.calls);

          return (
            <div
              key={plan.id}
              className={`bg-white rounded-xl shadow-md overflow-hidden relative ${
                isBestPlan ? 'ring-2 ring-yellow-400 shadow-lg transform hover:-translate-y-1' : ''
              } transition-all duration-200 hover:shadow-lg`}
            >
              {isBestPlan && (
                <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Meilleure offre
                </div>
              )}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center divide-x divide-gray-200">
                {/* Colonne 1: Smartphone sélectionné */}
                <div className="w-[160px] flex-shrink-0 px-4">
                  {selectedPhone ? (
                    <div className="flex flex-col items-center">
                      <div className="relative w-24 h-24 mb-2">
                        <Image
                          src={selectedPhone.imageUrl || '/images/default-phone.png'}
                          alt={`${selectedPhone.brand} ${selectedPhone.model}`}
                          className="w-full h-full object-contain"
                          width={100}
                          height={100}
                        />
                      </div>
                      {selectedPhone?.upfrontPrices?.[plan.provider.toLowerCase() as keyof Smartphone['upfrontPrices']] && (
                        <div className="text-center">
                          <p className="text-xs text-gray-600 mb-1">Coût initial</p>
                          <p className="font-semibold text-blue-600">
                            {selectedPhone?.upfrontPrices?.[plan.provider.toLowerCase() as keyof Smartphone['upfrontPrices']]?.price}€
                          </p>
                          <p className="text-xs text-gray-500">
                            {selectedPhone?.upfrontPrices?.[plan.provider.toLowerCase() as keyof Smartphone['upfrontPrices']]?.condition}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <p>Sélectionnez un smartphone pour voir les prix</p>
                    </div>
                  )}
                </div>

                {/* Colonne 2: Logo et nom de l'opérateur */}
                <div className="w-[300px] flex-shrink-0 px-4">
                  <div className="flex flex-col space-y-3">
                    {/* Logo et nom du plan */}
                    <div className="flex items-center gap-3">
                      <Image 
                        src={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/images/${plan.provider.toLowerCase()}-logo.svg`}
                        alt={`${plan.provider} logo`}
                        className="h-8 w-auto"
                        width={50}
                        height={32}
                      />
                      <h3 className="text-xl font-bold text-blue-600">{plan.name}</h3>
                    </div>

                    {/* Features avec icônes */}
                    {plan.features && plan.features.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-2">
                        <ul className="space-y-1">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                              <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Colonne 3: Caractéristiques principales */}
                <div className="w-[400px] px-4">
                  <div className="flex justify-between items-center">
                    {/* Appels */}
                    <div className="flex flex-col items-center justify-center w-1/3">
                      <DonutGauge
                        value={callsValue}
                        maxValue={maxCallsValue}
                        label="Appels"
                        color="#22c55e"
                        displayText={plan.calls}
                        tooltip={`${callsValue === -1 ? 'Appels illimités' : `${callsValue} minutes d'appel`} inclus dans ce forfait`}
                      />
                    </div>

                    {/* Data */}
                    <div className="flex flex-col items-center justify-center w-1/3">
                      <DonutGauge
                        value={dataValue}
                        maxValue={maxDataValue}
                        label="Data"
                        color="#3b82f6"
                        displayText={plan.data}
                        tooltip={`${dataValue === -1 ? 'Data illimitée' : `${dataValue} Go de données mobiles`} inclus dans ce forfait`}
                      />
                    </div>

                    {/* Réseau */}
                    <div className="flex flex-col items-center justify-center w-1/3">
                      <span className="text-sm text-gray-500 mb-2">Réseau</span>
                      <div className="flex gap-1">
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

                {/* Prix et actions */}
                <div className="flex-1 flex flex-col items-center gap-2 px-4 py-4">
                  {plan.promotion && (
                    <span className="inline-block bg-red-100 text-red-600 text-sm px-2 py-1 rounded-full">
                      {plan.promotion.description}
                    </span>
                  )}
                  <div className="text-3xl font-bold text-blue-600">
                    {plan.price}€<span className="text-sm font-normal">/mois</span>
                  </div>
                  {selectedPhone?.upfrontPrices?.[plan.provider.toLowerCase() as keyof Smartphone['upfrontPrices']]?.condition && (
                    <div className="text-sm text-gray-600 text-center mb-2">
                      {selectedPhone?.upfrontPrices?.[plan.provider.toLowerCase() as keyof Smartphone['upfrontPrices']]?.condition}
                    </div>
                  )}
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex gap-2">
                      {selectedPhone?.upfrontPrices?.[plan.provider.toLowerCase() as keyof Smartphone['upfrontPrices']]?.url ? (
                        <a
                          href={selectedPhone?.upfrontPrices?.[plan.provider.toLowerCase() as keyof Smartphone['upfrontPrices']]?.url || plan.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 text-center"
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
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 text-center"
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
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                        className="bg-blue-100 hover:bg-blue-200 text-blue-600 font-bold py-2 px-6 rounded-lg transition-colors duration-200 text-center flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                          <path d="M4 2C2.8 3.7 2 5.7 2 8" />
                          <path d="M22 8c0-2.3-.8-4.3-2-6" />
                        </svg>
                        Alerte de prix
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
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
