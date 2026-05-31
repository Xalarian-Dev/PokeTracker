import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { checkTrainerIdAvailability, setTrainerId } from '../services/supabase';
import { Button, Input } from './ui';

interface TrainerIdSetupProps {
    onComplete: (trainerId: string) => void;
}

const TRAINER_ID_REGEX = /^[a-zA-Z0-9_-]{3,20}$/;

type CheckState = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export const TrainerIdSetup: React.FC<TrainerIdSetupProps> = ({ onComplete }) => {
    const { t } = useLanguage();
    const [value, setValue] = useState('');
    const [checkState, setCheckState] = useState<CheckState>('idle');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Debounced availability check
    useEffect(() => {
        if (!value) { setCheckState('idle'); return; }
        if (!TRAINER_ID_REGEX.test(value)) { setCheckState('invalid'); return; }

        setCheckState('checking');
        const timer = setTimeout(async () => {
            const available = await checkTrainerIdAvailability(value);
            setCheckState(available ? 'available' : 'taken');
        }, 500);
        return () => clearTimeout(timer);
    }, [value]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (checkState !== 'available' || submitting) return;
        setSubmitting(true);
        setError(null);
        try {
            await setTrainerId(value);
            onComplete(value);
        } catch {
            setError(t('trainer_id_taken'));
            setCheckState('taken');
        } finally {
            setSubmitting(false);
        }
    }, [checkState, submitting, value, t, onComplete]);

    const statusColor: Record<CheckState, string> = {
        idle: 'text-gray-400',
        checking: 'text-gray-400',
        available: 'text-green-400',
        taken: 'text-red-400',
        invalid: 'text-yellow-400',
    };

    const statusText: Record<CheckState, string> = {
        idle: '',
        checking: t('trainer_id_checking'),
        available: t('trainer_id_available'),
        taken: t('trainer_id_taken'),
        invalid: t('trainer_id_invalid'),
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-md p-8">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="bg-yellow-400/20 rounded-full p-4">
                        <svg className="w-12 h-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-white text-center mb-2">
                    {t('trainer_id_choose')}
                </h2>
                <p className="text-gray-400 text-sm text-center mb-6">
                    {t('trainer_id_description')}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Input
                            type="text"
                            value={value}
                            onChange={e => setValue(e.target.value.trim())}
                            placeholder={t('trainer_id_placeholder')}
                            maxLength={20}
                            autoFocus
                            autoComplete="off"
                            className="bg-gray-700 border-gray-600 text-white placeholder-gray-500 text-center text-lg font-bold tracking-wide"
                        />
                        <div className="mt-1.5 min-h-[20px] flex items-center justify-between px-1">
                            <p className="text-xs text-gray-500">{t('trainer_id_rules')}</p>
                            {value && (
                                <p className={`text-xs font-medium ${statusColor[checkState]}`}>
                                    {statusText[checkState]}
                                </p>
                            )}
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm text-center">{error}</p>
                    )}

                    <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-3">
                        <p className="text-yellow-400 text-xs text-center">
                            ⚠️ {t('trainer_id_immutable_note')}
                        </p>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={checkState !== 'available' || submitting}
                    >
                        {submitting ? '...' : t('trainer_id_confirm')}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default TrainerIdSetup;
