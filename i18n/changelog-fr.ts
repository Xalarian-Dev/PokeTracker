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
        sectionTitle: "Statistiques, légende des icônes et corrections d'interface",
        features: "Nouvelles fonctionnalités",
        featuresList: [
            "Statistiques : fonds colorés et lettre A / G / H / P pour les formes régionales, couronne dorée pour les légendaires, étoiles pour les fabuleux. Profil : nouvelle mise en page avec la progression globale et toutes vos statistiques (génération, jeu, spéciaux, régions). Collection : le jeu et le nombre de rencontres s'affichent sur les cartes shiny quand on les a (en infobulle sur mobile). Nouvelle police pour les titres et les chiffres",
            "Nouveau look : fond nuit avec lueurs, en-tête et barre de filtres en verre dépoli, accueil animé (titre en dégradé, compteur, apparition au défilement, halo et lévitation des sprites), reflet sur le bouton principal et éclat au survol des cartes shiny. Les animations respectent le réglage « réduire les animations »",
            "Nouvelle adresse : PokeTracker est maintenant sur pokemonshinytracker.com. L'ancienne adresse (pokemonshinytracker.vercel.app) redirige automatiquement vers la nouvelle ; pensez à mettre à jour vos favoris. Votre compte et vos données sont conservés",
            "Page « Chasse » : la recherche d'un Pokémon est maintenant en premier, suivie du bouton « Chasse Aléatoire »",
            "Page d'accueil : à l'arrivée sur le site, une présentation (principe en 3 étapes, fonctionnalités, activité de la communauté en direct) avec les boutons de création de compte et de connexion. La collection est maintenant sur /collection ; une fois connecté, vous arrivez directement dessus",
            "Communauté : la page occupe toute la largeur sur ordinateur, avec de grandes cartes qui affichent aussi le jeu utilisé et le nombre de rencontres des captures faites depuis la page Chasse",
            "Page « Chasse » : la recherche se parcourt au clavier (↑ ↓ Entrée), affiche aussi les Pokémon déjà capturés (« Déjà capturé ») ; en choisir un montre le jeu et le nombre de rencontres enregistrés, modifiables. L'animation d'étoiles se rejoue à chaque cible choisie",
            "Page « Chasse » : tirez une cible au sort ou choisissez-la vous-même, indiquez le jeu utilisé, comptez vos rencontres (boutons + / −, saisie directe ou clavier : +, − , flèches, Espace), puis « Capturé ! » enregistre le shiny avec le jeu et le nombre de rencontres. La chasse en cours est conservée si vous rechargez la page",
            "Statistiques : la page occupe toute la largeur sur ordinateur, avec des blocs plus grands ; en-tête compact (icônes seules) sur les écrans moyens pour ne plus chevaucher le nom de dresseur ; « Chasse aléatoire » devient « Chasse » dans le menu",
            "Nouvelle navigation : les languettes latérales sont remplacées par un menu dans l'en-tête (Collection, Statistiques, Communauté, Chasse aléatoire) et par une barre de navigation en bas sur mobile ; chaque page a sa propre adresse (/stats, /communaute, /chasse)",
            "Filtres : une barre fixe sous l'en-tête regroupe la recherche, la génération, le jeu et « manquants / shiny seulement » ; « Tous les filtres » ouvre le détail ; les filtres actifs sont rappelés, se retirent d'un clic, avec « Tout réinitialiser »",
            "« Signaler un problème » se trouve maintenant dans le pied de page",
            "Statistiques : nouveaux blocs de progression par génération, par jeu, « Spécial » (starters, légendaires, fabuleux) et formes régionales",
            "Légende des icônes : un bouton « Légende » explique les icônes des cartes, rangées par génération et adaptées au jeu ou à la génération filtrés",
            "Les icônes d'information (DLC, Shiny Lock, événement, raid…) s'affichent aussi sur les cartes mobiles (3 au maximum)",
            "Forme favorite disponible sur mobile, comme sur ordinateur",
            "Recherche : un bouton permet d'effacer le texte saisi",
            "Page introuvable : une vraie page 404 avec retour à la collection, à la place de la redirection silencieuse",
            "Fil de la communauté : limite de 3 entrées par joueur appliquée, retirer un shiny le retire aussi du fil, identifiant de compte masqué aux visiteurs",
            "Mobile : 4 cartes par ligne, texte plus gros et bouton « + » plus facile à toucher",
        ],
        security: "Sécurité & confidentialité",
        securityList: [
            "« Supprimer mes données » efface aussi vos formes de Pokémon et vos entrées du fil de la communauté",
            "Identifiants, pseudos et listes de jeux invalides refusés ; dépendances vulnérables mises à jour",
        ],
        technical: "Corrections & Améliorations",
        technicalList: [
            "Le bandeau cookies ne bloque plus la page",
            "Contrastes renforcés (bouton « + », boutons rouge et indigo, filtres de jeu) et plus aucun texte sous 12 px",
            "Erreurs visibles : des messages à l'écran remplacent les boîtes du navigateur (export, session expirée, enregistrement du profil) ; la fenêtre de synchronisation des données locales affichait un nom de clé au lieu d'un texte",
            "Fenêtre des formes : se ferme avec Échap, textes traduits dans les quatre langues",
            "Profil : plus de retour automatique à l'accueil après l'enregistrement ; profil public : nom des Pokémon visible et carte conservée si une image manque",
            "Animations réduites si votre système le demande",
            "Mises à jour techniques : Tailwind 4, Vite 8, Clerk 6, icônes lucide 1.61, fonctions serveur Node 24",
        ],
        close: "Fermer"
    },
    changelogFR_juin2026,
];
