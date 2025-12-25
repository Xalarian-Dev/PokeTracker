import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getGdprTranslations } from '../i18n/gdpr-index';
import { getUserPreferences, fetchShinyPokemon } from '../services/supabase';

export const DataExport: React.FC = () => {
    const { user } = useUser();
    const { language } = useLanguage();
    const t = getGdprTranslations(language as 'fr' | 'en' | 'jp');
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);

        try {
            // Gather all user data
            const userData: any = {
                exportDate: new Date().toISOString(),
                exportVersion: '1.0',
                account: {
                    email: user?.primaryEmailAddress?.emailAddress || 'Guest',
                    username: user?.username || user?.firstName || 'Guest',
                    userId: user?.id || 'guest',
                    createdAt: user?.createdAt || null,
                },
                shinyPokemon: {
                    // Get from localStorage (guest mode or cached data)
                    localStorage: (() => {
                        const keys = Object.keys(localStorage).filter(key => key.startsWith('shinyTrackerData_'));
                        const data: Record<string, any> = {};
                        keys.forEach(key => {
                            try {
                                data[key] = JSON.parse(localStorage.getItem(key) || '{}');
                            } catch {
                                data[key] = localStorage.getItem(key);
                            }
                        });
                        return data;
                    })(),
                },
                preferences: {
                    language: localStorage.getItem('shinyTrackerLang') || language,
                    displayName: localStorage.getItem('displayName') || null,
                },
                cookies: {
                    cookieConsent: localStorage.getItem('poketracker_cookie_consent') || 'not_set',
                },
            };

            // If user is logged in, fetch data from Supabase
            if (user?.id) {
                try {
                    // Fetch shiny Pokemon from Supabase
                    const shinyPokemonSet = await fetchShinyPokemon(user.id);
                    userData.shinyPokemon.supabase = Array.from(shinyPokemonSet);

                    // Fetch user preferences from Supabase
                    const preferences = await getUserPreferences(user.id);
                    if (preferences) {
                        userData.preferences.supabase = {
                            preferredLanguage: preferences.preferred_language,
                            ownedGames: preferences.owned_games,
                            displayName: preferences.display_name,
                        };
                    }
                } catch (error) {
                    console.error('Error fetching Supabase data:', error);
                    userData.supabase_error = 'Failed to fetch some data from Supabase';
                }
            }

            // Create JSON blob
            const jsonString = JSON.stringify(userData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });

            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${t.export_filename}-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            // Success feedback
            setTimeout(() => {
                alert(t.export_data_success);
                setIsExporting(false);
            }, 500);
        } catch (error) {
            console.error('Export error:', error);
            alert(t.export_data_error);
            setIsExporting(false);
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{t.export_data_title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{t.export_data_description}</p>
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                    >
                        {isExporting ? (
                            <>
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {language === 'fr' ? 'Export en cours...' : language === 'jp' ? 'エクスポート中...' : 'Exporting...'}
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                {t.export_data_button}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
