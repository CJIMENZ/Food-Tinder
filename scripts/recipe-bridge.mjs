#!/usr/bin/env node
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const PORT = Number(process.env.RECIPE_BRIDGE_PORT || 8787);
const HOST = process.env.RECIPE_BRIDGE_HOST || '127.0.0.1';
const CLI = process.env.RECIPE_PP_CLI || 'recipe-pp-cli';
const MOCK_FILE = process.env.RECIPE_BRIDGE_MOCK_FILE;
const DEFAULT_SOURCES = 'allrecipes,yellowblissroad,everythingjustbaked';
const TIMEOUT_MS = Number(process.env.RECIPE_BRIDGE_TIMEOUT_MS || 45000);

const SOURCE_NAMES = {
  allrecipes: 'Allrecipes',
  yellowblissroad: 'Yellow Bliss Road',
  everythingjustbaked: 'Everything Just Baked',
  printingpress: 'Printing Press Source',
};

function stableId(input) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash.toString(36);
}

function inferSourceId(rawSourceName = '', rawSourceUrl = '') {
  const value = `${rawSourceName} ${rawSourceUrl}`.toLowerCase();
  if (value.includes('allrecipes')) return 'allrecipes';
  if (value.includes('yellow')) return 'yellowblissroad';
  if (value.includes('everything')) return 'everythingjustbaked';
  return 'printingpress';
}

function normalizeStringArray(value) {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  if (typeof value === 'string') return value.split(',').map((item) => item.trim()).filter(Boolean);
  return [];
}

function normalizeIngredients(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === 'string') return { name: item.trim() };
      if (!item || typeof item !== 'object') return null;
      const name = String(item.name || item.ingredient || item.title || '').trim();
      if (!name) return null;
      const measure = String(item.measure || item.amount || '').trim();
      return measure ? { name, measure } : { name };
    })
    .filter(Boolean);
}

function normalizeRecipe(recipe) {
  if (!recipe || typeof recipe !== 'object') return null;

  const title = String(recipe.title || recipe.name || recipe.recipeName || '').trim();
  if (!title) return null;

  const sourceUrl = String(recipe.sourceUrl || recipe.url || recipe.link || '').trim();
  const sourceId = recipe.sourceId || inferSourceId(recipe.sourceName || recipe.source || '', sourceUrl);
  const sourceName = String(recipe.sourceName || recipe.source || SOURCE_NAMES[sourceId] || SOURCE_NAMES.printingpress).trim();

  return {
    id: String(recipe.id || `${sourceId}-${stableId(`${title}-${sourceUrl}`)}`),
    title,
    category: String(recipe.category || recipe.recipeCategory || 'Recipe'),
    cuisine: String(recipe.cuisine || recipe.recipeCuisine || 'Source'),
    tags: normalizeStringArray(recipe.tags || recipe.keywords),
    appliances: normalizeStringArray(recipe.appliances).length ? normalizeStringArray(recipe.appliances) : ['Any'],
    effort: ['Low', 'Medium', 'High'].includes(recipe.effort) ? recipe.effort : 'Medium',
    time: String(recipe.time || recipe.totalTime || recipe.cookTime || 'See recipe'),
    image: String(recipe.image || recipe.imageUrl || recipe.thumbnail || ''),
    sourceId,
    sourceName,
    sourceUrl,
    youtubeUrl: recipe.youtubeUrl || recipe.videoUrl || undefined,
    instructions: normalizeStringArray(recipe.instructions || recipe.steps).length
      ? normalizeStringArray(recipe.instructions || recipe.steps)
      : ['Open the source recipe for full preparation details.'],
    ingredients: normalizeIngredients(recipe.ingredients || recipe.recipeIngredient),
  };
}

function normalizeCliOutput(parsed) {
  const rawRecipes = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.recipes) ? parsed.recipes : [];
  const warnings = Array.isArray(parsed?.warnings) ? parsed.warnings.map(String) : [];
  return {
    recipes: rawRecipes.map(normalizeRecipe).filter(Boolean),
    warnings,
    source: parsed?.source || 'recipe-pp-cli',
  };
}

async function loadMockFile() {
  if (!MOCK_FILE) return null;
  const raw = await readFile(MOCK_FILE, 'utf8');
  return normalizeCliOutput(JSON.parse(raw));
}

function runPrintedCli({ query, sources, limit }) {
  return new Promise((resolve, reject) => {
    const args = ['search', '--query', query, '--sources', sources, '--limit', String(limit), '--json'];
    const child = spawn(CLI, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
    });

    let stdout = '';
    let stderr = '';
    const timeout = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error(`Timed out after ${TIMEOUT_MS}ms running ${CLI}`));
    }, TIMEOUT_MS);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    child.on('close', (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        reject(new Error(`${CLI} exited ${code}: ${stderr || stdout}`));
        return;
      }

      try {
        resolve(normalizeCliOutput(JSON.parse(stdout)));
      } catch (error) {
        reject(new Error(`Could not parse ${CLI} JSON output: ${error}`));
      }
    });
  });
}

async function getRecipes(searchParams) {
  const query = searchParams.get('q') || 'chicken dinner';
  const sources = searchParams.get('sources') || DEFAULT_SOURCES;
  const limit = Math.min(Number(searchParams.get('limit') || 80), 200);
  const mock = await loadMockFile();

  if (mock) {
    return { ...mock, source: `mock:${MOCK_FILE}` };
  }

  return runPrintedCli({ query, sources, limit });
}

const server = createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://${HOST}:${PORT}`);

  if (url.pathname === '/health') {
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true, cli: CLI, mock: Boolean(MOCK_FILE) }));
    return;
  }

  if (url.pathname !== '/recipes/search') {
    res.writeHead(404, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: false, recipes: [], warnings: ['Not found'] }));
    return;
  }

  try {
    const result = await getRecipes(url.searchParams);
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true, ...result }));
  } catch (error) {
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    res.end(
      JSON.stringify({
        ok: false,
        recipes: [],
        warnings: [
          String(error),
          `Expected printed CLI command: ${CLI} search --query <terms> --sources <ids> --limit <n> --json`,
          'Set RECIPE_BRIDGE_MOCK_FILE=/path/to/export.json to test the UI before the printed CLI exists.',
        ],
        source: CLI,
      }),
    );
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Food Tinder recipe bridge listening at http://${HOST}:${PORT}`);
  console.log(`CLI: ${CLI}`);
  if (MOCK_FILE) console.log(`Mock file: ${MOCK_FILE}`);
});
