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
        sectionTitle: "Statistics, Icon Legend & Interface Fixes",
        features: "New Features",
        featuresList: [
            "New address: PokeTracker now lives at pokemonshinytracker.com. The old address (pokemonshinytracker.vercel.app) redirects automatically to the new one; remember to update your bookmarks. Your account and data are unchanged",
            "\"Hunt\" page: searching for a Pokémon now comes first, followed by the \"Random Hunt\" button",
            "Home page: when you arrive on the site, an introduction (3-step overview, features, live community activity) with sign-up and log-in buttons. The collection now lives at /collection; once logged in, you land straight on it",
            "Community: the page now uses the full width on desktop, with large cards that also show the game used and the number of encounters for catches made from the Hunt page",
            "\"Hunt\" page: search is keyboard-navigable (↑ ↓ Enter) and also lists already-caught Pokémon (\"Already caught\"); picking one shows its saved game and encounters, which you can edit. The star animation replays each time you pick a target",
            "\"Hunt\" page: roll a random target or pick one yourself, choose the game used, count your encounters (+ / − buttons, direct input or keyboard: +, −, arrows, Space), then \"Caught!\" saves the shiny with its game and number of encounters. Your current hunt is kept if you reload the page",
            "Statistics: the page now uses the full width on desktop, with larger blocks; compact header (icons only) on medium screens so it no longer overlaps the trainer name; \"Random Hunt\" becomes \"Hunt\" in the menu",
            "New navigation: the side tabs are replaced by a menu in the header (Collection, Statistics, Community, Random Hunt) and by a bottom navigation bar on mobile; each page has its own address (/stats, /communaute, /chasse)",
            "Filters: a fixed bar under the header groups search, generation, game and \"missing / shiny only\"; \"All filters\" opens the full list; active filters are shown, can be removed with one click, with \"Reset all\"",
            "\"Report a problem\" is now in the footer",
            "Statistics: new progress blocks by generation, by game, \"Special\" (starters, legendaries, mythicals) and regional forms",
            "Icon legend: a \"Legend\" button explains the icons on the cards, grouped by generation and adapted to the selected game or generation",
            "Info icons (DLC, Shiny Lock, event, raid…) now also appear on mobile cards (3 at most)",
            "Favorite form is now available on mobile, like on desktop",
            "Search: a button clears the typed text",
            "Page not found: a real 404 page with a link back to the collection, instead of the silent redirect",
            "Community feed: limit of 3 entries per player enforced, removing a shiny also removes it from the feed, account ID hidden from visitors",
            "Mobile: 4 cards per row, larger text and an easier-to-tap \"+\" button",
        ],
        security: "Security & Privacy",
        securityList: [
            "\"Delete my data\" now also erases your Pokémon forms and your community feed entries",
            "Invalid IDs, usernames and game lists are rejected; vulnerable dependencies updated",
        ],
        technical: "Fixes & Improvements",
        technicalList: [
            "The cookie banner no longer blocks the page",
            "Stronger contrast (\"+\" button, red and indigo buttons, game filters) and no text below 12 px anymore",
            "Visible errors: on-screen messages replace browser dialogs (export, expired session, profile saving); the local data sync prompt used to show a key name instead of text",
            "Forms window: closes with Esc, texts translated in all four languages",
            "Profile: no more automatic return to the home page after saving; public profile: Pokémon names visible and the card is kept when an image is missing",
            "Reduced animations when your system asks for it",
            "Technical updates: Tailwind 4, Vite 8, Clerk 6, lucide icons 1.61, Node 24 server functions",
        ],
        close: "Close"
    },
    changelogEN_juin2026,
];
