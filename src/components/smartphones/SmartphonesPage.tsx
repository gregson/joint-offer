'use client';

import React, { useState, useMemo } from 'react';
import { getSmartphones } from '@/utils/dataLoader';
import type { Smartphone } from '@/types/smartphone';
import { useRouter } from 'next/navigation';

export default function SmartphonesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const smartphones = getSmartphones();
  
  // Calculer le prix maximum parmi tous les smartphones
  const maxPrice = useMemo(() => {
    const allPrices = smartphones.flatMap(phone => 
      Object.values(phone.upfrontPrices || {})
        .map(p => p?.price || 0)
    );
    return Math.max(...allPrices);
  }, [smartphones]);

  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'storage-asc' | 'storage-desc'>('price-asc');

  const brands = Array.from(new Set(smartphones.map(phone => phone.brand))).sort();

  const filteredAndSortedPhones = useMemo(() => {
    return smartphones
      .filter(phone => {
        const phoneModel = String(phone?.model || '');
        const phoneBrand = String(phone?.brand || '');
        const searchTermLower = searchTerm.toLowerCase();
        
        const matchesSearch = searchTerm === '' || 
          phoneModel.toLowerCase().includes(searchTermLower) ||
          phoneBrand.toLowerCase().includes(searchTermLower);
          
        const matchesBrand = !selectedBrand || phoneBrand === selectedBrand;
        const lowestPrice = Math.min(...Object.values(phone.upfrontPrices || {}).map(p => p.price));
        const matchesPrice = lowestPrice >= priceRange[0] && lowestPrice <= priceRange[1];
        
        return matchesSearch && matchesBrand && matchesPrice;
      })
      .sort((a, b) => {
        const getLowestPrice = (phone: Smartphone) => 
          Math.min(...Object.values(phone.upfrontPrices || {}).map(p => p.price));

        switch (sortBy) {
          case 'price-asc':
            return getLowestPrice(a) - getLowestPrice(b);
          case 'price-desc':
            return getLowestPrice(b) - getLowestPrice(a);
          case 'storage-asc':
            return a.storage - b.storage;
          case 'storage-desc':
            return b.storage - a.storage;
          default:
            return 0;
        }
      });
  }, [smartphones, searchTerm, selectedBrand, priceRange, sortBy]);

  const handlePhoneClick = (phone: Smartphone) => {
    router.push(`/search?phone=${phone.id}`);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Smartphones</h1>
          <p className="mt-2 text-gray-600">
            Découvrez notre sélection de smartphones disponibles chez les principaux opérateurs belges
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Rechercher
              </label>
              <input
                type="text"
                id="search"
                placeholder="Nom du smartphone..."
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Brand filter */}
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                Marque
              </label>
              <select
                id="brand"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
              >
                <option value="">Toutes les marques</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            {/* Price range */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Prix maximum: {priceRange[1]}€
              </label>
              <input
                type="range"
                id="price"
                min="0"
                max={maxPrice}
                step={50}
                className="w-full"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
              />
            </div>

            {/* Sort */}
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
                Trier par
              </label>
              <select
                id="sort"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              >
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="storage-asc">Stockage croissant</option>
                <option value="storage-desc">Stockage décroissant</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedPhones.map(phone => {
            const lowestPrice = Math.min(...Object.values(phone.upfrontPrices || {}).map(p => p.price));
            const providers = Object.keys(phone.upfrontPrices || {});

            return (
              <div
                key={phone.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => handlePhoneClick(phone)}
              >
                <div className="aspect-w-1 aspect-h-1 bg-white">
                  <img
                    src={phone.imageUrl}
                    alt={`${phone.brand} ${phone.model}`}
                    className="w-full h-48 object-contain p-4"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {phone.brand} {phone.model}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {phone.storage}GB
                  </p>
                  <p className="text-lg font-bold text-blue-600 mb-2">
                    À partir de {lowestPrice}€
                  </p>
                  <div className="flex gap-2 mt-2">
                    {providers.map(provider => (
                      <img
                        key={provider}
                        src={`/images/${provider}-logo.svg`}
                        alt={`${provider} logo`}
                        className="h-6 w-auto"
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAndSortedPhones.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun smartphone trouvé
            </h3>
            <p className="text-gray-600">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
