import React, { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getUserPreferences, saveUserPreferences, deleteUserData } from '../services/supabase';
import { INDIVIDUAL_GAME_LIST } from '../data/games';
import { UKFlag, FranceFlag, JapanFlag } from './Icons';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface ProfilePageProps {
    onBack: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
    const { user } = useUser();
    const { signOut } = useClerk();
    const { language, setLanguage, t, getGameName } = useLanguage();
    const [selectedLanguage, setSelectedLanguage] = useState<'fr' | 'en' | 'jp'>(language);
    const [ownedGames, setOwnedGames] = useState<string[]>([]);
    const [displayName, setDisplayName] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Load user preferences
    useEffect(() => {
        const loadPreferences = async () => {
            if (!user?.id) return;

            try {
                const prefs = await getUserPreferences(user.id);
                if (prefs) {
                    setSelectedLanguage(prefs.preferred_language);
                    setOwnedGames(prefs.owned_games);
                    setDisplayName(prefs.display_name || '');
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
            await saveUserPreferences(user.id, selectedLanguage, ownedGames, displayName || undefined);
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

    const handleDeleteAccount = async () => {
        if (!user?.id) return;

        setDeleting(true);
        try {
            // Delete all user data from Supabase
            await deleteUserData(user.id);

            // Delete Clerk account
            await user.delete();

            // Sign out
            await signOut();
        } catch (error) {
            console.error('Error deleting account:', error);
            setMessage('Error deleting account');
            setDeleting(false);
            setShowDeleteConfirm(false);
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
            {/* Delete Confirmation Modal */}
            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>⚠️ {t('delete_account_title')}</DialogTitle>
                        <DialogDescription>
                            {t('delete_account_warning')}
                        </DialogDescription>
                    </DialogHeader>
                    <ul className="list-disc list-inside text-gray-400 mb-6 space-y-1">
                        <li>{t('delete_account_data_1')}</li>
                        <li>{t('delete_account_data_2')}</li>
                        <li>{t('delete_account_data_3')}</li>
                    </ul>
                    <p className="text-red-400 font-bold mb-6">{t('delete_account_irreversible')}</p>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={deleting}
                        >
                            {t('cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteAccount}
                            disabled={deleting}
                        >
                            {deleting ? t('deleting') : t('delete_forever')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">{t('my_profile')}</h1>
                    <Button
                        variant="ghost"
                        onClick={onBack}
                    >
                        ← {t('back')}
                    </Button>
                </div>

                {/* User Info */}
                <Card className="mb-6">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-2xl">
                            {user?.firstName?.[0] || user?.username?.[0] || '👤'}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{user?.firstName || user?.username}</h2>
                            <p className="text-gray-400">{user?.primaryEmailAddress?.emailAddress}</p>
                        </div>
                    </div>
                </Card>

                {/* Display Name */}
                <Card className="mb-6">
                    <h3 className="text-lg font-bold mb-4">{t('display_name')}</h3>
                    <Input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder={t('display_name_placeholder')}
                        maxLength={30}
                        helperText={`${displayName ? `"${displayName}"` : user?.username || user?.firstName || 'Your username'} ${t('will_be_displayed')}`}
                    />
                </Card>

                {/* Language Selection */}
                <Card className="mb-6">
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
                </Card>

                {/* Owned Games */}
                <Card className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold">{t('owned_games')}</h3>
                        <div className="space-x-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={selectAllGames}
                            >
                                {t('select_all_games')}
                            </Button>
                            <span className="text-gray-600">|</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={deselectAllGames}
                            >
                                {t('deselect_all_games')}
                            </Button>
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
                        {ownedGames.length} {ownedGames.length === 1 ? t('game_selected') : t('games_selected')}
                    </p>
                </Card>

                {/* Action Buttons */}
                <div className="mt-6">
                    {message && (
                        <p className={`text-sm mb-3 ${message.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                            {message}
                        </p>
                    )}
                    <div className="flex justify-between items-center">
                        <Button
                            size="lg"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : t('save_preferences')}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="text-red-400/70 hover:text-red-400 border border-red-600/50 hover:bg-red-600/10"
                        >
                            {t('delete_account')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
