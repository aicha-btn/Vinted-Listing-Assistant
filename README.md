# Vintedito

Application React + TypeScript créée avec Vite.

Objectif : générer une annonce Vinted complète à partir d’un formulaire produit, puis proposer une amélioration IA optionnelle avec **Google Gemini**, sans remplacer le moteur maison.

## Stack

- React
- TypeScript
- Vite
- CSS natif
- localStorage
- Express
- Gemini API

## Fonctionnalités V1

- Formulaire produit simple
- Génération locale d’annonce
- Titre, descriptions, hashtags, prix conseillé
- Conseils photo et checklists
- Score qualité
- Historique local avec statuts

## Fonctionnalités V2

- Bouton `✨ Améliorer avec IA`
- Architecture IA séparée dans `src/services/aiService.ts`
- Backend local dans `server/index.ts`
- Gemini réel via backend local
- Mode simulation encore disponible
- États `loading`, `erreur`, `succès`
- Comparaison `version maison` / `version IA`
- Possibilité de copier ou sauvegarder la version affichée

## Important

- La clé Google reste côté serveur
- Aucune clé API n’est exposée dans le frontend
- Le fournisseur réel branché ici est **Google Gemini**

## Variables d’environnement

Copier `.env.example` en `.env`.

```bash
VITE_AI_MODE=provider
VITE_AI_PROVIDER=gemini
VITE_AI_BACKEND_URL=
VITE_AI_MODEL=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
```

### Explication

- `VITE_AI_MODE`
  - `provider` : utilise le backend Gemini
  - `simulation` : garde le faux mode local
- `VITE_AI_PROVIDER`
  - valeur attendue ici : `gemini`
- `VITE_AI_BACKEND_URL`
  - vide en local si tu utilises le proxy Vite
- `VITE_AI_MODEL`
  - réserve frontend
- `GEMINI_API_KEY`
  - clé gratuite récupérée dans [Google AI Studio](https://ai.google.dev/aistudio)
  - variable recommandée par la doc Google
  - `GOOGLE_API_KEY` est aussi acceptée en local par le serveur comme fallback
- `GEMINI_MODEL`
  - modèle côté serveur
  - valeur recommandée : `gemini-2.5-flash`

## Commandes utilisées

Vérification de l’environnement :

```bash
node -v
npm -v
```

Création du projet :

```bash
npm create vite@latest vinted-listing-assistant -- --template react-ts
cd vinted-listing-assistant
npm install
```

Lancement :

```bash
npm run dev
```

Le script `npm run dev` lance :

- le client Vite
- le serveur Gemini local

Vérifications :

```bash
npm run lint
npm run build
```

## Installation locale

```bash
git clone <votre-repo>
cd vinted-listing-generator/vinted-listing-assistant
npm install
cp .env.example .env
npm run dev
```

## Scripts

- `npm run dev` : client + serveur Gemini
- `npm run dev:client` : frontend seul
- `npm run dev:server` : backend Gemini seul
- `npm run build` : build de production
- `npm run lint` : vérification ESLint
- `npm run preview` : aperçu du build

## Structure

```text
src/
  components/
    ProductForm.tsx
    GeneratedListing.tsx
    QualityScore.tsx
    ListingHistory.tsx
    Checklist.tsx
    CopyIconButton.tsx
    StepNavigation.tsx
  data/
    templates.ts
    hashtagRules.ts
    priceRules.ts
  services/
    aiService.ts
  types/
    listing.ts
    ai.ts
  utils/
    generateListing.ts
    generateHashtags.ts
    calculateScore.ts
    estimatePrice.ts
    storage.ts
server/
  index.ts
```

## Fonctionnement

1. Remplir le produit
2. Générer l’annonce maison
3. Cliquer sur `✨ Améliorer avec IA`
4. Le frontend appelle le backend local
5. Le backend appelle Gemini
6. Comparer maison / IA
7. Sauvegarder la version affichée

## Sources officielles Google utilisées

- [Quickstart Gemini API](https://ai.google.dev/gemini-api/docs/quickstart)
- [System instructions](https://ai.google.dev/gemini-api/docs/system-instructions)
- [Tarifs Gemini API](https://ai.google.dev/pricing)

## Notes sur le gratuit

D’après la documentation officielle Google :

- l’API Gemini peut démarrer avec une offre gratuite
- la clé API se récupère gratuitement dans Google AI Studio
- l’offre gratuite reste soumise à des quotas et limites qui peuvent évoluer
