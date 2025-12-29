
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

export const SparklesIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    {/* Large sparkle */}
    <path d="M12 0L13.5 6.5L20 8L13.5 9.5L12 16L10.5 9.5L4 8L10.5 6.5L12 0Z" />
    {/* Small sparkle top right */}
    <path d="M19 3L19.5 5L21.5 5.5L19.5 6L19 8L18.5 6L16.5 5.5L18.5 5L19 3Z" />
    {/* Small sparkle bottom left */}
    <path d="M5 16L5.5 18L7.5 18.5L5.5 19L5 21L4.5 19L2.5 18.5L4.5 18L5 16Z" />
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

export const IsleOfArmorIcon: React.FC<IconProps> = ({ className }) => (
  <img
    src="/assets/isle-of-armor.png"
    alt="Isle of Armor DLC"
    className={className}
  />
);

export const CrownTundraIcon: React.FC<IconProps> = ({ className }) => (
  <img
    src="/assets/crown-tundra.png"
    alt="Crown Tundra DLC"
    className={className}
  />
);

export const TealMaskIcon: React.FC<IconProps> = ({ className }) => (
  <img
    src="/assets/teal-mask.png"
    alt="Teal Mask DLC"
    className={className}
  />
);

export const IndigoDiskIcon: React.FC<IconProps> = ({ className }) => (
  <img
    src="/assets/indigo-disk.png"
    alt="Indigo Disk DLC"
    className={className}
  />
);

export const MegaDimensionIcon: React.FC<IconProps> = ({ className }) => (
  <img
    src="/assets/mega-dimension.png"
    alt="Mega Dimension"
    className={className}
  />
);

export const EventIcon: React.FC<IconProps> = ({ className }) => (
  <img
    src="/assets/event-icon.png"
    alt="Event Item Required"
    className={className}
  />
);

export const DiceIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="7" cy="7" r="1.5" />
    <circle cx="17" cy="17" r="1.5" />
    <circle cx="17" cy="7" r="1.5" />
    <circle cx="7" cy="17" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
  </svg>
);



export const LockIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
  >
    <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm3 8H9V7a3 3 0 0 1 6 0z" />
  </svg>
);

export const CartridgeIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
  >
    <path d="M7 2h10c.55 0 1 .45 1 1v18c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1V3c0-.55.45-1 1-1zm2 3v10h6V5H9zm1 14h4v2h-4v-2z" />
  </svg>
);

export const RaidEventIcon: React.FC<IconProps> = ({ className }) => (
  <img
    src="/assets/raid-event.png"
    alt="Raid Event"
    className={className}
  />
);

export const DynamaxAdventureIcon: React.FC<IconProps> = ({ className }) => (
  <img
    src="/assets/dynamax-adventure.png"
    alt="Dynamax Adventure"
    className={className}
  />
);

