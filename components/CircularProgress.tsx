import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface CircularProgressProps {
    progress: number; // 0-100
    shinyCount: number;
    totalPokemon: number;
    size?: number; // diameter in pixels
    /** Fond doux du cercle (valeur CSS `background`), affiché derrière le pourcentage */
    background?: string;
    /** Texte en filigrane (ex. chiffre romain), très discret, derrière le pourcentage */
    watermark?: string;
    /** Léger contour sur le pourcentage, pour les fonds clairs */
    textOutline?: boolean;
}

/**
 * Composant CircularProgress - Indicateur de progression circulaire
 * 
 * @example
 * <CircularProgress
 *   progress={35}
 *   shinyCount={150}
 *   totalPokemon={1025}
 *   size={120}
 * />
 */
export const CircularProgress: React.FC<CircularProgressProps> = ({
    progress,
    shinyCount,
    totalPokemon,
    size = 120,
    background,
    watermark,
    textOutline = false
}) => {
    const { t } = useLanguage();

    // Ajuster le strokeWidth pour les petites tailles
    const strokeWidth = size < 80 ? 4 : 8;
    const radius = (size - strokeWidth * 2) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    // Afficher le texte et labels seulement si assez grand
    const showText = size >= 80;
    const showLabel = size >= 100;

    return (
        <div className="flex flex-col items-center justify-center" style={{ padding: showLabel ? '1.5rem' : '0' }}>
            <div className="relative" style={{ width: size, height: size }}>
                {/* Background Circle */}
                <svg className="transform -rotate-90" width={size} height={size}>
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        fill="none"
                        className="text-gray-700"
                    />
                    {/* Progress Circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="text-poke-yellow transition-all duration-500"
                        strokeLinecap="round"
                    />
                </svg>

                {/* Fond coloré discret (atténué pour garder l'anneau jaune lisible) */}
                {showText && background && (
                    <div
                        aria-hidden="true"
                        className="absolute rounded-full pointer-events-none"
                        style={{ inset: strokeWidth * 1.5, background, opacity: 0.4 }}
                    />
                )}
                {showText && watermark && (
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none font-bold text-white"
                        style={{ opacity: 0.2, fontSize: size * 0.5, lineHeight: 1 }}
                    >
                        {watermark}
                    </div>
                )}

                {/* Center Text - only for larger sizes */}
                {showText && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span
                            className={`font-bold text-white ${size < 100 ? 'text-sm' : 'text-3xl'}`}
                            style={textOutline ? { textShadow: '0 0 3px #000, 0 0 3px #000, 0 0 2px #000' } : undefined}
                        >
                            {Math.round(progress)}%
                        </span>
                    </div>
                )}
            </div>

            {/* Label - only for larger sizes */}
            {showLabel && (
                <div className="mt-4 text-center">
                    <p className="text-sm font-semibold text-white">{t('shinydex_completed')}</p>
                    <p className="text-xs text-gray-400 mt-1">
                        {shinyCount} / {totalPokemon}
                    </p>
                </div>
            )}
        </div>
    );
};

export default CircularProgress;
