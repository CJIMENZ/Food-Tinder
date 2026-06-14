# Food Tinder

A local-first Tinder-style recipe curator built with React, TypeScript, Tailwind, and Vite.

## What it does

Food Tinder shows recipe cards that you can swipe right to keep or swipe left to pass. Your decisions train a lightweight taste profile in the browser:

- liked meals boost similar ingredients, cuisines, categories, and tags
- passed meals down-rank similar recipes
- live recipe suggestions load from TheMealDB during local development
- recipes and swipe decisions persist in `localStorage`
- the full local state can be exported/imported as JSON so the storage layer can later move to a database

## Local development

```bash
npm install
npm run dev
```

Then open the Vite localhost URL shown in the terminal.

## Build check

```bash
npm run build
```

## Storage model

Current storage is browser-local:

- `food_tinder_recipes_v2`
- `food_tinder_decisions_v2`

Use **Export JSON** to back up the current recipe cache and taste decisions. Use **Import JSON** to restore a previous local state.

The exported file shape is intentionally simple:

```ts
{
  version: 2,
  exportedAt: string,
  recipes: RecipeCard[],
  decisions: SwipeRecord[]
}
```

That shape is the bridge to future DB storage. A later backend can store recipes and decisions per user without rewriting the UI ranking logic.

## Recipe/image strategy

The app no longer depends on random hotlinked blog images in a hardcoded card list. It now:

1. starts from a small local starter deck
2. loads live recipe details from TheMealDB
3. uses recipe-owned `strMealThumb` images when available
4. falls back to an embedded SVG image if remote images fail
5. keeps working from the local cache when the API or network is unavailable

## Controls

- Drag right or press the heart button to like a meal
- Drag left or press X to pass
- Flip the card to inspect ingredients and steps
- Refresh Taste Queue to pull new suggestions based on current preferences
- Export JSON / Import JSON to move local state between sessions or machines
- Clear Taste Memory to reset likes/passes without deleting cached recipes
- Reset Local Cache to return to the starter deck
