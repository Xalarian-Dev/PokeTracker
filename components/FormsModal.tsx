import React from 'react';
import ReactDOM from 'react-dom';
import type { PokemonForm } from '../types';
import { SparklesIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { pokemonFormsEN, pokemonFormsFR, pokemonFormsJP } from '../i18n/pokemon-forms';

const HOME_SPRITE_BASE_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/';

const formTranslations = {
    en: pokemonFormsEN,
    fr: pokemonFormsFR,
    jp: pokemonFormsJP,
};

interface FormsModalProps {
    isOpen: boolean;
    onClose: () => void;
    basePokemonName: string;
    forms: Array<{
        id: string;
        name: string;
        spriteId: number;
    }>;
    onToggleForm: (formId: string, isShiny: boolean) => void;
    shinyForms: Set<string>;
    favoriteFormId?: string;
    onSetFavorite?: (formId: string) => void;
}

const FormsModal: React.FC<FormsModalProps> = ({
    isOpen,
    onClose,
    basePokemonName,
    forms,
    onToggleForm,
    shinyForms,
    favoriteFormId,
    onSetFavorite
}) => {
    const { language } = useLanguage();

    if (!isOpen) return null;

    // Get translated form name
    const getFormName = (formId: string) => {
        return formTranslations[language][formId] || formId;
    };

    const modalContent = (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            style={{ zIndex: 9999 }}
            onClick={onClose}
        >
            <div
                className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-gray-700 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-center z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{basePokemonName} Forms</h2>
                        <p className="text-sm text-gray-400 mt-1">
                            {shinyForms.size} / {forms.length} shiny forms
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors text-3xl leading-none"
                    >
                        ×
                    </button>
                </div>

                {/* Forms Grid */}
                <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {forms.map((form) => {
                        const isShiny = shinyForms.has(form.id);
                        const isFavorite = favoriteFormId === form.id;
                        const spriteUrl = `${HOME_SPRITE_BASE_URL}${isShiny ? 'shiny/' : ''}${form.spriteId}.png`;

                        const handleClick = () => {
                            // Simple toggle shiny on/off
                            onToggleForm(form.id, !isShiny);
                        };

                        const handleFavoriteClick = (e: React.MouseEvent) => {
                            e.stopPropagation();
                            if (onSetFavorite) {
                                onSetFavorite(form.id);
                            }
                        };

                        // Shiny glow style (same as main list)
                        const shinyGlowStyle = isShiny ? {
                            boxShadow: '0 0 15px 3px rgba(251, 191, 36, 0.35)'
                        } : {};

                        return (
                            <div
                                key={form.id}
                                className={`
                                    relative bg-gray-800 rounded-lg p-3 flex flex-col items-center justify-center
                                    cursor-pointer transition-all duration-300 transform select-none
                                    hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20
                                    ${isShiny ? 'border-2 border-amber-400' : 'border-2 border-gray-700'}
                                    overflow-visible
                                `}
                                style={shinyGlowStyle}
                                onClick={handleClick}
                            >
                                {/* Favorite Heart Icon - Top Left */}
                                <button
                                    onClick={handleFavoriteClick}
                                    className="absolute top-2 left-2 z-20 transition-all hover:scale-125"
                                    title="Set as favorite form to display in main list"
                                >
                                    {isFavorite ? (
                                        <svg className="w-5 h-5 text-red-500 drop-shadow-[0_2px_4px_rgba(239,68,68,0.5)]" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 text-gray-500 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    )}
                                </button>

                                {/* Shiny Icon - Top Right (only when shiny) */}
                                {isShiny && (
                                    <div className="absolute top-2 right-2 text-amber-400 drop-shadow-[0_2px_4px_rgba(251,191,36,0.5)]">
                                        <SparklesIcon className="w-5 h-5" />
                                    </div>
                                )}

                                {/* Sprite */}
                                <div className="w-24 h-24 flex items-center justify-center">
                                    <img
                                        src={spriteUrl}
                                        alt={form.name}
                                        className="max-w-full max-h-full object-contain group-hover:animate-pulse"
                                        width="96"
                                        height="96"
                                        loading="lazy"
                                    />
                                </div>

                                {/* Name */}
                                <div className="text-center mt-2 w-full px-0.5 overflow-hidden">
                                    <p className="text-sm font-bold text-white truncate">{getFormName(form.id)}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-4 text-center">
                    <p className="text-xs text-gray-400">
                        ❤️ Click heart to set favorite form (displayed in main list) • Click card to toggle shiny
                    </p>
                </div>
            </div>
        </div>
    );

    // Render modal using a portal to escape parent constraints
    return ReactDOM.createPortal(modalContent, document.body);
};

export default FormsModal;
