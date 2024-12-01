export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Politique de Confidentialité</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="text-gray-700 mb-4">
            Chez JointOffer, nous accordons une grande importance à la protection de vos données personnelles. 
            Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations 
            lorsque vous utilisez notre service de comparaison de forfaits mobiles.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Informations que nous collectons</h2>
          <p className="text-gray-700 mb-4">Nous collectons les informations suivantes :</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Votre adresse email (uniquement si vous vous inscrivez à notre newsletter)</li>
            <li>Vos préférences de recherche de forfaits</li>
            <li>Les données de navigation anonymes sur notre site</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Utilisation des informations</h2>
          <p className="text-gray-700 mb-4">Nous utilisons vos informations pour :</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Vous envoyer notre newsletter si vous y êtes inscrit</li>
            <li>Améliorer notre service de comparaison</li>
            <li>Personnaliser votre expérience utilisateur</li>
            <li>Analyser l&apos;utilisation de notre site</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Protection des données</h2>
          <p className="text-gray-700 mb-4">
            Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos informations contre tout accès, 
            modification, divulgation ou destruction non autorisés.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Vos droits</h2>
          <p className="text-gray-700 mb-4">Vous avez le droit de :</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Accéder à vos données personnelles</li>
            <li>Rectifier vos données</li>
            <li>Demander la suppression de vos données</li>
            <li>Vous désabonner de notre newsletter</li>
            <li>Obtenir une copie de vos données</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Cookies</h2>
          <p className="text-gray-700 mb-4">
            Nous utilisons des cookies pour améliorer votre expérience sur notre site. 
            Vous pouvez contrôler les cookies via les paramètres de votre navigateur.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Contact</h2>
          <p className="text-gray-700 mb-4">
            Pour toute question concernant cette politique de confidentialité ou vos données personnelles, 
            vous pouvez nous contacter à : privacy@jointoffer.fr
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Modifications</h2>
          <p className="text-gray-700 mb-4">
            Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. 
            Les modifications entrent en vigueur dès leur publication sur cette page.
          </p>
          <p className="text-gray-700 italic">
            Dernière mise à jour : Novembre 2023
          </p>
        </section>
      </div>
    </div>
  );
}
