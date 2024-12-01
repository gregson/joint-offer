'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
}

interface FAQCategory {
  title: string;
  items: FAQItem[];
}

export default function FAQ() {
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});

  const toggleItem = (categoryIndex: number, itemIndex: number) => {
    const key = `${categoryIndex}-${itemIndex}`;
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const faqCategories: FAQCategory[] = [
    {
      title: "Comparaison de Forfaits",
      items: [
        {
          question: "Comment comparer les forfaits sur JointOffer ?",
          answer: "Notre comparateur vous permet de filtrer les forfaits selon vos besoins en data, appels, et budget. Utilisez les filtres sur la page de recherche et consultez les détails de chaque offre pour faire le meilleur choix."
        },
        {
          question: "Les prix affichés sont-ils à jour ?",
          answer: "Oui, nous mettons à jour nos prix quotidiennement pour vous garantir les informations les plus récentes. La date de dernière mise à jour est toujours indiquée sur la page de comparaison."
        },
        {
          question: "Puis-je comparer les forfaits avec et sans engagement ?",
          answer: "Absolument ! Vous pouvez filtrer les forfaits selon la durée d'engagement et comparer les différentes options. Nous indiquons clairement la durée d'engagement pour chaque offre."
        }
      ]
    },
    {
      title: "Smartphones et Forfaits",
      items: [
        {
          question: "Comment choisir un smartphone avec un forfait ?",
          answer: (
            <div>
              <p className="mb-2">Pour choisir un smartphone avec un forfait :</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Sélectionnez un smartphone dans notre catalogue</li>
                <li>Comparez les offres associées</li>
                <li>Vérifiez le coût total sur la durée de l&apos;engagement</li>
                <li>Consultez nos recommandations personnalisées</li>
              </ol>
            </div>
          )
        },
        {
          question: "Puis-je garder mon numéro en changeant de forfait ?",
          answer: "Oui, vous pouvez conserver votre numéro grâce à la portabilité."
        }
      ]
    },
    {
      title: "Utilisation du Site",
      items: [
        {
          question: "Comment créer une alerte prix ?",
          answer: "Pour créer une alerte prix, sélectionnez un forfait qui vous intéresse et cliquez sur 'Créer une alerte'. Vous recevrez un email dès que le prix change ou qu'une meilleure offre est disponible."
        },
        {
          question: "Les comparaisons sont-elles objectives ?",
          answer: "Oui, nos comparaisons sont totalement objectives et basées uniquement sur les caractéristiques réelles des forfaits. Nous n'avons aucun partenariat influençant nos recommandations."
        }
      ]
    },
    {
      title: "Compte et Newsletter",
      items: [
        {
          question: "Comment gérer mes préférences de newsletter ?",
          answer: (
            <div>
              <p className="mb-2">Vous pouvez gérer vos préférences de newsletter de deux façons :</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Via le lien en bas de chaque email</li>
                <li>En nous contactant directement à newsletter@jointoffer.fr</li>
              </ul>
            </div>
          )
        },
        {
          question: "Mes données sont-elles en sécurité ?",
          answer: (
            <span>
              Oui, nous prenons la sécurité de vos données très au sérieux. Consultez notre{' '}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                politique de confidentialité
              </Link>
              {' '}pour plus de détails.
            </span>
          )
        }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">
        Questions Fréquentes
      </h1>

      {/* Search Bar - Pour une future implémentation */}
      <div className="mb-12">
        <div className="relative max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Rechercher dans la FAQ..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button className="absolute right-3 top-3 text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* FAQ Categories */}
      <div className="space-y-8">
        {faqCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <h2 className="text-xl font-semibold p-6 bg-gray-50">
              {category.title}
            </h2>
            <div className="divide-y divide-gray-200">
              {category.items.map((item, itemIndex) => {
                const key = `${categoryIndex}-${itemIndex}`;
                return (
                  <div key={itemIndex} className="border-t border-gray-200">
                    <button
                      onClick={() => toggleItem(categoryIndex, itemIndex)}
                      className="w-full text-left px-6 py-4 focus:outline-none focus:bg-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">
                          {item.question}
                        </span>
                        <svg
                          className={`w-5 h-5 text-gray-500 transform transition-transform ${
                            openItems[key] ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>
                    {openItems[key] && (
                      <div className="px-6 pb-4 text-gray-700">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Contact Section */}
      <div className="mt-12 text-center bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Vous ne trouvez pas la réponse à votre question ?
        </h2>
        <p className="text-gray-600 mb-4">
          Notre équipe est là pour vous aider
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Contactez-nous
        </Link>
      </div>
    </div>
  );
}
