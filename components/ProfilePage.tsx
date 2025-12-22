import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getUserPreferences, saveUserPreferences } from '../services/supabase';
import { INDIVIDUAL_GAME_LIST } from '../data/games';
import { UKFlag, FranceFlag, JapanFlag } from './Icons';

interface ProfilePageProps {
    onBack: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
    const { user } = useUser();
    const { language, setLanguage, t, getGameName } = useLanguage();
    const [selectedLanguage, setSelectedLanguage] = useState<'fr' | 'en' | 'jp'>(language);
    const [ownedGames, setOwnedGames] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    // Load user preferences
    useEffect(() => {
        const loadPreferences = async () => {
            if (!user?.id) return;

            try {
                const prefs = await getUserPreferences(user.id);
                if (prefs) {
                    setSelectedLanguage(prefs.preferred_language);
                    setOwnedGames(prefs.owned_games);
                }
            } catch (error) {
                console.error('Error loading preferences:', error);
            } finally {
                setLoading(false);
            }
        };

        loadPreferences();
    }, [user?.id]);

    const handleSave = async () => {
        if (!user?.id) return;

        setSaving(true);
        setMessage(null);

        try {
            await saveUserPreferences(user.id, selectedLanguage, ownedGames);
            setLanguage(selectedLanguage); // Update app language
            setMessage(t('preferences_saved'));

            // Redirect to tracker after 1 second
            setTimeout(() => {
                onBack();
            }, 1000);
        } catch (error) {
            console.error('Error saving preferences:', error);
            setMessage('Error saving preferences');
        } finally {
            setSaving(false);
        }
    };

    const toggleGame = (gameId: string) => {
        setOwnedGames(prev =>
            prev.includes(gameId)
                ? prev.filter(id => id !== gameId)
                : [...prev, gameId]
        );
    };

    const selectAllGames = () => {
        setOwnedGames(Object.keys(INDIVIDUAL_GAME_LIST));
    };

    const deselectAllGames = () => {
        setOwnedGames([]);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <p className="text-gray-400">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">{t('my_profile')}</h1>
                    <button
                        onClick={onBack}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        ← {t('back')}
                    </button>
                </div>

                {/* User Info */}
                <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-2xl">
                            {user?.firstName?.[0] || user?.username?.[0] || '👤'}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{user?.firstName || user?.username}</h2>
                            <p className="text-gray-400">{user?.primaryEmailAddress?.emailAddress}</p>
                        </div>
                    </div>
                </div>

                {/* Language Selection */}
                <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
                    <h3 className="text-lg font-bold mb-4">{t('preferred_language')}</h3>
                    <div className="flex space-x-4">
                        {[
                            { code: 'en' as const, label: 'English', FlagComponent: UKFlag },
                            { code: 'fr' as const, label: 'Français', FlagComponent: FranceFlag },
                            { code: 'jp' as const, label: '日本語', FlagComponent: JapanFlag }
                        ].map(lang => (
                            <button
                                key={lang.code}
                                onClick={() => setSelectedLanguage(lang.code)}
                                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${selectedLanguage === lang.code
                                    ? 'border-indigo-500 bg-indigo-500/20'
                                    : 'border-gray-600 hover:border-gray-500'
                                    }`}
                            >
                                <div className="flex items-center justify-center mb-2">
                                    <lang.FlagComponent className="w-8 h-6 shadow-sm" />
                                </div>
                                <span className="text-sm">{lang.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Owned Games */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold">{t('owned_games')}</h3>
                        <div className="space-x-2">
                            <button
                                onClick={selectAllGames}
                                className="text-sm text-indigo-400 hover:text-indigo-300"
                            >
                                {t('select_all_games')}
                            </button>
                            <span className="text-gray-600">|</span>
                            <button
                                onClick={deselectAllGames}
                                className="text-sm text-indigo-400 hover:text-indigo-300"
                            >
                                {t('deselect_all_games')}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                        {Object.entries(INDIVIDUAL_GAME_LIST).map(([gameId, gameName]) => (
                            <label
                                key={gameId}
                                className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    checked={ownedGames.includes(gameId)}
                                    onChange={() => toggleGame(gameId)}
                                    className="w-5 h-5 rounded border-gray-600 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-gray-800"
                                />
                                <span className="text-sm">{getGameName(gameId)}</span>
                            </label>
                        ))}
                    </div>

                    <p className="text-sm text-gray-400 mt-4">
                        {ownedGames.length} {ownedGames.length === 1 ? 'game' : 'games'} selected
                    </p>
                </div>

                {/* Save Button */}
                <div className="mt-6 flex items-center justify-between">
                    <div>
                        {message && (
                            <p className={`text-sm ${message.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                                {message}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold transition-all"
                    >
                        {saving ? 'Saving...' : t('save_preferences')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
