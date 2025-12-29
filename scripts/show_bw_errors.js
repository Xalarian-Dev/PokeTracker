import fs from 'fs';

const content = fs.readFileSync('data/games.ts', 'utf8');

// Extract B/W Pokemon
const lines = content.split('\n');
const bwPokemon = new Set();

lines.forEach(line => {
    const match = line.match(/'(\d+)':\s*\[([^\]]+)\]/);
    if (match) {
        const id = parseInt(match[1]);
        const games = match[2];
        const gamesList = games.split(',').map(g => g.trim().replace(/'/g, ''));

        if (gamesList.includes('bla') || gamesList.includes('w')) {
            bwPokemon.add(id);
        }
    }
});

// Show full lists
const sortedBW = Array.from(bwPokemon).sort((a, b) => a - b);

console.log('\n📊 Black/White Pokemon - Complete Analysis:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

console.log(`\nTotal Pokemon: ${sortedBW.length}`);

// Show all incorrectly included (transfer-only)
const transferOnly = [
    // All starters
    1, 2, 3, 4, 5, 6, 7, 8, 9,
    152, 153, 154, 155, 156, 157, 158, 159, 160,
    252, 253, 254, 255, 256, 257, 258, 259, 260,
    387, 388, 389, 390, 391, 392, 393, 394, 395,

    // Caterpie line, Weedle line, Pidgey line, Rattata line, Spearow line, etc.
    10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
    26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41,
    42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 58, 59, 72, 73,
    88, 89, 96, 97, 100, 101, 109, 110, 122, 123, 128, 133, 134, 135,
    136, 144, 145, 146, 150, 151,

    161, 162, 165, 166, 167, 168, 169, 170, 171, 198, 199, 200, 216,
    217, 218, 219, 231, 232, 243, 244, 245, 249, 250, 251,

    261, 262, 265, 266, 267, 268, 269, 285, 286, 290, 291, 292, 377,
    378, 379, 380, 381, 382, 383, 384, 385, 386,

    396, 397, 398, 399, 400, 401, 402, 480, 481, 482, 483, 484, 485,
    486, 487, 488, 489, 490, 491, 492, 493,
];

const incorrectlyIncluded = sortedBW.filter(id => transferOnly.includes(id));

if (incorrectlyIncluded.length > 0) {
    console.log(`\n❌ INCORRECTLY INCLUDED (${incorrectlyIncluded.length} Pokemon):`);
    console.log(`These should be transfer-only:`);
    console.log(incorrectlyIncluded.join(', '));
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
