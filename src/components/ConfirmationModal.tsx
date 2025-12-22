import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    message: string;
    title?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, message, title }) => {
    const { t } = useLanguage();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-6 max-w-md w-full transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
                <h3 className="text-xl font-bold text-white mb-4">
                    {title || t('confirm_action')}
                </h3>

                <p className="text-gray-300 mb-8">
                    {message}
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors"
                    >
                        {t('no')}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
                    >
                        {t('yes')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
