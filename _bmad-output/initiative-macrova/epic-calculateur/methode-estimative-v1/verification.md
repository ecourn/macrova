# Vérification documentaire et arithmétique — proposition v1

Version : `methode-estimative-v1`. Exécution locale du 7 octobre 2026 avec Python 3 et `fractions.Fraction`. Aucun estimateur ni script de moteur n'est ajouté au dépôt. [Méthode](methode-estimative-v1.md), [JSON](exemples-reference.json), [exemples](exemples-reference.md), [registre en attente](validation.md), [sources conservées](sources-verifiees.md).

## Contrôles exécutés

- Lecture intégrale du plan et de ses deux fichiers de contexte avant rédaction ; lecture du contrat numérique existant AD-12 et de la normalisation française, sans modification applicative.
- JSON parsé ; identifiants de matrice uniques ; version unique et statut proposé/non approuvé vérifiés.
- Trois profils reproduits indépendamment en Fraction : R, IMC, E0, P/G/L, seuil P ; identité 4P+4G+9L=E et affichages vérifiés.
- Sept modifications reproduites : les quatre champs, E aux deux bornes, passage E-haut puis E-bas, P au minimum pour B. Proportions ou valeurs conservées, intervalles, référence E0 originale, minimum P et affichages exacts vérifiés.
- Cinq transitions relues ; toutes les cibles renseignées vérifiées pour identité, intervalles et arrondis ; profil changé invalide explicitement toutes les cibles.
- 112 cas de matrice : bornes numériques et fractions/seuils reproduits par comparaisons exactes ; autres gardes, exclusions et priorités relues contre l'ordre des messages. Ce contrôle documentaire ne prétend pas exécuter des gardes applicatives inexistantes.
- Trois exemples d'arrondis contrôlés par quotient entier au centième demi supérieur ; leur représentation rationnelle documentaire est également réduite. Toutes les valeurs exactes des résultats sont des fractions réduites ; aucune réinjection des affichages.
- Liens Markdown locaux des compagnons contrôlés pour existence. Les liens primaires restent ceux du registre de sources déjà vérifié ; ce contrôle ne revendique pas une nouvelle consultation scientifique.

Aucun contrôle applicatif : seul le dossier de proposition est ajouté. La revue indépendante quick du 7 octobre 2026 a retourné une liste vide de constats. Un second audit arithmétique indépendant a reproduit les trois profils, sept modifications, 112 gardes, cinq transitions, trois arrondis, liens et empreintes avec succès. Ces revues techniques ne constituent pas un accord nutritionnel.

## Reproduction minimale indépendante

Depuis la racine, exécuter cette commande temporaire ; elle lit les vecteurs et vérifie l'arithmétique sans livrer un second moteur. Les contrôles des bornes de matrice ont été effectués séparément par comparaisons Fraction (bornes métier, IMC, fractions énergétiques et minimum P), puis les gardes non numériques relues.

```sh
python3 - <<'PY'
from fractions import Fraction as F
from pathlib import Path
import json
p = Path('_bmad-output/initiative-macrova/epic-calculateur/methode-estimative-v1/exemples-reference.json')
d = json.loads(p.read_text())
def exact(t):
    return {k: F(v) for k, v in t['exact'].items()}
def check(t):
    q = exact(t)
    assert 4*q['P'] + 4*q['G'] + 9*q['L'] == q['E']
    for k, x in q.items():
        c = (200*x.numerator+x.denominator)//(2*x.denominator)
        assert t['affichage'][k] == f'{c//100},{c%100:02}'
    return q
profiles = {v['id']: v for v in d['profils']}
for v in profiles.values():
    x = v['profil']
    a,h,w,c,pal = (F(x[k]) for k in ['age','taille_cm','poids_kg','coefficient','pal'])
    r = 10*w + F(25,4)*h - 5*a + c
    e = r*pal
    assert F(v['intermediaires']['R']) == r
    assert F(v['intermediaires']['IMC']) == 10000*w/h**2
    assert check(v['cible']) == {'E':e,'P':3*e/80,'G':9*e/80,'L':2*e/45}
for m in d['modifications']:
    base = exact(d['modifications'][0]['candidat']) if m['depart']=='E-haut confirmé' else exact(profiles[m['depart']]['cible'])
    q = check(m['candidat'])
    assert q[m['champ']] == F(m['saisie'])
    if m['champ']=='E':
        assert all(q[k]/q['E'] == base[k]/base['E'] for k in ['P','G','L'])
    else:
        assert q['E'] == base['E']
        k = 'L' if m['champ']=='P' else 'P'
        assert q[k] == base[k]
for t in d['transitions']:
    if t.get('cible'):
        check(t['cible'])
print('Profils, modifications, transitions et affichages : OK')
PY
```

## Intégrité des pièces

Les empreintes SHA-256 ci-dessous identifient les pièces soumises à examen ; ce fichier de vérification n'a pas d'empreinte auto-référente. La preuve externe devra couvrir cette version et ces pièces, ou leurs révisions explicitement examinées. Toute modification après accord impose une vérification de concordance et un nouvel examen des décisions affectées.

| Pièce | SHA-256 |
|---|---|
| sources-verifiees.md | `e8fb037a09d247e36c3681c730e25fc974783dc921a344db82a0ec5e10dc7580` |
| methode-estimative-v1.md | `661136ca33bef7cdcedad6fa0b45899aa0bf6c5c0357f263f0b867728cbbf2d1` |
| exemples-reference.json | `b8d1eb571d69ef3c220adb5d286a73c5cfe8fad71fbab2f83b373409e7fb113f` |
| exemples-reference.md | `a45e89313d260ac8161ae5fd722267bddeed6ca44a53ce40cc5f20a3065b7184` |
| validation.md | `1d030f9345b29235c9f8c9822c991a8c577a211d77d4254d10a0d62e35de1c01` |

## Contrôles de reprise du recueil — 7 octobre 2026

La commande de reproduction minimale ci-dessus a été réexécutée : profils, modifications, transitions et affichages conformes. Les cinq empreintes du tableau et les quatre empreintes du formulaire de décision ont été recalculées et concordent ; les liens Markdown locaux du dossier existent. `git diff --check` ne signale aucune erreur. L'empreinte de validation.md reflète l'ajout du journal de recueil ; les quatre pièces scientifiques/numériques restent identiques. Ces contrôles vérifient le support de recueil, sans attester un accord externe.
