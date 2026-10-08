# Exemples et matrice de référence — proposition v1

Version : `methode-estimative-v1` ; vérifiés le 7 octobre 2026. Profils fictifs, aucun conseil personnalisé. [Méthode et messages](methode-estimative-v1.md), [JSON exact](exemples-reference.json), [sources](sources-verifiees.md), [validation produit](validation.md), [vérification](verification.md).

Les gardes sont exercées sous disponibilité hypothétique de la méthode. La décision produit du 8 octobre 2026 rend le dossier disponible pour construction ; METHODE_INDISPONIBLE prime si la version est absente, retirée ou non adoptée. Aucun moteur applicatif n’est livré par ces vecteurs. Les cas `GARDE_PASSEE` attestent seulement la garde nommée, pas un profil complet ni une approbation. Les gardes de cible isolées vérifient un invariant, sans simuler nécessairement une modification accessible depuis le défaut.

## Profils synthétiques

| Profil | Âge ; taille ; poids ; c ; PAL | R ; IMC ; minimum P exacts | E ; P ; G ; L exacts | Affichage kcal ; g ; g ; g |
|---|---|---|---|---|
| A | 30 ; 175 ; 70 ; 5 ; 1.6 | 6595/4 ; 160/7 ; 581/10 | 2638/1 ; 3957/40 ; 11871/40 ; 5276/45 | 2638,00 ; 98,93 ; 296,78 ; 117,24 |
| B | 40 ; 165 ; 60 ; -161 ; 1.4 | 5081/4 ; 8000/363 ; 249/5 | 35567/20 ; 106701/1600 ; 320103/1600 ; 35567/450 | 1778,35 ; 66,69 ; 200,06 ; 79,04 |
| C | 25 ; 180 ; 80 ; 5 ; 1.8 | 1805/1 ; 2000/81 ; 332/5 | 3249/1 ; 9747/80 ; 29241/80 ; 722/5 | 3249,00 ; 121,84 ; 365,51 ; 144,40 |

Pour chaque profil : déclaration globale oui, coefficient explicitement choisi ; contrôles de domaine et P minimum satisfaits. L'affichage n'est pas une donnée de recalcul. Exemple A : P=3957/40 g affiche 98,93 g ; L=5276/45 g est périodique. Les fractions énergétiques exactes restent 15/45/40, même si une somme d'affichages diffère.

## Modification, validation et réinitialisation

Chaque ligne part de A sauf la transition successive explicitement nommée ; le JSON donne la cible candidate exacte et son affichage. Les candidats ne deviennent courants qu'après confirmation.

| Cas | Saisie | E ; P ; G ; L exacts | Affichage |
|---|---|---|---|
| E-haut | E=2901.8 | 14509/5 ; 43527/400 ; 130581/400 ; 29018/225 | 2901,80 ; 108,82 ; 326,45 ; 128,97 |
| E-bas | E=2374.2 | 11871/5 ; 35613/400 ; 106839/400 ; 2638/25 | 2374,20 ; 89,03 ; 267,10 ; 105,52 |
| P | P=110 | 2638/1 ; 110/1 ; 2857/10 ; 5276/45 | 2638,00 ; 110,00 ; 285,70 ; 117,24 |
| G | G=310 | 2638/1 ; 3957/40 ; 310/1 ; 3341/30 | 2638,00 ; 98,93 ; 310,00 ; 111,37 |
| L | L=110 | 2638/1 ; 3957/40 ; 12523/40 ; 110/1 | 2638,00 ; 98,93 ; 313,08 ; 110,00 |
| E-haut-puis-bas | E=2374.2 | 11871/5 ; 35613/400 ; 106839/400 ; 2638/25 | 2374,20 ; 89,03 ; 267,10 ; 105,52 |

Énergie conserve les proportions courantes exactes ; P conserve E/L ; G conserve E/P ; L conserve E/P. Chaque candidat respecte 4P+4G+9L=E, les intervalles et le minimum. E-haut puis E-bas démontre que la référence E0 reste 2638 ; une hausse successive vers 3191,98 refuse.

| Transition | Action | Résultat |
|---|---|---|
| confirmation | valider explicitement la prévisualisation P | CIBLE_MODIFIEE |
| annulation | annuler une prévisualisation depuis A | CIBLE_ESTIMEE |
| reset | réinitialiser explicitement après modification, profil A inchangé | CIBLE_ESTIMEE |
| profil-change | changer poids de A à 71 | AUCUNE_CIBLE_COURANTE |
| recalcul-profil | calcul explicite après poids 71 | CIBLE_ESTIMEE |

Le reset et l'annulation restituent exactement A. Après poids 71 et recalcul explicite : E=2654, P=3981/40, G=11943/40, L=5308/45. Tout ancien E0/résultat/prévisualisation est invalidé au changement de profil.

## Matrice complète des bornes et refus

Les entrées associées figurent intégralement dans le JSON ; chaque code correspond au message unique du dossier de méthode. Un refus produit aucune nouvelle cible valide, ni estimation de substitution. Les motifs documentaires d'exclusion ne sont pas des champs à collecter.

| Cas | Étape | Attendu |
|---|---|---|
| methode-absente | disponibilite | METHODE_INDISPONIBLE |
| methode-non-approuvee | disponibilite | METHODE_INDISPONIBLE |
| methode-retiree | disponibilite | METHODE_INDISPONIBLE |
| methode-version-differente | disponibilite | METHODE_INDISPONIBLE |
| syntaxe-4 | AD-12 | ENTREE_INVALIDE |
| syntaxe-5 | AD-12 | ENTREE_INVALIDE |
| syntaxe-6 | AD-12 | ENTREE_INVALIDE |
| syntaxe-7 | AD-12 | ENTREE_INVALIDE |
| syntaxe-8 | AD-12 | ENTREE_INVALIDE |
| syntaxe-9 | AD-12 | ENTREE_INVALIDE |
| syntaxe-10 | AD-12 | ENTREE_INVALIDE |
| syntaxe-11 | AD-12 | ENTREE_INVALIDE |
| syntaxe-12 | AD-12 | ENTREE_INVALIDE |
| normalisation-13 | AD-12 | NORMALISE |
| normalisation-14 | AD-12 | NORMALISE |
| normalisation-15 | AD-12 | NORMALISE |
| normalisation-16 | AD-12 | NORMALISE |
| normalisation-17 | AD-12 | NORMALISE |
| age-18 | borne-champ | AGE_HORS_DOMAINE |
| age-19 | borne-champ | GARDE_PASSEE |
| age-64 | borne-champ | GARDE_PASSEE |
| age-65 | borne-champ | AGE_HORS_DOMAINE |
| age-19.5 | borne-champ | AGE_HORS_DOMAINE |
| taille_cm-119.999999 | borne-champ | TAILLE_HORS_DOMAINE |
| taille_cm-120 | borne-champ | GARDE_PASSEE |
| taille_cm-220 | borne-champ | GARDE_PASSEE |
| taille_cm-220.000001 | borne-champ | TAILLE_HORS_DOMAINE |
| poids_kg-29.999999 | borne-champ | POIDS_HORS_DOMAINE |
| poids_kg-30 | borne-champ | GARDE_PASSEE |
| poids_kg-200 | borne-champ | GARDE_PASSEE |
| poids_kg-200.000001 | borne-champ | POIDS_HORS_DOMAINE |
| IMC-47.359999 | IMC | IMC_HORS_DOMAINE |
| IMC-47.36 | IMC | GARDE_PASSEE |
| IMC-47.360001 | IMC | GARDE_PASSEE |
| IMC-76.799999 | IMC | GARDE_PASSEE |
| IMC-76.8 | IMC | IMC_HORS_DOMAINE |
| IMC-76.800001 | IMC | IMC_HORS_DOMAINE |
| poids200-profil | IMC | IMC_HORS_DOMAINE |
| coefficient-absent | choix | COEFFICIENT_NON_APPLICABLE |
| coefficient-incertain | choix | COEFFICIENT_NON_APPLICABLE |
| coefficient-autre | choix | COEFFICIENT_NON_APPLICABLE |
| coefficient-5 | choix | GARDE_PASSEE |
| coefficient--161 | choix | GARDE_PASSEE |
| PAL-1.4 | choix | GARDE_PASSEE |
| PAL-1.6 | choix | GARDE_PASSEE |
| PAL-1.8 | choix | GARDE_PASSEE |
| PAL-2.0 | choix | GARDE_PASSEE |
| PAL-absent | choix | PAL_INVALIDE |
| PAL-1.5 | choix | PAL_INVALIDE |
| PAL-2.1 | choix | PAL_INVALIDE |
| eligibilite-absente | choix | ELIGIBILITE_ABSENTE |
| eligibilite-inconnue | choix | ELIGIBILITE_ABSENTE |
| eligibilite-oui | exclusion | GARDE_PASSEE |
| grossesse-non | exclusion | SITUATION_EXCLUE |
| grossesse-incertain | exclusion | SITUATION_EXCLUE |
| allaitement-non | exclusion | SITUATION_EXCLUE |
| allaitement-incertain | exclusion | SITUATION_EXCLUE |
| trouble-alimentaire-actuel-non | exclusion | SITUATION_EXCLUE |
| trouble-alimentaire-actuel-incertain | exclusion | SITUATION_EXCLUE |
| trouble-alimentaire-anterieur-non | exclusion | SITUATION_EXCLUE |
| trouble-alimentaire-anterieur-incertain | exclusion | SITUATION_EXCLUE |
| pathologie-influente-non | exclusion | SITUATION_EXCLUE |
| pathologie-influente-incertain | exclusion | SITUATION_EXCLUE |
| traitement-influent-non | exclusion | SITUATION_EXCLUE |
| traitement-influent-incertain | exclusion | SITUATION_EXCLUE |
| prescription-nutritionnelle-non | exclusion | SITUATION_EXCLUE |
| prescription-nutritionnelle-incertain | exclusion | SITUATION_EXCLUE |
| sport-intensif-non | exclusion | SITUATION_EXCLUE |
| sport-intensif-incertain | exclusion | SITUATION_EXCLUE |
| competition-non | exclusion | SITUATION_EXCLUE |
| competition-incertain | exclusion | SITUATION_EXCLUE |
| coefficient-inapplicable-non | exclusion | SITUATION_EXCLUE |
| coefficient-inapplicable-incertain | exclusion | SITUATION_EXCLUE |
| contexte-hormonal-non-couvert-non | exclusion | SITUATION_EXCLUE |
| contexte-hormonal-non-couvert-incertain | exclusion | SITUATION_EXCLUE |
| cardinalite-75 | edition | MODIFICATION_NON_UNIQUE |
| cardinalite-76 | edition | MODIFICATION_NON_UNIQUE |
| cardinalite-77 | edition | MODIFICATION_NON_UNIQUE |
| cardinalite-78 | edition | MODIFICATION_NON_UNIQUE |
| edition-sans-cible | edition | CIBLE_ABSENTE |
| energie-2374.199999 | edition | ENERGIE_HORS_PLAGE |
| energie-2374.2 | edition | PREVISUALISATION |
| energie-2901.8 | edition | PREVISUALISATION |
| energie-2901.800001 | edition | ENERGIE_HORS_PLAGE |
| energie-cumul-interdit | edition | ENERGIE_HORS_PLAGE |
| edition-P-0 | edition | REPARTITION_HORS_DOMAINE |
| edition-P-1000 | edition | CIBLE_INCOHERENTE |
| edition-G-1000 | edition | CIBLE_INCOHERENTE |
| edition-L-1000 | edition | CIBLE_INCOHERENTE |
| edition-P--1 | edition | ENTREE_INVALIDE |
| fraction-P-0.10-egal | cible | GARDE_PASSEE |
| fraction-P-0.10-dehors | cible | REPARTITION_HORS_DOMAINE |
| fraction-P-0.20-egal | cible | GARDE_PASSEE |
| fraction-P-0.20-dehors | cible | REPARTITION_HORS_DOMAINE |
| fraction-G-0.40-egal | cible | GARDE_PASSEE |
| fraction-G-0.40-dehors | cible | REPARTITION_HORS_DOMAINE |
| fraction-G-0.55-egal | cible | GARDE_PASSEE |
| fraction-G-0.55-dehors | cible | REPARTITION_HORS_DOMAINE |
| fraction-L-0.35-egal | cible | GARDE_PASSEE |
| fraction-L-0.35-dehors | cible | REPARTITION_HORS_DOMAINE |
| fraction-L-0.40-egal | cible | GARDE_PASSEE |
| fraction-L-0.40-dehors | cible | REPARTITION_HORS_DOMAINE |
| minimum-P-49.799999 | cible | PROTEINES_INSUFFISANTES |
| minimum-P-49.8 | cible | GARDE_PASSEE |
| minimum-P-49.800001 | cible | GARDE_PASSEE |

Les six frontières de répartition sont testées à égalité puis un millionième de fraction au-delà ; plusieurs intervalles peuvent échouer simultanément mais le code reste REPARTITION_HORS_DOMAINE. À IMC=30 le refus est strict ; à IMC=18,5 la garde passe. Taille et poids décimaux sont comparés exactement.

Le minimum protéique est testé directement sur des cibles à E=1900, W=60 : 49,799999 g refuse, 49,8 g et 49,800001 g passent. La garde demeure obligatoire même si le défaut la satisfait dans le périmètre réduit ; elle peut refuser une cible modifiée.

## Compléments de transition et priorité

Sur B, une édition de P à 49,8 g est admise exactement au minimum : E/P/G/L = 35567/20 ; 249/5 ; 86781/400 ; 35567/450. À 49,799999 g, la répartition reste admise mais PROTEINES_INSUFFISANTES refuse. Méthode indisponible prime aussi pendant modification/reset et sur une entrée invalide ; syntaxe invalide prime sur exclusion ; exclusion prime sur IMC. Reset sans cible refuse CIBLE_ABSENTE. Ces cas sont aussi dans le JSON.

## Arrondis

0,005 → 0,01 ; 98,925 → 98,93 ; 1/3 → 0,33. Aucun de ces affichages ne remplace le rationnel initial. Une cible entrée à six décimales reste exacte après confirmation ; la précision d'une fraction dérivée peut être infinie sans enfreindre la limite de saisie AD-12.
