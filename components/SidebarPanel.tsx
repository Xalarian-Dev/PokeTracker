import React from 'react';
import CircularProgress from './CircularProgress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { FilterChip } from './ui';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarPanelProps {
    shinyCount: number;
    totalPokemon: number;
    progress: number;
    activeFilter: { type: 'gen' | 'region'; value: string | number } | null;
    setActiveFilter: (filter: { type: 'gen' | 'region'; value: string | number } | null) => void;
    selectedGame: string | null;
    setSelectedGame: (game: string | null) => void;
    showOnlyShiny: boolean;
    setShowOnlyShiny: (show: boolean) => void;
    showMissingShiny: boolean;
    setShowMissingShiny: (show: boolean) => void;
    hideRegionalForms: boolean;
    setHideRegionalForms: (hide: boolean) => void;
    onMajorFilterChange: () => void;
}

/**
 * Composant SidebarPanel - Panel latéral avec progression et filtres
 */
export const SidebarPanel: React.FC<SidebarPanelProps> = ({
    shinyCount,
    totalPokemon,
    progress,
    activeFilter,
    setActiveFilter,
    selectedGame,
    setSelectedGame,
    showOnlyShiny,
    setShowOnlyShiny,
    showMissingShiny,
    setShowMissingShiny,
    hideRegionalForms,
    setHideRegionalForms,
    onMajorFilterChange
}) => {
    const { t, getGameList, getRegionName } = useLanguage();
    const gameList = getGameList();

    const handleFilterClick = (type: 'gen' | 'region', value: number | string) => {
        if (activeFilter?.type === type && activeFilter?.value === value) {
            setActiveFilter(null);
        } else {
            setActiveFilter({ type, value });
        }
        onMajorFilterChange();
    };

    const handleGameClick = (gameId: string) => {
        setSelectedGame(selectedGame === gameId ? null : gameId);
        onMajorFilterChange();
    };

    return (
        <>
            {/* Circular Progress */}
            <CircularProgress
                progress={progress}
                shinyCount={shinyCount}
                totalPokemon={totalPokemon}
            />

            {/* Filters */}
            <Accordion type="multiple" defaultValue={["gen"]} className="mt-4">
                {/* Generations Filter */}
                <AccordionItem value="gen">
                    <AccordionTrigger>
                        <div className="flex items-center gap-2">
                            <span>🎮</span>
                            <span>{t('filter_by_generation')}</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="flex flex-wrap gap-2">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(gen => (
                                <FilterChip
                                    key={gen}
                                    label={`${t('gen')} ${gen}`}
                                    isActive={activeFilter?.type === 'gen' && activeFilter?.value === gen}
                                    variant="filter"
                                    onClick={() => handleFilterClick('gen', gen)}
                                />
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Regions Filter */}
                <AccordionItem value="region">
                    <AccordionTrigger>
                        <div className="flex items-center gap-2">
                            <span>🗺️</span>
                            <span>{t('filter_by_region')}</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="flex flex-wrap gap-2">
                            {['Alola', 'Galar', 'Hisui', 'Paldea'].map(region => (
                                <FilterChip
                                    key={region}
                                    label={getRegionName(region)}
                                    isActive={activeFilter?.type === 'region' && activeFilter?.value === region}
                                    variant="filter"
                                    onClick={() => handleFilterClick('region', region)}
                                />
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Games Filter */}
                <AccordionItem value="game">
                    <AccordionTrigger>
                        <div className="flex items-center gap-2">
                            <span>🎯</span>
                            <span>{t('filter_by_game')}</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                            {Object.entries(gameList).map(([gameId, gameName]) => (
                                <FilterChip
                                    key={gameId}
                                    label={gameName}
                                    isActive={selectedGame === gameId}
                                    variant="game"
                                    onClick={() => handleGameClick(gameId)}
                                />
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Status Filter */}
                <AccordionItem value="status">
                    <AccordionTrigger>
                        <div className="flex items-center gap-2">
                            <span>✨</span>
                            <span>{t('status')}</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showOnlyShiny}
                                    onChange={(e) => setShowOnlyShiny(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-600 text-poke-yellow focus:ring-poke-yellow"
                                />
                                <span className="text-sm text-gray-300">{t('show_only_shiny')}</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showMissingShiny}
                                    onChange={(e) => setShowMissingShiny(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-600 text-blue-400 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-300">{t('show_missing_shiny')}</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={hideRegionalForms}
                                    onChange={(e) => setHideRegionalForms(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-600 text-green-400 focus:ring-green-500"
                                />
                                <span className="text-sm text-gray-300">{t('hide_regional_forms')}</span>
                            </label>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </>
    );
};

export default SidebarPanel;
