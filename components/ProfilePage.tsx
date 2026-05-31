import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getUserPreferences, saveUserPreferences, deleteUserData } from '../services/supabase';
import { INDIVIDUAL_GAME_LIST } from '../data/games';
import { UKFlag, FranceFlag, JapanFlag, SpainFlag } from './Icons';
import { MasterBallIcon } from './Icons';
const DataExport = lazy(() => import('./DataExport').then(module => ({ default: module.DataExport })));
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle,
} from './ui';
import { Button } from './ui';

const Section: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
    <div className={`bg-gray-800/60 border border-gray-700 rounded-xl p-5 ${className}`}>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">{title}</h3>
        {children}
    </div>
);

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const onBack = () => navigate('/');
    const { user } = useUser();
    const { signOut } = useClerk();
    const { language, setLanguage, t, getGameName } = useLanguage();
    const [selectedLanguage, setSelectedLanguage] = useState<'fr' | 'en' | 'jp' | 'es'>(language);
    const [ownedGames, setOwnedGames] = useState<string[]>([]);
    const [trainerId, setTrainerId] = useState<string | null>(null);
    const [profileLinkCopied, setProfileLinkCopied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (!user?.id) return;
        getUserPreferences(user.id)
            .then(prefs => {
                if (prefs) {
                    setSelectedLanguage(prefs.preferred_language);
                    setOwnedGames(prefs.owned_games);
                    setTrainerId(prefs.trainer_id || null);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user?.id]);

    const handleSave = async () => {
        if (!user?.id) return;
        setSaving(true);
        try {
            await saveUserPreferences(user.id, selectedLanguage, ownedGames);
            setLanguage(selectedLanguage);
            setSaved(true);
            setTimeout(() => { setSaved(false); onBack(); }, 1000);
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!user?.id) return;
        setDeleting(true);
        try {
            await deleteUserData(user.id);
            await user.delete();
            await signOut();
        } catch (e) {
            console.error(e);
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const toggleGame = (gameId: string) =>
        setOwnedGames(prev => prev.includes(gameId) ? prev.filter(id => id !== gameId) : [...prev, gameId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-yellow-400" />
            </div>
        );
    }

    const initials = (user?.firstName?.[0] || user?.username?.[0] || '?').toUpperCase();

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Delete Confirmation Modal */}
            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>⚠️ {t('delete_account_title')}</DialogTitle>
                        <DialogDescription>{t('delete_account_warning')}</DialogDescription>
                    </DialogHeader>
                    <ul className="list-disc list-inside text-gray-400 mb-4 space-y-1 text-sm">
                        <li>{t('delete_account_data_1')}</li>
                        <li>{t('delete_account_data_2')}</li>
                        <li>{t('delete_account_data_3')}</li>
                    </ul>
                    <p className="text-red-400 font-bold text-sm mb-4">{t('delete_account_irreversible')}</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
                            {t('cancel')}
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleting}>
                            {deleting ? t('deleting') : t('delete_forever')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Top bar */}
            <div className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
                <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MasterBallIcon className="w-5 h-5" />
                        <span className="font-bold text-yellow-400 text-sm">{t('my_profile')}</span>
                    </div>
                    <button
                        onClick={onBack}
                        className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        {t('back')}
                    </button>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">

                {/* Identity */}
                <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-5 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-gray-900 font-bold text-xl shrink-0 shadow-lg">
                        {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="font-bold text-lg truncate">{user?.firstName || user?.username}</p>
                        <p className="text-sm text-gray-400 truncate">{user?.primaryEmailAddress?.emailAddress}</p>
                        {trainerId && (
                            <div className="flex items-center gap-2 mt-2">
                                <p className="font-mono font-bold text-yellow-400 text-sm">{trainerId}</p>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${window.location.origin}/u/${trainerId}`);
                                        setProfileLinkCopied(true);
                                        setTimeout(() => setProfileLinkCopied(false), 2000);
                                    }}
                                    className="flex items-center gap-1 px-2.5 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-xs font-medium transition-colors"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    {profileLinkCopied ? t('public_profile_link_copied') : t('public_profile_copy_link')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Language */}
                <Section title={t('preferred_language')}>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {([
                            { code: 'en' as const, label: 'English',  Flag: UKFlag },
                            { code: 'fr' as const, label: 'Français', Flag: FranceFlag },
                            { code: 'es' as const, label: 'Español',  Flag: SpainFlag },
                            { code: 'jp' as const, label: '日本語',   Flag: JapanFlag },
                        ] as const).map(({ code, label, Flag }) => (
                            <button
                                key={code}
                                onClick={() => setSelectedLanguage(code)}
                                className={`flex flex-col items-center gap-2 py-3 rounded-lg border-2 transition-all ${
                                    selectedLanguage === code
                                        ? 'border-yellow-400 bg-yellow-400/10 text-white'
                                        : 'border-gray-700 bg-gray-800/40 text-gray-400 hover:border-gray-500 hover:text-white'
                                }`}
                            >
                                <Flag className="w-7 h-5 shadow-sm" />
                                <span className="text-xs font-medium">{label}</span>
                            </button>
                        ))}
                    </div>
                </Section>

                {/* Owned Games */}
                <Section title={t('owned_games')}>
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-gray-500">
                            {ownedGames.length} {ownedGames.length === 1 ? t('game_selected') : t('games_selected')}
                        </p>
                        <div className="flex items-center gap-3 text-xs">
                            <button onClick={() => setOwnedGames(Object.keys(INDIVIDUAL_GAME_LIST))} className="text-yellow-400 hover:text-yellow-300 transition-colors">
                                {t('select_all_games')}
                            </button>
                            <span className="text-gray-700">|</span>
                            <button onClick={() => setOwnedGames([])} className="text-gray-400 hover:text-white transition-colors">
                                {t('deselect_all_games')}
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(INDIVIDUAL_GAME_LIST).map(([gameId, _]) => {
                            const active = ownedGames.includes(gameId);
                            return (
                                <button
                                    key={gameId}
                                    onClick={() => toggleGame(gameId)}
                                    className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
                                        active
                                            ? 'border-yellow-400/60 bg-yellow-400/15 text-yellow-300'
                                            : 'border-gray-700 bg-gray-800/40 text-gray-500 hover:border-gray-500 hover:text-gray-300'
                                    }`}
                                >
                                    {getGameName(gameId)}
                                </button>
                            );
                        })}
                    </div>
                </Section>

                {/* Data Export */}
                <Suspense fallback={<div className="text-center text-gray-500 py-4 text-sm">...</div>}>
                    <DataExport />
                </Suspense>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="text-xs text-red-500/60 hover:text-red-400 transition-colors"
                    >
                        {t('delete_account')}
                    </button>
                    <Button onClick={handleSave} disabled={saving || saved}>
                        {saved ? `✓ ${t('preferences_saved')}` : saving ? '...' : t('save_preferences')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
