export default function CookiesPolicy() {
  const cookieTypes = [
    {
      title: "Cookies Essentiels",
      description: "Ces cookies sont nécessaires au fonctionnement du site. Ils ne peuvent pas être désactivés.",
      examples: [
        "Session de navigation",
        "Préférences de sécurité",
        "Fonctionnalités techniques essentielles"
      ]
    },
    {
      title: "Cookies de Performance",
      description: "Ces cookies nous permettent d'analyser l'utilisation du site pour en améliorer les performances et l'expérience utilisateur.",
      examples: [
        "Statistiques de navigation",
        "Identification des erreurs",
        "Test des nouvelles fonctionnalités"
      ]
    },
    {
      title: "Cookies de Personnalisation",
      description: "Ces cookies permettent de personnaliser votre expérience sur notre site.",
      examples: [
        "Préférences de recherche",
        "Historique de comparaison",
        "Paramètres d'affichage"
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Politique des Cookies</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Qu&apos;est-ce qu&apos;un Cookie ?</h2>
          <p className="text-gray-700 mb-4">
            Un cookie est un petit fichier texte stocké sur votre appareil lorsque vous visitez notre site. 
            Les cookies nous aident à faire fonctionner le site, à le rendre plus sûr, et à vous offrir une 
            meilleure expérience utilisateur.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Comment Utilisons-nous les Cookies ?</h2>
          <div className="grid gap-6 mt-6">
            {cookieTypes.map((type, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{type.title}</h3>
                <p className="text-gray-700 mb-4">{type.description}</p>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">Exemples :</p>
                  <ul className="list-disc pl-5 text-gray-700">
                    {type.examples.map((example, i) => (
                      <li key={i}>{example}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Gestion des Cookies</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Vous pouvez contrôler et/ou supprimer les cookies comme vous le souhaitez. 
              Vous pouvez supprimer tous les cookies déjà présents sur votre appareil et 
              paramétrer la plupart des navigateurs pour qu&apos;ils les bloquent.
            </p>
            <p>
              Pour gérer les cookies dans votre navigateur :
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="font-medium">Chrome :</span> Menu → Paramètres → Afficher les paramètres avancés → 
                Confidentialité → Paramètres de contenu
              </li>
              <li>
                <span className="font-medium">Firefox :</span> Menu → Options → Vie privée → 
                Règles de conservation → Utiliser les paramètres personnalisés
              </li>
              <li>
                <span className="font-medium">Safari :</span> Préférences → Confidentialité → 
                Cookies et données de sites web
              </li>
              <li>
                <span className="font-medium">Edge :</span> Paramètres → Cookies et autorisations de site
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Durée de Conservation</h2>
          <p className="text-gray-700 mb-4">
            La durée de conservation des cookies varie selon leur type :
          </p>
          <ul className="list-disc pl-5 text-gray-700 space-y-2">
            <li>Cookies de session : supprimés à la fermeture du navigateur</li>
            <li>Cookies persistants : jusqu&apos;à 13 mois maximum</li>
            <li>Cookies de mesure d&apos;audience : 25 mois maximum</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Mise à Jour de Notre Politique</h2>
          <p className="text-gray-700 mb-4">
            Nous nous réservons le droit de modifier cette politique des cookies à tout moment. 
            Tout changement sera effectif immédiatement après la publication de la politique révisée 
            sur ce site web.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Questions et Contact</h2>
          <p className="text-gray-700 mb-4">
            Si vous avez des questions concernant notre utilisation des cookies, 
            n&apos;hésitez pas à nous contacter à : privacy@jointoffer.fr
          </p>
          <p className="text-gray-700 italic">
            Dernière mise à jour : Novembre 2023
          </p>
        </section>
      </div>
    </div>
  );
}
