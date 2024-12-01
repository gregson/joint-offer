import React, { useRef } from 'react';
import type { Smartphone } from '@/types/smartphone';

interface ComparisonImageProps {
  phones: Array<{
    id: string;
    brand: string;
    model: string;
    storage: number;
    prices: {
      proximus: number | null;
      voo: number | null;
      orange: number | null;
    };
  }>;
}

export function ComparisonImage({ phones }: ComparisonImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto"
      style={{ fontFamily: 'Arial, sans-serif' }}
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Comparaison JointOffer</h2>
        <p className="text-gray-600">Comparaison des meilleurs forfaits smartphones</p>
      </div>

      <div className="grid gap-6">
        {phones.map((phone) => {
          const bestPrice = Math.min(
            ...[phone.prices.proximus, phone.prices.voo, phone.prices.orange]
              .filter((price): price is number => price !== null)
          );
          const monthlyPrice = Math.round((bestPrice / 24 + 20.99) * 100) / 100;

          return (
            <div key={phone.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {phone.brand} {phone.model}
                  </h3>
                  <p className="text-gray-600">{phone.storage}GB</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-800">
                    {bestPrice}€
                  </div>
                  <div className="text-sm text-gray-600">
                    ou {monthlyPrice}€/mois*
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-sm text-gray-500 text-center">
        <p>*Prix calculé sur 24 mois avec le forfait de base</p>
        <p className="mt-2">www.jointoffer.be</p>
      </div>
    </div>
  );
}
