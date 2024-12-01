import React from 'react';
import Image from 'next/image';
import { getPromotions } from '@/utils/dataLoader';

const Promotions = () => {
  const promotions = getPromotions();

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Offres promotionnelles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {promotions.map((promo) => (
            <div 
              key={promo.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200"
            >
              <div className="relative">
                <div className="aspect-w-16 aspect-h-9 relative">
                  {/* Note: Add actual images to public/images/ directory */}
                  <div className="bg-gray-200 w-full h-48"/>
                </div>
                <span className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {promo.tag}
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{promo.title}</h3>
                <p className="text-gray-600 mb-4">{promo.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-blue-600">{promo.price}€/mois</span>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                    En savoir plus
                  </button>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  <ul className="list-disc list-inside">
                    {promo.conditions.slice(0, 2).map((condition, index) => (
                      <li key={index}>{condition}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Promotions;
