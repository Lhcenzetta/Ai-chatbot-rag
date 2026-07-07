# Script de démo — à répéter avant la présentation

> Objectif : montrer au manager que le chatbot répond **uniquement à partir des
> données de la compagnie**, en français ET en arabe, et qu'il refuse d'inventer.
>
> Avant la démo : `python ingest.py` déjà exécuté, backend + frontend démarrés,
> vérifier `http://127.0.0.1:8000/health` → `"status": "ok"`.

## Déroulé conseillé (6 questions)

### 1. FR — vue d'ensemble (réponse en liste, sources visibles)
> **Quelles assurances proposez-vous ?**

Attendu : liste auto / habitation / santé / vie. Montrer les puces « Sources » sous la réponse.

### 2. FR — question précise sur les tarifs
> **Combien coûte l'assurance auto tous risques ?**

Attendu : « à partir de 3 800 DH/an » — souligner que le chiffre vient du document `assurance_auto.md`, pas de l'imagination du modèle.

### 3. FR — procédure (réponse structurée en étapes)
> **Comment déclarer un sinistre auto ?**

Attendu : étapes numérotées (déclaration sous 5 jours, constat amiable, expertise 72h, indemnisation 15 jours).

### 4. AR — الدارجة (montrer la détection de langue + affichage RTL)
> **شنو هي أثمنة التأمين الصحي؟**

Attendu : réponse en arabe, alignée à droite, avec les formules (150 / 280 / 450 درهم في الشهر).

### 5. AR — horaires de l'agence
> **واش الوكالة خدامة السبت؟ وشنو هي أوقات العمل؟**

Attendu : réponse en arabe — samedi 9h-13h, dimanche fermé, horaires Ramadan.

### 6. Le clou de la démo — la question piège 🎯
> **Est-ce que vous assurez les bateaux de pêche ?**

Attendu : le chatbot répond qu'il **n'a pas cette information** et propose un
conseiller — il n'invente rien. C'est LA preuve à montrer au manager : avec les
vraies données, il ne dira jamais n'importe quoi aux clients.

## Phrase de conclusion pour le manager

« L'assistant ne connaît que le contenu du dossier `data/`. Aujourd'hui ce sont
des fichiers d'exemple — remplacez-les par nos vrais documents, on relance une
commande (`python ingest.py`), et il répond avec nos vraies offres. »

## Si quelque chose casse en direct

- Réponse « erreur technique » → vérifier que le backend tourne (`uvicorn app:app`)
  et qu'Ollama est lancé (`ollama list`).
- Réponses lentes → normal sur un modèle local ; dire que la version production
  peut utiliser une API (changement d'une ligne dans `.env`).
- Réponse hors-sujet → reformuler la question plus précisément (et le noter
  comme limite connue du MVP).
