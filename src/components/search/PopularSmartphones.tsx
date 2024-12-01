'use client';

import React from 'react';
import { getSmartphones } from '@/utils/dataLoader';
import type { Smartphone } from '@/types/smartphone';

interface PopularSmartphonesProps {
  onSelect: (phone: Smartphone) => void;
}

const PopularSmartphones: React.FC<PopularSmartphonesProps> = ({ onSelect }) => {
  const smartphones = getSmartphones();
  
  // Sélectionner les smartphones avec plusieurs providers
  const popularPhones = [
    smartphones.find(phone => phone.id === 'samsung-galaxy-z-fold6-256'),
    smartphones.find(phone => phone.id === 'xiaomi-14t-pro-512'),
    smartphones.find(phone => phone.id === 'apple-iphone-15-128')
  ].filter((phone): phone is Smartphone => phone !== undefined);

  // Fonction pour trouver le prix le plus bas parmi tous les providers
  const getLowestPrice = (phone: Smartphone) => {
    if (!phone.upfrontPrices) return null;
    return Math.min(...Object.values(phone.upfrontPrices).map(p => p.price));
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Smartphones populaires</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {popularPhones.map(phone => {
          const lowestPrice = getLowestPrice(phone);
          return (
            <div
              key={phone.id}
              className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => onSelect(phone)}
            >
              <div className="aspect-w-3 aspect-h-4 mb-4">
                <img
                  src={phone.imageUrl}
                  alt={`${phone.brand} ${phone.model}`}
                  className="w-full h-48 object-contain"
                />
              </div>
              <h3 className="font-bold text-lg mb-1">{phone.brand} {phone.model}</h3>
              <p className="text-gray-600">{phone.storage}GB</p>
              {lowestPrice !== null && (
                <p className="text-blue-600 font-semibold mt-2">
                  À partir de {lowestPrice}€
                </p>
              )}
              <div className="mt-2 flex gap-2">
                {Object.keys(phone.upfrontPrices).map(provider => (
                  <img
                    key={provider}
                    src={`/images/${provider}-logo.svg`}
                    alt={`${provider} logo`}
                    className="h-6 w-auto"
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PopularSmartphones;
