/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import {
    animateCardsIn,
    animateCardRemove,
    killAnimationsOnClass,
} from "@/lib/gsapAnimations";

interface UseTaskCardsOptions {
    stagger?: number;
    duration?: number;
}

export const useTaskCards = (
    tasks: any[],
    options: UseTaskCardsOptions = {},
) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { stagger = 0.1, duration = 0.4 } = options;

    useGSAP(() => {
        if (containerRef.current) {
            const cards = containerRef.current.querySelectorAll(".task-card");
            if (cards.length > 0) {
                animateCardsIn(cards, { stagger, duration });
            }
        }
    }, [tasks, stagger, duration]);

    const removeCard = async (cardElement: HTMLElement): Promise<void> => {
        await animateCardRemove(cardElement, 0.3);
        cardElement.remove();
    };

    const killAll = () => {
        killAnimationsOnClass("task-card");
    };

    return { containerRef, removeCard, killAll };
};
