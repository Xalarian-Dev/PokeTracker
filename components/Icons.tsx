
import React from 'react';

interface IconProps {
  className?: string;
  filled?: boolean;
}

export const StarIcon: React.FC<IconProps> = ({ className, filled }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke={filled ? 'none' : 'currentColor'}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

export const LuxuryBallIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    viewBox="0 0 100 100"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Main Ball */}
    <circle cx="50" cy="50" r="45" fill="#1a1a1a" stroke="#000" strokeWidth="2" />

    {/* Golden middle band */}
    <rect x="5" y="47" width="90" height="6" fill="#d4af37" stroke="#000" strokeWidth="1" />

    {/* Red accents (top) */}
    <path d="M30 25 L50 40 L70 25" fill="none" stroke="#e63946" strokeWidth="4" strokeLinecap="round" />

    {/* Center Button */}
    <circle cx="50" cy="50" r="12" fill="#d4af37" stroke="#000" strokeWidth="2" />
    <circle cx="50" cy="50" r="8" fill="#f8f9fa" stroke="#adb5bd" strokeWidth="1" />
  </svg>
);

export const MasterBallIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    viewBox="0 0 100 100"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <g transform="rotate(-45 50 50)">
      {/* Bottom Half */}
      <circle cx="50" cy="50" r="45" fill="#f8f9fa" stroke="#000" strokeWidth="2" />

      {/* Top Half (Purple) */}
      <path d="M5 50 A45 45 0 0 1 95 50 Z" fill="#7b2cbf" stroke="#000" strokeWidth="2" />

      {/* Pink Circles on top */}
      <circle cx="28" cy="35" r="8" fill="#ff4d6d" />
      <circle cx="72" cy="35" r="8" fill="#ff4d6d" />

      {/* Black divider band */}
      <rect x="5" y="48" width="90" height="4" fill="#1a1a1a" />

      {/* White Button */}
      <circle cx="50" cy="50" r="12" fill="#f8f9fa" stroke="#000" strokeWidth="2" />
      <circle cx="50" cy="50" r="8" fill="#f8f9fa" stroke="#adb5bd" strokeWidth="1" />

      {/* The 'M' */}
      <text x="50" y="38" textAnchor="middle" fill="#f8f9fa" fontSize="24" fontWeight="bold" fontFamily="Arial">M</text>
    </g>
  </svg>
);

export const FranceFlag: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 3 2" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="1" height="2" fill="#002395" />
    <rect x="1" width="1" height="2" fill="#FFFFFF" />
    <rect x="2" width="1" height="2" fill="#ED2939" />
  </svg>
);

export const UKFlag: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 60 30" className={className} xmlns="http://www.w3.org/2000/svg">
    <clipPath id="s">
      <path d="M0,0 v30 h60 v-30 z" />
    </clipPath>
    <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
    <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#s)" stroke="#C8102E" strokeWidth="4" />
    <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
    <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
  </svg>
);

export const JapanFlag: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 3 2" className={className} xmlns="http://www.w3.org/2000/svg" shadow-sm="true">
    <rect width="3" height="2" fill="#fff" />
    <circle cx="1.5" cy="1" r="0.6" fill="#bc002d" />
  </svg>
);
