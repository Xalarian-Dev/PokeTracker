import { LayoutGrid, BarChart3, Users, Dices, type LucideIcon } from 'lucide-react';

export interface NavItem {
    to: string;
    labelKey: string;
    icon: LucideIcon;
    end?: boolean;
}

/** Entrées de la navigation principale (en-tête sur ordinateur, barre du bas sur mobile) */
export const NAV_ITEMS: NavItem[] = [
    { to: '/', labelKey: 'nav_collection', icon: LayoutGrid, end: true },
    { to: '/stats', labelKey: 'stats_tab', icon: BarChart3 },
    { to: '/communaute', labelKey: 'community_feed', icon: Users },
    { to: '/chasse', labelKey: 'random_hunt', icon: Dices },
];
