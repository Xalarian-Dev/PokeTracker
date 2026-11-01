import React, { useMemo } from 'react';
import { Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui';
import { LEGEND_GROUPS, BADGE_DEFS, BadgeIcon, computeBadges, type BadgeKey, type CardBadge } from './CardBadges';
import { hasVersionColors } from './cardShared';
import { POKEMON_LIST } from '../data/pokemon';

/** Fenêtre « Légende » : explique chaque icône des cartes, rangées par génération puis par jeu. */
interface LegendDialogProps {
    /** Jeu filtré : la légende ne montre que les icônes qui apparaissent sur ses cartes */
    selectedGame: string | null;
    /** Génération filtrée (sans jeu) : la légende se limite à cette génération */
    generation: number | null;
}

const LegendDialog: React.FC<LegendDialogProps> = ({ selectedGame, generation }) => {
    const { t, getGameList } = useLanguage();
    const gameList = getGameList();

    // Icônes réellement affichées sur au moins une carte du jeu sélectionné
    const applicable = useMemo(() => {
        if (!selectedGame) return null;
        const keys = new Set<BadgeKey>();
        for (const p of POKEMON_LIST) computeBadges(p.id, selectedGame).forEach(b => keys.add(b.key));
        return keys;
    }, [selectedGame]);

    const groups = LEGEND_GROUPS
        .filter(g => applicable !== null || generation === null || g.generation === null || g.generation === generation)
        .map(g => ({
            ...g,
            games: g.games
                .map(x => ({ ...x, keys: x.keys.filter(k => (applicable ? applicable.has(k) : true)) }))
                .filter(x => x.keys.length > 0),
        }))
        .filter(g => g.games.length > 0);

    const labelOf = (badge: CardBadge): string => {
        if (badge.key === 'cart') {
            // « Nécessite le port GBA : {game} » → sans la partie variable
            return t('dual_slot_req', { game: '' }).replace(/\s*[:：]\s*$/, '');
        }
        return t(BADGE_DEFS[badge.key].labelKey);
    };

    const renderRow = (key: BadgeKey) => {
        const badge: CardBadge = { key };
        const label = labelOf(badge);
        return (
            <li key={key} className="flex items-center gap-3 text-sm">
                <span className="w-12 h-8 shrink-0 flex items-center justify-center rounded bg-gray-800">
                    <BadgeIcon badge={badge} label={label} className={key === 'lzadlc1' ? 'w-10 h-5' : 'w-6 h-6'} />
                </span>
                <span>{label}</span>
            </li>
        );
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                    <Info className="w-4 h-4" aria-hidden="true" />
                    {t('legend_open')}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t('legend_title')}</DialogTitle>
                    <DialogDescription>{t('legend_description')}</DialogDescription>
                </DialogHeader>

                <div className="grid gap-5">
                    {groups.map(group => (
                        <section key={group.generation ?? 'multi'} aria-labelledby={`legend-gen-${group.generation ?? 'multi'}`}>
                            <h3
                                id={`legend-gen-${group.generation ?? 'multi'}`}
                                className="text-sm font-bold text-yellow-400 border-b border-gray-700 pb-1 mb-2"
                            >
                                {group.generation === null ? t('legend_multi') : `${t('gen')} ${group.generation}`}
                            </h3>
                            <div className="grid gap-3">
                                {group.games.map(({ game, keys }) => (
                                    <div key={game ?? 'all'}>
                                        {game && <p className="text-xs text-gray-400 mb-1.5">{gameList[game] || game}</p>}
                                        <ul className="grid gap-2">{keys.map(renderRow)}</ul>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                {groups.length === 0 && <p className="text-sm text-gray-300">{t('legend_none')}</p>}

                {(!selectedGame || hasVersionColors(selectedGame)) && (
                    <p className="text-sm text-gray-400 border-t border-gray-700 pt-3">{t('legend_colors')}</p>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default LegendDialog;
