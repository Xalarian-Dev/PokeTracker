import React from 'react';

interface SpotlightCardProps extends React.HTMLAttributes<HTMLElement> {
    as?: 'div' | 'li';
}

/** Carte dont un halo suit le pointeur (écrans à souris uniquement : l'effet CSS est inactif au toucher). */
const SpotlightCard: React.FC<SpotlightCardProps> = ({ as = 'div', className = '', children, onPointerMove, ...rest }) => {
    const Tag = as as React.ElementType;
    const handleMove = (e: React.PointerEvent<HTMLElement>) => {
        if (e.pointerType === 'mouse') {
            const rect = e.currentTarget.getBoundingClientRect();
            e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
            e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
        }
        onPointerMove?.(e);
    };
    return (
        <Tag className={`spotlight-card ${className}`} onPointerMove={handleMove} {...rest}>
            {children}
        </Tag>
    );
};

export default SpotlightCard;
