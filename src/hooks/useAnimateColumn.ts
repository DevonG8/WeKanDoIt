import { useRef, useState, useCallback } from "react";
import {
    animateColumnOpen,
    animateColumnClose,
    killAllAnimations,
} from "@/lib/gsapAnimations";

export const useAnimatedColumn = () => {
    const columnRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);

    const toggleColumn = useCallback(async () => {
        const element = columnRef.current;
        if (!element) return;

        if (isOpen) {
            await animateColumnClose(element);
        } else {
            await animateColumnOpen(element);
        }
        setIsOpen(!isOpen);
    }, [isOpen]);

    const reset = useCallback(() => {
        const element = columnRef.current;
        if (element) {
            killAllAnimations(element);
        }
        setIsOpen(false);
    }, []);

    return { columnRef, toggleColumn, isOpen, reset };
};
