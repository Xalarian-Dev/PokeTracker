import fs from 'fs';

const content = fs.readFileSync('data/games.ts', 'utf8');

// Simple approach: search for 'bla' or 'w' in each line
const lines = content.split('\n');
const bwPokemon = new Set();
const blaOnly = [];
const wOnly = [];

lines.forEach(line => {
    // Match lines like: '123': ['game1', 'game2', ...],
    const match = line.match(/'(\d+)':\s*\[([^\]]+)\]/);
    if (match) {
        const id = match[1];
        const games = match[2];

        // Need exact match for 'bla' and 'w' as standalone game codes
        const gamesList = games.split(',').map(g => g.trim().replace(/'/g, ''));

        const hasBla = gamesList.includes('bla');
        const hasW = gamesList.includes('w');

        if (hasBla || hasW) {
            bwPokemon.add(id);

            if (hasBla && !hasW) {
                blaOnly.push(id);
            } else if (hasW && !hasBla) {
                wOnly.push(id);
            }
        }
    }
});

const sortedBW = Array.from(bwPokemon).map(Number).sort((a, b) => a - b);

console.log(`\n📊 Black/White Pokemon Analysis:`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`Total Pokemon in B/W: ${sortedBW.length}`);
console.log(`Expected (Unova Dex): 156`);
console.log(`Expected (National Dex obtainable): ~493`);
console.log(`\nBlack exclusives: ${blaOnly.length}`);
console.log(`White exclusives: ${wOnly.length}`);

if (blaOnly.length > 0 && blaOnly.length <= 50) {
    console.log(`\nBlack-only IDs: ${blaOnly.join(', ')}`);
}

if (wOnly.length > 0 && wOnly.length <= 50) {
    console.log(`\nWhite-only IDs: ${wOnly.join(', ')}`);
}

// Check for missing Pokemon in Gen 1-5 range
const missingGen15 = [];
for (let i = 1; i <= 649; i++) {
    if (!sortedBW.includes(i)) {
        missingGen15.push(i);
    }
}

if (missingGen15.length > 0) {
    console.log(`\n⚠️  Missing Pokemon (1-649): ${missingGen15.length}`);
    if (missingGen15.length <= 50) {
        console.log(`IDs: ${missingGen15.join(', ')}`);
    } else {
        console.log(`First 50 IDs: ${missingGen15.slice(0, 50).join(', ')}...`);
    }
} else {
    console.log(`\n✅ All Gen 1-5 Pokemon (1-649) are present!`);
}

// Check for unexpected Pokemon (Gen 6+)
const unexpectedPokemon = sortedBW.filter(id => id > 649);
if (unexpectedPokemon.length > 0) {
    console.log(`\n⚠️  Unexpected Pokemon (Gen 6+): ${unexpectedPokemon.length}`);
    console.log(`IDs: ${unexpectedPokemon.join(', ')}`);
}

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
