import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent,
} from 'react';
import {
  CheckCircle,
  ChefHat,
  Clock,
  Copy,
  Download,
  FileText,
  Heart,
  RefreshCw,
  RotateCcw,
  RotateCw,
  SlidersHorizontal,
  Trash2,
  Upload,
  Utensils,
  WifiOff,
  X,
} from 'lucide-react';

type Decision = 'like' | 'pass';
type Effort = 'Low' | 'Medium' | 'High';
type LoadState = 'idle' | 'loading' | 'ready' | 'offline' | 'error';

interface Ingredient {
  name: string;
  measure?: string;
}

interface RecipeCard {
  id: string;
  title: string;
  category: string;
  cuisine: string;
  tags: string[];
  appliances: string[];
  effort: Effort;
  time: string;
  image: string;
  sourceName: string;
  sourceUrl?: string;
  youtubeUrl?: string;
  instructions: string[];
  ingredients: Ingredient[];
}

interface SwipeRecord {
  recipeId: string;
  decision: Decision;
  title: string;
  at: string;
}

interface LocalRecipeState {
  version: 2;
  exportedAt: string;
  recipes: RecipeCard[];
  decisions: SwipeRecord[];
}

type CountMap = Record<string, number>;

interface TasteProfile {
  likedCount: number;
  passedCount: number;
  likedCategories: CountMap;
  passedCategories: CountMap;
  likedCuisines: CountMap;
  passedCuisines: CountMap;
  likedTags: CountMap;
  passedTags: CountMap;
  likedIngredients: CountMap;
  passedIngredients: CountMap;
  preferredSearchTerms: string[];
}

type MealDbMeal = Record<string, string | null> & {
  idMeal: string;
  strMeal: string;
  strCategory: string | null;
  strArea: string | null;
  strInstructions: string | null;
  strMealThumb: string | null;
  strTags: string | null;
  strYoutube: string | null;
  strSource: string | null;
};

type MealDbFilterMeal = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string | null;
};

const THEMEALDB_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';
const SWIPE_THRESHOLD = 110;
const FETCH_TIMEOUT_MS = 9_000;
const MAX_LIVE_RECIPES = 120;

const STORAGE_KEYS = {
  recipes: 'food_tinder_recipes_v2',
  decisions: 'food_tinder_decisions_v2',
} as const;

const DEFAULT_SEARCH_SEEDS = [
  'chicken',
  'beef',
  'salmon',
  'pasta',
  'rice',
  'tacos',
  'breakfast',
  'egg',
  'soup',
  'pizza',
  'vegetarian',
  'curry',
];

const PANTRY_STAPLES = new Set([
  'water',
  'salt',
  'pepper',
  'black pepper',
  'oil',
  'olive oil',
  'vegetable oil',
  'butter',
  'sugar',
  'garlic',
  'onion',
]);

const FALLBACK_RECIPE_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="50%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#431407"/>
    </linearGradient>
    <radialGradient id="plate" cx="50%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="70%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#94a3b8"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#bg)"/>
  <circle cx="600" cy="395" r="190" fill="url(#plate)" opacity="0.95"/>
  <circle cx="600" cy="395" r="122" fill="#f97316" opacity="0.85"/>
  <path d="M480 355c90-95 178-96 245 0-58 57-185 57-245 0Z" fill="#facc15" opacity="0.95"/>
  <path d="M498 454c72 48 145 48 216 0" stroke="#0f172a" stroke-width="22" stroke-linecap="round" opacity="0.35"/>
  <text x="600" y="675" text-anchor="middle" fill="#f8fafc" font-family="Arial, sans-serif" font-size="52" font-weight="800">Food Tinder</text>
  <text x="600" y="728" text-anchor="middle" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="28">image unavailable</text>
</svg>
`)}`;

const STARTER_RECIPES: RecipeCard[] = [
  {
    id: 'starter-chicken-fajita-bowl',
    title: 'Chicken Fajita Power Bowl',
    category: 'Chicken',
    cuisine: 'Mexican',
    tags: ['high-protein', 'weeknight', 'family'],
    appliances: ['Stovetop'],
    effort: 'Low',
    time: '30 mins',
    image: 'https://www.themealdb.com/images/media/meals/qrqywr1503066605.jpg',
    sourceName: 'Starter Deck',
    sourceUrl: 'local://starter/chicken-fajita-bowl',
    instructions: [
      'Season sliced chicken with fajita spices.',
      'Sear chicken, peppers, and onions in a hot skillet.',
      'Serve over rice with avocado, salsa, and lime.',
    ],
    ingredients: [
      { name: 'Chicken breast' },
      { name: 'Bell peppers' },
      { name: 'Onion' },
      { name: 'Rice' },
      { name: 'Avocado' },
      { name: 'Salsa' },
    ],
  },
  {
    id: 'starter-salmon-rice-bowl',
    title: 'Teriyaki Salmon Rice Bowl',
    category: 'Seafood',
    cuisine: 'Japanese',
    tags: ['rice bowl', 'omega-3', 'weeknight'],
    appliances: ['Oven', 'Stovetop'],
    effort: 'Low',
    time: '25 mins',
    image: 'https://www.themealdb.com/images/media/meals/xxyupu1468262513.jpg',
    sourceName: 'Starter Deck',
    sourceUrl: 'local://starter/salmon-rice-bowl',
    instructions: [
      'Brush salmon with teriyaki glaze.',
      'Roast until just cooked through.',
      'Serve over rice with cucumber, avocado, and sesame seeds.',
    ],
    ingredients: [
      { name: 'Salmon' },
      { name: 'Teriyaki sauce' },
      { name: 'Rice' },
      { name: 'Cucumber' },
      { name: 'Avocado' },
      { name: 'Sesame seeds' },
    ],
  },
  {
    id: 'starter-breakfast-tacos',
    title: 'Chorizo Breakfast Tacos',
    category: 'Breakfast',
    cuisine: 'Mexican',
    tags: ['breakfast', 'tacos', 'quick'],
    appliances: ['Stovetop'],
    effort: 'Low',
    time: '20 mins',
    image: 'https://www.themealdb.com/images/media/meals/1550441275.jpg',
    sourceName: 'Starter Deck',
    sourceUrl: 'local://starter/breakfast-tacos',
    instructions: [
      'Cook chorizo until browned.',
      'Scramble eggs in the same pan.',
      'Fill warm tortillas and top with cheese, salsa, and cilantro.',
    ],
    ingredients: [
      { name: 'Chorizo' },
      { name: 'Eggs' },
      { name: 'Tortillas' },
      { name: 'Cheese' },
      { name: 'Salsa' },
      { name: 'Cilantro' },
    ],
  },
  {
    id: 'starter-beef-noodle-stir-fry',
    title: 'Beef Noodle Stir-Fry',
    category: 'Beef',
    cuisine: 'Asian',
    tags: ['stir-fry', 'noodles', 'quick'],
    appliances: ['Stovetop'],
    effort: 'Medium',
    time: '35 mins',
    image: 'https://www.themealdb.com/images/media/meals/1529444830.jpg',
    sourceName: 'Starter Deck',
    sourceUrl: 'local://starter/beef-noodle-stir-fry',
    instructions: [
      'Sear thin beef strips over high heat.',
      'Add vegetables and stir-fry sauce.',
      'Toss with cooked noodles and garnish with green onions.',
    ],
    ingredients: [
      { name: 'Beef' },
      { name: 'Noodles' },
      { name: 'Broccoli' },
      { name: 'Soy sauce' },
      { name: 'Ginger' },
      { name: 'Green onions' },
    ],
  },
  {
    id: 'starter-pesto-panini',
    title: 'Turkey Pesto Panini',
    category: 'Lunch',
    cuisine: 'Italian',
    tags: ['sandwich', 'panini', 'quick'],
    appliances: ['Panini Press'],
    effort: 'Low',
    time: '12 mins',
    image: 'https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg',
    sourceName: 'Starter Deck',
    sourceUrl: 'local://starter/pesto-panini',
    instructions: [
      'Spread pesto on sourdough bread.',
      'Layer turkey, provolone, and tomato.',
      'Press until crisp outside and melted inside.',
    ],
    ingredients: [
      { name: 'Turkey' },
      { name: 'Pesto' },
      { name: 'Sourdough bread' },
      { name: 'Provolone' },
      { name: 'Tomato' },
    ],
  },
  {
    id: 'starter-vegetable-curry',
    title: 'Coconut Vegetable Curry',
    category: 'Vegetarian',
    cuisine: 'Indian',
    tags: ['vegetarian', 'curry', 'comfort'],
    appliances: ['Stovetop'],
    effort: 'Medium',
    time: '40 mins',
    image: 'https://www.themealdb.com/images/media/meals/svprys1511176755.jpg',
    sourceName: 'Starter Deck',
    sourceUrl: 'local://starter/vegetable-curry',
    instructions: [
      'Toast curry spices in a pot.',
      'Simmer vegetables in coconut milk.',
      'Serve with rice and fresh herbs.',
    ],
    ingredients: [
      { name: 'Coconut milk' },
      { name: 'Curry powder' },
      { name: 'Chickpeas' },
      { name: 'Sweet potato' },
      { name: 'Spinach' },
      { name: 'Rice' },
    ],
  },
  {
    id: 'starter-air-fryer-tenders',
    title: 'Air Fryer Chicken Tenders',
    category: 'Chicken',
    cuisine: 'American',
    tags: ['air fryer', 'kid-friendly', 'crispy'],
    appliances: ['Air Fryer'],
    effort: 'Medium',
    time: '25 mins',
    image: 'https://www.themealdb.com/images/media/meals/1520084413.jpg',
    sourceName: 'Starter Deck',
    sourceUrl: 'local://starter/air-fryer-tenders',
    instructions: [
      'Coat chicken strips in seasoned crumbs.',
      'Air fry until golden and cooked through.',
      'Serve with dipping sauce and a simple side.',
    ],
    ingredients: [
      { name: 'Chicken breast' },
      { name: 'Panko breadcrumbs' },
      { name: 'Eggs' },
      { name: 'Paprika' },
      { name: 'Ranch' },
    ],
  },
  {
    id: 'starter-pasta-night',
    title: 'Garlic Butter Pasta Night',
    category: 'Pasta',
    cuisine: 'Italian',
    tags: ['pasta', 'comfort', 'quick'],
    appliances: ['Stovetop'],
    effort: 'Low',
    time: '20 mins',
    image: 'https://www.themealdb.com/images/media/meals/wtsvxx1511296896.jpg',
    sourceName: 'Starter Deck',
    sourceUrl: 'local://starter/pasta-night',
    instructions: [
      'Boil pasta until al dente.',
      'Sauté garlic in butter.',
      'Toss pasta with parmesan, herbs, and reserved pasta water.',
    ],
    ingredients: [
      { name: 'Pasta' },
      { name: 'Garlic' },
      { name: 'Butter' },
      { name: 'Parmesan' },
      { name: 'Parsley' },
    ],
  },
];

const normalizeToken = (value: string) => value.trim().toLowerCase();

const titleCase = (value: string) =>
  value
    .split(' ')
    .filter(Boolean)
    .map((piece) => piece.charAt(0).toUpperCase() + piece.slice(1))
    .join(' ');

const incrementCount = (map: CountMap, rawValue: string) => {
  const key = normalizeToken(rawValue);
  if (!key || PANTRY_STAPLES.has(key)) return;
  map[key] = (map[key] ?? 0) + 1;
};

const topKeys = (map: CountMap, limit: number) =>
  Object.entries(map)
    .sort(([, firstCount], [, secondCount]) => secondCount - firstCount)
    .slice(0, limit)
    .map(([key]) => key);

const uniqueStrings = (items: string[]) =>
  Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));

const mergeUniqueRecipes = (recipes: RecipeCard[]) => {
  const byId = new Map<string, RecipeCard>();

  recipes.forEach((recipe) => {
    if (!recipe.id || !recipe.title) return;
    byId.set(recipe.id, {
      ...recipe,
      image: recipe.image || FALLBACK_RECIPE_IMAGE,
      ingredients: recipe.ingredients ?? [],
      instructions: recipe.instructions?.length ? recipe.instructions : ['Open the source recipe for full preparation details.'],
      tags: recipe.tags ?? [],
      appliances: recipe.appliances?.length ? recipe.appliances : ['Any'],
    });
  });

  return Array.from(byId.values());
};

const readLocalJson = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;

  try {
    const saved = window.localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeLocalJson = (key: string, value: unknown) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Local storage can fail in private mode or when full. The app still works in memory.
  }
};

const loadInitialRecipes = () => {
  const savedRecipes = readLocalJson<RecipeCard[]>(STORAGE_KEYS.recipes, []);
  return mergeUniqueRecipes(savedRecipes.length > 0 ? [...savedRecipes, ...STARTER_RECIPES] : STARTER_RECIPES);
};

const loadInitialDecisions = () => readLocalJson<SwipeRecord[]>(STORAGE_KEYS.decisions, []);

const createTasteProfile = (decisions: SwipeRecord[], recipes: RecipeCard[]): TasteProfile => {
  const recipeById = new Map(recipes.map((recipe) => [recipe.id, recipe]));
  const profile: TasteProfile = {
    likedCount: 0,
    passedCount: 0,
    likedCategories: {},
    passedCategories: {},
    likedCuisines: {},
    passedCuisines: {},
    likedTags: {},
    passedTags: {},
    likedIngredients: {},
    passedIngredients: {},
    preferredSearchTerms: [],
  };

  decisions.forEach((record) => {
    const recipe = recipeById.get(record.recipeId);
    if (!recipe) return;

    const liked = record.decision === 'like';
    if (liked) profile.likedCount += 1;
    if (!liked) profile.passedCount += 1;

    const categoryMap = liked ? profile.likedCategories : profile.passedCategories;
    const cuisineMap = liked ? profile.likedCuisines : profile.passedCuisines;
    const tagMap = liked ? profile.likedTags : profile.passedTags;
    const ingredientMap = liked ? profile.likedIngredients : profile.passedIngredients;

    incrementCount(categoryMap, recipe.category);
    incrementCount(cuisineMap, recipe.cuisine);
    recipe.tags.forEach((tag) => incrementCount(tagMap, tag));
    recipe.ingredients.forEach((ingredient) => incrementCount(ingredientMap, ingredient.name));
  });

  const likedIngredients = topKeys(profile.likedIngredients, 8).filter(
    (key) => (profile.passedIngredients[key] ?? 0) < (profile.likedIngredients[key] ?? 0),
  );
  const likedCategories = topKeys(profile.likedCategories, 5).filter(
    (key) => (profile.passedCategories[key] ?? 0) <= (profile.likedCategories[key] ?? 0),
  );
  const likedCuisines = topKeys(profile.likedCuisines, 5).filter(
    (key) => (profile.passedCuisines[key] ?? 0) <= (profile.likedCuisines[key] ?? 0),
  );
  const likedTags = topKeys(profile.likedTags, 5).filter(
    (key) => (profile.passedTags[key] ?? 0) <= (profile.likedTags[key] ?? 0),
  );

  profile.preferredSearchTerms = uniqueStrings([
    ...likedIngredients,
    ...likedCategories,
    ...likedCuisines,
    ...likedTags,
    ...DEFAULT_SEARCH_SEEDS,
  ]).slice(0, 16);

  return profile;
};

const scoreRecipe = (recipe: RecipeCard, profile: TasteProfile) => {
  let score = 0;

  const category = normalizeToken(recipe.category);
  const cuisine = normalizeToken(recipe.cuisine);

  score += (profile.likedCategories[category] ?? 0) * 8;
  score -= (profile.passedCategories[category] ?? 0) * 5;

  score += (profile.likedCuisines[cuisine] ?? 0) * 6;
  score -= (profile.passedCuisines[cuisine] ?? 0) * 4;

  recipe.tags.forEach((tag) => {
    const key = normalizeToken(tag);
    score += (profile.likedTags[key] ?? 0) * 5;
    score -= (profile.passedTags[key] ?? 0) * 4;
  });

  recipe.ingredients.forEach((ingredient) => {
    const key = normalizeToken(ingredient.name);
    score += (profile.likedIngredients[key] ?? 0) * 3;
    score -= (profile.passedIngredients[key] ?? 0) * 4;
  });

  if (recipe.sourceName === 'TheMealDB') score += 1;
  if (recipe.image && recipe.image !== FALLBACK_RECIPE_IMAGE) score += 1;
  if (profile.likedCount === 0 && DEFAULT_SEARCH_SEEDS.some((seed) => recipe.title.toLowerCase().includes(seed))) {
    score += 2;
  }

  return score;
};

const inferAppliances = (meal: MealDbMeal) => {
  const text = `${meal.strMeal} ${meal.strInstructions ?? ''} ${meal.strTags ?? ''}`.toLowerCase();
  const appliances = new Set<string>();

  if (text.includes('air fry')) appliances.add('Air Fryer');
  if (text.includes('oven') || text.includes('bake') || text.includes('roast')) appliances.add('Oven');
  if (text.includes('grill')) appliances.add('Grill');
  if (text.includes('slow cooker')) appliances.add('Slow Cooker');
  if (text.includes('pressure cooker') || text.includes('instant pot')) appliances.add('Pressure Cooker');
  if (text.includes('sous vide')) appliances.add('Sous Vide');
  if (text.includes('panini')) appliances.add('Panini Press');
  if (text.includes('boil') || text.includes('simmer') || text.includes('fry') || text.includes('sauté') || text.includes('saute')) {
    appliances.add('Stovetop');
  }

  return Array.from(appliances.size > 0 ? appliances : new Set(['Any']));
};

const splitInstructions = (instructions: string | null) => {
  const normalized = (instructions ?? '')
    .replace(/\r/g, '\n')
    .replace(/STEP\s*\d+\s*-?/gi, '\n')
    .replace(/\n\s*\d+\.\s*/g, '\n');

  const steps = normalized
    .split(/\n{2,}|\n-\s+/)
    .map((step) => step.trim())
    .filter(Boolean)
    .slice(0, 8);

  return steps.length > 0 ? steps : ['Open the source recipe for full preparation details.'];
};

const collectIngredients = (meal: MealDbMeal) => {
  const ingredients: Ingredient[] = [];

  for (let index = 1; index <= 20; index += 1) {
    const ingredient = meal[`strIngredient${index}`];
    const measure = meal[`strMeasure${index}`];
    if (!ingredient?.trim()) continue;

    ingredients.push({
      name: ingredient.trim(),
      measure: measure?.trim() || undefined,
    });
  }

  return ingredients;
};

const inferEffort = (ingredients: Ingredient[], instructions: string[], appliances: string[]): Effort => {
  const complexity = ingredients.length + instructions.length + Math.max(appliances.length - 1, 0) * 2;

  if (complexity >= 22) return 'High';
  if (complexity >= 13) return 'Medium';
  return 'Low';
};

const inferTime = (instructions: string[], effort: Effort) => {
  const text = instructions.join(' ');
  const minuteMatches = Array.from(text.matchAll(/(\d+)\s*(?:minutes|minute|mins|min)/gi)).map((match) => Number(match[1]));
  const hourMatches = Array.from(text.matchAll(/(\d+)\s*(?:hours|hour|hrs|hr)/gi)).map((match) => Number(match[1]) * 60);
  const explicitTimes = [...minuteMatches, ...hourMatches].filter((value) => Number.isFinite(value));

  if (explicitTimes.length > 0) {
    const estimate = Math.min(Math.max(...explicitTimes), 240);
    return `${estimate} mins`;
  }

  if (effort === 'High') return '60-90 mins';
  if (effort === 'Medium') return '35-55 mins';
  return '20-30 mins';
};

const mapMealDbToRecipe = (meal: MealDbMeal): RecipeCard => {
  const ingredients = collectIngredients(meal);
  const instructions = splitInstructions(meal.strInstructions);
  const appliances = inferAppliances(meal);
  const effort = inferEffort(ingredients, instructions, appliances);
  const tags = meal.strTags?.split(',').map((tag) => tag.trim()).filter(Boolean) ?? [];

  return {
    id: `mealdb-${meal.idMeal}`,
    title: meal.strMeal,
    category: meal.strCategory || 'Other',
    cuisine: meal.strArea || 'Global',
    tags,
    appliances,
    effort,
    time: inferTime(instructions, effort),
    image: meal.strMealThumb || FALLBACK_RECIPE_IMAGE,
    sourceName: 'TheMealDB',
    sourceUrl: meal.strSource || undefined,
    youtubeUrl: meal.strYoutube || undefined,
    instructions,
    ingredients,
  };
};

const fetchJsonWithTimeout = async <T,>(url: string): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Recipe request failed: ${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    window.clearTimeout(timeoutId);
  }
};

const fetchMealDbSearch = async (term: string) => {
  const data = await fetchJsonWithTimeout<{ meals: MealDbMeal[] | null }>(
    `${THEMEALDB_BASE_URL}/search.php?s=${encodeURIComponent(term)}`,
  );

  return (data.meals ?? []).map(mapMealDbToRecipe);
};

const fetchMealDbLookup = async (id: string) => {
  const data = await fetchJsonWithTimeout<{ meals: MealDbMeal[] | null }>(
    `${THEMEALDB_BASE_URL}/lookup.php?i=${encodeURIComponent(id)}`,
  );

  return data.meals?.[0] ? mapMealDbToRecipe(data.meals[0]) : null;
};

const fetchMealDbFilterIds = async (filter: 'i' | 'c' | 'a', term: string) => {
  const preparedTerm = filter === 'i' ? term.trim().replaceAll(' ', '_') : term.trim();
  const data = await fetchJsonWithTimeout<{ meals: MealDbFilterMeal[] | null }>(
    `${THEMEALDB_BASE_URL}/filter.php?${filter}=${encodeURIComponent(preparedTerm)}`,
  );

  return (data.meals ?? []).map((meal) => meal.idMeal);
};

const loadMealDbSuggestions = async (profile: TasteProfile) => {
  const searchTerms = profile.preferredSearchTerms.slice(0, 12);
  const filterIngredients = topKeys(profile.likedIngredients, 5);
  const filterCategories = topKeys(profile.likedCategories, 4);
  const filterAreas = topKeys(profile.likedCuisines, 4);

  const searchResults = await Promise.allSettled(searchTerms.map(fetchMealDbSearch));
  const searchedRecipes = searchResults.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));

  const filterResults = await Promise.allSettled([
    ...filterIngredients.map((term) => fetchMealDbFilterIds('i', term)),
    ...filterCategories.map((term) => fetchMealDbFilterIds('c', titleCase(term))),
    ...filterAreas.map((term) => fetchMealDbFilterIds('a', titleCase(term))),
  ]);

  const lookupIds = uniqueStrings(
    filterResults.flatMap((result) => (result.status === 'fulfilled' ? result.value : [])),
  ).slice(0, 40);

  const lookupResults = await Promise.allSettled(lookupIds.map(fetchMealDbLookup));
  const lookedUpRecipes = lookupResults.flatMap((result) =>
    result.status === 'fulfilled' && result.value ? [result.value] : [],
  );

  return mergeUniqueRecipes([...searchedRecipes, ...lookedUpRecipes]).slice(0, MAX_LIVE_RECIPES);
};

const formatIngredient = (ingredient: Ingredient) =>
  ingredient.measure ? `${ingredient.measure} ${ingredient.name}` : ingredient.name;

interface RecipeImageProps {
  src: string;
  alt: string;
  className: string;
}

function RecipeImage({ src, alt, className }: RecipeImageProps) {
  const [imageSrc, setImageSrc] = useState(src || FALLBACK_RECIPE_IMAGE);

  useEffect(() => {
    setImageSrc(src || FALLBACK_RECIPE_IMAGE);
  }, [src]);

  return (
    <img
      src={imageSrc}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      className={className}
      onError={() => setImageSrc(FALLBACK_RECIPE_IMAGE)}
    />
  );
}

export default function MealSwiperApp() {
  const [recipes, setRecipes] = useState<RecipeCard[]>(loadInitialRecipes);
  const [decisions, setDecisions] = useState<SwipeRecord[]>(loadInitialDecisions);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [cuisineFilter, setCuisineFilter] = useState('All');
  const [effortFilter, setEffortFilter] = useState<'All' | Effort>('All');
  const [applianceFilter, setApplianceFilter] = useState('All');
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [loadMessage, setLoadMessage] = useState('Starter deck loaded. Live recipe search will fill the queue.');
  const [isFlipped, setIsFlipped] = useState(false);
  const [swipeAnimation, setSwipeAnimation] = useState<Decision | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [drag, setDrag] = useState({ x: 0, y: 0, isDragging: false });

  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const hasLoadedLiveRecipesRef = useRef(false);

  useEffect(() => writeLocalJson(STORAGE_KEYS.recipes, recipes), [recipes]);
  useEffect(() => writeLocalJson(STORAGE_KEYS.decisions, decisions), [decisions]);

  const tasteProfile = useMemo(() => createTasteProfile(decisions, recipes), [decisions, recipes]);
  const likedIds = useMemo(
    () => new Set(decisions.filter((record) => record.decision === 'like').map((record) => record.recipeId)),
    [decisions],
  );

  const categories = useMemo(() => ['All', ...uniqueStrings(recipes.map((recipe) => recipe.category)).sort()], [recipes]);
  const cuisines = useMemo(() => ['All', ...uniqueStrings(recipes.map((recipe) => recipe.cuisine)).sort()], [recipes]);
  const appliances = useMemo(
    () => ['All', ...uniqueStrings(recipes.flatMap((recipe) => recipe.appliances)).sort()],
    [recipes],
  );

  const refreshRecipes = useCallback(async () => {
    setLoadState('loading');
    setLoadMessage('Loading live recipe suggestions from your current taste profile...');

    try {
      const liveRecipes = await loadMealDbSuggestions(tasteProfile);
      if (liveRecipes.length === 0) {
        setLoadState('offline');
        setLoadMessage('No live recipes came back. The local starter deck is still ready.');
        return;
      }

      setRecipes((currentRecipes) => mergeUniqueRecipes([...liveRecipes, ...currentRecipes, ...STARTER_RECIPES]));
      setLoadState('ready');
      setLoadMessage(`Loaded ${liveRecipes.length} live recipes. The deck is ranked from your likes and passes.`);
    } catch {
      setLoadState('offline');
      setLoadMessage('Live recipe search is unavailable. Running from the local starter deck and saved JSON cache.');
    }
  }, [tasteProfile]);

  useEffect(() => {
    if (hasLoadedLiveRecipesRef.current) return;
    hasLoadedLiveRecipesRef.current = true;
    void refreshRecipes();
  }, [refreshRecipes]);

  const deck = useMemo(() => {
    const decidedIds = new Set(decisions.map((record) => record.recipeId));

    return recipes
      .filter((recipe) => !decidedIds.has(recipe.id))
      .filter((recipe) => categoryFilter === 'All' || recipe.category === categoryFilter)
      .filter((recipe) => cuisineFilter === 'All' || recipe.cuisine === cuisineFilter)
      .filter((recipe) => effortFilter === 'All' || recipe.effort === effortFilter)
      .filter((recipe) => applianceFilter === 'All' || recipe.appliances.includes(applianceFilter))
      .map((recipe) => ({ recipe, score: scoreRecipe(recipe, tasteProfile) }))
      .sort((first, second) => second.score - first.score || first.recipe.title.localeCompare(second.recipe.title))
      .map(({ recipe }) => recipe);
  }, [applianceFilter, categoryFilter, cuisineFilter, decisions, effortFilter, recipes, tasteProfile]);

  const currentCard = deck[0] ?? null;
  const likedRecipes = useMemo(() => recipes.filter((recipe) => likedIds.has(recipe.id)), [likedIds, recipes]);
  const currentCardId = currentCard?.id ?? 'empty';

  useEffect(() => {
    setIsFlipped(false);
    setDrag({ x: 0, y: 0, isDragging: false });
  }, [currentCardId]);

  const performDecision = useCallback(
    (decision: Decision) => {
      if (!currentCard || swipeAnimation) return;

      const record: SwipeRecord = {
        recipeId: currentCard.id,
        decision,
        title: currentCard.title,
        at: new Date().toISOString(),
      };

      setSwipeAnimation(decision);
      setDrag({ x: 0, y: 0, isDragging: false });

      window.setTimeout(() => {
        setDecisions((previous) => [...previous.filter((item) => item.recipeId !== currentCard.id), record]);
        setSwipeAnimation(null);
      }, 330);
    },
    [currentCard, swipeAnimation],
  );

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!currentCard || swipeAnimation) return;
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ x: 0, y: 0, isDragging: true });
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current || !drag.isDragging || swipeAnimation) return;

    setDrag({
      x: event.clientX - dragStartRef.current.x,
      y: event.clientY - dragStartRef.current.y,
      isDragging: true,
    });
  };

  const handlePointerEnd = () => {
    if (!dragStartRef.current || swipeAnimation) return;

    const finalX = drag.x;
    dragStartRef.current = null;

    if (Math.abs(finalX) >= SWIPE_THRESHOLD) {
      performDecision(finalX > 0 ? 'like' : 'pass');
      return;
    }

    setDrag({ x: 0, y: 0, isDragging: false });
  };

  const undoLastDecision = () => {
    setDecisions((previous) => previous.slice(0, -1));
    setSwipeAnimation(null);
    setDrag({ x: 0, y: 0, isDragging: false });
  };

  const removeLikedRecipe = (recipeId: string) => {
    setDecisions((previous) => previous.filter((record) => record.recipeId !== recipeId));
  };

  const clearTasteMemory = () => {
    setDecisions([]);
    setIsFlipped(false);
    setSwipeAnimation(null);
  };

  const resetLocalCache = () => {
    setRecipes(STARTER_RECIPES);
    setDecisions([]);
    setCategoryFilter('All');
    setCuisineFilter('All');
    setEffortFilter('All');
    setApplianceFilter('All');
    setLoadState('idle');
    setLoadMessage('Local cache reset. Starter deck is loaded.');
  };

  const exportLocalJson = () => {
    const payload: LocalRecipeState = {
      version: 2,
      exportedAt: new Date().toISOString(),
      recipes,
      decisions,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `food-tinder-state-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const importLocalJson = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<LocalRecipeState>;
      const importedRecipes = Array.isArray(parsed.recipes) ? parsed.recipes : [];
      const importedDecisions = Array.isArray(parsed.decisions) ? parsed.decisions : [];

      setRecipes((currentRecipes) => mergeUniqueRecipes([...importedRecipes, ...currentRecipes, ...STARTER_RECIPES]));
      setDecisions(importedDecisions);
      setLoadState('ready');
      setLoadMessage(`Imported ${importedRecipes.length} recipes and ${importedDecisions.length} taste decisions.`);
    } catch {
      setLoadState('error');
      setLoadMessage('That JSON file could not be imported. Exported Food Tinder files are supported.');
    } finally {
      event.currentTarget.value = '';
    }
  };

  const copyShoppingList = async () => {
    const ingredientNames = uniqueStrings(
      likedRecipes.flatMap((recipe) => recipe.ingredients.map((ingredient) => formatIngredient(ingredient))),
    ).sort();

    const text = [
      'FOOD TINDER CURATED MEALS',
      '',
      ...likedRecipes.map((recipe) => `- ${recipe.title} (${recipe.category} / ${recipe.cuisine})`),
      '',
      'SHOPPING LIST',
      ...ingredientNames.map((ingredient) => `- [ ] ${ingredient}`),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(true);
      window.setTimeout(() => setCopyFeedback(false), 1800);
    } catch {
      setLoadState('error');
      setLoadMessage('Clipboard access was blocked by the browser. Export JSON still works.');
    }
  };

  const dragApproval = Math.min(Math.abs(drag.x) / SWIPE_THRESHOLD, 1);
  const cardTransform = drag.isDragging
    ? `translate(${drag.x}px, ${drag.y}px) rotate(${drag.x / 16}deg)`
    : undefined;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-amber-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-tr from-amber-500 to-rose-500 p-3 rounded-2xl shadow-lg shadow-amber-500/20">
              <ChefHat className="w-8 h-8 text-slate-950" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">Food Tinder</h1>
              <p className="text-sm text-slate-400 max-w-2xl">
                Swipe right to train your taste profile. Swipe left to down-rank similar meals. Recipes load live, then persist locally as JSON-ready cache.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Queue</span>
              <p className="text-lg font-black">{deck.length}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Liked</span>
              <p className="text-lg font-black text-emerald-400">{tasteProfile.likedCount}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Passed</span>
              <p className="text-lg font-black text-rose-400">{tasteProfile.passedCount}</p>
            </div>
          </div>
        </header>

        <section className="bg-slate-900/70 border border-slate-800 rounded-3xl p-4 md:p-5 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              {loadState === 'offline' ? (
                <WifiOff className="w-4 h-4 text-amber-400" />
              ) : loadState === 'ready' ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : (
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
              )}
              <span className="text-slate-300">{loadMessage}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void refreshRecipes()}
                disabled={loadState === 'loading'}
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-400 text-slate-950 font-black rounded-xl px-4 py-2 text-xs transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loadState === 'loading' ? 'animate-spin' : ''}`} />
                Refresh Taste Queue
              </button>
              <button
                type="button"
                onClick={exportLocalJson}
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl px-4 py-2 text-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                Export JSON
              </button>
              <button
                type="button"
                onClick={() => importInputRef.current?.click()}
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl px-4 py-2 text-xs transition-colors"
              >
                <Upload className="w-4 h-4" />
                Import JSON
              </button>
              <input ref={importInputRef} type="file" accept="application/json" className="hidden" onChange={importLocalJson} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <label className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Category</span>
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Cuisine</span>
              <select
                value={cuisineFilter}
                onChange={(event) => setCuisineFilter(event.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-500"
              >
                {cuisines.map((cuisine) => (
                  <option key={cuisine} value={cuisine}>
                    {cuisine}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Effort</span>
              <select
                value={effortFilter}
                onChange={(event) => setEffortFilter(event.target.value as 'All' | Effort)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-500"
              >
                <option value="All">All</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Appliance</span>
              <select
                value={applianceFilter}
                onChange={(event) => setApplianceFilter(event.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-500"
              >
                {appliances.map((appliance) => (
                  <option key={appliance} value={appliance}>
                    {appliance}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <main className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-8 items-start">
          <section className="flex flex-col items-center gap-5">
            {currentCard ? (
              <>
                <div className="relative w-full max-w-md h-[590px]">
                  <div
                    role="button"
                    tabIndex={0}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerEnd}
                    onPointerCancel={handlePointerEnd}
                    className={`absolute inset-0 rounded-[2rem] select-none touch-none cursor-grab active:cursor-grabbing ${
                      swipeAnimation === 'like' ? 'animate-swipe-right' : ''
                    } ${swipeAnimation === 'pass' ? 'animate-swipe-left' : ''}`}
                    style={{ transform: cardTransform }}
                  >
                    <div className={`relative w-full h-full transform-style-3d transition-transform duration-500 ${isFlipped ? 'rotate-y-180' : ''}`}>
                      <article className="absolute inset-0 backface-hidden bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
                        <div className="relative h-72 bg-slate-950">
                          <RecipeImage
                            src={currentCard.image}
                            alt={currentCard.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                          <div
                            className="absolute top-6 left-6 border-4 border-emerald-400 text-emerald-300 rounded-2xl px-4 py-2 text-2xl font-black rotate-[-12deg]"
                            style={{ opacity: drag.x > 0 ? dragApproval : 0 }}
                          >
                            LIKE
                          </div>
                          <div
                            className="absolute top-6 right-6 border-4 border-rose-400 text-rose-300 rounded-2xl px-4 py-2 text-2xl font-black rotate-12"
                            style={{ opacity: drag.x < 0 ? dragApproval : 0 }}
                          >
                            PASS
                          </div>

                          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                            <span className="bg-slate-950/80 border border-slate-700 rounded-full px-3 py-1 text-[11px] font-black">
                              {currentCard.category}
                            </span>
                            <span className="bg-slate-950/80 border border-slate-700 rounded-full px-3 py-1 text-[11px] font-black">
                              {currentCard.cuisine}
                            </span>
                          </div>
                        </div>

                        <div className="p-6 space-y-5">
                          <div>
                            <h2 className="text-2xl font-black leading-tight">{currentCard.title}</h2>
                            <p className="text-xs text-slate-400 mt-2">
                              From {currentCard.sourceName}. Ranked by your liked and passed meals.
                            </p>
                          </div>

                          <div className="grid grid-cols-3 gap-3 text-xs">
                            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3">
                              <Clock className="w-4 h-4 text-amber-400 mb-2" />
                              <span className="block text-slate-500 font-bold uppercase">Time</span>
                              <span className="font-black">{currentCard.time}</span>
                            </div>
                            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3">
                              <FileText className="w-4 h-4 text-blue-400 mb-2" />
                              <span className="block text-slate-500 font-bold uppercase">Effort</span>
                              <span className="font-black">{currentCard.effort}</span>
                            </div>
                            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3">
                              <Utensils className="w-4 h-4 text-emerald-400 mb-2" />
                              <span className="block text-slate-500 font-bold uppercase">Items</span>
                              <span className="font-black">{currentCard.ingredients.length}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {currentCard.appliances.map((appliance) => (
                              <span key={appliance} className="text-[11px] bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-full px-3 py-1 font-bold">
                                {appliance}
                              </span>
                            ))}
                            {currentCard.tags.slice(0, 5).map((tag) => (
                              <span key={tag} className="text-[11px] bg-slate-800 text-slate-300 rounded-full px-3 py-1 font-bold">
                                {tag}
                              </span>
                            ))}
                          </div>

                          <p className="text-xs text-slate-500">Drag the card left/right or use the action buttons. Flip for ingredients and steps.</p>
                        </div>
                      </article>

                      <article className="absolute inset-0 backface-hidden rotate-y-180 bg-slate-900 border border-amber-500/30 rounded-[2rem] overflow-hidden shadow-2xl p-6 flex flex-col">
                        <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
                          <div>
                            <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider">Recipe Detail</span>
                            <h3 className="font-black text-lg">{currentCard.title}</h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsFlipped(false)}
                            className="bg-slate-800 hover:bg-slate-700 rounded-xl p-2 transition-colors"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex-1 overflow-y-auto py-5 space-y-5 text-sm">
                          <section>
                            <h4 className="text-[11px] uppercase tracking-wider text-slate-500 font-black mb-2">Ingredients</h4>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {currentCard.ingredients.map((ingredient) => (
                                <li key={`${ingredient.name}-${ingredient.measure ?? ''}`} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300">
                                  {formatIngredient(ingredient)}
                                </li>
                              ))}
                            </ul>
                          </section>

                          <section>
                            <h4 className="text-[11px] uppercase tracking-wider text-slate-500 font-black mb-2">Steps</h4>
                            <ol className="space-y-3">
                              {currentCard.instructions.map((step, index) => (
                                <li key={`${currentCard.id}-step-${index}`} className="flex gap-3 text-slate-300">
                                  <span className="text-amber-400 font-black">{index + 1}.</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          </section>
                        </div>

                        {(currentCard.sourceUrl || currentCard.youtubeUrl) && (
                          <div className="border-t border-slate-800 pt-4 flex gap-2 text-xs">
                            {currentCard.sourceUrl && (
                              <a href={currentCard.sourceUrl} target="_blank" rel="noreferrer" className="flex-1 text-center bg-slate-800 hover:bg-slate-700 rounded-xl px-3 py-2 font-bold transition-colors">
                                Source Recipe
                              </a>
                            )}
                            {currentCard.youtubeUrl && (
                              <a href={currentCard.youtubeUrl} target="_blank" rel="noreferrer" className="flex-1 text-center bg-slate-800 hover:bg-slate-700 rounded-xl px-3 py-2 font-bold transition-colors">
                                Video
                              </a>
                            )}
                          </div>
                        )}
                      </article>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => performDecision('pass')}
                    className="w-16 h-16 bg-slate-900 border border-rose-500/30 hover:bg-rose-500/10 text-rose-300 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95"
                    aria-label="Pass recipe"
                  >
                    <X className="w-7 h-7" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFlipped((value) => !value)}
                    className="w-14 h-14 bg-slate-900 border border-amber-500/30 hover:bg-amber-500/10 text-amber-300 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95"
                    aria-label="Flip recipe card"
                  >
                    <RotateCw className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={() => performDecision('like')}
                    className="w-16 h-16 bg-slate-900 border border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-300 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95"
                    aria-label="Like recipe"
                  >
                    <Heart className="w-7 h-7" />
                  </button>
                </div>

                <div className="flex flex-wrap justify-center gap-3 text-xs">
                  <button
                    type="button"
                    onClick={undoLastDecision}
                    disabled={decisions.length === 0}
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-amber-300 disabled:text-slate-700 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Undo Last Swipe
                  </button>
                  <button type="button" onClick={clearTasteMemory} className="text-slate-500 hover:text-rose-300 transition-colors">
                    Clear Taste Memory
                  </button>
                  <button type="button" onClick={resetLocalCache} className="text-slate-500 hover:text-rose-300 transition-colors">
                    Reset Local Cache
                  </button>
                </div>
              </>
            ) : (
              <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2rem] p-8 text-center space-y-5">
                <CheckCircle className="w-14 h-14 text-emerald-400 mx-auto" />
                <h2 className="text-2xl font-black">Queue complete</h2>
                <p className="text-sm text-slate-400">Refresh for more suggestions, clear filters, or reset taste memory to see cards again.</p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => void refreshRecipes()}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl px-4 py-3 transition-colors"
                  >
                    Refresh Taste Queue
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryFilter('All');
                      setCuisineFilter('All');
                      setEffortFilter('All');
                      setApplianceFilter('All');
                    }}
                    className="bg-slate-800 hover:bg-slate-700 font-bold rounded-xl px-4 py-3 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </section>

          <aside className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 xl:sticky xl:top-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-black">Curated Meals</h3>
                <p className="text-xs text-slate-400">Local-first storage. Export this JSON before moving to DB-backed profiles.</p>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-2xl px-3 py-2 text-sm font-black">
                {likedRecipes.length}
              </div>
            </div>

            {likedRecipes.length === 0 ? (
              <div className="border border-dashed border-slate-700 rounded-2xl p-6 text-center text-sm text-slate-500">
                Swipe right on meals you would actually eat. The next refresh will bias toward those ingredients, cuisines, and tags.
              </div>
            ) : (
              <div className="space-y-3 max-h-[430px] overflow-y-auto pr-1">
                {likedRecipes.map((recipe) => (
                  <div key={recipe.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex gap-3 group">
                    <RecipeImage src={recipe.image} alt={recipe.title} className="w-16 h-16 rounded-xl object-cover bg-slate-900 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-sm truncate">{recipe.title}</p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {recipe.category} · {recipe.cuisine} · {recipe.time}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {recipe.ingredients.slice(0, 3).map((ingredient) => (
                          <span key={ingredient.name} className="text-[10px] bg-slate-800 text-slate-400 rounded-full px-2 py-0.5">
                            {ingredient.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLikedRecipe(recipe.id)}
                      className="text-slate-600 hover:text-rose-300 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all"
                      aria-label={`Remove ${recipe.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => void copyShoppingList()}
                disabled={likedRecipes.length === 0}
                className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-700 rounded-xl px-3 py-3 text-xs font-black transition-colors"
              >
                {copyFeedback ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copyFeedback ? 'Copied' : 'Copy List'}
              </button>
              <button
                type="button"
                onClick={exportLocalJson}
                className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 rounded-xl px-3 py-3 text-xs font-black transition-colors"
              >
                <Download className="w-4 h-4" />
                Backup
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 space-y-2">
              <p className="font-black text-slate-200">Taste signal</p>
              <p>
                Preferred queue seeds:{' '}
                {tasteProfile.preferredSearchTerms.slice(0, 8).map((term) => titleCase(term)).join(', ') || 'starter mix'}
              </p>
              <p>
                Passed meals are not thrown away; they down-rank similar categories, cuisines, tags, and ingredients.
              </p>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
