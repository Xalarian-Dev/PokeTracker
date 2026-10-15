// Contrôles de format des valeurs reçues par l'API (ticket #8).
// Identifiants Pokémon / formes : "25", "128-paldea-aqua", "111-female"...
const ID_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/i;
const GAME_REGEX = /^[a-z0-9_-]{1,20}$/i;

export const MAX_ID_LENGTH = 40;
export const MAX_DISPLAY_NAME_LENGTH = 50;
export const MAX_OWNED_GAMES = 100;

export function isValidPokemonId(value: unknown): value is string {
    return typeof value === 'string' && value.length <= MAX_ID_LENGTH && ID_REGEX.test(value);
}

export function isValidDisplayName(value: unknown): boolean {
    return value === undefined || value === null || value === ''
        || (typeof value === 'string' && value.length <= MAX_DISPLAY_NAME_LENGTH && !/[<>\u0000-\u001f]/.test(value));
}

export function isValidOwnedGames(value: unknown): value is string[] {
    return Array.isArray(value) && value.length <= MAX_OWNED_GAMES
        && value.every(g => typeof g === 'string' && GAME_REGEX.test(g));
}
