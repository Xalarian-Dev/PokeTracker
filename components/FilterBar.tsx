import React, { useMemo, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useIsMobile } from '../hooks/use-mobile';
import { Button, FilterChip, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import SearchBarWithProgress from './SearchBarWithProgress';
import FiltersPanel, { type FilterState } from './FiltersPanel';

interface FilterBarProps extends FilterState {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    progress: number;
    shinyCount: number;
    totalPokemon: number;
    activeCount: number;
    resetFilters: () => void;
}

interface Pill {
    id: string;
    label: string;
    remove: () => void;
}

const selectTriggerClass = 'h-10 min-w-0 bg-gray-800 border-gray-600 text-white focus:ring-poke-yellow';

/**
 * Barre de recherche et de filtres, fixée sous l'en-tête :
 * progression + recherche, filtres rapides (génération, jeu, shiny/manquants) et tiroir « Tous les filtres ».
 * Les filtres actifs sont rappelés sous la barre, chacun retirable, avec « Tout réinitialiser ».
 */
const FilterBar: React.FC<FilterBarProps> = (props) => {
    const { t, getGameList, getRegionName } = useLanguage();
    const isMobile = useIsMobile();
    const [sheetOpen, setSheetOpen] = useState(false);
    const gameList = getGameList();

    const pills = useMemo<Pill[]>(() => {
        const out: Pill[] = [];
        const { activeFilter } = props;
        if (activeFilter?.type === 'gen') {
            out.push({ id: 'gen', label: `${t('gen')} ${activeFilter.value}`, remove: () => props.setActiveFilter(null) });
        }
        if (activeFilter?.type === 'region') {
            out.push({ id: 'region', label: getRegionName(String(activeFilter.value)), remove: () => props.setActiveFilter(null) });
        }
        if (props.selectedGame) {
            out.push({ id: 'game', label: gameList[props.selectedGame] || props.selectedGame, remove: () => props.setSelectedGame(null) });
        }
        if (props.showOnlyShiny) out.push({ id: 'only', label: t('show_only_shiny'), remove: () => props.setShowOnlyShiny(false) });
        if (props.showMissingShiny) out.push({ id: 'missing', label: t('show_missing_shiny'), remove: () => props.setShowMissingShiny(false) });
        if (props.hideGrayedPokemon) out.push({ id: 'gray', label: t('hide_grayed_pokemon'), remove: () => props.setHideGrayedPokemon(false) });
        if (props.hideShinyLocked) out.push({ id: 'lock', label: t('hide_shiny_locked'), remove: () => props.setHideShinyLocked(false) });
        return out;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.activeFilter, props.selectedGame, props.showOnlyShiny, props.showMissingShiny, props.hideGrayedPokemon, props.hideShinyLocked, t, gameList, getRegionName]);

    const genValue = props.activeFilter?.type === 'gen' ? String(props.activeFilter.value) : 'all';
    const hasAnyFilter = pills.length > 0 || props.searchTerm.trim() !== '';

    return (
        <>
            <div className="sticky top-16 z-30 bg-gray-900/75 backdrop-blur-lg border-b border-white/10">
                <div className="w-full md:max-w-[1160px] md:mx-auto px-2 md:px-0 py-2 flex flex-col gap-2">
                    <SearchBarWithProgress
                        searchTerm={props.searchTerm}
                        onSearchChange={props.onSearchChange}
                        progress={props.progress}
                        shinyCount={props.shinyCount}
                        totalPokemon={props.totalPokemon}
                    />

                    <div className="flex items-center gap-2">
                        <div className="w-32 sm:w-40 shrink-0">
                            <Select
                                value={genValue}
                                onValueChange={(v) => {
                                    if (v === 'all') {
                                        if (props.activeFilter?.type === 'gen') props.setActiveFilter(null);
                                    } else {
                                        props.setActiveFilter({ type: 'gen', value: Number(v) });
                                    }
                                    props.onMajorFilterChange();
                                }}
                            >
                                <SelectTrigger className={selectTriggerClass} aria-label={t('filter_generation')}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-700 border-gray-600">
                                    <SelectItem value="all" className="text-white focus:bg-gray-600">{t('filter_generation')}</SelectItem>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(g => (
                                        <SelectItem key={g} value={String(g)} className="text-white focus:bg-gray-600">{t('gen')} {g}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="min-w-0 flex-1 sm:flex-none sm:w-56">
                            <Select
                                value={props.selectedGame ?? 'all'}
                                onValueChange={(v) => {
                                    props.setSelectedGame(v === 'all' ? null : v);
                                    props.onMajorFilterChange();
                                }}
                            >
                                <SelectTrigger className={selectTriggerClass} aria-label={t('filter_games')}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-700 border-gray-600 max-h-72">
                                    <SelectItem value="all" className="text-white focus:bg-gray-600">{t('game_all')}</SelectItem>
                                    {Object.entries(gameList).map(([id, name]) => (
                                        <SelectItem key={id} value={id} className="text-white focus:bg-gray-600">{name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="hidden md:flex items-center gap-2">
                            <FilterChip
                                label={t('show_missing_shiny')}
                                isActive={props.showMissingShiny}
                                onClick={() => {
                                    if (!props.showMissingShiny) props.setShowOnlyShiny(false);
                                    props.setShowMissingShiny(!props.showMissingShiny);
                                }}
                            />
                            <FilterChip
                                label={t('show_only_shiny')}
                                isActive={props.showOnlyShiny}
                                onClick={() => {
                                    if (!props.showOnlyShiny) props.setShowMissingShiny(false);
                                    props.setShowOnlyShiny(!props.showOnlyShiny);
                                }}
                            />
                        </div>

                        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="ml-auto h-10 gap-2 shrink-0">
                                    <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
                                    <span className="hidden sm:inline">{t('filters_all')}</span>
                                    <span className="sm:hidden">{t('filters')}</span>
                                    {pills.length > 0 && (
                                        <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-poke-yellow text-gray-900 text-xs font-bold">
                                            {pills.length}
                                        </span>
                                    )}
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side={isMobile ? 'bottom' : 'right'}
                                className="bg-gray-800 border-gray-700 text-white overflow-y-auto max-h-[85vh] md:max-h-none rounded-t-xl md:rounded-none"
                            >
                                <SheetHeader className="mb-2 text-left">
                                    <SheetTitle className="text-white">{t('filters_all')}</SheetTitle>
                                    <SheetDescription className="sr-only">{t('filters_all')}</SheetDescription>
                                </SheetHeader>
                                <FiltersPanel {...props} />
                                <div className="sticky bottom-0 -mx-6 -mb-6 mt-4 px-6 py-4 bg-gray-800 border-t border-gray-700 flex items-center justify-between gap-3">
                                    <Button variant="ghost" onClick={props.resetFilters} disabled={!hasAnyFilter}>
                                        {t('filters_reset')}
                                    </Button>
                                    <Button onClick={() => setSheetOpen(false)}>
                                        {t('filters_show_results', { count: props.activeCount })}
                                    </Button>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>

            {pills.length > 0 && (
                <div className="w-full md:max-w-[1160px] md:mx-auto px-2 md:px-0 pt-3 flex flex-wrap items-center gap-2" role="group" aria-label={t('filters_active_label')}>
                    {pills.map(p => (
                        <button
                            key={p.id}
                            type="button"
                            onClick={p.remove}
                            aria-label={t('filter_remove', { filter: p.label })}
                            className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-poke-yellow text-gray-900 text-xs font-medium hover:bg-yellow-400 transition-colors"
                        >
                            {p.label}
                            <X className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={props.resetFilters}
                        className="px-2 py-1.5 text-xs text-gray-300 underline underline-offset-2 hover:text-white"
                    >
                        {t('filters_reset')}
                    </button>
                </div>
            )}
        </>
    );
};

export default FilterBar;
