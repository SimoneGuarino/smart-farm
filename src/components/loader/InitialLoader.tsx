// app/components/InitialLoader.tsx
'use client';

import { ReactNode, useState, useEffect } from 'react';
import SplashLoader from './SplashLoader';

interface InitialLoaderProps {
    children: ReactNode;
    /**
     * Durata minima (in ms) che vogliamo far rimanere lo splash
     * prima di mostrare i figli. Di default andiamo 1200ms (=1.2s).
     */
    minDuration?: number;
}

export default function InitialLoader({
    children,
    minDuration = 1200,
}: InitialLoaderProps) {
    // ❶ stato per sapere se React ha idratato (montato in client)
    const [hydrated, setHydrated] = useState(false);
    // ❷ stato per sapere se è passato il “minimum hold time”
    const [delayDone, setDelayDone] = useState(false);

    useEffect(() => {
        // NON siamo ancora in client, ma appena entriamo in questo useEffect
        // significa che la componente è stata montata sul client → hydration ok
        setHydrated(true);

        // Lanciamo un timer per la durata minima che vogliamo far restare lo splash
        const handle = setTimeout(() => {
            setDelayDone(true);
        }, minDuration);

        // Cleanup (nel raro caso React smonti subito):
        return () => clearTimeout(handle);
    }, [minDuration]);

    // Mostriamo splash se NON sono soddisfatti entrambi i flag
    if (!(hydrated && delayDone)) {
        return <SplashLoader />;
    }

    // Altrimenti renderizziamo i figli veri
    return <>{children}</>;
}
