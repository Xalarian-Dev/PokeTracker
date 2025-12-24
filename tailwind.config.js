/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Variables shadcn (adaptées au thème Pokémon)
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                // Palette Pokémon personnalisée (on garde pour compatibilité)
                'poke-yellow': {
                    DEFAULT: '#facc15', // yellow-400
                    light: '#fde047',   // yellow-300
                    dark: '#eab308',    // yellow-500
                },
                'poke-red': {
                    DEFAULT: '#dc2626', // red-600
                    light: '#ef4444',   // red-500
                    dark: '#b91c1c',    // red-700
                },
                'poke-indigo': {
                    DEFAULT: '#4f46e5', // indigo-600
                    light: '#6366f1',   // indigo-500
                    dark: '#4338ca',    // indigo-700
                },
                'poke-purple': {
                    DEFAULT: '#9333ea', // purple-600
                    light: '#a855f7',   // purple-500
                },
                'poke-pink': {
                    DEFAULT: '#ec4899', // pink-500
                    light: '#f472b6',   // pink-400
                },
                // Grays standardisés
                'dark': {
                    900: '#111827',  // gray-900
                    800: '#1f2937',  // gray-800
                    700: '#374151',  // gray-700
                    600: '#4b5563',  // gray-600
                    500: '#6b7280',  // gray-500
                    400: '#9ca3af',  // gray-400
                    300: '#d1d5db',  // gray-300
                }
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
}
