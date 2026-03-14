import { ChangeLogEntry } from './changelog-en';

export const changelogES: ChangeLogEntry = {
    title: "Novedades",
    date: "14 de marzo de 2026",
    sectionTitle: "Soporte en español & Mejoras de calidad",
    features: "Nuevas funcionalidades",
    featuresList: [
        "Idioma español: Traducción completa al español añadida en toda la aplicación (interfaz, juegos, formas, páginas legales, SEO)",
        "Gestión de errores: La aplicación ahora maneja errores inesperados con una opción de reintentar en lugar de una pantalla en blanco",
        "Scroll pasivo: Mejora del rendimiento de desplazamiento en todos los dispositivos",
    ],
    security: "Mejoras de seguridad",
    securityList: [
        "CORS API: Acceso API restringido únicamente al dominio de producción (antes estaba abierto a todos los orígenes)",
        "Token de autenticación: Reemplazo del almacenamiento global inseguro por un almacén seguro a nivel de módulo",
        "Eliminación del campo legacy de hash de contraseña de los tipos de datos de usuario",
    ],
    technical: "Mejoras técnicas",
    technicalList: [
        "Refactorización de ShinyTracker (más de 850 líneas) en hooks y componentes enfocados para mejor mantenibilidad",
        "Centralización de la autenticación API en un módulo compartido único (eliminación de código duplicado)",
        "Eliminación de más de 50 llamadas console.log de depuración y del servicio de autenticación legacy no utilizado",
        "Eliminación del hook duplicado de detección móvil y corrección de directivas TypeScript @ts-ignore",
    ],
    close: "Cerrar"
};
