import React from 'react';
import Link from 'next/link';

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Comparez facilement les meilleurs plans téléphoniques et d'Internet pour votre domicile
          </h1>
          <p className="text-xl mb-8">
            Trouvez l'offre parfaite adaptée à vos besoins en quelques clics
          </p>
          <Link 
            href="/search"
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full transition-colors duration-200"
          >
            Comparer maintenant
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
