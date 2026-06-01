import { useRef, useState, useCallback } from "react";
import {
    animateColumnOpen,
    animateColumnClose,
    killAllAnimations,
} from "@/lib/gsapAnimations";

/**
 * Manages a column's open/close animation.
 * Accepts an optional `onOpen` callback — use it to trigger card entrance
 * animations after the column finishes opening.
 */
export const useAnimatedColumn = (onOpen?: () => void, initialOpen = false) => {
    const columnRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(initialOpen);

    const toggleColumn = useCallback(async () => {
        const element = columnRef.current;
        if (!element) return;

        if (isOpen) {
            await animateColumnClose(element);
            setIsOpen(false);
        } else {
            await animateColumnOpen(element);
            setIsOpen(true);
            // Fire card entrance after column has opened
            onOpen?.();
        }
    }, [isOpen, onOpen]);

    const reset = useCallback(() => {
        const element = columnRef.current;
        if (element) killAllAnimations(element);
        setIsOpen(false);
    }, []);

    return { columnRef, toggleColumn, isOpen, reset };
};
