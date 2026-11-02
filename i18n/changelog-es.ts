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
        sectionTitle: "Nueva dirección, nuevo aspecto y página Caza",
        features: "Nuevas funcionalidades",
        featuresList: [
            "Nueva dirección: PokeTracker ahora está en pokemonshinytracker.com. Recuerda actualizar tus favoritos: la dirección anterior dejará de redirigir dentro de unos meses. Tu cuenta y tus datos se mantienen",
            "Una dirección por idioma: el sitio se abre en /fr/, /en/, /es/ o /jp/. Al cambiar de idioma cambia la dirección, y un enlace compartido se abre directamente en el idioma correcto",
            "Nuevo aspecto: un tema nocturno con toques dorados, una página de inicio animada y tarjetas shiny que brillan al marcarlas",
            "Página de inicio: una presentación del sitio para los nuevos visitantes. El botón «Shiny Tracker» siempre te lleva a ella; al iniciar sesión desde el inicio, llegas directamente a tu colección",
            "Página «Caza»: sortea un objetivo o elígelo, cuenta tus encuentros y guarda tu captura con el juego utilizado y el número de encuentros",
            "Estadísticas y perfil: un progreso más detallado (por generación, por juego, legendarios, formas regionales…) y un perfil más completo",
            "Comunidad: una página más amplia, que muestra también el juego y el número de encuentros de las capturas",
            "Navegación y filtros renovados: un menú en la cabecera (una barra inferior en móvil) y una barra de filtros siempre a mano",
            "Leyenda de iconos: un botón explica qué significan los iconos de las tarjetas",
            "En móvil: tarjetas más legibles, ahora con los iconos informativos y la forma favorita",
        ],
        security: "Seguridad y privacidad",
        securityList: [
            "Aviso legal y política de privacidad actualizados: tus datos se alojan ahora en nuestro propio servidor (OVH, en Europa), y ya no en Supabase ni Vercel",
            "«Eliminar mis datos» también borra tus formas de Pokémon y tus entradas del feed de la comunidad",
        ],
        technical: "Correcciones y mejoras",
        technicalList: [
            "Muchas pequeñas correcciones de interfaz: banner de cookies, contraste, mensajes de error más claros, página no encontrada, ventana de formas",
            "Actualizaciones técnicas entre bastidores, para mejorar la seguridad y la fiabilidad",
        ],
        close: "Cerrar"
    },
    changelogES_juin2026,
];
