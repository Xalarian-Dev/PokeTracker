import { ChangeLogEntry } from './changelog-en';

export const changelogES: ChangeLogEntry = {
    title: "Novedades",
    date: "31 de mayo de 2026",
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
    ],
    close: "Cerrar"
};
