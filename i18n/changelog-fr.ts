import { ChangeLogEntry } from './changelog-en';

export const changelogFR: ChangeLogEntry = {
    title: "Nouveautés",
    date: "16 juin 2026",
    sectionTitle: "Fonctionnalités Communautaires, Profils Publics & Filtre DLC",
    features: "Nouvelles fonctionnalités",
    featuresList: [
        "ID Dresseur : choisissez un identifiant unique et permanent à la première connexion — utilisé dans l'URL de votre profil public (/u/votre-id) et affiché dans l'en-tête",
        "Profils publics : visitez la page de n'importe quel dresseur pour parcourir sa collection de shiny, ses stats, son pourcentage de complétion et ses formes favorites",
        "Fil communautaire : un panneau en direct sur la droite affiche les captures récentes de shiny de tous les dresseurs en temps réel — cliquez sur une entrée pour visiter leur profil",
        "Filtre DLC : en sélectionnant Épée/Bouclier, Écarlate/Violet ou Légendes Z-A, des boutons DLC apparaissent sous le filtre de jeu — actifs quand affichés, grisés quand masqués",
        "Formes sur mobile : les Pokémon multi-formes (Motisma, Arceus, Vivillon…) disposent d'un bouton '+' sur les cartes mobiles, ouvrant la modale complète des formes",
        "Badge Shiny Lock sur mobile : une icône de cadenas apparaît sur les cartes mobiles pour les Pokémon avec Shiny Lock",
        "Tout marquer / Tout démarquer disponible sur mobile : les actions en masse ne sont plus réservées au bureau",
        "Refonte de la page Profil : entièrement retravaillée pour correspondre au thème sombre de l'application — chips de jeux à la place des cases à cocher, accents jaunes, mise en page cohérente",
        "La page Profil a maintenant sa propre URL (/profile) : les boutons précédent/suivant du navigateur fonctionnent correctement et la page est enregistrable en favoris",
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
        "Correction de toutes les erreurs TypeScript préexistantes (@types/react manquant, import.meta.env, types de composants de classe)",
        "Fil communautaire : correction des entrées dupliquées et des captures bloquées/obsolètes, limite par dresseur portée à 3 captures récentes, et le panneau affiche désormais jusqu'à 40 entrées",
    ],
    close: "Fermer"
};
