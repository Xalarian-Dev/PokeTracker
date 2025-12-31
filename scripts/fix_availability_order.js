import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../data/games.ts');

const GAME_GROUP_ORDER_KEYS = [
    'rb', 'ye', 'gs', 'c', 'rs', 'e', 'frlg', 'dp', 'pt', 'hgss', 'bw', 'bw2', 'xy', 'oras', 'sm', 'usum', 'lgpe', 'swsh', 'bdsp', 'la', 'sv', 'lza'
];

const GAME_GROUPS = {
    'rb': ['r', 'b'],
    'ye': ['ye'],
    'gs': ['g', 's'],
    'c': ['c'],
    'rs': ['ru', 'sa'],
    'e': ['e'],
    'frlg': ['fr', 'lg'],
    'dp': ['d', 'p'],
    'pt': ['pt'],
    'hgss': ['hg', 'ss'],
    'bw': ['bla', 'w'],
    'bw2': ['bla2', 'w2'],
    'xy': ['x', 'y'],
    'oras': ['or', 'as'],
    'sm': ['su', 'm'],
    'usum': ['us', 'um'],
    'lgpe': ['lgp', 'lge'],
    'swsh': ['sw', 'sh', 'swdlc1', 'shdlc1', 'swdlc2', 'shdlc2'],
    'bdsp': ['bd', 'sp'],
    'la': ['lpa'],
    'sv': ['sc', 'v', 'scdlc1', 'vdlc1', 'scdlc2', 'vdlc2'],
    'lza': ['lpza', 'lpzadlc1'],
};

// Flatten the game order
let EXPECTED_ORDER = [];
for (const key of GAME_GROUP_ORDER_KEYS) {
    EXPECTED_ORDER = EXPECTED_ORDER.concat(GAME_GROUPS[key]);
}

const fileContent = fs.readFileSync(filePath, 'utf8');
const lines = fileContent.split('\n');
let newLines = [];
let fixes = 0;
let errors = [];

// Track if we're inside POKEMON_AVAILABILITY
let insidePokemonAvailability = false;

for (let line of lines) {

    // Check if we're entering POKEMON_AVAILABILITY
    if (line.includes('export const POKEMON_AVAILABILITY')) {
        insidePokemonAvailability = true;
        newLines.push(line);
        continue;
    }

    // Check if we're exiting POKEMON_AVAILABILITY (next export const or closing brace at start of line)
    if (insidePokemonAvailability && (line.match(/^export const [A-Z_]+/) || line.match(/^};/))) {
        insidePokemonAvailability = false;
        newLines.push(line);
        continue;
    }

    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//')) {
        newLines.push(line);
        continue;
    }

    // Only process lines if we're inside POKEMON_AVAILABILITY
    if (!insidePokemonAvailability) {
        newLines.push(line);
        continue;
    }

    // Regex to match 'id': ['game1', 'game2'],
    const match = trimmed.match(/^(\s*)'([^']+)'\s*:\s*\[(.*)\](.*)$/);
    if (!match) {
        newLines.push(line);
        continue;
    }

    const indentation = match[1];
    const id = match[2];
    const gamesRaw = match[3];
    const endStuff = match[4];

    const games = gamesRaw.split(',').map(s => s.trim().replace(/'/g, '')).filter(s => s.length > 0);

    // Safety check: Don't touch if any unknown games
    const unknownGames = games.filter(g => !EXPECTED_ORDER.includes(g));
    if (unknownGames.length > 0) {
        errors.push(`ID ${id}: Skipped due to unknown games: ${unknownGames.join(', ')}`);
        newLines.push(line);
        continue;
    }

    // Sort
    const sortedGames = [...games].sort((a, b) => {
        return EXPECTED_ORDER.indexOf(a) - EXPECTED_ORDER.indexOf(b);
    });

    // Check if changed
    let changed = false;
    for (let i = 0; i < games.length; i++) {
        if (games[i] !== sortedGames[i]) {
            changed = true;
            break;
        }
    }

    if (changed) {
        const newContent = sortedGames.map(g => `'${g}'`).join(', ');
        newLines.push(`${indentation}'${id}': [${newContent}]${endStuff}`);
        fixes++;
    } else {
        newLines.push(line);
    }
}

if (errors.length > 0) {
    console.log(`\nFound ${errors.length} lines with errors (skipped):`);
    errors.forEach(e => console.log(e));
} else {
    console.log("\nNo errors found during processing.");
}

console.log(`Fixed ${fixes} lines.`);

fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
