JOINT OFFER - Guide de lancement manuel des workers
==============================================

Worker de mise à jour des smartphones (mergeSmartphones)
------------------------------------------------------

Ce worker permet de mettre à jour automatiquement la base de données des smartphones à partir des sites des opérateurs.

Prérequis :
- Node.js installé
- npm installé
- Être dans le répertoire du projet (joint-offer)

Étapes de lancement :

1. Ouvrir un terminal dans le répertoire du projet

2. S'assurer que toutes les dépendances sont installées :
   npm install

3. Lancer le worker avec la commande :
   npx ts-node src/workers/mergeSmartphones.ts

Le worker va alors :
- Scraper les données de smartphones depuis Proximus
- Mettre à jour les prix et conditions
- Fusionner avec les données existantes
- Sauvegarder dans src/data/smartphones.json

Notes importantes :
- Le worker peut prendre quelques minutes pour s'exécuter
- Vérifier la connexion internet avant le lancement
- Le fichier smartphones.json sera automatiquement mis à jour
- En cas d'erreur, vérifier les logs dans la console

Fréquence recommandée :
- Une fois par jour pour maintenir les prix à jour
- Après chaque modification majeure des sites des opérateurs

En cas de problème :
1. Vérifier la connexion internet
2. S'assurer que tous les packages sont installés (npm install)
3. Vérifier les logs d'erreur dans la console

Worker de surveillance des prix (priceAlertWorker)
----------------------------------------------

Ce worker surveille les changements de prix des smartphones et envoie des notifications par email aux utilisateurs inscrits aux alertes.

Prérequis :
- Node.js installé
- npm install
- Configuration SMTP dans le fichier .env.local :
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_SECURE=false
  SMTP_USER=votre_email@gmail.com
  SMTP_PASS=votre_mot_de_passe_application
  SMTP_FROM=votre_email@gmail.com
  NEXT_PUBLIC_BASE_URL=http://localhost:3000

Étapes de lancement :

1. Installer dotenv-cli si ce n'est pas déjà fait :
   npm install --save-dev dotenv-cli

2. Lancer le worker avec les variables d'environnement :
   npx dotenv-cli -e .env.local -- ts-node --project tsconfig.json src/workers/priceAlertWorker.ts

Fonctionnement du worker :
- Vérifie les changements de prix dans price-history.json
- Compare avec les alertes configurées dans price-alerts.json
- Envoie des emails de notification en cas de :
  * Baisse de prix (si notifyOnPriceDecrease=true)
  * Tout changement de prix (si notifyOnAnyChange=true)

Format des alertes (price-alerts.json) :
```json
{
  "id": "unique-id",
  "email": "user@example.com",
  "smartphoneId": "samsung-galaxy-s23-256",
  "provider": "proximus",
  "preferences": {
    "notifyOnAnyChange": false,
    "notifyOnPriceDecrease": true
  }
}
```

Format de l'historique des prix (price-history.json) :
```json
{
  "smartphoneId": "samsung-galaxy-s23-256",
  "prices": {
    "proximus": [
      {
        "price": 899.99,
        "date": "2024-12-01T15:00:00Z"
      }
    ]
  }
}
```

Notifications par email :
- Email de bienvenue lors de la création d'une alerte
- Email de notification lors d'un changement de prix avec :
  * Ancien et nouveau prix
  * Pourcentage de variation
  * Lien direct vers la page du smartphone
  * Type d'alerte configurée

Fréquence recommandée :
- Toutes les heures pour une surveillance régulière
- Après chaque mise à jour du worker mergeSmartphones

En cas de problème :
1. Vérifier la configuration SMTP dans .env.local
2. S'assurer que le mot de passe d'application Gmail est valide
3. Vérifier la structure des fichiers JSON (price-alerts.json et price-history.json)
4. Consulter les logs d'erreur dans la console

Déploiement en Production (Windows Server & IIS)
--------------------------------------------

Prérequis serveur :
- Windows Server avec IIS installé
- Node.js LTS installé
- Git installé
- PM2 pour la gestion des processus : npm install -g pm2
- URL Manager pour IIS installé

1. Préparation du serveur IIS :
   - Ouvrir le Gestionnaire IIS
   - Créer un nouveau site web pour JointOffer
   - Configurer le binding (port 80/443)
   - Activer le module URL Rewrite
   - Installer le certificat SSL si nécessaire

2. Déploiement de l'application Next.js :
   ```bash
   # Se connecter au serveur et cloner le repo
   git clone https://github.com/votre-repo/joint-offer.git
   cd joint-offer

   # Installer les dépendances
   npm install

   # Build de l'application
   npm run build

   # Configurer le fichier web.config pour IIS
   ```

   Créer un fichier web.config à la racine :
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <configuration>
     <system.webServer>
       <handlers>
         <add name="iisnode" path="server.js" verb="*" modules="iisnode" />
       </handlers>
       <rewrite>
         <rules>
           <rule name="NodeInspector" patternSyntax="ECMAScript" stopProcessing="true">
             <match url="^server.js\/debug[\/]?" />
           </rule>
           <rule name="StaticContent">
             <action type="Rewrite" url="public{REQUEST_URI}"/>
           </rule>
           <rule name="DynamicContent">
             <conditions>
               <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True"/>
             </conditions>
             <action type="Rewrite" url="server.js"/>
           </rule>
         </rules>
       </rewrite>
       <security>
         <requestFiltering>
           <hiddenSegments>
             <remove segment="bin"/>
           </hiddenSegments>
         </requestFiltering>
       </security>
     </system.webServer>
   </configuration>
   ```

3. Configuration des variables d'environnement :
   - Créer un fichier .env.production à la racine
   ```env
   NEXT_PUBLIC_BASE_URL=https://votre-domaine.com
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=votre_email@gmail.com
   SMTP_PASS=votre_mot_de_passe_application
   SMTP_FROM=votre_email@gmail.com
   ```

4. Configuration des workers avec PM2 :
   ```bash
   # Créer un fichier ecosystem.config.js
   module.exports = {
     apps: [
       {
         name: 'nextjs',
         script: 'npm',
         args: 'start',
         env: {
           NODE_ENV: 'production',
         },
       },
       {
         name: 'price-alert-worker',
         script: 'ts-node',
         args: 'src/workers/priceAlertWorker.ts',
         env: {
           NODE_ENV: 'production',
         },
         cron_restart: '0 * * * *', // Toutes les heures
       },
       {
         name: 'merge-smartphones-worker',
         script: 'ts-node',
         args: 'src/workers/mergeSmartphones.ts',
         env: {
           NODE_ENV: 'production',
         },
         cron_restart: '0 0 * * *', // Une fois par jour à minuit
       },
     ],
   };

   # Démarrer les processus
   pm2 start ecosystem.config.js
   
   # Sauvegarder la configuration PM2
   pm2 save
   
   # Configurer le démarrage automatique
   pm2 startup
   ```

5. Configuration du pare-feu Windows :
   - Ouvrir les ports nécessaires (80, 443)
   - Autoriser Node.js dans le pare-feu

6. Maintenance et Monitoring :
   - Monitoring des processus : pm2 monit
   - Logs des workers : pm2 logs
   - Redémarrage des processus : pm2 restart all
   - Mise à jour de l'application :
     ```bash
     git pull
     npm install
     npm run build
     pm2 restart all
     ```

7. Sauvegarde :
   - Configurer une sauvegarde régulière des fichiers :
     * .env.production
     * src/data/*.json
     * logs/

8. Sécurité :
   - Activer HTTPS
   - Configurer les en-têtes de sécurité dans IIS
   - Restreindre les accès aux dossiers sensibles
   - Mettre à jour régulièrement Node.js et les dépendances

En cas de problème :
1. Vérifier les logs IIS
2. Consulter les logs PM2
3. Vérifier les permissions des dossiers
4. S'assurer que les services sont en cours d'exécution
