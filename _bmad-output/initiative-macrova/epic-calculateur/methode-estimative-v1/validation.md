# Registre de validation — proposition v1

Version soumise : `methode-estimative-v1`, dossier préparé le **7 octobre 2026**. **Statut : EN ATTENTE — aucune approbation nutritionnelle réelle, aucune autorisation d'implémentation d'estimation automatique.** La story 2.1 demeure ouverte à l'acceptation finale et la suite 2.2 reste fermée.

## Vérification documentaire et numérique

La préparation technique fournit [méthode](methode-estimative-v1.md), [sources primaires vérifiées](sources-verifiees.md), [exemples et matrice](exemples-reference.md), [vecteurs JSON](exemples-reference.json) et [preuves de vérification](verification.md). Elle distingue données des sources et choix produit ; les calculs sont reproductibles en fractions exactes. Ces contrôles attestent cohérence du dossier et arithmétique, **pas** applicabilité clinique, sécurité individuelle, consentement ou approbation réelle. L'agent qui prépare les fichiers n'est pas le responsable nutritionnel et ne signe pas à sa place.

| Exigence | Pièces soumises | Ce qui reste nécessaire |
|---|---|---|
| CAL-1 | Sources S1–S5 datées, formule, PAL, défaut, unités, hypothèses, limites, modifications, exemples exacts | Accord réel daté d'un responsable identifié sur l'ensemble de la version |
| CAL-3 | Gardes ordonnées, matrice bornes/exclusions, messages, méthode indisponible, invalidation après changement | Approbation du périmètre et des exclusions ; implémentation/recette ultérieures |
| CAL-4 | Recalcul des quatre champs, seuil E original, prévisualisation/confirmation/reset, refus sans clamp | Approbation des règles de modification ; implémentation/recette ultérieures |

La vérification de liens ne renouvelle pas une lecture scientifique : les preuves de consultation primaire au 7 octobre 2026 sont celles de sources-verifiees.md, à conserver. Aucun test applicatif ni moteur n'est livré par 2.1.

## Décision externe à recueillir

| Élément de décision | Valeur actuelle |
|---|---|
| Nom du responsable réel | **Non fourni** |
| Rôle et compétence pertinents, assumés par cette personne | **Non fournis** |
| Date de décision | **Non reçue** |
| Version examinée et empreintes des pièces | `methode-estimative-v1`, empreintes dans verification.md ; examen réel non attesté |
| Décision explicite | **Non reçue** (acceptation / refus / modifications demandées) |
| Réserves et conditions | **Non reçues** |
| Preuve de décision et emplacement vérifiable | **Aucune reçue** |

La signature doit couvrir explicitement : assemblage Mifflin × PAL et coefficient applicable ; descriptions des PAL ; maintien seul ; défaut 15/45/40 ; intervalles et facteurs 4/4/9 ; seuil 0,83 g/kg ; bornes âge/taille/poids/IMC ; toutes les exclusions et déclaration globale ; modifications ±10 % d'E0 sans cumul, recalcul et gardes des macros ; messages/états sans estimation ; limites, incertitudes et exemples de cette version. Un accord partiel ou sur une ancienne version ne vaut pas acceptation globale.

Une réponse valide est une preuve attribuable à une personne réelle identifiée, datée, référant précisément la version et les pièces examinées et exprimant sa décision sur tous les éléments. Le rôle/compétence et la responsabilité acceptée doivent être consignés, sans inventer un titre, diplôme ou qualité réglementaire. Si réserves, contradiction, refus ou modification : conserver la preuve et l'historique, rouvrir les arbitrages concernés, produire une version cohérente nouvelle et demander l'examen du dossier révisé. Ne pas interpréter silence, délégation de rédaction, revue technique ou approbation du plan comme accord nutritionnel.

Après réception effective seulement, consigner responsable/rôle, date, version, décision, réserves et lien de preuve ; vérifier concordance de toutes les pièces et absence de réserve bloquante. La clôture de 2.1 peut alors être décidée dans le workflow humain prévu. Ce dossier ne modifie ni tickets, ni checkpoint, ni contrat parent et n'ouvre pas automatiquement 2.2. Le lancement public garde ses autres conditions propres.
