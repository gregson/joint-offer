import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
                  <Image 
                    src={`/images/${promo.provider}-logo.svg`}
                    alt={`${promo.provider} logo`}
                    className="object-contain p-4"
                    fill
                  />
                </div>
                <span className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Promotion
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{promo.name}</h3>
                <p className="text-gray-600 mb-4">{promo.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-blue-600">{promo.price}€<span className="text-sm font-normal">/mois</span></span>
                  <Link 
                    href={promo.url} 
                    target="_blank"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Voir l'offre
                  </Link>
                </div>
                {promo.endDate && (
                  <div className="mt-4 text-sm text-gray-500">
                    <p>Offre valable jusqu'au {new Date(promo.endDate).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Promotions;
