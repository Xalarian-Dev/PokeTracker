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
    date: "March 14, 2026",
    sectionTitle: "Spanish Support & Quality of Life Improvements",
    features: "New Features",
    featuresList: [
        "Spanish language: Full Spanish translation added across the entire application (UI, games, forms, legal pages, SEO)",
        "Error boundary: The app now gracefully handles unexpected errors with a retry option instead of a blank screen",
        "Passive scroll listener: Improved scrolling performance on all devices",
    ],
    security: "Security Improvements",
    securityList: [
        "API CORS: Restricted API access to the production domain only (was open to all origins)",
        "Auth token: Replaced unsafe global window token storage with a secure module-scoped store",
        "Removed legacy password hash field from user data types",
    ],
    technical: "Technical Improvements",
    technicalList: [
        "Refactored ShinyTracker (850+ lines) into focused hooks and components for better maintainability",
        "Centralized API authentication into a single shared module (removed duplicate code)",
        "Removed 50+ debug console.log calls and deleted unused legacy auth service",
        "Removed duplicate mobile detection hook and fixed TypeScript @ts-ignore directives",
    ],
    close: "Close"
};
