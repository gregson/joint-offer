import Image from 'next/image';

export default function About() {
  const features = [
    {
      title: "Comparaison Intelligente",
      description: "Notre algorithme analyse des milliers d'offres pour vous proposer les forfaits les plus adaptés à vos besoins.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: "Sélection de Smartphones",
      description: "Trouvez le smartphone idéal parmi notre sélection des derniers modèles, avec les meilleures offres du marché.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "Actualités & Conseils",
      description: "Restez informé des dernières tendances et recevez des conseils personnalisés pour optimiser votre forfait mobile.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-blue-600 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              À Propos de JointOffer
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl">
              Nous simplifions la recherche du forfait mobile parfait, avec ou sans smartphone.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-white"></div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Notre Mission
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Chez JointOffer, nous croyons que choisir un forfait mobile ne devrait pas être compliqué. 
            Notre mission est de vous aider à trouver l&apos;offre qui correspond exactement à vos besoins 
            et à votre budget, en toute transparence.
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gray-50">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="relative">
              <div className="absolute h-12 w-12 flex items-center justify-center rounded-xl bg-blue-600 text-white">
                {feature.icon}
              </div>
              <div className="pl-16">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Values Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Nos Valeurs
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Transparence</h3>
            <p className="text-gray-600">
              Nous nous engageons à présenter toutes les informations de manière claire et honnête, 
              sans frais cachés ni surprises désagréables.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Innovation</h3>
            <p className="text-gray-600">
              Notre plateforme évolue constamment pour vous offrir les meilleurs outils de comparaison 
              et une expérience utilisateur optimale.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Accessibilité</h3>
            <p className="text-gray-600">
              Nous rendons la comparaison de forfaits accessible à tous, avec une interface simple 
              et des recommandations personnalisées.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Fiabilité</h3>
            <p className="text-gray-600">
              Nos données sont régulièrement mises à jour pour vous garantir des comparaisons 
              précises et pertinentes.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-8">
              Contactez-nous
            </h2>
            <p className="text-xl text-gray-600 mb-4">
              Une question ? Notre équipe est là pour vous aider.
            </p>
            <a 
              href="mailto:contact@jointoffer.fr"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Nous Contacter
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
