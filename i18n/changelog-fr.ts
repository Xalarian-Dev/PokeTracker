import { ChangeLogEntry } from './changelog-en';

export const changelogFR: ChangeLogEntry = {
    title: "Nouveautés",
    date: "14 mars 2026",
    sectionTitle: "Support espagnol & Améliorations de qualité",
    features: "Nouvelles fonctionnalités",
    featuresList: [
        "Langue espagnole : Traduction complète en espagnol ajoutée dans toute l'application (interface, jeux, formes, pages légales, SEO)",
        "Gestion d'erreurs : L'application gère désormais les erreurs inattendues avec une option de réessai au lieu d'un écran blanc",
        "Scroll passif : Amélioration des performances de défilement sur tous les appareils",
    ],
    security: "Améliorations de sécurité",
    securityList: [
        "CORS API : Accès API restreint au domaine de production uniquement (était ouvert à toutes les origines)",
        "Token d'authentification : Remplacement du stockage global non sécurisé par un store sécurisé au niveau module",
        "Suppression du champ legacy de hash de mot de passe des types de données utilisateur",
    ],
    technical: "Améliorations techniques",
    technicalList: [
        "Refactorisation de ShinyTracker (850+ lignes) en hooks et composants ciblés pour une meilleure maintenabilité",
        "Centralisation de l'authentification API dans un module partagé unique (suppression du code dupliqué)",
        "Suppression de 50+ appels console.log de débogage et du service d'authentification legacy inutilisé",
        "Suppression du hook de détection mobile dupliqué et correction des directives TypeScript @ts-ignore",
    ],
    close: "Fermer"
};
