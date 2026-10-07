# Journal de revue : méthode estimative v1 — 20261007

Cible : [dossier méthode estimative v1](../initiative-macrova/epic-calculateur/methode-estimative-v1/).

Journal append-only des décisions, preuves et points ouverts. Session : unavailable.

## 1 — Orientation — Cadrage

Session: unavailable · Timestamp: 2026-10-07T20:59:03+02:00

- Action: Ouverture d’une revue documentaire du dossier ; création du récit en sept blocs, premier bloc en cours.
- Result: L’utilisateur délègue explicitement les réponses et acceptations à l’agent. Revue documentaire uniquement ; aucune signature nutritionnelle, modification des tickets ou de l’application, ni commit/publication par défaut.
- Evidence: Instruction utilisateur « reponds à tes questions a ma place. fais au mieux » ; [Intent du plan](../initiative-macrova/epic-calculateur/story-documenter-et-valider-la-methode-estimative-plan.md#intent).
- Open: Parcours et acceptation des sept blocs ; validation nutritionnelle externe hors de la délégation de revue.

## 2 — Blocs 1 et 2 — Examen et décision

Session: unavailable · Timestamp: 2026-10-07T21:00:05+02:00

- Action: Intention comparée au plan et CAP-1 ; parcours des six pièces.
- Result: Acceptés par délégation explicite : proposition documentaire, sans moteur applicatif ni accord nutritionnel réel. Aucun constat documentaire. 
- Evidence: [Intent](../initiative-macrova/epic-calculateur/story-documenter-et-valider-la-methode-estimative-plan.md#intent) ; [CAP-1](../spec-macrova/spec-macrova.md) ; [méthode](../initiative-macrova/epic-calculateur/methode-estimative-v1/methode-estimative-v1.md).

## 3 — Bloc 3 — Sources — Examen et décision

Session: unavailable · Timestamp: 2026-10-07T21:00:05+02:00

- Action: Relecture S1 PubMed, S2 Wiley, S4 EFSA et S5 EUR-Lex ; S3 téléchargé par urllib puis extrait via uv/pypdf, page26 (indice zéro).
- Result: Accepté par délégation. Sources et choix produit distingués ; aucun constat. Lecteur web S3 et pdftotext indisponibles, repli réussi. PDF : 5 506 287 octets ; tableau4 confirme 10–20/40–55/35–40.
- Evidence: [S1](https://pubmed.ncbi.nlm.nih.gov/2305711/) ; [S2](https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2013.3005) ; [S3](https://www.anses.fr/fr/system/files/NUT2012SA0103Ra-1.pdf) ; [S4](https://www.efsa.europa.eu/en/efsajournal/pub/2557) ; [S5](https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32011R1169) ; [empreinte PDF e6d43e4f2b1e94b9904b882f670ed1f7daceb8271b2c76d81f391c918cb0c11a](../initiative-macrova/epic-calculateur/methode-estimative-v1/sources-verifiees.md).

## 4 — Bloc 4 — Contrat numérique et refus — Examen et décision

Session: unavailable · Timestamp: 2026-10-07T21:00:05+02:00

- Action: Lecture AD-12, rationnels, intermédiaires signés et ordre des gardes.
- Result: Accepté par délégation ; cohérence documentaire, aucun constat ni modification du contrat.
- Evidence: [Architecture AD-12](../initiative-macrova/architecture-app/architecture-app.md) ; [contrat numérique](../initiative-macrova/epic-calculateur/methode-estimative-v1/methode-estimative-v1.md#contrat-numérique-et-ordre-des-gardes).

## 5 — Vérification — Harnais temporaire — Examen et décision

Session: unavailable · Timestamp: 2026-10-07T21:00:05+02:00

- Action: Reproduction publiée exécutée puis contrôle complémentaire.
- Result: Erreur du harnais : exec réaffectait p, causant NotADirectoryError. Relance avec namespace isolé réussie ; aucun défaut dans la commande publiée.
- Evidence: [Commande de reproduction](../initiative-macrova/epic-calculateur/methode-estimative-v1/verification.md#reproduction-minimale-indépendante).

## 6 — Bloc 5 — Modification et états — Examen et décision

Session: unavailable · Timestamp: 2026-10-07T21:01:29+02:00

- Action: Comparaison automatique des cinq transitions : confirmation=candidat P, reset et annulation=A, E0/cible nulls après changement de profil ; recalcul indépendant Fraction du poids71.
- Result: Accepté par délégation. Cinq transitions conformes ; aucune correction du dossier requise. Il ne s’agit pas d’une recette applicative.
- Evidence: [États](../initiative-macrova/epic-calculateur/methode-estimative-v1/methode-estimative-v1.md#modification-explicite-et-états) ; [vecteurs](../initiative-macrova/epic-calculateur/methode-estimative-v1/exemples-reference.json).

## 7 — Bloc 6 — Exemples et preuves — Examen et décision

Session: unavailable · Timestamp: 2026-10-07T21:01:29+02:00

- Action: Commande publiée reproduite ; script temporaire indépendant pour 112 gardes, admissibilité des profils/candidats, arrondis, liens et cinq empreintes.
- Result: Accepté par délégation. Profils, modifications, transitions et affichages : OK ; contrôles complémentaires : OK. Aucun défaut documentaire identifié ni test applicatif exécuté : aucun moteur livré.
- Evidence: [Reproduction et empreintes](../initiative-macrova/epic-calculateur/methode-estimative-v1/verification.md) ; [exemples](../initiative-macrova/epic-calculateur/methode-estimative-v1/exemples-reference.md) ; [vecteurs](../initiative-macrova/epic-calculateur/methode-estimative-v1/exemples-reference.json).

## 8 — Bloc 7 — Validation externe — Examen et décision

Session: unavailable · Timestamp: 2026-10-07T21:01:29+02:00

- Action: Examen du registre de validation et des conditions d’acceptation finale.
- Result: Accepté pour la revue documentaire. Responsable, rôle, date et preuve restent absents ; 2.1 non close et 2.2 non autorisée. Aucune signature inventée.
- Evidence: [Registre](../initiative-macrova/epic-calculateur/methode-estimative-v1/validation.md) ; [critères du plan](../initiative-macrova/epic-calculateur/story-documenter-et-valider-la-methode-estimative-plan.md#tasks--acceptance).
- Open: Accord nutritionnel externe réel à recevoir et consigner avant décision de clôture de 2.1.

## 9 — Clôture — Livrables locaux — Examen et décision

Session: unavailable · Timestamp: 2026-10-07T21:01:29+02:00

- Action: Sept blocs acceptés ; récit reformulé en mécanismes concrets pour les blocs3–6 et références commentées pour le bloc7.
- Result: Revue terminée par délégation. Dossier cible inchangé ; seul le récit a changé de rédaction pendant la revue, outre ses statuts. Récit et journal conservés localement ; aucun commit, push, publication ni changement de tickets.
- Evidence: [Récit](walkthrough-methode-estimative-v1-20261007.md) ; journal présent.
- Open: Validation nutritionnelle externe toujours ouverte ; aucune autorisation d’implémentation de 2.2.
