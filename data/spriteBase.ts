/**
 * Dossier des sprites « HOME » des Pokémon (…/<numéro>.png et …/shiny/<numéro>.png).
 * En production, ils sont servis par notre propre serveur (/sprites/, avec cache) ; en développement,
 * directement depuis le dépôt PokeAPI. Voir server/sprites.ts.
 */
export const SPRITE_BASE = import.meta.env.PROD
    ? '/sprites/'
    : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/';
