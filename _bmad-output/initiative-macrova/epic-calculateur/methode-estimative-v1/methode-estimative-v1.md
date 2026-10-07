# Méthode estimative — proposition v1

Version unique : `methode-estimative-v1`. Dossier préparé le 7 octobre 2026, **en attente d'accord réel**. Cette proposition n'autorise aucune estimation dans l'application. [Validation](validation.md), [vecteurs JSON](exemples-reference.json), [exemples et matrice](exemples-reference.md), [vérification](verification.md), [sources primaires vérifiées S1–S5](sources-verifiees.md).

## Portée et justification

Cible journalière théorique de maintien, sans objectif de perte ou prise de poids, prescription, diagnostic ni garantie de santé. La méthode prédit une dépense ; elle ne mesure pas le besoin d'une personne. Les erreurs individuelles restent possibles même dans le périmètre. Tous les arbitrages de couverture et de recalcul ci-dessous sont **proposés pour examen**, pas validés par les auteurs des sources.

S1 fournit l'équation simplifiée de dépense au repos dans deux groupes de l'étude de Mifflin : `R = 10W + 6,25H − 5A + c`, en kcal/jour, avec W en kg, H en cm, A en années et c égal à 5 (groupe masculin de l'étude) ou −161 (groupe féminin). S1 porte sur 498 adultes en bonne santé de 19 à 78 ans, incluant poids normal et obésité ; les bornes Macrova ne décrivent pas la population validée par l'étude. Seul son résumé original a été consulté.

`E0 = R × PAL` en kcal/jour. S2 décrit cette démarche factorielle et les PAL ci-dessous, mais utilise Henry dans ses références : **S2 ne valide pas Mifflin × PAL**. Le choix de cet assemblage appartient à Macrova.

| PAL | Description qualitative proposée, sur toute la journée |
|---|---|
| 1,4 | Faible : journée surtout assise, peu de déplacements actifs. |
| 1,6 | Modéré : journée comportant régulièrement marche et déplacements actifs. |
| 1,8 | Actif : journée comportant beaucoup de déplacements ou activités physiques. |
| 2,0 | Très actif : activité physique importante pendant une grande partie de la journée, hors sport intensif/compétition. |

Ces descriptions sont des aides produit approximatives, pas des seuils horaires validés. Choix explicite d'un PAL parmi ces quatre valeurs ; aucune déduction d'un nombre de séances, aucun ajout d'exercice. Une activité très élevée ne lève aucune exclusion.

Défaut proposé : fractions énergétiques P/G/L = 15/45/40 %, soit `P = 3E0/80`, `G = 9E0/80`, `L = 2E0/45`, en g/jour. S3 donne les intervalles adultes 10–20/40–55/35–40 %, sans sélectionner le défaut. S5 donne les facteurs 4/4/9 kcal/g utilisés uniquement pour cette cible théorique. `4P + 4G + 9L = E` exactement ; cette identité ne sert jamais à reconstituer des calories alimentaires ou d'étiquette (autres constituants possibles).

Le plan propose de refuser `P < 0,83W` g/jour, en référence à S4 (adultes en bonne santé, régimes mixtes). La référence de population ne valide pas chaque personne au-dessus du seuil et ne constitue pas une limite supérieure de sécurité. Ne jamais augmenter P silencieusement pour passer cette garde.

## Entrées et exclusions

Seulement âge entier 19–64 inclus ; taille 120–220 cm inclus ; poids 30–200 kg inclus ; coefficient explicite de l'étude ; PAL ; déclaration globale d'éligibilité `oui/non/incertain`. Aucune date de naissance, IMC saisi, masse grasse, identité de genre, objectif pondéral ou diagnostic détaillé. L'IMC est calculé exactement : `W / (H/100)²`, admis si `18,5 ≤ IMC < 30`. Ce sont des restrictions produit, sans garantie médicale. À 200 kg et au plus 220 cm, l'IMC reste supérieur à 30 : une borne individuelle admise n'assure pas l'éligibilité globale.

La déclaration unique demande si **toutes** les conditions suivantes sont satisfaites : absence de grossesse/allaitement ; absence de trouble alimentaire actuel ou antérieur ; absence de pathologie ou traitement influençant les besoins ou le poids ; absence de prescription nutritionnelle ; absence de sport intensif ou compétition ; applicabilité certaine du coefficient de l'étude, notamment hors contexte hormonal non couvert. Une seule réponse non ou incertain refuse, sans demander quelle situation s'applique. Coefficient absent ou incertain refuse également, sans le déduire de l'identité de genre. Aucune réponse médicale de substitution n'est générée.

## Contrat numérique et ordre des gardes

Appliquer AD-12 du [contrat d'architecture](../../architecture-app/architecture-app.md) : saisie française normalisée explicitement, espaces périphériques retirés, virgule ou point admis, zéros initiaux/finals retirés. Au plus six décimales **avant** suppression des zéros, valeurs 0 à 1 000 000 ; pas de signe, exposant, séparateur de milliers ni arrondi caché. Âge normalisé doit être entier ; `19,0` devient `19` et est admis. `19,5` refuse. Les bornes métier se vérifient après ce contrat général.

Nombres saisis : chaînes canoniques. Calculs internes : rationnels exacts, jamais comparaison de flottants. Les résultats périodiques ne sont pas des saisies à six décimales : les conserver en rationnels, sans troncature vers une chaîne AD-12. Dans les vecteurs uniquement, les rationnels réduits sont des chaînes `n/d` avec d strictement positif ; ils ne redéfinissent pas le transport applicatif. Les termes `−5A`, `c = −161` et les soustractions de recalcul exigent des intermédiaires signés ; `rational()` existant est non négatif et ne les accepte pas aujourd'hui. Le futur domaine devra les traiter explicitement, sans changer silencieusement AD-12. Aucun code n'est livré ici.

Affichage seulement : centième, demi supérieur ; pour x ≥ 0, `floor(100x + 1/2)/100`, virgule française et deux chiffres après virgule. Ne jamais réinjecter cet affichage dans le calcul ; une validation d'édition confirme la valeur saisie, les valeurs conservées restent exactes. Au repos, énergie et macros originales exactes restent disponibles.

Pour obtenir un résultat, contrôler dans cet ordre ; au premier échec, **aucune estimation**, saisies conservées en mémoire de session. Plusieurs erreurs numériques de la même étape peuvent être liées aux champs avec un résumé, dans l'ordre âge/taille/poids/coefficient/PAL/éligibilité.

| Ordre | Code | Garde et message déterministe |
|---|---|---|
| 1 | METHODE_INDISPONIBLE | Version absente, non approuvée, retirée ou différente de la version demandée : « La méthode estimative n'est pas disponible : aucune estimation ne peut être calculée. » |
| 2 | ENTREE_INVALIDE | Champ numérique absent, syntaxe/précision/plafond AD-12 incorrect : « {champ} : saisissez une valeur décimale valide, avec au plus six décimales. » |
| 3 | AGE_HORS_DOMAINE | Âge non entier ou hors 19–64 : « L'âge doit être un entier entre 19 et 64 ans. » |
| 3 | TAILLE_HORS_DOMAINE | « La taille doit être comprise entre 120 et 220 cm. » |
| 3 | POIDS_HORS_DOMAINE | « Le poids doit être compris entre 30 et 200 kg. » |
| 4 | COEFFICIENT_NON_APPLICABLE | Choix absent, inconnu ou incertain : « Aucun coefficient applicable de l'étude n'a été confirmé : aucune estimation. » |
| 4 | PAL_INVALIDE | Absent ou hors ensemble : « Choisissez un niveau d'activité parmi les quatre proposés. » |
| 4 | ELIGIBILITE_ABSENTE | Absente ou réponse inconnue : « Confirmez votre éligibilité par oui, non ou incertain. » |
| 5 | SITUATION_EXCLUE | Non ou incertain : « Votre situation est hors du périmètre de cette méthode ou son applicabilité est incertaine : aucune estimation automatique. » |
| 6 | IMC_HORS_DOMAINE | « Le profil est hors du domaine proposé (18,5 ≤ IMC < 30) : aucune estimation automatique. » |
| 7 | CIBLE_INCOHERENTE | Après calcul exact, E ≤ 0 ou une macro négative : « La cible calculée n'est pas prise en charge : aucune estimation. » |
| 8 | REPARTITION_HORS_DOMAINE | p=4P/E, g=4G/E, l=9L/E hors [0,10;0,20]/[0,40;0,55]/[0,35;0,40], bornes inclusives : « La répartition proposée est hors des intervalles pris en charge. » |
| 9 | PROTEINES_INSUFFISANTES | P < 83W/100 : « La cible de protéines est inférieure à 0,83 g/kg/jour : aucune cible n'est validée. » |

Les étapes 7–9 vérifient la cible, pas la santé. Les calculs de démonstration documentaire ci-joints supposent seulement la méthode disponible pour exercer les gardes ; ils ne prouvent pas sa disponibilité réelle.

## Modification explicite et états

Une modification exige profil encore valide, méthode disponible et cible confirmée courante. Soumettre exactement un champ parmi E/P/G/L, en kcal ou g selon le champ. Zéro champ, champ inconnu ou plusieurs champs : `MODIFICATION_NON_UNIQUE`, « Modifiez un seul champ parmi calories, protéines, glucides et lipides. » Sans résultat courant : `CIBLE_ABSENTE`, « Calculez explicitement une cible pour le profil actuel avant de la modifier. » Vérifier disponibilité, cible courante, cardinalité, syntaxe AD-12, puis les gardes suivantes.

| Champ saisi | Conservé exactement | Recalcul exact |
|---|---|---|
| E | Fractions énergétiques actuelles p/g/l | P'=P×E'/E ; G'=G×E'/E ; L'=L×E'/E |
| P | E et L | G'=(E−4P'−9L)/4 |
| L | E et P | G'=(E−4P−9L')/4 |
| G | E et P | L'=(E−4P−4G')/9 |

Toujours vérifier `9E0/10 ≤ E ≤ 11E0/10`, avec **E0 original** même après plusieurs modifications : `ENERGIE_HORS_PLAGE`, « Les calories doivent rester entre 90 % et 110 % de l'estimation originale. » Puis E positif et macros non négatives (CIBLE_INCOHERENTE), fractions dans les intervalles (REPARTITION_HORS_DOMAINE), P ≥ 83W/100 (PROTEINES_INSUFFISANTES), dans cet ordre. Entrée signée négative : ENTREE_INVALIDE avant calcul ; macro dérivée négative : CIBLE_INCOHERENTE. Aucune correction, clamp ou choix d'une autre macro.

Une proposition admise devient **prévisualisation**, indiquant ancien/nouveau exacts et affichages, champs conservés et recalculés ; la cible courante ne change qu'après validation explicite. Annuler conserve la cible précédente. Un refus ne crée pas de cible candidate valide et laisse la cible confirmée antérieure identifiée ; une saisie d'édition non validée n'est pas présentée comme cible courante. Identité de valeurs ne dispense pas de validation ; après confirmation, état « cible modifiée ».

Toute modification de profil (y compris éligibilité/PAL/coefficient) invalide immédiatement E0, cible modifiée et prévisualisation : **aucun ancien résultat actuel**, aucun recalcul automatique. Les champs du profil restent en mémoire ; un nouveau calcul explicite revient au défaut de la nouvelle estimation. Réinitialisation explicite avec profil inchangé et méthode disponible revient à E0 et 15/45/40, état « cible estimée ». Sans cible courante ou méthode disponible, elle suit CIBLE_ABSENTE/METHODE_INDISPONIBLE. Retour de navigation pendant la session conserve le brouillon et son état ; aucune persistance, URL, cookie, log ou transfert implicite vers un compte.

États distincts : initial sans résultat ; méthode en chargement ; méthode indisponible ; entrée invalide ; exclusion ; résultat estimé ; prévisualisation de modification ; résultat modifié ; profil changé sans résultat. Respecter les états/accessibilité du [contrat UX](../../../ux-macrova/EXPERIENCE.md) lors des stories suivantes. Ce dossier ne change pas ces contrats parents.
