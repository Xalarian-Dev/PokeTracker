import React from 'react';
import { Book, Map, Gamepad2, Eye } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { GAME_DLCS } from '../data/games';
import { FilterChip, Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui';

export type ActiveFilter = { type: 'gen' | 'region'; value: string | number } | null;

export interface FilterState {
    activeFilter: ActiveFilter;
    setActiveFilter: (filter: ActiveFilter) => void;
    selectedGame: string | null;
    setSelectedGame: (game: string | null) => void;
    disabledDlcs: Set<string>;
    toggleDlc: (dlcId: string) => void;
    showOnlyShiny: boolean;
    setShowOnlyShiny: (show: boolean) => void;
    showMissingShiny: boolean;
    setShowMissingShiny: (show: boolean) => void;
    hideGrayedPokemon: boolean;
    setHideGrayedPokemon: (hide: boolean) => void;
    hideShinyLocked: boolean;
    setHideShinyLocked: (hide: boolean) => void;
    /** Appelé après un changement de filtre majeur (génération, région, jeu) */
    onMajorFilterChange: () => void;
}

/** Contenu complet des filtres (génération, région, jeu + DLC, affichage), affiché dans le tiroir « Tous les filtres ». */
const FiltersPanel: React.FC<FilterState> = (props) => {
    const { t, getGameList, getRegionName } = useLanguage();
    const gameList = getGameList();

    const handleFilterClick = (type: 'gen' | 'region', value: number | string) => {
        if (props.activeFilter?.type === type && props.activeFilter?.value === value) {
            props.setActiveFilter(null);
        } else {
            props.setActiveFilter({ type, value });
        }
        props.onMajorFilterChange();
    };

    const handleGameClick = (gameId: string) => {
        props.setSelectedGame(props.selectedGame === gameId ? null : gameId);
        props.onMajorFilterChange();
    };

    return (
        <Accordion type="multiple" defaultValue={['gen', 'status']}>
            <AccordionItem value="gen">
                <AccordionTrigger>
                    <div className="flex items-center gap-2">
                        <Book className="w-5 h-5 text-gray-400" aria-hidden="true" />
                        <span>{t('filter_generation')}</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(gen => (
                            <FilterChip
                                key={gen}
                                label={`${t('gen')} ${gen}`}
                                isActive={props.activeFilter?.type === 'gen' && props.activeFilter?.value === gen}
                                variant="filter"
                                onClick={() => handleFilterClick('gen', gen)}
                            />
                        ))}
                    </div>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="region">
                <AccordionTrigger>
                    <div className="flex items-center gap-2">
                        <Map className="w-5 h-5 text-gray-400" aria-hidden="true" />
                        <span>{t('filter_region')}</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="flex flex-wrap gap-2">
                        {['Alola', 'Galar', 'Hisui', 'Paldea'].map(region => (
                            <FilterChip
                                key={region}
                                label={getRegionName(region)}
                                isActive={props.activeFilter?.type === 'region' && props.activeFilter?.value === region}
                                variant="filter"
                                onClick={() => handleFilterClick('region', region)}
                            />
                        ))}
                    </div>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="game">
                <AccordionTrigger>
                    <div className="flex items-center gap-2">
                        <Gamepad2 className="w-5 h-5 text-gray-400" aria-hidden="true" />
                        <span>{t('filter_games')}</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="flex flex-wrap gap-2 pb-4">
                        {Object.entries(gameList).map(([gameId, gameName]) => (
                            <FilterChip
                                key={gameId}
                                label={gameName}
                                isActive={props.selectedGame === gameId}
                                variant="game"
                                onClick={() => handleGameClick(gameId)}
                            />
                        ))}
                    </div>
                    {props.selectedGame && GAME_DLCS[props.selectedGame] && (
                        <div className="mt-2 pt-2 border-t border-gray-700">
                            <p className="text-xs text-gray-400 mb-2">{t('filter_dlc_hide')}</p>
                            <div className="flex flex-wrap gap-2">
                                {GAME_DLCS[props.selectedGame].map(dlc => (
                                    <FilterChip
                                        key={dlc.id}
                                        label={t(dlc.nameKey)}
                                        isActive={!props.disabledDlcs.has(dlc.id)}
                                        variant="filter"
                                        onClick={() => props.toggleDlc(dlc.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="status">
                <AccordionTrigger>
                    <div className="flex items-center gap-2">
                        <Eye className="w-5 h-5 text-gray-400" aria-hidden="true" />
                        <span>{t('filter_visibility')}</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="flex flex-wrap gap-2">
                        <FilterChip
                            label={t('show_only_shiny')}
                            isActive={props.showOnlyShiny}
                            variant="filter"
                            onClick={() => {
                                if (!props.showOnlyShiny) props.setShowMissingShiny(false);
                                props.setShowOnlyShiny(!props.showOnlyShiny);
                            }}
                        />
                        <FilterChip
                            label={t('show_missing_shiny')}
                            isActive={props.showMissingShiny}
                            variant="filter"
                            onClick={() => {
                                if (!props.showMissingShiny) props.setShowOnlyShiny(false);
                                props.setShowMissingShiny(!props.showMissingShiny);
                            }}
                        />
                        <FilterChip
                            label={t('hide_grayed_pokemon')}
                            isActive={props.hideGrayedPokemon}
                            variant="filter"
                            onClick={() => props.setHideGrayedPokemon(!props.hideGrayedPokemon)}
                        />
                        <FilterChip
                            label={t('hide_shiny_locked')}
                            isActive={props.hideShinyLocked}
                            variant="filter"
                            onClick={() => props.setHideShinyLocked(!props.hideShinyLocked)}
                        />
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};

export default FiltersPanel;
