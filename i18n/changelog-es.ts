import { ChangeLogEntry } from './changelog-en';

/** Entrée de juin 2026 (conservée telle quelle) */
const changelogES_juin2026: ChangeLogEntry = {
    title: "Novedades",
    date: "16 de junio de 2026",
    sectionTitle: "Funciones Comunitarias, Perfiles Públicos y Filtro DLC",
    features: "Nuevas funcionalidades",
    featuresList: [
        "ID de Entrenador: elige un identificador único y permanente en el primer inicio de sesión — aparece en la URL de tu perfil público (/u/tu-id) y se muestra en el encabezado",
        "Perfiles públicos: visita la página de cualquier entrenador para ver su colección completa de shiny, estadísticas, porcentaje de completado y formas favoritas",
        "Feed comunitario: un panel en vivo a la derecha muestra las capturas shiny recientes de todos los entrenadores en tiempo real — haz clic en una entrada para visitar su perfil",
        "Filtro DLC: al seleccionar Espada/Escudo, Escarlata/Púrpura o Leyendas Z-A, aparecen botones DLC bajo el filtro de juego — activos cuando se muestran, en gris cuando se ocultan",
        "Formas en móvil: los Pokémon con múltiples formas (Rotom, Arceus, Vivillon…) ahora tienen un botón '+' en las tarjetas móviles que abre el modal completo de formas",
        "Insignia Shiny Lock en móvil: aparece un icono de candado en las tarjetas móviles para Pokémon con Shiny Lock",
        "Marcar todo / Desmarcar todo disponible en móvil: las acciones masivas ya no son exclusivas del escritorio",
        "Rediseño de la página de Perfil: completamente renovada para coincidir con el tema oscuro de la aplicación — chips de juegos en lugar de casillas de verificación, acentos amarillos, diseño coherente",
        "La página de Perfil ahora tiene su propia URL (/profile): los botones atrás/adelante del navegador funcionan correctamente y la página se puede guardar en marcadores",
    ],
    technical: "Correcciones y Mejoras",
    technicalList: [
        "Corrección del zoom en iOS provocado por campos de texto con tamaño de fuente inferior a 16px (barra de búsqueda, formulario de comentarios, perfil)",
        "Corrección del botón de alternancia del panel inaccesible mientras el panel estaba abierto (conflicto de z-index con el fondo)",
        "Corrección del botón de volver arriba que nunca aparecía en móvil (escuchaba el scroll de window en lugar del contenedor interno)",
        "Corrección de la página de Perfil que se deslizaba bajo el encabezado fijo en móvil — el contenido ahora respeta la altura de 64px",
        "Corrección del destello de tarjetas de escritorio en el primer renderizado móvil (useIsMobile ahora se inicializa de forma síncrona)",
        "Corrección de CookieConsent y FormsModal que ignoraban las zonas seguras de iOS (muesca, Dynamic Island, indicador de inicio)",
        "Eliminación de zonas de desplazamiento anidadas en la lista de juegos del panel y la cuadrícula de juegos poseídos",
        "Caché de sprites: un service worker almacena en caché todos los sprites Pokémon tras la primera carga — instantáneo en visitas posteriores",
        "Añadido decoding='async' en todas las imágenes de sprites para reducir las interrupciones al desplazarse",
        "Botones de pestañas del panel, FilterChips y otros objetivos táctiles ampliados para cumplir el mínimo de 44px",
        "Corrección de todos los errores TypeScript preexistentes (@types/react faltante, import.meta.env, tipos de componentes de clase)",
        "Feed comunitario: corregidas las entradas duplicadas y las capturas atascadas/obsoletas, el límite por entrenador sube a 3 capturas recientes, y el panel ahora muestra hasta 40 entradas",
    ],
    close: "Cerrar"
};

/** Entrées du journal « Nouveautés », de la plus récente à la plus ancienne */
export const changelogES: ChangeLogEntry[] = [
    {
        title: "Novedades",
        date: "1 de noviembre de 2026",
        sectionTitle: "Estadísticas, leyenda de iconos y correcciones de interfaz",
        features: "Nuevas funcionalidades",
        featuresList: [
            "Página \"Caza\": sortea un objetivo o elígelo tú, indica el juego utilizado, cuenta tus encuentros (botones + / − o entrada directa) y \"¡Capturado!\" guarda el shiny con su juego y número de encuentros. La caza en curso se conserva si recargas la página",
            "Estadísticas: la página usa todo el ancho en ordenador, con bloques más grandes; cabecera compacta (solo iconos) en pantallas medianas para que ya no se solape con el nombre de entrenador; \"Caza aleatoria\" pasa a ser \"Caza\" en el menú",
            "Nueva navegación: las pestañas laterales se sustituyen por un menú en la cabecera (Colección, Estadísticas, Comunidad, Caza aleatoria) y por una barra de navegación inferior en móvil; cada página tiene su propia dirección (/stats, /communaute, /chasse)",
            "Filtros: una barra fija bajo la cabecera reúne la búsqueda, la generación, el juego y \"faltantes / solo shiny\"; \"Todos los filtros\" abre el detalle; los filtros activos se muestran, se quitan con un clic, con \"Restablecer todo\"",
            "\"Informar de un problema\" está ahora en el pie de página",
            "Estadísticas: nuevos bloques de progreso por generación, por juego, \"Especial\" (iniciales, legendarios, singulares) y formas regionales",
            "Leyenda de iconos: un botón \"Leyenda\" explica los iconos de las tarjetas, agrupados por generación y adaptados al juego o la generación filtrados",
            "Los iconos informativos (DLC, Shiny Lock, evento, incursión…) también aparecen en las tarjetas móviles (3 como máximo)",
            "Forma favorita disponible en móvil, igual que en ordenador",
            "Búsqueda: un botón permite borrar el texto escrito",
            "Página no encontrada: una verdadera página 404 con enlace a la colección, en lugar de la redirección silenciosa",
            "Feed de la comunidad: límite de 3 entradas por jugador aplicado, quitar un shiny también lo quita del feed, ID de cuenta oculto a los visitantes",
            "Móvil: 4 tarjetas por fila, texto más grande y botón \"+\" más fácil de pulsar",
        ],
        security: "Seguridad y privacidad",
        securityList: [
            "\"Eliminar mis datos\" también borra tus formas de Pokémon y tus entradas del feed de la comunidad",
            "Se rechazan ID, nombres de usuario y listas de juegos no válidos; dependencias vulnerables actualizadas",
        ],
        technical: "Correcciones y mejoras",
        technicalList: [
            "El banner de cookies ya no bloquea la página",
            "Contraste reforzado (botón \"+\", botones rojo e índigo, filtros de juego) y ningún texto por debajo de 12 px",
            "Errores visibles: mensajes en pantalla sustituyen a los cuadros del navegador (exportación, sesión caducada, guardado del perfil); la ventana de sincronización de datos locales mostraba un nombre de clave en vez de un texto",
            "Ventana de formas: se cierra con Esc, textos traducidos en los cuatro idiomas",
            "Perfil: ya no vuelve automáticamente al inicio tras guardar; perfil público: nombre de los Pokémon visible y la tarjeta se conserva si falta una imagen",
            "Animaciones reducidas si tu sistema lo solicita",
            "Actualizaciones técnicas: Tailwind 4, Vite 8, Clerk 6, iconos lucide 1.61, funciones de servidor Node 24",
        ],
        close: "Cerrar"
    },
    changelogES_juin2026,
];
