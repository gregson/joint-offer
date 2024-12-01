'use client';

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getPlans, filterPlans, sortPlans, type SortOption } from '@/utils/dataLoader';
import SmartphoneModal from '@/components/search/SmartphoneModal';
import PlanOptions from '@/components/search/PlanOptions';
import PlanResults from '@/components/search/PlanResults';
import Image from 'next/image';
import DonutGauge from '@/components/search/DonutGauge';
import type { Smartphone } from '@/types/smartphone';
import type { FilterState } from '@/components/search/PlanFilters';
import Link from 'next/link';
import smartphonesData from '@/data/smartphones.json';

const smartphones: Smartphone[] = smartphonesData as Smartphone[];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedPhone, setSelectedPhone] = React.useState<Smartphone | null>(null);
  const [filters, setFilters] = React.useState<FilterState>({
    priceRange: [0, 200],
    data: '1',
    calls: '60',
    messages: '100',
    networkType: [],
    features: []
  });
  const [sortBy, setSortBy] = React.useState<SortOption>('lowest-price');

  // Pré-sélectionner le smartphone depuis l'URL et réinitialiser les filtres
  useEffect(() => {
    const phoneId = searchParams?.get('phone');
    if (phoneId) {
      const phone = smartphones.find(s => s.id === phoneId);
      if (phone) {
        setSelectedPhone(phone);
        // Réinitialiser les filtres avec des valeurs minimales pour montrer plus de résultats
        setFilters({
          priceRange: [0, 200],
          data: '1',
          calls: '60',
          messages: '100',
          networkType: [],
          features: []
        });
        // Définir le tri par coût initial le plus bas
        setSortBy('lowest-upfront');
      }
    }
  }, [searchParams]);

  // Récupérer tous les plans
  const allPlans = getPlans();

  // Ajouter des logs pour le debugging
  React.useEffect(() => {
    console.log('=== État des filtres ===');
    console.log('Filtres actuels:', filters);
  }, [filters]);

  // Filtrer les plans en fonction des critères
  const filteredPlans = React.useMemo(() => {
    const filterParams = {
      maxPrice: filters.priceRange[1],
      networkType: filters.networkType,
      minData: filters.data,
      calls: filters.calls,
      messages: filters.messages,
      features: filters.features
    };
    
    console.log('=== Paramètres de filtrage ===');
    console.log('Paramètres:', filterParams);
    
    const results = filterPlans(filterParams);
    
    console.log('=== Résultats du filtrage ===');
    console.log('Nombre de plans trouvés:', results.length);
    console.log('Plans filtrés:', results.map(plan => ({
      name: plan.name,
      price: plan.price,
      data: plan.data,
      calls: plan.calls,
      network: plan.networkType
    })));
    
    return results;
  }, [filters]);

  // Mettre à jour les plans filtrés quand le smartphone change
  useEffect(() => {
    const sorted = sortPlans(filteredPlans, sortBy, selectedPhone);
    // setFilteredPlans(sorted); // Supprimé car filteredPlans est déjà mis à jour
  }, [selectedPhone, sortBy]);

  return (
    <main className="flex-1 p-4">
      <div className="max-w-7xl mx-auto">
        {/* En-tête avec titre et description */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Trouvez votre forfait idéal</h1>
              <p className="text-gray-600">Comparez et choisissez parmi nos offres adaptées à vos besoins</p>
            </div>
            
            {/* Bouton Quiz */}
            <Link
              href="/recommend"
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:animate-bounce" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z" clipRule="evenodd" />
              </svg>
              Trouver mon smartphone idéal
            </Link>
          </div>
        </div>

        {/* Barre de filtres unifiée */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex items-center space-x-6 p-4">
            {/* Sélection du smartphone */}
            <div 
              onClick={() => setIsModalOpen(true)}
              className="flex-shrink-0 w-64 cursor-pointer group"
            >
              {selectedPhone ? (
                <div className="flex items-start space-x-4 p-3 rounded-lg group-hover:bg-gray-50 transition-colors h-28 overflow-hidden">
                  <div className="relative w-28 h-36 flex-shrink-0">
                    <img
                      src={selectedPhone.imageUrl || '/images/smartphone-default.png'}
                      alt={`${selectedPhone.brand} ${selectedPhone.model}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0 pt-1">
                    <div className="text-xs text-gray-400 mb-0.5">
                      Smartphone sélectionné
                    </div>
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {selectedPhone.brand}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {selectedPhone.model}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3 p-2 rounded-lg group-hover:bg-gray-50 transition-colors">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm4 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-500">Choisir un smartphone</span>
                </div>
              )}
            </div>

            {/* Séparateur vertical */}
            <div className="h-10 w-px bg-gray-200"></div>

            {/* Options de forfait */}
            <div className="flex-1">
              <PlanOptions
                data={filters.data}
                calls={filters.calls}
                messages={filters.messages}
                onDataChange={(value) => setFilters(prev => ({ ...prev, data: value }))}
                onCallsChange={(value) => setFilters(prev => ({ ...prev, calls: value }))}
                onMessagesChange={(value) => setFilters(prev => ({ ...prev, messages: value }))}
              />
            </div>
          </div>
        </div>

        {/* Résultats */}
        <div className="mt-6">
          {filteredPlans.length > 0 ? (
            <PlanResults plans={sortPlans(filteredPlans, sortBy, selectedPhone)} selectedPhone={selectedPhone} />
          ) : (
            <div className="text-center py-8 text-gray-500">
              Aucun forfait ne correspond à vos critères
            </div>
          )}
        </div>

      </div>

      {/* Modal de sélection du smartphone */}
      <SmartphoneModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(phone) => {
          setSelectedPhone(phone);
          setIsModalOpen(false);
        }}
        filterComparable={false}
      />
    </main>
  );
}
