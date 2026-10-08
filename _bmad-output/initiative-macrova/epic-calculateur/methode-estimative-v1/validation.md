# Validation produit — méthode estimative v1

**Décision du 8 octobre 2026 : dossier accepté pour la construction isolée de CAP-1 ; 2.1 clôturée sous mandat utilisateur, 2.2 autorisée à démarrer.** Validation produit documentaire et arithmétique ; aucune certification clinique ou signature externe revendiquée. L’application n’est pas encore implémentée.

L’utilisateur a demandé de remplacer la gouvernance externe par le fonctionnement à deux et a délégué les arbitrages ainsi que leur application sans nouvelle confirmation. L’agent consigne l’adoption des six points de [décision](decision-responsable.md) sur les pièces identifiées dans [verification.md](verification.md), en conservant les limites des [sources](sources-verifiees.md).

CAL-1 est satisfait par la méthode, les sources datées, unités, hypothèses, exclusions, règles et exemples vérifiés. CAL-3/CAL-4 sont documentés ici ; leur implémentation et leurs tests restent en 2.2–2.4. Les essais intégrés sont à réaliser en 2.8. Tout retrait de la version rétablit METHODE_INDISPONIBLE. L’ouverture publique conserve ses conditions propres.

## Historique antérieur remplacé — 7 octobre 2026

Les paragraphes suivants retracent l’ancienne exigence externe et ses constats exacts à cette date. Ils ne définissent plus les conditions courantes de clôture ou de démarrage.

# Registre de validation — proposition v1

Version soumise : `methode-estimative-v1`, dossier préparé le **7 octobre 2026**. **Statut : BLOQUÉE / EN ATTENTE DE VALIDATION EXTERNE — aucune approbation nutritionnelle réelle, aucune autorisation d'implémentation d'estimation automatique.** La story 2.1 demeure ouverte à l'acceptation finale et la suite 2.2 reste fermée.

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

## Reprise du recueil — 7 octobre 2026

- Révision examinée : `7939b0f8f552e8ad94e4067c6409c40deb717b4b`. Recherche dans les documents versionnés du dépôt et les deux commits de préparation/revue : aucune décision attribuable à un responsable réel trouvée. Les journaux de walkthrough confirment expressément que l'accord externe reste à recevoir. Ce constat porte sur les pièces accessibles, pas sur l'existence éventuelle d'un accord hors du dépôt.
- L'instruction de reprise délègue les réponses et arbitrages à l'agent ; elle ne fournit ni identité/compétence du responsable, ni décision datée couvrant les pièces. Elle n'est donc pas enregistrée comme accord nutritionnel.
- Le [formulaire de décision](decision-responsable.md) fournit les points à examiner et les quatre empreintes des pièces scientifiques/numériques. C'est un support de recueil non signé, pas une preuve reçue.
- Une demande de transmission de la décision réelle et de sa provenance a été présentée dans la conversation de reprise. Aucun destinataire externe ni accès à une réponse externe n'est fourni ; aucun tiers n'a été contacté.
- **Résultat à ce stade : validation réelle non recueillie ; acceptation de 2.1 ouverte et implémentation 2.2 non autorisée.** Ne renseigner les champs de décision qu'à réception effective d'une preuve recevable.

## Bilan final de préparation — 7 octobre 2026

L'utilisateur confirme dans la conversation de reprise : « Je ne dispose pas d’une décision réelle et vérifiable d’un responsable externe concernant la méthode estimative v1. » Cette déclaration atteste l'absence d'accord disponible, sans constituer un refus du responsable ni un accord sur la méthode. Aucune identité, compétence, décision ou preuve n'est inventée.

**Tous les éléments préparatoires de 2.1 sont complets et exploitables ; la validation réelle du responsable est le seul élément restant.** Sources primaires consignées avec leurs limites, méthode et choix produit distingués, entrées/unités/domaines/exclusions définis, gardes et messages ordonnés, règles de recalcul et états déterministes, trois profils synthétiques, sept modifications, 112 cas de matrice, cinq transitions et trois arrondis, vérification reproductible et formulaire de décision sont disponibles. Les tests d'implémentation et de parcours relèvent des stories suivantes et ne sont pas des travaux préparatoires manquants de 2.1.

### Informations indispensables pour clôturer 2.1

- Nom du responsable réel, rôle, compétence pertinente déclarée et responsabilité assumée pour l'examen, sans titre présumé.
- Date effective de la décision et confirmation d'examen de `methode-estimative-v1` et des pièces identifiées par les quatre SHA-256 du formulaire.
- Décision explicite sur chacun des six points du formulaire, couvrant formule/coefficient/PAL, maintien, répartition/facteurs/seuil protéique, bornes, exclusions, modifications/recalcul/états/messages, limites et exemples ; acceptation globale de cette version pour permettre la clôture.
- Réserves et conditions, ou mention explicite de leur absence ; aucune réserve bloquante non résolue. Un refus ou des modifications demandées ne permettent pas la clôture et exigent le traitement des points concernés puis un nouvel accord recevable.
- Texte original attribuable de la décision ou signature, provenance et emplacement vérifiable de la preuve conservée. Une réponse dans le formulaire ou un message attribuable suffit si tous les éléments sont présents ; ne pas exiger un diplôme ou une forme de signature non prévus.

À réception seulement : conserver la preuve, vérifier sa concordance avec la version et les empreintes, consigner la décision et ses réserves dans ce registre puis soumettre la clôture au checkpoint de 2.1. Ce traitement fait partie de la validation externe restante ; aucun travail technique préalable supplémentaire n'est requis actuellement.

Le plan porte `status: blocked`, `acceptance: awaiting-real-validation` et `implementation_authorized: false`. **2.2 reste non autorisée**, conformément à sa dépendance formelle à 2.1. Ce blocage documente la condition réelle et ne la supprime pas ; il ne vaut ni validation nutritionnelle ni autorisation de lancement public.
