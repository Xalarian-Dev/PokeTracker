export const clerkAppearance = {
    baseTheme: {
        dark: true,
    },
    variables: {
        colorPrimary: '#4f46e5', // indigo-600
        colorBackground: '#111827', // gray-900
        colorInputBackground: '#1f2937', // gray-800
        colorInputText: '#ffffff',
        colorText: '#ffffff',
        colorTextSecondary: '#9ca3af', // gray-400
        colorDanger: '#ef4444', // red-500
        colorSuccess: '#10b981', // green-500
        borderRadius: '0.75rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    elements: {
        // Modal container
        rootBox: 'shadow-2xl',
        card: 'bg-gray-800 shadow-2xl border border-gray-700 rounded-xl',

        // Header
        headerTitle: 'text-white font-bold text-2xl',
        headerSubtitle: 'text-gray-400 text-sm',

        // Social buttons (Discord, Google, etc.)
        socialButtonsBlockButton:
            'bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white font-medium transition-all duration-200 hover:scale-[1.02] shadow-md',
        socialButtonsBlockButtonText: 'text-white font-medium',

        // Primary action button
        formButtonPrimary:
            'bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg hover:shadow-indigo-500/50 transition-all duration-200 hover:scale-[1.02]',

        // Input fields
        formFieldInput:
            'bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20',
        formFieldLabel: 'text-gray-300 font-medium',

        // Links
        footerActionLink: 'text-indigo-400 hover:text-indigo-300 font-medium',
        identityPreviewEditButton: 'text-indigo-400 hover:text-indigo-300',

        // Divider
        dividerLine: 'bg-gray-700',
        dividerText: 'text-gray-500',

        // Other elements
        identityPreviewText: 'text-white',
        formFieldSuccessText: 'text-green-400',
        formFieldErrorText: 'text-red-400',
        alertText: 'text-gray-300',
    },
};

export const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
    throw new Error('Missing Clerk Publishable Key. Please add VITE_CLERK_PUBLISHABLE_KEY to your .env.local file');
}
