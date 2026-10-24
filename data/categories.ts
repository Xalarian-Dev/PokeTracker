// Listes fixes (numéros du Pokédex national) pour le bloc « Spécial » des statistiques.
// Les formes régionales ne sont pas listées ici : elles se repèrent au champ `region` du Pokémon.

const range = (from: number, to: number): string[] =>
  Array.from({ length: to - from + 1 }, (_, i) => String(from + i));

// Starters : les 3 stades de chaque famille de départ, de la génération 1 à 9.
export const STARTER_IDS: string[] = [
  1, 152, 252, 387, 495, 650, 722, 810, 906,
].flatMap((first) => range(first, first + 8));

// Fabuleux.
export const MYTHICAL_IDS: string[] = [
  151, 251, 385, 386, 489, 490, 491, 492, 493, 494, 647, 648, 649,
  719, 720, 721, 801, 802, 807, 808, 809, 893, 1025,
].map(String);

// Légendaires et sous-légendaires, sans les fabuleux (qui ont leur propre ligne).
// Les Ultra-Chimères ne sont pas comptées.
export const LEGENDARY_IDS: string[] = [
  144, 145, 146, 150,
  243, 244, 245, 249, 250,
  ...range(377, 384).map(Number),
  ...range(480, 488).map(Number),
  ...range(638, 646).map(Number),
  716, 717, 718,
  772, 773, ...range(785, 792).map(Number), 800,
  888, 889, 890, 891, 892, 894, 895, 896, 897, 898, 905,
  1001, 1002, 1003, 1004, 1007, 1008, 1014, 1015, 1016, 1017, 1024,
].map(String);
