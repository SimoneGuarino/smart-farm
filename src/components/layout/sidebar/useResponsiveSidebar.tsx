import { useEffect, useRef, useCallback, useState } from "react";

export function useResponsiveSidebar(breakpoint = 1280) {
    const frame = useRef<number | null>(null);
    const [isMobile, setIsMobile] = useState<boolean>(() => window.innerWidth < breakpoint);

    const update = useCallback(() => {
        const mobile = window.innerWidth < breakpoint;
        setIsMobile(mobile);
    }, [breakpoint]);

    const onResize = useCallback(() => {
        if (frame.current != null) return;
        frame.current = requestAnimationFrame(() => {
            frame.current = null;
            update();
        });
    }, [update]);

    useEffect(() => {
        update();
        window.addEventListener("resize", onResize, { passive: true });
        return () => {
            window.removeEventListener("resize", onResize);
            if (frame.current != null) cancelAnimationFrame(frame.current);
        };
    }, [onResize, update]);

    return { isMobile };
}
