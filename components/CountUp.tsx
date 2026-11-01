import React, { useEffect, useRef, useState } from 'react';

interface CountUpProps {
    value: number;
    /** Durée de l'animation en millisecondes */
    duration?: number;
    className?: string;
}

/** Nombre qui monte de 0 à `value` à l'apparition à l'écran. Valeur finale directe avec « réduire les animations ». */
const CountUp: React.FC<CountUpProps> = ({ value, duration = 1200, className }) => {
    const ref = useRef<HTMLSpanElement | null>(null);
    const [shown, setShown] = useState(0);
    const started = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        if (reduced || typeof IntersectionObserver === 'undefined') {
            setShown(value);
            return;
        }
        let raf = 0;
        const run = () => {
            if (started.current) return;
            started.current = true;
            const t0 = performance.now();
            const tick = (now: number) => {
                const p = Math.min(1, (now - t0) / duration);
                const eased = 1 - Math.pow(1 - p, 3);
                setShown(Math.round(value * eased));
                if (p < 1) raf = requestAnimationFrame(tick);
            };
            raf = requestAnimationFrame(tick);
        };
        const observer = new IntersectionObserver(entries => {
            if (entries.some(e => e.isIntersecting)) {
                run();
                observer.disconnect();
            }
        });
        observer.observe(el);
        return () => {
            observer.disconnect();
            cancelAnimationFrame(raf);
        };
    }, [value, duration]);

    // Le lecteur d'écran lit toujours la valeur finale
    return (
        <span ref={ref} className={className} aria-label={value.toLocaleString()}>
            <span aria-hidden="true">{shown.toLocaleString()}</span>
        </span>
    );
};

export default CountUp;
