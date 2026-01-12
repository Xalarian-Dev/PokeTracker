import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface SessionTimeoutWarningProps {
    secondsRemaining: number;
    onStayConnected: () => void;
}

/**
 * Warning modal displayed before automatic logout due to inactivity
 */
export function SessionTimeoutWarning({ secondsRemaining, onStayConnected }: SessionTimeoutWarningProps) {
    const { t } = useLanguage();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-gray-800 border border-yellow-500/50 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-300">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className="bg-yellow-500/20 rounded-full p-3">
                        <svg
                            className="w-12 h-12 text-yellow-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-white text-center mb-3">
                    {t('sessionTimeout.title')}
                </h2>

                {/* Message */}
                <p className="text-gray-300 text-center mb-6">
                    {t('sessionTimeout.message').replace('{seconds}', secondsRemaining.toString())}
                </p>

                {/* Countdown */}
                <div className="flex justify-center mb-6">
                    <div className="bg-gray-900 rounded-lg px-6 py-3 border border-yellow-500/30">
                        <span className="text-4xl font-bold text-yellow-500 tabular-nums">
                            {secondsRemaining}
                        </span>
                        <span className="text-gray-400 ml-2">s</span>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={onStayConnected}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-yellow-500/50"
                >
                    {t('sessionTimeout.stayConnected')}
                </button>
            </div>
        </div>
    );
}
