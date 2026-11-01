import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui';
import type { PokemonForm } from '../types';
import { SparklesIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { pokemonFormsEN, pokemonFormsFR, pokemonFormsJP, pokemonFormsES } from '../i18n/pokemon-forms';
import { ui as uiEN } from '../i18n/en';
import { ui as uiFR } from '../i18n/fr';
import { ui as uiJP } from '../i18n/jp';
import { ui as uiES } from '../i18n/es';
import { SPRITE_BASE } from '../data/spriteBase';

const HOME_SPRITE_BASE_URL = SPRITE_BASE;

const formTranslations = {
    en: pokemonFormsEN,
    fr: pokemonFormsFR,
    jp: pokemonFormsJP,
    es: pokemonFormsES,
};

const uiTranslations = {
    en: uiEN,
    fr: uiFR,
    jp: uiJP,
    es: uiES,
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

    // Traductions des noms de formes et des textes de la fenêtre
    const getFormName = (formId: string) => formTranslations[language][formId] || formId;
    const t = uiTranslations[language];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-gray-800 border-2 border-gray-700 rounded-xl">
                <DialogHeader className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 pr-14 z-10">
                    <DialogTitle className="text-2xl font-bold text-white">{basePokemonName} {t.forms_modal_title}</DialogTitle>
                    <DialogDescription className="text-sm text-gray-400">
                        {shinyForms.size} / {forms.length} {t.shiny_forms_counter}
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {forms.map((form) => {
                        const isShiny = shinyForms.has(form.id);
                        const isFavorite = favoriteFormId === form.id;
                        // spriteId : identifiant numérique ou textuel (ex. « 676-heart »)
                        const spriteUrl = `${HOME_SPRITE_BASE_URL}${isShiny ? 'shiny/' : ''}${form.spriteId}.png`;
                        const shinyGlowStyle = isShiny ? { boxShadow: '0 0 15px 3px rgba(251, 191, 36, 0.35)' } : {};

                        return (
                            <div
                                key={form.id}
                                className={`
                                    relative bg-gray-800 rounded-lg p-3 flex flex-col items-center justify-center
                                    cursor-pointer transition-all duration-300 transform select-none
                                    hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20
                                    ${isShiny ? 'border-2 border-amber-400' : 'border-2 border-gray-700'}
                                `}
                                style={shinyGlowStyle}
                                onClick={() => onToggleForm(form.id, !isShiny)}
                            >
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); onSetFavorite?.(form.id); }}
                                    className="absolute top-0 left-0 z-20 p-2.5 transition-all hover:scale-125"
                                    title={t.forms_set_favorite}
                                    aria-label={t.forms_set_favorite}
                                    aria-pressed={isFavorite}
                                >
                                    {isFavorite ? (
                                        <svg className="w-5 h-5 text-red-500 drop-shadow-[0_2px_4px_rgba(239,68,68,0.5)]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 text-gray-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    )}
                                </button>

                                {isShiny && (
                                    <div className="absolute top-2 right-2 text-amber-400 drop-shadow-[0_2px_4px_rgba(251,191,36,0.5)]">
                                        <SparklesIcon className="w-5 h-5" />
                                    </div>
                                )}

                                <div className="w-24 h-24 flex items-center justify-center">
                                    <img
                                        src={spriteUrl}
                                        alt={getFormName(form.id)}
                                        className="max-w-full max-h-full object-contain"
                                        width="96"
                                        height="96"
                                        loading="lazy"
                                    />
                                </div>

                                <div className="text-center mt-2 w-full px-0.5 overflow-hidden">
                                    <p className="text-sm font-bold text-white truncate">{getFormName(form.id)}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-4 text-center">
                    <p className="text-xs text-gray-400">{t.forms_hint}</p>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default FormsModal;
