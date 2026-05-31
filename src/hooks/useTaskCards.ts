import { useRef, useCallback } from "react";
import gsap from "gsap";

export const useAnimateCards = (staggerIn = 0.05, staggerOut = 0.04) => {
    const cardsRef = useRef<HTMLDivElement>(null);

    // ── Forward Animation ────────────────────────────────────────────────
    const triggerAnimation = useCallback(() => {
        const container = cardsRef.current;
        if (!container) return;

        const cards = container.querySelectorAll("[data-task-card]");
        if (!cards.length) return;

        gsap.killTweensOf(cards);

        // Instantly force clear baseline styling values to guarantee predictability
        gsap.set(cards, { clearProps: "opacity,transform" });

        gsap.fromTo(
            cards,
            {
                opacity: 0,
                y: 15,
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: staggerIn,
                ease: "power2.out",
                overwrite: "auto",
            },
        );
    }, [staggerIn]);

    // ── Reverse Animation ────────────────────────────────────────────────
    const triggerReverseAnimation = useCallback(
        (onComplete?: () => void) => {
            const container = cardsRef.current;
            if (!container) return;

            const cards = container.querySelectorAll("[data-task-card]");

            if (!cards.length) {
                onComplete?.();
                return;
            }

            gsap.killTweensOf(cards);

            gsap.to(cards, {
                opacity: 0,
                y: -15,
                duration: 0.6,
                stagger: staggerOut,
                ease: "power2.in",
                onComplete: () => {
                    onComplete?.();
                },
            });
        },
        [staggerOut],
    );

    return { cardsRef, triggerAnimation, triggerReverseAnimation };
};
