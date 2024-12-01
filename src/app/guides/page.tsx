import Link from 'next/link';

export default function Guides() {
  const guides = [
    {
      title: "Comment comparer les forfaits",
      slug: "comparer-forfaits",
      description: "Guide complet pour trouver le forfait idéal selon vos besoins",
      steps: [
        "Accédez à la page de recherche",
        "Utilisez les filtres de données et d'appels",
        "Comparez les prix et les engagements",
        "Vérifiez la couverture réseau"
      ],
      tips: [
        "Privilégiez les forfaits sans engagement si vous souhaitez plus de flexibilité",
        "Vérifiez les options internationales si vous voyagez souvent",
        "Consultez les avis et retours d'expérience"
      ]
    },
    {
      title: "Choisir son smartphone avec un forfait",
      slug: "choisir-smartphone",
      description: "Comment sélectionner le meilleur duo smartphone + forfait",
      steps: [
        "Sélectionnez un smartphone dans notre catalogue",
        "Comparez les offres avec engagement",
        "Calculez le coût total sur 24 mois",
        "Vérifiez les conditions de garantie"
      ],
      tips: [
        "Comparez le prix du smartphone seul vs avec forfait",
        "Vérifiez la durée d'engagement nécessaire",
        "Examinez les options de paiement disponibles"
      ]
    },
    {
      title: "Optimiser son forfait existant",
      slug: "optimiser-forfait",
      description: "Conseils pour optimiser votre forfait actuel ou changer au bon moment",
      steps: [
        "Analysez votre consommation réelle",
        "Identifiez les options inutilisées",
        "Comparez avec les nouvelles offres",
        "Planifiez le changement d'opérateur"
      ],
      tips: [
        "Surveillez la fin de votre engagement",
        "Profitez des offres de fidélité",
        "Négociez avec votre opérateur actuel"
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Guides Pratiques
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Découvrez nos guides pour faire les meilleurs choix en matière de forfaits mobiles et de smartphones.
        </p>
      </div>

      {/* Quick Links */}
      <div className="bg-blue-50 rounded-lg p-6 mb-12">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">Accès Rapide</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {guides.map((guide) => (
            <a
              key={guide.slug}
              href={`#${guide.slug}`}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {guide.title}
            </a>
          ))}
        </div>
      </div>

      {/* Detailed Guides */}
      <div className="space-y-16">
        {guides.map((guide) => (
          <section key={guide.slug} id={guide.slug} className="scroll-mt-20">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {guide.title}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {guide.description}
              </p>

              {/* Steps */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Étapes à suivre
                </h3>
                <div className="space-y-4">
                  {guide.steps.map((step, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <p className="ml-4 text-gray-700">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Conseils pratiques
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  {guide.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>

              {/* Related Links */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Liens utiles
                </h3>
                <div className="flex space-x-4">
                  <Link 
                    href="/search" 
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Comparer les forfaits →
                  </Link>
                  <Link 
                    href="/about" 
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    En savoir plus →
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Help Section */}
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Besoin d&apos;aide supplémentaire ?
        </h2>
        <p className="text-gray-600 mb-6">
          Notre équipe est là pour vous aider à faire le meilleur choix.
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
