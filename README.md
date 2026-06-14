# Food Tinder

A local-first Tinder-style recipe curator built with React, TypeScript, Tailwind, Vite, and a Printing Press-compatible recipe source bridge.

## What it does

Food Tinder shows recipe cards that you can swipe right to keep or swipe left to pass. Your decisions train a lightweight taste profile in the browser:

- liked meals boost similar ingredients, cuisines, categories, tags, and higher-quality sources
- passed meals down-rank similar recipes
- recipe suggestions can come from a Printing Press-generated CLI/API bridge for Allrecipes, Yellow Bliss Road, and Everything Just Baked
- TheMealDB remains as a no-setup fallback source for local development
- recipes and swipe decisions persist in `localStorage`
- the full local state can be exported/imported as JSON so the storage layer can later move to a database

## Local development

```bash
npm install
npm run dev
```

Then open the Vite localhost URL shown in the terminal.

For the best source coverage, run the local recipe bridge in a second terminal:

```bash
npm run bridge:recipes
```

The app calls `http://localhost:8787/recipes/search` by default. Override that with:

```bash
VITE_RECIPE_SOURCE_BRIDGE_URL=http://localhost:8787/recipes/search npm run dev
```

## Printing Press source architecture

Food Tinder does **not** try to scrape recipe websites from React. CORS is only the browser problem; the durable pattern is:

1. use Printing Press to generate a recipe CLI/API from the target sites
2. run a local bridge that calls the printed CLI
3. return normalized recipe JSON to Food Tinder
4. keep Food Tinder focused on taste curation, ranking, swiping, and local storage

Printing Press is designed for this type of job: it can point at a website without an official API, capture/reverse-engineer behavior during generation, and print a CLI plus MCP server. The generated tool is where source-specific mapping for Allrecipes, Yellow Bliss Road, and Everything Just Baked should live.

### Expected printed CLI contract

The bridge expects a printed CLI command shaped like this:

```bash
recipe-pp-cli search \
  --query "chicken,pasta,tacos" \
  --sources allrecipes,yellowblissroad,everythingjustbaked \
  --limit 80 \
  --json
```

Expected JSON output:

```json
{
  "recipes": [
    {
      "id": "allrecipes-123",
      "title": "Example Recipe",
      "category": "Dinner",
      "cuisine": "American",
      "tags": ["chicken", "weeknight"],
      "appliances": ["Oven"],
      "effort": "Medium",
      "time": "45 mins",
      "image": "https://...",
      "sourceId": "allrecipes",
      "sourceName": "Allrecipes",
      "sourceUrl": "https://...",
      "instructions": ["Step one", "Step two"],
      "ingredients": [{ "name": "Chicken", "measure": "1 lb" }]
    }
  ],
  "warnings": []
}
```

The bridge also accepts common alternate field names like `name`, `url`, `imageUrl`, `recipeIngredient`, and `steps`, then normalizes them for the UI.

### Running before the CLI exists

You can test the UI with a mock JSON file:

```bash
RECIPE_BRIDGE_MOCK_FILE=./sample-recipes.json npm run bridge:recipes
```

Or point the bridge at a differently named printed CLI:

```bash
RECIPE_PP_CLI=my-recipes-pp-cli npm run bridge:recipes
```

## Suggested Printing Press prompt

Inside Claude Code with the Printing Press skills installed:

```text
/printing-press Recipe Sources
```

Then scope the generated CLI around:

- Allrecipes search and recipe detail extraction
- Yellow Bliss Road search and recipe detail extraction
- Everything Just Baked search and recipe detail extraction
- stable recipe detail fields: title, image, source URL, ingredients, steps, total time, category, cuisine/tags when available
- command: `search --query --sources --limit --json`
- optional local cache/sync table for source results
- output that matches the contract above

## Storage model

Current storage is browser-local:

- `food_tinder_recipes_v3`
- `food_tinder_decisions_v3`

The app still imports v2 local state if present, then writes v3 going forward.

Use **Export JSON** to back up the current recipe cache and taste decisions. Use **Import JSON** to restore a previous local state.

The exported file shape is intentionally simple:

```ts
{
  version: 3,
  exportedAt: string,
  recipes: RecipeCard[],
  decisions: SwipeRecord[]
}
```

That shape is the bridge to future DB storage. A later backend can store recipes and decisions per user without rewriting the UI ranking logic.

## Build check

```bash
npm run build
```

## Controls

- Drag right or press the heart button to like a meal
- Drag left or press X to pass
- Flip the card to inspect ingredients and steps
- Refresh Queue to pull new suggestions based on current preferences
- Filter by category, source, and effort
- Export JSON / Import JSON to move local state between sessions or machines
- Clear Taste Memory to reset likes/passes without deleting cached recipes
- Reset Local Cache to return to the starter deck
