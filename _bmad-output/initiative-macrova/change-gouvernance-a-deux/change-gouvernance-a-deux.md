---
type: sprint-change-proposal
title: Macrova — gouvernance à deux
created: '2026-10-08'
status: applied
scope: moderate
mode: batch
approval: explicit-user-delegation
---

# Correction de trajectoire — gouvernance à deux

## 1. Problème et mandat

La story 2.1 disposait d’un dossier technique complet mais portait `blocked`, `awaiting-real-validation` et `implementation_authorized: false`, faute de signature nutritionnelle externe. La story 10.1 avait livré les six pièces du kit mais attendait un responsable externe et des tests d’un support privé pour sa clôture. Ces exigences organisationnelles ne correspondaient pas au fonctionnement utilisateur/agent et faisaient attendre la construction sur des validations relevant d’autres moments.

Preuves examinées : plans de 2.1 et 10.1, registres méthode/kit, tickets et exigences CAL-1/ENQ-1/ENQ-5. Les constats du 7 octobre restent vrais historiquement ; aucune signature ni aucun essai privé n’a été reçu par cette correction.

Mandat utilisateur du 8 octobre 2026 : « remplacer la gouvernance avec responsables externes par notre fonctionnement à deux », « Je délègue les arbitrages nécessaires à l’agent et autorise leur application sans nouvelle confirmation », « Les vérifications techniques nécessaires seront exécutées au moment pertinent, sans bloquer le développement sur le support d’enquête ». Le mode groupé et les réponses aux questions du workflow sont choisis par l’agent conformément à ce mandat. Aucun accord supplémentaire n’est attendu.

## 2. Impact

- Initiative : même objectif, CAP-1 à CAP-8, seuils, prix, périmètre et observations réelles. Responsabilités produit/architecture/développement/catalogue/validation coordonnées par l’agent ; comptes, collecte et présence humaine portés par l’utilisateur.
- Epic 2 : décision produit sourcée au lieu d’une signature externe ; dossier méthode adopté, 2.1 clôturée, 2.2 libérée. Tests de code et garde des exclusions conservés.
- Epic 10 : 10.1 limitée au kit, cadre documentaire et gel du protocole ; configuration effective et essais privés déplacés au début de 10.2 avant collecte. 10.5/10.7 conservent la traçabilité et les contrôles de remise.
- Epics 3 à 9 et socle : responsabilité organisationnelle réattribuée au binôme ; frontières métier, livrables et contrats conservés. Audit réel de cinquante recherches toujours requis pour le catalogue ; observations et paiements réels toujours requis pour le bilan.
- Spec et compagnons : gouvernance canonique, adoption du dossier v1 et calendrier de vérification explicites. L’addendum garde ses constats historiques et renvoie aux décisions récentes.
- Architecture/UX : préciser « méthode validée » comme décision produit sourcée. Aucun changement de stack, schéma, domaine numérique, écran, primitive, flux de confirmation utilisateur ou fournisseur.
- Application/infrastructure : aucun fichier applicatif modifié, aucune estimation déjà livrée ou ouverture publique présumée. Les actions différées du socle restent ouvertes selon leurs preuves et zones concernées.

Aucun PRD distinct n’est présent ; la spécification et ses quatre compagnons tiennent lieu de contrat produit. DESIGN.md a été lu et ne nécessite pas de modification visuelle. L’initiative locale a été sélectionnée dans la configuration personnelle ignorée par Git.

## 3. Approche retenue

Ajustement direct du backlog et des documents. Portée modérée : deux stories rescopées et une tâche déplacée, sans nouvel epic ni refonte du MVP. Effort documentaire faible à moyen ; pas d’estimation en points activée. Effet de calendrier : reprise immédiate possible du développement, sans attendre un support d’enquête ou un tiers. Les délais terrain dépendent encore de participants et d’accès réels.

Rollback écarté : les dossiers et le socle sont réutilisables ; aucune suppression de code nécessaire. Réduction du MVP écartée : capacités et critères de succès restent réalisables, sans preuve de besoin de les supprimer.

Risque : confondre adoption produit et validation clinique, ou clôture documentaire et collecte autorisée. Réponse : portée explicite dans spec, registres et plans ; exigences de refus et de minimisation conservées ; essais du support avant toute donnée réelle. Le modèle de contact participant reste vierge dans Git car les coordonnées et faits privés se renseignent uniquement lors de 10.2.

## 4. Modifications avant → après et justification

### Story 2.1 — entrée, plan, CAL-1 et registre

Avant : « obtenir et consigner la validation datée du responsable », `hitl=true`, `done_checkpoint=true`, attente d’un nom/compétence/signature, blocage de 2.2.

Après : décision produit datée de l’agent mandaté sur méthode, sources, entrées, exclusions, recalcul et vecteurs ; `hitl=false`, `done_checkpoint=false`, `status: done`, `acceptance: accepted-delegated-product-decision`, `implementation_authorized: true`, blocage vidé par `tickets.py mark`.

Justification : exigence organisationnelle remplacée par mandat explicite. Dossier préparatoire déjà complet ; aucune certification clinique inventée. Paramètres et vecteurs numériques inchangés ; seul leur statut d’adoption et les empreintes documentaires changent.

### Story 10.1 — entrée, plan et kit

Avant : accord externe sur toutes les pièces et accès autorisé/refusé au support nécessaires à la clôture ; `hitl=true`, `done_checkpoint=true`, `built` avec acceptation ouverte.

Après : kit et protocole adoptés par l’agent, simulation exclue des résultats, `hitl=false`, `done_checkpoint=false`, `status: done`, `acceptance: accepted-documentary-kit`. `recruitment_authorized: false` reste explicite car aucun contact ni support réel n’est vérifié ou autorisé par cette correction seule.

Justification : préparation achevée ; tests du support déplacés à l’action où ce support est utilisé. Les critères bêta sont gelés et les responsabilités du binôme adoptées avant recrutement.

### Story 10.2 — description et vérification

Avant : démarrer le pilote à partir du cadre et du support supposés approuvés en 10.1.

Après : choisir le support maîtrisé par l’utilisateur, tester accès autorisé/refusé, révocation, suppression et copies avec données jetables ; finaliser information/contact et canaux ; recueillir l’accord volontaire de la personne avant toute collecte, puis éprouver le guide sur un pilote réel. Conserver `after=[1]`, `hitl=true` et le checkpoint de preuve terrain, sans nouvelle approbation d’un arbitrage délégué.

Justification : propriétaire explicite de tous les contrôles déplacés, aucun trou de protection ; absence de preuve bloque uniquement la collecte concernée. Les remises effectives et leurs accès restent vérifiés en 10.5/10.7.

### Spec et décisions de lancement

Avant : méthode non sélectionnée, validation préalable interprétée comme externe ; aucune gouvernance canonique à deux.

Après : dossier v1 adopté pour développement isolé ; validation produit sourcée/versionnée de l’agent avant estimation, gouvernance à deux et calendrier séparant développement, collecte réelle et ouverture publique. Conserver exclusions, absence de nutrition inventée, profils en mémoire, vérifications données/licences/commerciales/exploitation.

Justification : source parent alignée aux tickets avant reprise ; aucune réduction des protections ou seuils d’apprentissage.

### Protocole, addendum, architecture et UX

Avant : conventions bêta et remboursements proposés sans adoption ; méthode indisponible tant qu’un responsable ne signe pas.

Après : fenêtres UTC `[invitationAt, +14 jours[` et J6–J8 `[+6 jours, +9 jours[`, exclusion des règlements remboursés même partiellement au bilan, adoptées par décision produit ; vérification de l’instrumentation avant bêta. AD-2 et CAP-1 reflètent l’adoption du dossier v1 sans garantir une validité clinique. Les confirmations des personnes utilisant le produit et les états de refus sont conservés.

Justification : répondre aux arbitrages documentaires dans le périmètre délégué et distinguer décision de design et preuve d’exécution.

### Responsabilités futures et travaux différés

Avant : responsables et propriétaires proposés pouvant être compris comme intervenants externes ; report de signature 2.1 encore ouvert.

Après : même binôme pour les fonctions internes, limites de preuves maintenues ; ancien report externe clos par remplacement d’exigence. A4/A5/A7/A8/A9 restent des actions techniques de l’agent ; A6b nécessite une réception constatée par l’utilisateur. Ni tâche technique ni observation n’est déclarée accomplie sans résultat.

Justification : une seule gouvernance, sans réouverture artificielle des travaux terminés ou disparition des obligations réelles.

## 5. Mise en œuvre et relais

Les changements documentaires, de backlog et de statut sont appliqués dans ce travail sous le mandat utilisateur. `bmad-ticket` assure les mises à jour du store local via `tickets.py`; aucun tracker externe, destinataire tiers ou invitation n’est impliqué.

Prochaine story de développement : **2.2 — Relier le premier calcul public à la méthode validée**. Prérequis : 2.1, 1.1 et 1.2 terminées. Le dossier v1 fournit les règles exactes et les vecteurs. Le build devra rendre l’entrée SSR publique utilisable malgré une panne auth/Convex, préserver les erreurs privées, employer shadcn et traiter explicitement les intermédiaires signés dans le domaine pur, sans profil transmis ni persisté. Ne pas commencer le build dans cette correction : la demande porte sur son identification.

10.2 est disponible dans la chaîne d’enquête ; c’est une tâche terrain avec contrôles d’accès préalables, pas la prochaine story de code. Les deux parcours sont indépendants. Aucune nouvelle confirmation d’arbitrage déjà délégué n’est prévue.

Calendrier de contrôles :

- Maintenant : cohérence documents/TOML/JSON, liens introduits, empreintes, états et graphe de tickets, `git diff --check` et validations indépendantes.
- 2.2–2.4 : domaine exact, refus, exclusions, recalcul, absence de profil réseau/stockage et comportement SSR public/privé.
- 2.5–2.8 : mesure minimale, purge, accessibilité et recette isolée intégrée.
- Début 10.2 : support, accès, révocation, suppression/copies, contact/information et canaux avant collecte réelle.
- 10.5 et 10.7 : traçabilité réelle et remise privée effective au binôme.
- Epic 9 avant activation : décisions données/licences/commerce/exploitation instruites et preuves applicables ; avant bilan, vraie cohorte et vrais paiements. Aucune preuve terrain anticipée.

Critères de réussite de la correction : plus d’exigence active de signature externe en 2.1/10.1 ; statuts et checkpoints alignés ; contrôles déplacés couverts par 10.2 ; 2.2 présente dans `ready_to_start` sans dépendance à l’enquête ; traces historiques clairement datées ; aucune modification applicative ou donnée terrain ajoutée.

## 6. Checklist et journal du workflow

- [x] 1.1 — déclencheurs identifiés : 2.1 et 10.1.
- [x] 1.2 — problème : gouvernance inadaptée et confusion de calendrier.
- [x] 1.3 — preuves : plans, registres, entrées et instruction utilisateur.
- [x] 2.1 — epics 2 et 10 réalisables après correction locale.
- [x] 2.2 — exigences, critères et responsabilité des contrôles mis à jour.
- [x] 2.3 — tous les epics restants examinés ; responsabilités réattribuées.
- [N/A] 2.4 — aucun nouvel epic ni epic obsolète.
- [x] 2.5 — priorité immédiate à 2.2 ; enquête indépendante, ordre interne conservé.
- [x] 3.1 — spec et compagnons corrigés, MVP conservé.
- [x] 3.2 — AD-2 et conditions méthode alignées, contrats techniques conservés.
- [x] 3.3 — EXPERIENCE aligné, DESIGN lu et inchangé.
- [x] 3.4 — kit, plans, registres et travaux différés réconciliés ; pas de changement CI/déploiement.
- [x] 4.1 — ajustement direct retenu, effort documentaire faible à moyen.
- [N/A] 4.2 — rollback inutile.
- [N/A] 4.3 — réduction du MVP inutile.
- [x] 4.4 — choix motivé et risques traités.
- [x] 5.1 — résumé du problème documenté.
- [x] 5.2 — impacts par epic/story/artifact documentés.
- [x] 5.3 — approche et justification documentées.
- [x] 5.4 — périmètre et séquence explicités.
- [x] 5.5 — relais agent/utilisateur affecté, sans tiers requis.
- [x] 6.1 — chaque contrôle restant a une story et un moment d’exécution.
- [x] 6.2 — proposition et cohérence vérifiées selon journal ci-dessous.
- [x] 6.3 — approbation et application explicitement déléguées par l’utilisateur ; aucune confirmation renouvelée.
- [x] 6.4 — 2.2 identifiée comme prochaine story de développement ; 10.2 conserve les actions terrain.

Activation : aucun prepend/append/fait persistant personnalisé. Absence initiale d’initiative active résolue par `bmad` dans la configuration personnelle ignorée par Git, initiative-macrova choisie selon la demande explicite. Mode batch, réponses et arbitrages pris par l’agent. Proposition écrite et mise en œuvre autorisée. Les faits scientifiques sont ceux du dossier déjà vérifié du 7 octobre ; aucune nouvelle expertise médicale, juridique ou nouvelle consultation scientifique n’est revendiquée.

La publication locale est le commit des documents autorisés selon le store ; aucun push ni déploiement n’est nécessaire à cette correction. Les résultats des validations finales sont consignés ci-dessous.

## Résultats de vérification finale

- Validation indépendante calculateur : aucune correction bloquante, CAL-1 à CAL-8 couverts et 2.2 prête ; suggestion de vocabulaire d’adoption appliquée.
- Validation indépendante enquête : deux contradictions corrigées et relues, conservation des preuves jusqu’à recette 10.7 avec plafond 90 jours, fenêtres/remboursements marqués adoptés. ENQ-1 à ENQ-6 couverts, pas de blocage restant. Notices historiques ajoutées aux rapports d’inception.
- Validation indépendante arbre : couverture CAP unique, responsabilités transversales et dépendances cohérentes ; aucune nouvelle anomalie.
- Vecteurs numériques comparés au HEAD initial : strictement inchangés ; profils, modifications, transitions et affichages reproduits en fractions exactes avec succès. Seuils bêta conservés. TOML et JSON lisibles, ids/checkpoints conformes ; liens nouveaux et liens du kit contrôlés. Empreintes courantes régénérées après corrections.
- `tickets.py status/next` : 23 stories, 10 done, 13 planned ; 2.2 et 10.2 dans ready_to_start, sans blocked_at, drift, unpinned_after, undeclared_after ou order_conflict. Les trois avertissements sur des plans orphelins sans ticket sont préexistants et documentés ; aucune dette technique nouvelle.
- `git diff --check` conforme ; aucun fichier app/ modifié, donc tests applicatifs réservés aux stories de construction. Le support privé n’a pas été testé et demeure une vérification de 10.2 avant collecte réelle.

Workflow correct-course achevé ; proposition, avant/après, changements appliqués et relais vers 2.2 livrés.
