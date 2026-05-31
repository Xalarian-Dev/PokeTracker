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

export const changelogEN: ChangeLogEntry = {
    title: "What's New",
    date: "May 31, 2026",
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
    ],
    close: "Close"
};
