import { ChangeLogEntry } from './changelog-en';

/** Entrée de juin 2026 (conservée telle quelle) */
const changelogFR_juin2026: ChangeLogEntry = {
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

/** Entrées du journal « Nouveautés », de la plus récente à la plus ancienne */
export const changelogFR: ChangeLogEntry[] = [
    {
        title: "Nouveautés",
        date: "1er novembre 2026",
        sectionTitle: "Nouvelle adresse, nouveau look et page Chasse",
        features: "Nouvelles fonctionnalités",
        featuresList: [
            "Nouvelle adresse : PokeTracker est maintenant sur pokemonshinytracker.com. Pensez à mettre à jour vos favoris : l'ancienne adresse ne redirigera plus d'ici quelques mois. Vos comptes et vos données sont conservés",
            "Une adresse par langue : le site s'ouvre sur /fr/, /en/, /es/ ou /jp/. Changer de langue change l'adresse, et un lien partagé s'ouvre directement dans la bonne langue",
            "Nouveau look : un thème de nuit avec des touches dorées, une page d'accueil animée et des cartes shiny qui brillent quand on les marque",
            "Page d'accueil : une présentation du site pour les nouveaux visiteurs. Le bouton « Shiny Tracker » y ramène toujours ; en vous connectant depuis l'accueil, vous arrivez directement sur votre collection",
            "Page « Chasse » : tirez une cible au sort ou choisissez-la, comptez vos rencontres, puis enregistrez votre capture avec le jeu utilisé et le nombre de rencontres",
            "Statistiques et profil : une progression plus détaillée (par génération, par jeu, légendaires, formes régionales…) et un profil plus complet",
            "Communauté : une page plus large, qui montre aussi le jeu et le nombre de rencontres des captures",
            "Navigation et filtres repensés : un menu dans l'en-tête (une barre en bas sur mobile) et une barre de filtres toujours à portée de main",
            "Légende des icônes : un bouton explique ce que signifient les icônes des cartes",
            "Sur mobile : cartes plus lisibles, avec les icônes d'information et la forme favorite",
        ],
        security: "Sécurité & confidentialité",
        securityList: [
            "Mentions légales mises à jour : vos données sont maintenant hébergées sur notre propre serveur (OVH, en Europe), et non plus chez Supabase et Vercel",
            "« Supprimer mes données » efface aussi vos formes de Pokémon et vos entrées du fil de la communauté",
        ],
        technical: "Corrections & Améliorations",
        technicalList: [
            "De nombreuses petites corrections d'interface : bandeau cookies, contrastes, messages d'erreur plus clairs, page introuvable, fenêtre des formes",
            "Mises à jour techniques en coulisses, pour la sécurité et la fiabilité",
        ],
        close: "Fermer"
    },
    changelogFR_juin2026,
];
