import { ChangeLogEntry } from './changelog-en';

export const changelogFR: ChangeLogEntry = {
    title: "Nouveautés",
    date: "31 mai 2026",
    sectionTitle: "Refonte Mobile, Filtre DLC & Performances",
    features: "Nouvelles fonctionnalités",
    featuresList: [
        "Filtre DLC : En sélectionnant Épée/Bouclier, Écarlate/Violet ou Légendes Z-A, des boutons DLC apparaissent sous le filtre de jeu — actifs quand affichés, grisés quand masqués",
        "Formes sur mobile : Les Pokémon multi-formes (Motisma, Arceus, Vivillon…) disposent désormais d'un bouton '+' sur les cartes mobiles, ouvrant la modale complète des formes",
        "Badge Shiny Lock sur mobile : Une icône de cadenas apparaît sur les cartes mobiles pour les Pokémon avec Shiny Lock",
        "Tout marquer / Tout démarquer disponible sur mobile : Les actions en masse ne sont plus réservées au bureau",
    ],
    technical: "Corrections & Améliorations",
    technicalList: [
        "Correction du zoom iOS déclenché par les champs de saisie avec une taille de police inférieure à 16px (barre de recherche, formulaire de retour, profil)",
        "Correction du bouton de bascule du panneau inaccessible lorsque le panneau était ouvert (conflit z-index avec l'arrière-plan)",
        "Correction du bouton de retour en haut jamais visible sur mobile (écoutait le scroll de window au lieu du conteneur interne)",
        "Correction de la page Profil qui se glissait sous l'en-tête fixe sur mobile — le contenu respecte désormais la hauteur de 64px",
        "Correction du flash de cartes bureau lors du premier rendu mobile (useIsMobile s'initialise maintenant de façon synchrone)",
        "Correction de CookieConsent et FormsModal ignorant les zones sûres iOS (encoche, Dynamic Island, indicateur d'accueil)",
        "Suppression des zones de défilement imbriquées dans la liste des jeux du panneau et la grille des jeux possédés",
        "Cache des sprites : un service worker met en cache tous les sprites Pokémon après le premier chargement — instantané lors des visites suivantes",
        "Ajout de decoding='async' sur toutes les images de sprites pour réduire les saccades lors du défilement",
        "Boutons des onglets du panneau, FilterChips et autres zones tactiles agrandis pour atteindre le minimum de 44px",
        "Le sélecteur de langue dans le profil s'adapte maintenant sur les petits écrans au lieu de déborder",
        "Correction de toutes les erreurs TypeScript préexistantes (@types/react manquant, import.meta.env, types de composants de classe)",
    ],
    close: "Fermer"
};
