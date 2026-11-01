import React from 'react';
import { Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui';
import { LEGEND_GROUPS, BADGE_DEFS, BadgeIcon, type BadgeKey, type CardBadge } from './CardBadges';

/** Fenêtre « Légende » : explique chaque icône des cartes, rangées par génération puis par jeu. */
const LegendDialog: React.FC = () => {
    const { t, getGameList } = useLanguage();
    const gameList = getGameList();

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
                    {LEGEND_GROUPS.map(group => (
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

                <p className="text-sm text-gray-400 border-t border-gray-700 pt-3">{t('legend_colors')}</p>
            </DialogContent>
        </Dialog>
    );
};

export default LegendDialog;
