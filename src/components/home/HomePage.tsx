'use client';

import PopularSmartphones from '@/components/search/PopularSmartphones';
import PopularPlans from '@/components/home/PopularPlans';
import Link from 'next/link';
import { useState } from 'react';
import { Smartphone } from '@/types/smartphone';

export default function HomePage() {
  const [selectedPhone, setSelectedPhone] = useState<Smartphone | null>(null);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section avec CTA Quiz plus visible */}
      <section className="relative px-6 lg:px-8 py-24 mx-auto max-w-7xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Comparez les meilleurs forfaits mobiles
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Trouvez le forfait parfait en comparant les offres de Proximus, VOO, Orange et plus encore.
            Économisez sur votre smartphone avec les meilleures offres combinées.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/recommend"
              className="rounded-md bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 animate-pulse"
            >
              Faire le Quiz et trouver mon forfait idéal
              <span className="ml-2">→</span>
            </Link>
          </div>
        </div>

        {/* Badges de confiance */}
        <div className="mt-12 flex justify-center gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">10k+</div>
            <div className="text-sm text-gray-600">Utilisateurs satisfaits</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">150€</div>
            <div className="text-sm text-gray-600">Économie moyenne</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">98%</div>
            <div className="text-sm text-gray-600">Avis positifs</div>
          </div>
        </div>
      </section>

      {/* Processus de recherche avec illustrations */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Comment ça marche ?</h2>
          <div className="relative">
            {/* Ligne de progression */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-blue-200 -translate-y-1/2 hidden lg:block" />
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: "🎯",
                  title: "Quiz rapide",
                  description: "Répondez à quelques questions sur vos besoins"
                },
                {
                  icon: "📱",
                  title: "Sélection smartphone",
                  description: "Choisissez votre smartphone préféré"
                },
                {
                  icon: "💡",
                  title: "Comparaison",
                  description: "Comparez les meilleures offres"
                },
                {
                  icon: "💰",
                  title: "Économies",
                  description: "Profitez des meilleures offres"
                }
              ].map((step, index) => (
                <div key={index} className="relative bg-white p-6 rounded-lg shadow-sm">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl mb-4">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dernières offres */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8">Offres populaires</h2>
          <PopularPlans />
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Ce qu'en pensent nos utilisateurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Marie D.",
                text: "J'ai économisé 200€ sur mon nouveau forfait avec iPhone !",
                rating: 5
              },
              {
                name: "Thomas L.",
                text: "Interface super intuitive, j'ai trouvé mon forfait en 5 minutes.",
                rating: 5
              },
              {
                name: "Sophie M.",
                text: "Le quiz m'a permis de trouver exactement ce que je cherchais.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.text}"</p>
                <p className="font-semibold">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Phones Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <PopularSmartphones onSelect={(phone) => {
            setSelectedPhone(phone);
            window.location.href = `/search?phone=${phone.id}`;
          }} />
        </div>
      </section>
    </main>
  );
}
