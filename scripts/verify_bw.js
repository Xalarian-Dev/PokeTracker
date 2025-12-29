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

// Pokemon DIRECTLY catchable in B/W (from psypokes.com)
// This does NOT include pre-evolutions obtainable via breeding
const directlyCatchable = [
    // Gen 1
    54, 55, 56, 57, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71,
    74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 90, 91,
    92, 93, 94, 95, 98, 99, 102, 103, 104, 105, 106, 107, 108, 111,
    112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 124, 125, 126,
    127, 129, 130, 131, 132, 137, 138, 139, 140, 141, 142, 143, 147,
    148, 149,

    // Gen 2
    163, 164, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183,
    184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196,
    197, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212,
    213, 214, 215, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229,
    230, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 246, 247,
    248,

    // Gen 3
    263, 264, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280,
    281, 282, 287, 288, 289, 293, 294, 295, 296, 297, 298, 299, 300,
    301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313,
    314, 315, 316, 317, 318, 319, 320, 321, 322, 323, 324, 325, 326,
    327, 328, 329, 330, 331, 332, 333, 334, 335, 336, 337, 338, 339,
    340, 341, 342, 343, 344, 345, 346, 347, 348, 349, 350, 351, 352,
    353, 354, 355, 356, 357, 358, 359, 360, 361, 362, 363, 364, 365,
    366, 367, 368, 369, 370, 371, 372, 373, 374, 375, 376,

    // Gen 4
    403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415,
    416, 417, 418, 419, 420, 421, 422, 423, 424, 425, 426, 427, 428,
    429, 430, 431, 432, 433, 434, 435, 436, 437, 438, 439, 440, 441,
    442, 443, 444, 445, 446, 447, 448, 449, 450, 451, 452, 453, 454,
    455, 456, 457, 458, 459, 460, 461, 462, 463, 464, 465, 466, 467,
    468, 469, 470, 471, 472, 473, 474, 475, 476, 477, 478, 479,

    // Gen 5 (all)
    ...Array.from({ length: 156 }, (_, i) => i + 494),
];

// Evolutionary families where at least one member is directly catchable
// We need to include the whole family
const evolutionaryFamilies = {
    // Caterpie line: Metapod (11) is catchable in White
    10: [10, 11, 12], // Caterpie, Metapod, Butterfree

    // Weedle line: Kakuna (14) is catchable in Black
    13: [13, 14, 15], // Weedle, Kakuna, Beedrill

    // Pidgey line: Pidgeotto (17), Pidgeot (18) catchable
    16: [16, 17, 18], // Pidgey, Pidgeotto, Pidgeot

    // Rattata line: Raticate (20) catchable
    19: [19, 20], // Rattata, Raticate

    // Spearow line: Fearow (22) catchable
    21: [21, 22], // Spearow, Fearow

    // Ekans line: NOT catchable (transfer only)
    // Sandshrew line: NOT catchable

    // Nidoran lines: NOT catchable

    // Clefairy line: NOT catchable

    // Vulpix line: NOT catchable

    // Oddish line: Gloom (44), Vileplume (45), Bellossom (182) catchable
    43: [43, 44, 45, 182], // Oddish, Gloom, Vileplume, Bellossom

    // Paras line: Parasect (47) catchable
    46: [46, 47], // Paras, Parasect

    // Venonat line: Venomoth (49) catchable
    48: [48, 49], // Venonat, Venomoth

    // Meowth line: NOT catchable

    // Psyduck line: catchable (54, 55)

    // Mankey line: catchable (56, 57)

    // Poliwag line: catchable (60, 61, 62, 186)

    // Abra line: catchable (63, 64, 65)

    // Machop line: catchable (66, 67, 68)

    // Bellsprout line: catchable (69, 70, 71)

    // Tentacool line: NOT catchable

    // Geodude line: catchable (74, 75, 76)

    // Ponyta line: catchable (77, 78)

    // Slowpoke line: catchable (79, 80, 199)

    // Magnemite line: catchable (81, 82, 462)

    // Farfetch'd: catchable (83)

    // Doduo line: catchable (84, 85)

    // Seel line: catchable (86, 87)

    // Grimer line: NOT catchable

    // Shellder line: catchable (90, 91)

    // Gastly line: catchable (92, 93, 94)

    // Onix line: catchable (95, 208)

    // Drowzee line: NOT catchable

    // Krabby line: catchable (98, 99)

    // Voltorb line: NOT catchable

    // Exeggcute line: catchable (102, 103)

    // Cubone line: catchable (104, 105)

    // Hitmonlee/Hitmonchan/Hitmontop: catchable (106, 107, 237)

    // Lickitung line: catchable (108, 463)

    // Koffing line: NOT catchable

    // Rhyhorn line: catchable (111, 112, 464)

    // Chansey line: catchable (113, 242, 440)

    // Tangela line: catchable (114, 465)

    // Kangaskhan: catchable (115)

    // Horsea line: catchable (116, 117, 230)

    // Goldeen line: catchable (118, 119)

    // Staryu line: catchable (120, 121)

    // Mr. Mime: NOT catchable

    // Scyther line: NOT catchable

    // Jynx line: catchable (124, 238)

    // Electabuzz line: catchable (125, 239, 466)

    // Magmar line: catchable (126, 240, 467)

    // Pinsir: catchable (127)

    // Tauros: NOT catchable

    // Magikarp line: catchable (129, 130)

    // Lapras: catchable (131)

    // Ditto: catchable (132)

    // Eevee line: NOT catchable

    // Porygon line: catchable (137, 233, 474)

    // Omanyte line: catchable (138, 139)

    // Kabuto line: catchable (140, 141)

    // Aerodactyl: catchable (142)

    // Snorlax: catchable (143, 446)

    // Articuno/Zapdos/Moltres: NOT catchable

    // Dratini line: catchable (147, 148, 149)

    // Mewtwo/Mew: NOT catchable
};

// Build complete list of obtainable Pokemon (inclusive policy)
const obtainableInBW = new Set([...directlyCatchable]);

// Add all evolutionary family members
Object.values(evolutionaryFamilies).forEach(family => {
    family.forEach(id => obtainableInBW.add(id));
});

console.log('\n📊 Black/White Pokemon Verification (INCLUSIVE policy):');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

console.log(`\nTotal Pokemon in data: ${bwPokemon.size}`);
console.log(`Expected obtainable (with breeding): ~${obtainableInBW.size}`);

// Check current status
const inDataAndObtainable = Array.from(bwPokemon).filter(id => obtainableInBW.has(id));
const inDataButNotObtainable = Array.from(bwPokemon).filter(id => !obtainableInBW.has(id));
const obtainableButNotInData = Array.from(obtainableInBW).filter(id => !bwPokemon.has(id));

console.log(`\n✅ Correctly included: ${inDataAndObtainable.length}`);

if (inDataButNotObtainable.length > 0) {
    console.log(`\n⚠️  In data but NOT obtainable: ${inDataButNotObtainable.length}`);
    if (inDataButNotObtainable.length <= 30) {
        console.log(`IDs: ${inDataButNotObtainable.sort((a, b) => a - b).join(', ')}`);
    }
}

if (obtainableButNotInData.length > 0) {
    console.log(`\n⚠️  Obtainable but NOT in data: ${obtainableButNotInData.length}`);
    if (obtainableButNotInData.length <= 30) {
        console.log(`IDs: ${obtainableButNotInData.sort((a, b) => a - b).join(', ')}`);
    }
}

console.log('\n📝 Note: This verification uses an INCLUSIVE policy');
console.log('   (breeding allowed if any family member is catchable)');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
