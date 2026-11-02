export interface ChangeLogEntry {
    title: string;
    date: string;
    sectionTitle: string;
    features: string;
    featuresList: string[];
    security?: string;
    securityList?: string[];
    technical?: string;
    technicalList?: string[];
    close: string;
}

/** Entrée de juin 2026 (conservée telle quelle) */
const changelogEN_juin2026: ChangeLogEntry = {
    title: "What's New",
    date: "June 16, 2026",
    sectionTitle: "Community Features, Public Profiles & DLC Filter",
    features: "New Features",
    featuresList: [
        "Trainer ID: choose a unique, permanent identifier at first login — used in your public profile URL (/u/your-id) and shown in the header",
        "Public profiles: visit any trainer's page to browse their full shiny collection, stats, completion percentage and favourite forms",
        "Community feed: a live right-side panel shows recent shiny captures from all trainers in real time — click any entry to visit their profile",
        "DLC filter: when selecting Sword/Shield, Scarlet/Violet or Legends Z-A, DLC toggles appear below the game filter — highlighted when shown, gray when hidden",
        "Forms on mobile: multi-form Pokémon (Rotom, Arceus, Vivillon…) now have a '+' button on mobile cards, opening the full forms modal",
        "Shiny lock badge on mobile: a lock icon now appears on mobile cards for shiny-locked Pokémon",
        "Mark All / Unmark All available on mobile: bulk actions are no longer desktop-only",
        "Profile page redesign: fully reworked to match the app's dark theme — game chips replace checkboxes, yellow accents, consistent layout",
        "Profile page now has its own URL (/profile): browser back/forward buttons work correctly and the page is bookmarkable",
    ],
    technical: "Fixes & Improvements",
    technicalList: [
        "Fixed iOS viewport zoom triggered by inputs with font-size below 16px (search bar, feedback form, profile)",
        "Fixed sidebar toggle being unreachable while the sidebar was open (z-index conflict with the backdrop)",
        "Fixed scroll-to-top button never appearing on mobile (was listening to window scroll instead of the inner container)",
        "Fixed ProfilePage sliding under the fixed header on mobile — content now clears the 64px header",
        "Fixed flash of desktop cards on mobile first render (useIsMobile now initialises synchronously)",
        "Fixed CookieConsent and FormsModal ignoring iOS safe-area insets (notch, Dynamic Island, home indicator)",
        "Removed nested scroll traps in sidebar game list and profile owned-games grid",
        "Sprite caching: service worker now caches all Pokémon sprites after first load — instant on repeat visits",
        "Added decoding='async' to all sprite images to reduce main-thread jank while scrolling",
        "Sidebar tab buttons, FilterChips and other touch targets enlarged to meet the 44px minimum",
        "Fixed all pre-existing TypeScript errors (missing @types/react, import.meta.env, class component types)",
        "Community feed: fixed duplicate entries and stuck/stale captures, raised the per-trainer limit to 3 recent catches, and the panel now shows up to 40 entries",
    ],
    close: "Close"
};

/** Entrées du journal « Nouveautés », de la plus récente à la plus ancienne */
export const changelogEN: ChangeLogEntry[] = [
    {
        title: "What's New",
        date: "November 1, 2026",
        sectionTitle: "New Address, New Look & Hunt Page",
        features: "New Features",
        featuresList: [
            "New address: PokeTracker now lives at pokemonshinytracker.com. Remember to update your bookmarks: the old address will stop redirecting in a few months. Your account and data are unchanged",
            "One address per language: the site opens at /fr/, /en/, /es/ or /jp/. Switching language changes the address, and a shared link opens straight in the right language",
            "New look: a night theme with golden touches, an animated home page, and shiny cards that sparkle when you mark them",
            "Home page: an introduction to the site for new visitors. The “Shiny Tracker” button always takes you back to it; logging in from the home page takes you straight to your collection",
            "“Hunt” page: roll a random target or pick one, count your encounters, then save your catch with the game used and the number of encounters",
            "Statistics and profile: more detailed progress (by generation, by game, legendaries, regional forms…) and a fuller profile",
            "Community: a wider page that also shows the game and the number of encounters for each catch",
            "Redesigned navigation and filters: a menu in the header (a bottom bar on mobile) and a filter bar that's always within reach",
            "Icon legend: a button explains what the icons on the cards mean",
            "On mobile: easier-to-read cards, now with the info icons and the favorite form",
        ],
        security: "Security & Privacy",
        securityList: [
            "Legal notice and privacy policy updated: your data is now hosted on our own server (OVH, in Europe), no longer with Supabase and Vercel",
            "“Delete my data” now also erases your Pokémon forms and your community feed entries",
        ],
        technical: "Fixes & Improvements",
        technicalList: [
            "Many small interface fixes: cookie banner, contrast, clearer error messages, page not found, forms window",
            "Technical updates behind the scenes, for security and reliability",
        ],
        close: "Close"
    },
    changelogEN_juin2026,
];
