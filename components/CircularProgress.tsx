import React from 'react';

interface CircularProgressProps {
    progress: number; // 0-100
    shinyCount: number;
    totalPokemon: number;
    size?: number; // diameter in pixels
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
    size = 120
}) => {
    const radius = (size - 16) / 2; // 16 = strokeWidth * 2
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="flex flex-col items-center justify-center p-6">
            <div className="relative" style={{ width: size, height: size }}>
                {/* Background Circle */}
                <svg className="transform -rotate-90" width={size} height={size}>
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-700"
                    />
                    {/* Progress Circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="text-poke-yellow transition-all duration-500"
                        strokeLinecap="round"
                    />
                </svg>

                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">{Math.round(progress)}%</span>
                </div>
            </div>

            {/* Label */}
            <div className="mt-4 text-center">
                <p className="text-sm font-semibold text-white">ShinyDex</p>
                <p className="text-sm font-semibold text-white">Completed</p>
                <p className="text-xs text-gray-400 mt-1">
                    {shinyCount} / {totalPokemon}
                </p>
            </div>
        </div>
    );
};

export default CircularProgress;
