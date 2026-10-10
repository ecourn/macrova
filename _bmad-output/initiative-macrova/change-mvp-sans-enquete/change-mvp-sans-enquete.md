# MVP fiable sans enquête préalable — décision du 10 octobre 2026

## Décision et autorisation

L’utilisateur demande explicitement l’analyse puis l’application documentaire : aucune enquête de quinze utilisateurs ni entretien pilote obligatoire ; construire un MVP fonctionnel, robuste et utilisable, puis recueillir éventuellement des retours après mise à disposition. Cette instruction autorise les changements ci-dessous, sans nouvelle approbation. Aucun code applicatif, configuration, contact externe ou déploiement ne fait partie de cette opération.

La présente décision remplace les obligations terrain antérieures, y compris celles de la correction de gouvernance du 8 octobre. Les preuves historiques restent historiques. Aucun entretien, test, résultat d’audit ou paiement n’est créé par cette décision.

## Analyse d’impact avant modification

Inspection de l’ensemble des documents BMAD : spécification et quatre compagnons, brief/addendum, forge et journaux, contrats UX, architecture et revues, dix enveloppes d’epics, trois découpages existants, plans, kit enquête, rétrospectives, walkthroughs, registre différé et validations de découpage. Aucun PRD distinct n’existe ; la spécification est le contrat produit. L’initiative est explicitement désignée, sans modifier l’initiative active globale.

- **Sources produit :** le brief, l’addendum et le protocole imposaient quinze entretiens puis une bêta de 20–30 personnes ; le signal de succès et Done when 4 de l’initiative assimilaient livraison et validation commerciale.
- **Epic 10 :** ENQ-1 imposait un support privé avant recrutement ; ENQ-2 les quinze observations ; ENQ-3 un corpus issu de ces repas ; ENQ-4 le protocole bêta ; ENQ-5/6 la transmission et les limites/protection. 10.2 préparé mais in-progress ne prouvait aucun pilote. 10.3–10.7 étaient seulement planned ; 10.1 était done pour sa préparation documentaire.
- **Dépendances bloquantes :** epic 3 attendait epic 10/10.5 ; epic 9 attendait epic 10/10.7. La chaîne 10.2 → 10.3 → 10.4 → 10.5 → 10.6 → 10.7 rendait le catalogue puis le premium tributaires du recrutement.
- **Catalogue :** l’audit de cinquante recherches reste pertinent ; seule son origine obligatoirement terrain est abandonnée. Il ne peut démontrer une couverture représentative des repas de la cible.
- **Lancement :** invitations, tâches comparatives, seuils d’activation/réutilisation/paiement et renouvellement deviennent des options post-MVP ; données, licences, paiement, sécurité et exploitation restent des conditions effectives d’ouverture.
- **UX et architecture :** les scénarios fictifs restent de conception. AD-11 garde les événements métier et leur confidentialité ; la cohorte d’invitation devient conditionnelle à une étude décidée ultérieurement. Aucun contrat de code n’est modifié ici.
- **Socle/calculateur :** déjà done, preuves et tests conservés. R2, R3, R4 et reports techniques du socle restent ouverts ; aucune absence d’enquête ne les clôt.

Approche retenue : ajustement documentaire ciblé et séparation livraison/retours, sans rollback du travail réalisé ni réduction de CAP-1 à CAP-8. Effort documentaire limité ; retrait du délai humain non estimable du recrutement. Risque commercial conservé explicitement.

## Exigences abandonnées, conservées et reportées

- **Abandonnées comme obligations MVP :** ENQ-2 (quinze entretiens/pilote/lots), origine terrain de ENQ-3, remises ENQ-5 propres à l’enquête, recrutement obligatoire, taille/durée imposées de bêta, seuils commerciaux comme critères d’achèvement ou conditions de mise à disposition. Aucun nombre d’entretiens de substitution.
- **Conservées :** CAP-1 à CAP-8, OFF obligatoire, audit de cinquante recherches, quatre valeurs sourcées, absence ≠ zéro, bases/unités/états explicites, densité sourcée, calcul exact et déterministe, bornes/pas/verrous, confirmations, snapshots, isolation/autorisation backend, export/suppression, paiement/idempotence, recette intégrée/accessibilité/exploitation et licences.
- **Conditionnelles après livraison :** apprentissage réel, temps gagné, compréhension, plausibilité des portions, préférence, prix, réutilisation et renouvellement. Les anciens seuils sont des repères historiques, pas des résultats ou objectifs imposés. Si une étude est décidée, consentement, accès, retrait et conservation de ENQ-1/6 restent nécessaires avant collecte ; leur support ne bloque aucun développement sans collecte.
- **Validations techniques à faire :** corpus et audit 3.1, intégration catalogue et corrections privées, moteur et parcours personnels, paiement, données personnelles, recette de lancement ; reports R2/R3/R4 et socle selon leurs échéances existantes. Aucun succès nouveau déclaré.

## Bilan des tickets et critères

| Ticket / epic | Avant | Après / justification |
|---|---|---|
| 10.1 — Kit et protocole | done | Conservé done comme préparation historique ; ni preuve terrain ni gate MVP |
| 10.2 — Pilote réel | in-progress, six preuves terrain absentes | dropped ; plan et procédure conservés comme archives, aucune fausse clôture done |
| 10.3 — Sept entretiens après pilote | planned | Supprimé du découpage actif ; obligation abandonnée |
| 10.4 — Compléter quinze entretiens | planned | Supprimé du découpage actif ; obligation abandonnée |
| 10.5 — Corpus issu des repas réels | planned | Supprimé ; besoin technique transféré à 3.1, sans filiation terrain fictive |
| 10.6 — Nettoyage enquête | planned | Supprimé ; pas de clôture d’enquête à construire |
| 10.7 — Remise dossier/bêta | planned | Supprimé ; plus de remise préalable au lancement |
| Epic 10 | in-progress | dropped, archive conservée avec ids 10.1/10.2 ; aucun dépendant actif |
| 3.1 — Corpus reproductible et audit OFF | absent | Ajouté planned ; cinquante requêtes, captures sourcées, replay, contrôles et décision de couverture technique |
| Epic 3 | corpus fourni par 10.5 | Produit son propre corpus et audit, critères CAT-1 à CAT-3 |
| Epic 9 | bêta et bilan d’usage obligatoires | Recette objective et ouverture ; retours facultatifs après livraison |
| Initiative | bilan commercial obligatoire | MVP livré et vérifié, limitations et décisions d’ouverture documentées |
| Stories 1.1–1.8 et 2.1–2.8 | done | Conservées, aucun test ni preuve réécrit |
| Epics 4–8 | enveloppes futures | Capacités et dépendances techniques conservées ; mention terrain obligatoire retirée |

Les rendus HTML du brainstorming/forge, titres/critères et liens historiques du kit, de l’inception enquête, de la correction du 8 octobre et des sources amont sont conservés avec un avertissement de priorité ; ils ne doivent pas guider une reprise automatique. Le découpage enquête original est archivé dans ce dossier.

## Dépendances corrigées

- Retrait de epic 3 → epic 10 (livrable 10.5) et epic 9 → epic 10 (livrable 10.7).
- Retrait des dépendances internes de 10.2 et suppression des entries 10.3–10.7 ; epic 10 conservé en fin d’index à titre dropped, sans gate actif.
- 3.1 dépend de 1.2 (contrat FoodSnapshot/numérique existant) ; l’epic 3 conserve son préalable epic 1. Il prépare et réalise l’audit, sans attendre paiement, comptes d’abonnés ou observations réelles ; la construction utilise le droit de test isolé déjà prévu.
- Chaîne de livraison conservée : socle → catalogue → démonstration → abonnement → composition → repas/journal → données personnelles → lancement ; calculateur déjà livré isolément, utilisé au lancement. Les contrôles de conditions d’ouverture peuvent être préparés en amont, leur recette finale attend les capacités livrées.

## Vérifications objectives attendues

Le protocole canonique définit la matrice de cas et le contenu du corpus. Tests déterministes et jeux sourcés peuvent prouver la conformité technique aux règles choisies, pas la valeur du produit, la représentativité alimentaire ou la validité clinique. Les cas synthétiques d’erreur sont marqués et séparés des valeurs alimentaires sourcées. Chaque preuve future indique version/révision, commande, attendu, observé et limites ; les échecs restent visibles.

## Risques résiduels et suite

Sans enquête, besoin récurrent, gain de temps, compréhension réelle, plausibilité personnelle et prix restent non validés. Le corpus de cinquante requêtes n’est ni exhaustif ni représentatif ; un audit sans seuil inventé doit expliciter les limites et traiter les blocages des cas retenus. Les données OFF peuvent être incomplètes ou évoluer ; conserver dates, provenance et replays, puis recontrôler avant gel. Aucune conformité clinique, juridique ou d’accessibilité complète n’est revendiquée.

Prochain ticket recommandé : **3.1 — Constituer le corpus reproductible et auditer Open Food Facts**, prêt après les prérequis socle terminés. Puis détailler le reste de l’epic catalogue depuis son audit sans modifier les epics non concernés. Avant ouverture, traiter R2 ; avant consommation de cibles externes, R3 ; pour les affirmations d’accessibilité, R4 reste un contrôle réel sur outil/appareil et ne requiert pas le recrutement de quinze utilisateurs.

## Checklist de correction

[x] Déclencheur et mandat explicites ; [x] impacts epics/stories et contrats inventoriés ; [x] ajustement direct retenu ; [N/A] rollback applicatif ; [x] scope MVP fonctionnel conservé ; [x] changements appliqués sous autorisation utilisateur ; [x] handoff 3.1 et échéances techniques documentés. [!] Exécution de l’audit et validations produit techniques futures ; [!] adéquation aux besoins réels inconnue, retours facultatifs post-livraison.

## Contrôles documentaires

- Cinq fichiers TOML analysés sans erreur (index initiative et quatre découpages) ; graphe sans dépendance active vers epic 10 ou 10.2–10.7, sans cycle, unpinned_after, undeclared_after ni order_conflict.
- `tickets.py status` : 19 tickets détaillés, 17 done (socle, calculateur, 10.1), un dropped (10.2), un planned (3.1). Les epics futurs sont des enveloppes, ces nombres ne représentent pas tout le travail restant du MVP.
- `tickets.py next` : seul 3.1 ready_to_start ; aucun ticket in-progress ni bloqué par l’enquête. La suite du catalogue reste à détailler, elle n’est pas déclarée prête par ces contrôles.
- Quatre avertissements préexistants inchangés : plans transversaux sans champ ticket (actions R1–R5, corrections socle, publication socle, shadcn), ignorés par le ticket tree ; aucune anomalie nouvelle.
- Liens Markdown locaux des documents modifiés/nouveaux et liens des avertissements HTML contrôlés ; cibles présentes. `git diff --check` sans erreur. Seuls des fichiers `_bmad-output/` changent.
- CAP-1 à CAP-8 comparées au texte HEAD : inchangées ; plans et preuves des stories socle/calculateur inchangés octet par octet.
- Aucune suite applicative exécutée, aucune enquête, audit OFF ou validation clinique/juridique réalisée par cette opération documentaire.
