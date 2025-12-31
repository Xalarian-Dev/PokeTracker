// Component Usage Analysis

const components = [
    'CircularProgress.tsx',
    'ConfirmationModal.tsx',
    'CookieConsent.tsx',
    'DataExport.tsx',
    'Footer.tsx',
    'Header.tsx',
    'Icons.tsx',
    'LanguageSelector.tsx',
    'LeftSidebar.tsx',
    'MobilePokemonCard.tsx',
    'PokemonCard.tsx',
    'PrivacyPolicy.tsx',
    'ProfilePage.tsx',
    'ScrollToTopButton.tsx',
    'SearchBarWithProgress.tsx',
    'ShinyTracker.tsx',
    'TermsOfService.tsx'
];

// Imports found in App.tsx and other files:
const usedComponents = [
    'ShinyTracker',      // App.tsx
    'ProfilePage',       // App.tsx
    'CookieConsent',     // App.tsx
    'Footer',            // App.tsx
    'PrivacyPolicy',     // App.tsx
    'TermsOfService'     // App.tsx
];

// Components that need to be checked for usage:
const toCheck = [
    'CircularProgress',
    'ConfirmationModal',
    'DataExport',
    'Header',
    'Icons',
    'LanguageSelector',
    'LeftSidebar',
    'MobilePokemonCard',
    'PokemonCard',
    'ScrollToTopButton',
    'SearchBarWithProgress'
];

console.log('Components to verify usage:');
toCheck.forEach(c => console.log(`  - ${c}`));
