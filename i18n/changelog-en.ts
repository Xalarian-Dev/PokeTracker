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
    date: "January 15, 2026",
    sectionTitle: "Pokemon Forms Management 🎨",
    features: "New Features",
    featuresList: [
        "Multiple Forms: All Pokémon with multiple forms now accessible via a modal (Furfrou, Oricorio, Tauros, Rotom, Lycanroc, Toxtricity, Basculin, Shellos/Gastrodon, Burmy/Wormadam, Deerling/Sawsbuck, Flabébé/Floette/Florges, Unown, Sinistea/Polteageist, Poltchageist/Sinistcha, Maushold, Squawkabilly, Dudunsparce, Tatsugiri, Alcremie, and all gender forms)",
        "Shiny Toggle per Form: Each form can be marked as shiny independently",
        "Favorite Form: Select which form to display in the main list with the ❤️ icon",
        "Data Persistence: Shiny and favorite forms are saved in the database",
        "Translations: Form names translated in French, English, and Japanese"
    ],
    close: "Close"
};
