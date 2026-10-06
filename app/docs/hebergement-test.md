# Hébergement isolé — décision du 5 octobre 2026

Décision prise par délégation pour la story 1.7, selon AD-10. Responsable : propriétaire du projet Macrova. Cette préparation alimente la story 1.5 (publication SSR) ; l’exploitation et la restauration relèvent de 1.8.

## Choix et compatibilité

Retenir **Render Web Service**, instance **Free**, région **Frankfurt**, un seul service `macrova-socle-test`. Pas de site statique : `/login`, `/dashboard` et `/api/auth/$` exigent le serveur TanStack Start et le relais Better Auth. Aucun stockage métier chez Render.

Le [guide officiel TanStack](https://tanstack.com/start/latest/docs/framework/react/guide/hosting) décrit Render avec Nitro. La préparation 1.5 ajoute Nitro verrouillé `3.0.260903-beta`, le plugin Vite et `bun run start` (`node .output/server/index.mjs`). La [procédure SSR](livraison-ssr-test.md) décrit compilation, assets, recette distante explicite et fiche effective ; sa préparation locale ne prouve pas la publication Render. Ne pas présenter `vite preview` comme serveur de production.

Vercel et Netlify sont également décrits par ce guide ; Render est retenu pour un service SSR explicite et une région européenne sélectionnable. Il ne s’agit pas d’un comparatif de performances. L’instance gratuite suffit à la recette ponctuelle ; un lancement ou une bêta disponible en continu exige une nouvelle décision de budget.

## Régions et budget

| Élément | Cible | État constaté |
|---|---|---|
| Frontend SSR | Render Frankfurt | Accès fournisseur vérifié ; inventaire vide, service à créer par 1.5 |
| Backend de recette | Convex `dev:dazzling-puffin-856`, référence `socle-auth-tests` | Accès vérifié le 6 octobre 2026 ; région observée `aws-us-east-1` |
| Futur backend européen | `aws-eu-west-1` (Irlande) | À sélectionner seulement si un nouveau déploiement est nécessaire ; aucune migration effectuée |

[Render](https://render.com/docs/regions) propose Francfort ; déplacer un service nécessite de le recréer. [Convex](https://docs.convex.dev/production/regions) propose l’Irlande avec surcharge régionale de 30 % sur l’usage et ne déplace pas un déploiement existant. Le choix européen est une cible technique, sans garantie de résidence européenne de tous les services annexes ni conformité présumée. Garder le backend synthétique actuel pour la recette : sa région américaine est confirmée par une lecture authentifiée de l’API de gestion, pas déduite du DNS. Aucune migration effectuée.

Budget de test autorisé : **0 € de dépense nouvelle**, aucune carte ou offre payante ajoutée. [Render Free](https://render.com/docs/free) met le service en veille après 15 minutes et le réveil peut prendre environ une minute ; le stockage local est éphémère. Les quotas de bande passante et de compilation sont partagés au niveau workspace. Sans moyen de paiement, leur dépassement suspend le service ou les nouvelles compilations. Vérifier que le workspace choisi n’a pas de facturation automatique avant création ; sinon utiliser un workspace gratuit séparé ou attendre une décision explicite.

[Convex Free](https://www.convex.dev/pricing) convient au prototype dans ses limites ; Starter est une offre à l’usage distincte. Relever le plan et l’usage du projet existant, sans le convertir. Ne pas créer de backend supplémentaire si cela engage des frais. Prévoir arrêt des essais à épuisement des quotas et suivi hebdomadaire des deux dashboards ; ni seuil payant ni SLA implicite. Aucun domaine payant, base Render, disque, paiement réel ou envoi d’e-mail n’est requis.

Vérification du 6 octobre 2026 après connexion : l’API de facturation Convex retourne **aucun abonnement Orb** pour l’équipe du projet (471593). Le [dashboard officiel](https://github.com/get-convex/convex-backend/blob/main/npm-packages/dashboard/src/components/billing/planCards/FreePlan.tsx) sélectionne Free en l’absence d’abonnement : plan **Free**, déterminé à partir de cette réponse et de sa logique d’affichage. La [grille officielle](https://www.convex.dev/pricing) inclut notamment 1 million d’appels/mois, 20 GB-heures de calcul d’actions, 0,5 GB de base, 1 GB de fichiers, 1 GB d’I/O base et 1 GB de trafic sortant. Les montants inclus sont partagés ; les 249 appels relevés sur ce seul déploiement ne représentent pas l’usage total de l’équipe. Aucun passage à Starter ni offre payante autorisé. Les seuils de dépense personnalisés sont absents ; cela ne convertit pas Free en abonnement à l’usage.

Render : workspace **My Workspace**, `tea-db2fsavlot8c73f24nr0`, accessible par le CLI connecté. **Preuve Billing transmise par le propriétaire le 6 octobre 2026** : plan **Hobby**, **aucune carte enregistrée**, aucune charge en attente, crédit de 0 $, aucune facture passée. Usage mensuel du workspace : **0/750 heures Free**, **0 MB/5 GB de bande passante**, **0/500 minutes de pipeline**, **0/25 services**, **0/2 domaines inclus**. Ces données de facturation proviennent de la page consultée par le propriétaire, pas de l’API. Le [guide Free](https://render.com/docs/free) confirme la suspension des services ou des nouveaux builds en cas d’épuisement sans moyen de paiement : budget de dépense nouvelle nulle compatible avec l’unique service Free prévu. Ne pas ajouter de carte, modifier le plan, choisir une instance payante ni activer un supplément de build lors de 1.5. Recontrôler les quotas avant publication, car ils sont partagés et évolutifs.

## Variables et secrets

| Variable | Destination | Valeur de test / règle |
|---|---|---|
| `CONVEX_DEPLOYMENT` | Poste de publication Convex | `dev:dazzling-puffin-856` ; sélection explicite |
| `VITE_CONVEX_URL` | Build et serveur Render | `https://dazzling-puffin-856.convex.cloud` |
| `VITE_CONVEX_SITE_URL` | Build et serveur Render | `https://dazzling-puffin-856.convex.site` |
| `VITE_SITE_URL` | Build et serveur Render | Origine HTTPS exacte attribuée au service, sans chemin |
| `SITE_URL` | Backend Convex de test | Même origine HTTPS exacte que `VITE_SITE_URL` |
| `BETTER_AUTH_SECRET` | Backend Convex de test exclusivement | Secret distinct déjà créé par 1.1 ; ne pas l’extraire |
| `NITRO_PRESET` / `HOST` | Render, après ajout Nitro | `render-com` / `0.0.0.0` |
| `PORT` | Runtime Render | Fourni par Render, lu par Nitro |
| `E2E_AUTH_EMAIL` / `E2E_AUTH_PASSWORD` | Terminal privé ou secrets CI | Compte synthétique ; jamais Git, logs ou `VITE_*` |

Aucune clé de déploiement Convex nécessaire au serveur frontend. Les secrets de publication restent sur le poste autorisé ou dans la CI, distincts pour test/production. Aucun backend prod, clé prod, donnée réelle ou paiement réel dans une prévisualisation. Si le paiement est ajouté ultérieurement, utiliser uniquement son mode test et des secrets de test côté backend.

## Prérequis d’accès avant la livraison 1.5

Contrôle initial du **6 octobre 2026**, avant connexion : intégration Render trouvée mais non installée, CLI et configuration Render absents. Ces obstacles d’outillage et d’authentification sont désormais résolus par la voie CLI ci-dessous. Le navigateur collaboratif reste indisponible dans cet environnement, y compris après une nouvelle tentative `status` puis `open`.

Suite à la délégation du propriétaire, la voie CLI a été retenue. Le CLI officiel **2.28.0** est installé dans `/home/ubuntu/.local/bin/render`, archive et SHA-256 vérifiés depuis la release `render-oss/cli`. Le téléchargement direct a échoué (HTTP 500), puis `gh release download` a réussi. `render login` a terminé avec succès après validation du propriétaire ; le jeton est conservé dans la configuration privée du CLI, hors dépôt. Ne pas copier cette configuration dans Git, les logs ou la conversation.

La [connexion officielle](https://render.com/docs/cli#2-log-in) est vérifiée par `render workspaces -o json`. Le workspace a été sélectionné localement avec `render workspace set tea-db2fsavlot8c73f24nr0 -o json --confirm`. `render services -o json` réussit et retourne `null` (liste vide) ; une lecture API indépendante de `/v1/services` ciblée sur ce workspace, previews incluses, retourne `[]`. Aucune création ni publication effectuée pendant cette vérification d’accès.

Avant toute publication par 1.5, relever les preuves suivantes avec cet accès :

- **Workspace** : accès authentifié et sélection locale de My Workspace (`tea-db2fsavlot8c73f24nr0`) vérifiés. Billing confirmé par le propriétaire : Hobby sans carte, aucune charge en attente, quotas inutilisés relevés ci-dessus. Budget de 0 € compatible avec le service Free prévu ; ne pas transformer le compte ou le service en offre payante.
- **Dépôt** : `https://github.com/ecourn/macrova`, branche `main`, répertoire applicatif `app`. Dépôt public confirmé par GitHub ; lecture Git anonyme de `refs/heads/main` réussie, révision distante observée `8468aa47f06aaf1a4db9e73567d19305e4b4cda2`. Le compte GitHub local possède les droits ADMIN. Aucune autorisation GitHub privée nécessaire pour lire cette source publique ; la sélection de cette source dans Render reste à vérifier. Ne pas supposer que les commits locaux sont publiés : 1.5 doit livrer une révision distante contenant ses changements validés.
- **Service existant** : inventaire API vide, previews incluses ; aucun doublon de `macrova-socle-test`. La création du service Free Frankfurt reste à réaliser par 1.5 dans le budget vérifié.
- **Backend associé** : accès authentifié vérifié par `GET /v1/deployments/dazzling-puffin-856` et lecture du projet `macrova` (3148832). Type `dev`, référence `dev/socle-auth-tests`, région `aws-us-east-1`. Lecture CLI explicite de l’usage : 249 appels de fonctions sur le mois courant ; limites personnalisées retournées : aucune (`[]`). Plan Free établi par l’absence d’abonnement Orb et le code officiel du dashboard ; quotas inclus référencés ci-dessus. Aucun secret affiché, aucune écriture ou publication Convex.

**Prérequis d’accès et de budget levés pour 1.5.** Ils n’exigent pas un frontend déjà publié. La création ou configuration du service, la sélection de la source publique dans Render, son URL définitive et la recette HTTPS appartiennent à 1.5. La remise finale prévue par 1.7 sera complétée avec ces preuves de livraison. La préparation documentaire ne vaut pas acceptation du frontend distant.

## Remise des accès et publication préparée

1. Le propriétaire crée/connecte son compte Render, autorise le dépôt et vérifie le workspace gratuit et sa facturation. Accorder au responsable l’accès au service Render et au projet Convex par invitation fournisseur ; ne pas transmettre de mot de passe ou de clé dans le dépôt.
2. Dans la story 1.5, préparer Nitro et le script `start` (`node .output/server/index.mjs`), tester localement le serveur compilé avec `PORT` et `HOST`. Créer un Web Service Node à Francfort avec répertoire racine `app`, build `bun install --frozen-lockfile && bun run build`, démarrage `bun run start`. Vérifier la disponibilité/version de Bun dans l’environnement de build.
3. Désactiver les déploiements automatiques et les previews automatiques : [Render permet Auto-Deploy Off](https://render.com/docs/deploys). Une URL stable de test évite de partager un backend auth entre origines de previews arbitraires. Relever l’origine HTTPS attribuée avant la compilation finale.
4. Suivre le [README](../README.md) pour sélectionner explicitement le backend dédié ; retirer toute clé Convex prioritaire du processus avant sélection. Configurer `SITE_URL` sur cette cible et conserver le secret backend. Depuis `app/`, synchroniser **le backend de test** avec `bun run convex:dev --once` avant de publier le frontend ; ne pas utiliser `convex:deploy`, réservé à la production.
5. Configurer les trois URL publiques sur Render avant build et à l’exécution, lancer la publication manuelle du commit validé. Cette origine remplace localhost pour ce backend ; arrêter les parcours locaux concurrents ou leur réserver un autre backend. Pour revenir aux tests locaux, remettre explicitement `SITE_URL=http://localhost:3000`.
6. Sur le service HTTPS, vérifier page publique, inscription synthétique, connexion, rendu privé après rechargement, révocation et déconnexion, accès anonyme refusé et absence de secrets dans assets/logs. Sans `E2E_BASE_URL`, `test:e2e:auth` démarre un serveur local et ne prouve pas le service Render. La recette distante `test:e2e:remote` vise `E2E_BASE_URL` HTTPS identique à `VITE_SITE_URL`, sans serveur local ; conserver POST et protections avant hydratation.
7. Inscrire ci-dessous URL effective, identifiant de service, région backend observée, accès du responsable et preuve de recette. Ne pas fermer 1.7 sur la seule existence de cette procédure. Aucun push, création distante ou dépense n’a été effectué par cette préparation.

## Fiche de remise actuelle

- Backend associé : `https://dazzling-puffin-856.convex.cloud` et endpoint auth `.site` ci-dessus ; [dashboard Convex](https://dashboard.convex.dev/) pour le propriétaire autorisé.
- Frontend accessible existant : `http://localhost:3000` après `bun run dev` avec la configuration locale du README ; accès local uniquement, aucun service Render livré.
- Accès Render : CLI authentifié, workspace My Workspace sélectionné, inventaire vide vérifié. Hobby sans carte ni charges, quotas disponibles confirmés par le propriétaire. Installation de l’intégration facultative ; aucune nouvelle connexion nécessaire.
- Backend : accès, région `aws-us-east-1` et plan Free vérifiés le 6 octobre 2026 ; quotas inclus documentés, usage du déploiement relevé. Les lectures de métadonnées ne prouvent pas le parcours SSR distant.
- Préparation 1.7 : **accès, budget et régions renseignés ; prérequis résolus pour lancer 1.5**. Acceptation du frontend distant : **en attente de sa livraison et de la recette HTTPS par 1.5**. Aucun service créé ni résultat HTTPS présumé par ce ticket de préparation.
