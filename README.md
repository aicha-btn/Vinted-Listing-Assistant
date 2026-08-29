# Vintedito

A React and TypeScript application created with Vite.

The goal is to generate a complete Vinted listing from a product form, then optionally improve it with **Google Gemini** without replacing the in-house generation engine.

## Live Demo

https://vintedito.vercel.app/

## Stack

- React
- TypeScript
- Vite
- Native CSS
- localStorage
- Express
- Gemini API

## V1 Features

- Simple product form
- Local listing generation
- Title, descriptions, hashtags, and suggested price
- Photo tips and checklists
- Quality score
- Local history with statuses

## V2 Features

- `Improve with AI` action
- Separate AI architecture in `src/services/aiService.ts`
- Local backend in `server/index.ts`
- Real Gemini provider through the local backend
- Simulation mode still available
- `loading`, `error`, and `success` states
- Comparison between the in-house version and the AI version
- Ability to copy or save the displayed version

## Security Notes

- The Google key stays server-side.
- No API key is exposed in the frontend.
- The real provider connected here is **Google Gemini**.

## Environment Variables

Copy `.env.example` to `.env`.

```bash
VITE_AI_MODE=provider
VITE_AI_PROVIDER=gemini
VITE_AI_BACKEND_URL=
VITE_AI_MODEL=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
```

### Explanation

- `VITE_AI_MODE`
  - `provider`: uses the Gemini backend
  - `simulation`: keeps the local fake mode
- `VITE_AI_PROVIDER`
  - expected value here: `gemini`
- `VITE_AI_BACKEND_URL`
  - empty locally when using the Vite proxy
- `VITE_AI_MODEL`
  - reserved for frontend use
- `GEMINI_API_KEY`
  - free key retrieved from [Google AI Studio](https://ai.google.dev/aistudio)
  - variable recommended by Google documentation
  - `GOOGLE_API_KEY` is also accepted locally by the server as a fallback
- `GEMINI_MODEL`
  - server-side model
  - recommended value: `gemini-2.5-flash`

## Commands Used

Environment check:

```bash
node -v
npm -v
```

Project creation:

```bash
npm create vite@latest vinted-listing-assistant -- --template react-ts
cd vinted-listing-assistant
npm install
```

Launch:

```bash
npm run dev
```

The `npm run dev` script starts:

- the Vite client
- the local Gemini server

Verification:

```bash
npm run lint
npm run build
```

## Local Installation

```bash
git clone https://github.com/aicha-btn/Vinted-Listing-Assistant.git
cd Vinted-Listing-Assistant
npm install
cp .env.example .env
npm run dev
```

## Scripts

- `npm run dev`: client + Gemini server
- `npm run dev:client`: frontend only
- `npm run dev:server`: Gemini backend only
- `npm run build`: production build
- `npm run lint`: ESLint check
- `npm run preview`: preview the production build

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

## Flow

1. Fill in the product details.
2. Generate the in-house listing.
3. Click `Improve with AI`.
4. The frontend calls the local backend.
5. The backend calls Gemini.
6. Compare the in-house and AI versions.
7. Save the displayed version.

## Official Google Sources Used

- [Gemini API quickstart](https://ai.google.dev/gemini-api/docs/quickstart)
- [System instructions](https://ai.google.dev/gemini-api/docs/system-instructions)
- [Gemini API pricing](https://ai.google.dev/pricing)

## Free Tier Notes

According to Google's official documentation:

- the Gemini API can start with a free tier;
- the API key can be created for free in Google AI Studio;
- the free tier remains subject to quotas and limits that may change over time.
