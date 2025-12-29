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

console.log(`Expected Master Order: ${EXPECTED_ORDER.join(', ')}`);

const fileContent = fs.readFileSync(filePath, 'utf8');

const linesAll = fileContent.split('\n');
let inBlock = false;
let availabilityLines = [];

for (const line of linesAll) {
    if (line.includes('export const POKEMON_AVAILABILITY: Record<string, string[]> = {')) {
        inBlock = true;
        continue;
    }
    if (inBlock) {
        if (line.trim() === '};') {
            break;
        }
        availabilityLines.push(line);
    }
}

console.log(`Found ${availabilityLines.length} lines in block.`);
const lines = availabilityLines;

console.log(`First 5 lines:`, lines.slice(0, 5));

let errors = [];
let checked = 0;

lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//')) return;

    // Relaxed Regex
    const match = trimmed.match(/'([^']+)'\s*:\s*\[(.*)\]/);
    if (!match) {
        if (index < 5 && trimmed.length > 5) console.log(`No match for line: ${trimmed}`);
        return;
    }

    const id = match[1];
    const gamesRaw = match[2];
    const games = gamesRaw.split(',').map(s => s.trim().replace(/'/g, '')).filter(s => s.length > 0);

    checked++;

    if (games.length === 0) return;

    // Verify order
    // We filter the EXPECTED_ORDER to only include games that are in the 'games' array
    // Then we compare the arrays.

    // First, check if all games in 'games' are known
    const unknownGames = games.filter(g => !EXPECTED_ORDER.includes(g));
    if (unknownGames.length > 0) {
        errors.push(`ID ${id}: Contains unknown games: ${unknownGames.join(', ')}`);
        return;
    }

    const expectedSequence = EXPECTED_ORDER.filter(g => games.includes(g));

    // Check lengths match (should be true if no unknown games and no duplicates)
    if (expectedSequence.length !== games.length) {
        // Maybe duplicates in 'games'?
        const uniqueGames = new Set(games);
        if (uniqueGames.size !== games.length) {
            errors.push(`ID ${id}: Contains duplicate games.`);
        } else {
            // Should not happen if all valid
            errors.push(`ID ${id}: Length mismatch between expected and actual (Implementation error?). Expected ${expectedSequence.length} vs ${games.length}`);
        }
        return;
    }

    // Compare element by element
    let isOrdered = true;
    for (let i = 0; i < games.length; i++) {
        if (games[i] !== expectedSequence[i]) {
            isOrdered = false;
            break;
        }
    }

    if (!isOrdered) {
        errors.push(`ID ${id}: Order Incorrect.\n  Actual:   ${games.join(', ')}\n  Expected: ${expectedSequence.join(', ')}`);
    }
});

console.log(`Checked ${checked} entries.`);

if (errors.length > 0) {
    console.log(`Found ${errors.length} errors:`);
    errors.forEach(e => console.log(e));
} else {
    console.log("All entries are correctly ordered according to GAME_GROUP_MAP.");
}
