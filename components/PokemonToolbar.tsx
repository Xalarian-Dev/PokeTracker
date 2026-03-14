import React from 'react';
import { Button } from './ui';
import { useLanguage } from '../contexts/LanguageContext';

interface PokemonToolbarProps {
    activeCount: number;
    loading: boolean;
    onMarkAll: () => void;
    onUnmarkAll: () => void;
}

const PokemonToolbar: React.FC<PokemonToolbarProps> = ({
    activeCount,
    loading,
    onMarkAll,
    onUnmarkAll,
}) => {
    const { t } = useLanguage();

    return (
        <>
            {/* Mobile Counter */}
            {activeCount > 0 && (
                <div className="mb-4 px-2 block md:hidden">
                    <div className="text-gray-400 text-xs text-left">
                        {t('pokemon_shown', { count: activeCount })}
                    </div>
                </div>
            )}

            {/* Desktop Action Buttons with Counter */}
            {!loading && activeCount > 0 && (
                <div className="mb-4 w-full md:max-w-[1160px] md:mx-auto px-1 md:px-0 hidden md:block">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4">
                        <div className="text-gray-400 text-xs md:text-sm">
                            {t('pokemon_shown', { count: activeCount })}
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={onMarkAll} variant="secondary" size="sm">
                                {t('mark_all')}
                            </Button>
                            <Button onClick={onUnmarkAll} variant="ghost" size="sm">
                                {t('unmark_all')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PokemonToolbar;
