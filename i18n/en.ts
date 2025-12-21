
import { POKEMON_LIST } from '../data/pokemon';
import { GAME_LIST } from '../data/games';

export const ui = {
    loading: "Loading...",
    welcome_trainer: "Welcome, Trainer!",
    login_prompt: "Enter your name to start your shiny hunt.",
    username_placeholder: "Ash from Pallet Town",
    start_hunt: "Start the Hunt",
    disclaimer: "Note: This is a simulation. Your progress is saved locally in your browser and is not stored on a server.",
    trainer: "Trainer",
    logout: "Logout",
    shiny_tracker_title: "Shiny Tracker",
    shinydex_progress: "Your ShinyDex Progress",
    shiny_pokemon_caught: "shiny Pokémon caught",
    search_placeholder: "Search by name or #...",
    show_only_shiny: "Show only shiny",
    show_missing_shiny: "Show missing shiny",
    hide_regional_forms: "Hide regional forms",
    all_generations: "All",
    generation_short: "Gen",
    filter_by_game: "Filter by game availability:",
    no_pokemon_found: "No Pokémon match your search.",
    trainer_data_loading: "Loading trainer data...",
    pokemon_shown: "Showing {count} Pokémon",
    collapse_filters: "Collapse filters",
    expand_filters: "Expand filters",
    regions: {
        'Alola': 'Alola',
        'Galar': 'Galar',
        'Hisui': 'Hisui',
        'Paldea': 'Paldea',
    }
};

export const games: Record<string, string> = GAME_LIST;

export const pokemon: Record<string, string> = POKEMON_LIST.reduce((acc, p) => {
    acc[p.id.toString()] = p.name;
    return acc;
}, {} as Record<string, string>);