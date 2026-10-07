---
name: Macrova
status: final
updated: 2026-10-02
sources:
  - ../spec-macrova/spec-macrova.md
  - ../spec-macrova/regles-repas.md
  - ../spec-macrova/protocole-validation.md
  - ../spec-macrova/decisions-lancement.md
  - ../brief-macrova/brief-macrova.md
  - ../brief-macrova/addendum.md
---

## Foundation

[ASSUMPTION] Première surface : web responsive en français, prioritairement mobile, thème clair. Les primitives UI utilisent les composants shadcn locaux de `app/src/components/ui` ; les compositions métier suivent les comportements ci-dessous. [DESIGN.md](DESIGN.md) définit l'identité et les tokens ; ce document définit les comportements. La spécification et ses compagnons restent les contrats produit. Les huit capacités ci-dessous gardent leurs identifiants sources.

Le statut final signifie contrats UX finalisés, sans lever les blocages nutritionnels, commerciaux ou liés aux données. Les états décrivent le comportement attendu lorsque ces décisions sont instruites ; ils ne constituent pas des fonctionnalités déjà disponibles.

## Information Architecture

| Surface | Accès et besoin couvert | Accès personnel | Parcours |
|---|---|---|---|
| Accueil | Entrée publique ; calcul gratuit et démonstration | Aucun | CAP-1, CAP-2 |
| Calculateur | Accueil ; estimation, hypothèses, modification de cible | Aucun | CAP-1 |
| Démonstration | Accueil ou résultat gratuit ; sélection, verrou, proposition, écarts, reprise simulée | Aucun, données démonstratives identifiées | CAP-2 |
| Aliments | Composition ; recherche Open Food Facts et détail | Compte et abonnement pour usage personnel | CAP-3 |
| Données privées | Aliment incomplet ou détail ; compléter avec source et date | Compte et abonnement | CAP-3 |
| Composition | Démonstration, navigation, Favoris ou Journal ; cible et 3 à 6 aliments | Compte et abonnement pour usage personnel | CAP-4 |
| Confirmation du repas | Composition ; enregistrer ou ajouter à un jour explicitement choisi | Compte et abonnement | CAP-5 |
| Favoris | Navigation ; consultation et reprise modifiable | Compte et abonnement | CAP-5 |
| Journal | Navigation ; date, repas, totaux et complétude déclarée | Compte et abonnement | CAP-6 |
| Compte et abonnement | Fin de démonstration ou navigation ; connexion, offre, état et résiliation | Public pour connexion/offre, compte pour gestion | CAP-7 |
| Données personnelles | Compte ; export et suppression | Compte, accessible sans abonnement actif | CAP-8 |

Navigation publique : Accueil, Calculateur, Démonstration, Compte. Navigation personnelle : Composition, Favoris, Journal, Compte. Aliments et Données privées sont des étapes de Composition ; Confirmation du repas ne se superpose pas à une autre confirmation. Le retour conserve les saisies dans la session active sans promettre de restauration après fermeture. Toute surface est décrite uniquement par les contrats, sans maquette.

## Voice and Tone

[ASSUMPTION] Vouvoiement simple, phrases courtes, unités explicites ; aucun jugement sur les aliments, portions ou écarts.

| Situation | Texte de référence |
|---|---|
| Estimation | « Cible estimative. Consultez les hypothèses avant de la confirmer. » |
| Méthode indisponible | « L'estimation n'est pas disponible. » |
| Aliment incomplet | « Lipides manquants. Complétez cette donnée avec une source pour proposer des portions. » |
| Cible non atteinte | « Cible non atteinte. Voici les écarts avec votre cible. » |
| Contraintes incompatibles | « Aucune combinaison ne respecte vos contraintes. Vérifiez les limites indiquées. » |
| Journal incomplet | « Journée non déclarée complète. Le reste est indicatif. » |
| Sauvegarde échouée | « Le repas n'a pas été enregistré. Réessayez. » |
| Démonstration | « Exemple de démonstration. Ce repas n'est pas ajouté à votre journal. » |

## Component Patterns

Les noms correspondent exactement à DESIGN.md.Components. Les propriétés visuelles et le focus suivent notamment `{colors.focus}`, `{rounded.sm}` et `{spacing.4}`.

| Composant | Comportement |
|---|---|
| Navigation | Destination active annoncée ; changement de surface place le focus sur son titre. Accès interdit explique connexion ou abonnement et propose le retour public. |
| Action | Activation clavier et tactile ; pendant une mutation, état en cours et double envoi empêché. Succès affiché seulement après confirmation de l'opération. |
| Champ | Label associé, unités persistantes, décimales françaises acceptées puis normalisées sans arrondi caché ; validation locale précise et résumé des erreurs à la soumission. |
| Aliment | Sélection explicite ; détail expose identifiant, provenance, date, base et état connu ou « état inconnu ». Valeur absente et zéro restent distincts. |
| Portion | Quantité initiale confirmée, bornes et pas confirmés avec référence lorsqu'elle existe ; aucune valeur universelle inventée. Verrou fixe exactement la quantité, sans relâchement automatique. |
| Bilan | Cible confirmée, obtenu et écarts signés ; calories informatives. « proche » et « cible non atteinte » suivent exclusivement regles-repas.md. Modifier une entrée rend la proposition précédente obsolète. |
| Repas | Consultation de l'instantané enregistré ; reprendre ou copier crée une nouvelle instance. Modification de cette instance préserve l'original. |
| Message | Erreur liée au champ ou état global ; annoncer le changement utile, conserver les saisies, donner une action de reprise sans modifier les contraintes. |
| Confirmation | Montrer repas, jour et conséquences ; distinguer favori de journal. Annuler revient aux saisies ; confirmer une fois crée une seule entrée. Retrait et suppression exposent la conséquence avant exécution. |
| Offre | Accessible après démonstration complète ; 5,99 €/mois comme prix de test, récurrence visible. Paiement confirmé par le service avant ouverture des fonctions personnelles ; annulation ou erreur conserve le parcours. |
| Paramètre | État d'abonnement consultable ; résiliation, demande d'export et suppression accessibles. Afficher les conditions effectivement définies sans inventer délais ou garanties. |

## State Patterns

Règles communes à chaque surface : focus visible et ordre de lecture stable ; chargement annoncé sans bloquer la navigation publique ; erreur avec reprise explicite ; hors ligne signalé et opérations serveur suspendues, aucune sauvegarde présumée. Les valeurs disponibles peuvent rester lisibles avec leur date. Une saisie conservée dans la session n'est pas un enregistrement. Session expirée : reconnexion puis vérification avant nouvelle mutation.

| Surface | États spécifiques : vide, chargement, succès, erreur, accès |
|---|---|
| Accueil | Contenu public lisible ; lien vers méthode indisponible expliqué ; panne des fonctions distantes sans empêcher la lecture. Aucun accès personnel requis. |
| Calculateur | Initial : aucun résultat ; chargement de méthode ; résultat et hypothèses ; entrées invalides liées aux champs ; méthode non validée ou cas hors périmètre : aucune estimation automatique, explication issue des décisions approuvées. |
| Démonstration | Exemple chargé et identifié ; sélection guidée ; proposition ; exemple indisponible ou incomplet : pas de chiffres inventés, réessayer ; reprise simulée sans sauvegarde personnelle. Offre après parcours complet. |
| Aliments | Requête vide invite à rechercher ; recherche en cours ; liste ou aucun résultat ; échec de source distinct de zéro résultat ; sélection incomplète ouvre Données privées ; source et date visibles. |
| Données privées | Champs incomplets ; saisie en cours ; correction enregistrée privément ; source/base absente ou conversion ambiguë : blocage précis ; erreur de sauvegarde conserve saisie ; aucune modification du catalogue partagé. |
| Composition | Initial sans aliments ; moins de 3 ou plus de 6 interdit la proposition ; données/contraintes invalides expliquées ; calcul en cours ; proposition proche ou cible non atteinte ; aucune combinaison admissible : pas de repas présenté comme valide. |
| Confirmation du repas | Résumé chargé depuis proposition actuelle ; proposition obsolète bloque confirmation ; enregistrement en cours ; succès unique ; échec conserve résumé et destination ; retour permis. |
| Favoris | Aucun favori : lien Composition ; chargement ; liste et détail ; favori introuvable : retour liste ; copie ouverte dans Composition ; données actualisées seulement après confirmation explicite. |
| Journal | Aucun repas au jour choisi : action ajouter ; chargement ; liste/totaux ; journée incomplète ou complète déclarée ; modifier/retirer remet la déclaration à confirmer ; panne conserve le dernier bilan identifié sans promettre de mise à jour. |
| Compte et abonnement | Déconnecté : connexion/création ; connecté sans abonnement : offre ; paiement en cours, échoué, annulé ou confirmé ; statut indisponible : vérifier sans double paiement ; abonnement actif, résiliation demandée puis confirmée avec effet défini par les conditions. |
| Données personnelles | Demandes absentes, en cours, reçues, disponibles ou échouées ; suppression à confirmer ; compte supprimé : retour public ; accès conservé sans abonnement. Délais et exceptions affichés seulement après définition. |

## Interaction Primitives

Toutes les actions ont une alternative clavier standard : Tab, Maj+Tab, Entrée ou Espace selon le contrôle. Échap ferme Confirmation et restaure le focus au déclencheur ; le contenu sous une confirmation est inactif. Aucun glisser, geste caché ou survol obligatoire. Le bouton Retour suit les étapes et conserve les saisies de la session ; une sortie abandonnant des modifications explicites affiche Confirmation.

Proposer ne confirme pas un repas. Recalculer ne change pas un verrou. Ajouter une nouvelle instance demande le jour choisi et une confirmation. Ne pas relancer automatiquement un paiement, une suppression ou une mutation après une perte réseau ; vérifier d'abord l'état de l'opération. L'implémentation devra empêcher les doublons de confirmation.

## Accessibility Floor

Objectif WCAG 2.2 AA à vérifier lors de l'implémentation. Titres hiérarchisés, landmarks, labels explicites, tableaux avec en-têtes et alternatives linéaires mobile. Nom et état du verrou annoncés. Source et état cru/cuit accessibles au lecteur d'écran. Écart annoncé avec son signe et son unité.

Focus jamais masqué, ordre identique à l'ordre de lecture ; résultat, erreur et sauvegarde annoncés sans déplacer arbitrairement le focus. Résumé d'erreurs lié aux champs. Zoom 200 %, réagencement à 320 px, augmentation de texte et réduction des mouvements respectés. Zones tactiles d'au moins 44 × 44 px. Information jamais portée uniquement par couleur, position ou icône. Contraste visuel dans DESIGN.md ; absence de conformité revendiquée avant vérification.

## Responsive & Platform

| Largeur | Comportement |
|---|---|
| Moins de 768 px | Une colonne ; navigation visible et compacte ; aliments puis portions puis bilan ; Confirmation occupe l'espace disponible sans masquer ses actions ; clavier virtuel et safe areas respectés. |
| À partir de 768 px | Composition en deux zones possibles ; détails alimentaires et bilan adjacents ; mêmes contenus et actions, ordre de focus conservé. |

Maximum `{spacing.page-max}`, marges `{spacing.gutter}`. Le journal passe de lignes alignées à des Repas empilés sans perte d'information. Pas d'application native, pas de mode hors ligne complet ni de notifications de réengagement au premier périmètre.

## Inspiration & Anti-patterns

L'addendum documente des repères concurrentiels produit ; aucune identité visuelle concurrente n'est adoptée ici. La sélection autonome retient la lisibilité des mesures et la réutilisation explicite. Écarter séries, badges, objectif culpabilisant, compensation automatique, paywall avant démonstration et suggestions nutritionnelles sans provenance.

## Key Flows

Camille est un protagoniste fictif illustratif : adulte francophone qui suit déjà ses macros et pèse ses aliments. Ces parcours sont des scénarios de conception, pas des entretiens ni des usages observés.

### CAP-1 — Cible estimative sans compte

1. Camille ouvre Accueil puis Calculateur.
2. Lorsque la méthode a été validée, Camille fournit uniquement ses entrées nécessaires et consulte hypothèses, limites et exclusions.
3. Camille consulte l'estimation, modifie sa cible et demande le recalcul prévu par la méthode.
4. **Climax :** Camille retrouve les valeurs modifiées et leurs hypothèses, sans création de compte.

Échec : méthode non validée, entrée invalide ou situation exclue → pas d'estimation automatique ; expliquer le blocage sans conseil improvisé.

### CAP-2 — Démonstration complète avant abonnement

1. Camille entre dans Démonstration depuis Accueil ou Calculateur.
2. Camille sélectionne les aliments de l'exemple sourcé, verrouille une portion et demande une proposition.
3. Camille consulte quantités, écarts et une reprise simulée du repas.
4. **Climax :** Camille comprend ce qui peut être repris ; l'Offre devient accessible sans avoir ajouté de repas personnel.

Échec : données d'exemple insuffisantes → Message et reprise ; aucune démonstration numérique inventée.

### CAP-3 — Aliments et correction privée sourcée

1. Depuis Composition, Camille ouvre Aliments et cherche un aliment habituel.
2. Camille consulte provenance, date, base et état ; une valeur manquante est indiquée.
3. Camille ouvre Données privées et complète depuis une référence identifiable, avec base et date.
4. **Climax :** la donnée privée est enregistrée et Camille peut sélectionner cet aliment avec ses quatre valeurs complètes.

Échec : absence de source ou base ambiguë → blocage ciblé ; recherche indisponible distincte d'une liste vide.

### CAP-4 — Portions contrôlables pour une cible confirmée

1. Camille ouvre Composition, confirme la cible et sélectionne 3 à 6 aliments.
2. Camille confirme quantités, bornes et pas à partir des références disponibles ou de ses saisies ; verrouille une portion.
3. Camille demande une proposition et consulte Bilan.
4. **Climax :** les contraintes sont respectées et les écarts restent visibles ; Camille choisit d'accepter ou de modifier ses propres contraintes.

Échec : aucune combinaison admissible → contraintes à réexaminer expliquées, aucune correction automatique ; aucune donnée absente assimilée à zéro.

### CAP-5 — Confirmation, favori et copie

1. Camille ouvre Confirmation du repas depuis une proposition actuelle.
2. Camille confirme l'instantané et choisit explicitement un favori, un ajout au jour sélectionné, ou les deux.
3. Plus tard, Camille ouvre Favoris ou un repas du Journal et choisit reprendre ou copier.
4. Camille modifie la nouvelle instance dans Composition puis la confirme pour le jour voulu.
5. **Climax :** le nouveau repas figure une seule fois au Journal et l'original conserve ses données.

Échec : sauvegarde interrompue → vérifier son état puis réessayer ; mise à jour de données alimentaires demandant une confirmation avant remplacement de l'instantané.

### CAP-6 — Journal et complétude explicite

1. Camille ouvre Journal et choisit un jour.
2. Camille consulte les repas et les totaux, puis ajoute, modifie ou retire un repas avec confirmation appropriée.
3. Camille vérifie les totaux recalculés et déclare la journée complète si son journal l'est effectivement.
4. **Climax :** le bilan distingue reste indicatif et déclaration de complétude ; un reste négatif demeure neutre et sans proposition de rattrapage.

Échec : modification ultérieure → déclaration à confirmer ; en cas de panne, dernier bilan identifié et aucune mise à jour supposée.

### CAP-7 — Compte, paiement et résiliation

1. Après Démonstration, Camille ouvre Compte et abonnement, crée un compte ou se connecte.
2. Camille lit l'offre unique de test, 5,99 €/mois, sa récurrence et les conditions approuvées avant paiement.
3. Camille paie ; après confirmation réelle, Composition personnelle, Favoris et Journal deviennent accessibles.
4. **Climax :** Camille retrouve son statut et l'accès personnel confirmé, puis peut demander la résiliation depuis le même espace, avec ses effets explicités.

Échec : paiement échoué, annulé ou statut incertain → pas d'accès présumé ni de second paiement automatique ; conditions commerciales non définies bloquent l'ouverture de paiement public.

### CAP-8 — Contrôle des données personnelles

1. Camille ouvre Compte puis Données personnelles, même sans abonnement actif.
2. Camille demande un export et consulte l'état de la demande puis son accès lorsqu'il est disponible.
3. Camille consulte les conséquences, délais et exceptions réellement approuvés, puis confirme séparément la suppression.
4. **Climax :** Camille voit un état vérifiable de chaque demande et la confirmation de suppression lorsque celle-ci a effectivement abouti.

Échec : demande échouée → raison exploitable et reprise ; aucun message de suppression achevée avant confirmation ; délais et exceptions non définis bloquent l'ouverture publique.

## Décisions amont à instruire

| Sujet | Effet UX et limite |
|---|---|
| Méthode, entrées et exclusions nutritionnelles | Bloque CAP-1 avant implémentation ; aucun formulaire définitif ni calcul inventé. |
| Couverture Open Food Facts et provenance des exemples | Bloque gel du catalogue et démonstration chiffrée ; ne pas combler les absences par défaut. |
| Références de portions | Aucun pas ni borne universels ; la personne confirme les valeurs, toute impossibilité reste explicite. |
| Données, conservation, export et suppression | Définir champs nécessaires, délais et exceptions avant ouverture ; les présentes demandes ne constituent pas une politique juridique. |
| Paiement, résiliation et accès après arrêt | Définir les conditions et leurs effets avant ouverture ; aucune durée d'accès ou règle de remboursement improvisée. |
| Validation d'usage | Entretiens, bêta et audit restent à réaliser selon protocole-validation.md ; les scénarios fictifs ne valident ni préférence ni plausibilité. |
