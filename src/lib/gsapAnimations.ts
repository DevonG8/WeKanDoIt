/* eslint-disable @typescript-eslint/no-unused-vars */
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { Flip } from "gsap/Flip";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { TextPlugin } from "gsap/TextPlugin";

gsap.registerPlugin(
    Draggable,
    Flip,
    InertiaPlugin,
    MotionPathPlugin,
    TextPlugin,
);

interface AnimationOptions {
    duration?: number;
    ease?: string;
    stagger?: number;
}

interface CardExpandOptions extends AnimationOptions {
    onComplete?: () => void;
    overlaySelector?: string;
    contentSelector?: string;
}

// COLUMN ANIMATIONS

/**
 * Animates a column open from height 0 → auto.
 * Uses a regular tween — Flip is not suited for height toggling.
 */
export const animateColumnOpen = (
    element: HTMLElement | null,
    duration = 0.3,
): gsap.core.Tween | gsap.core.Timeline => {
    if (!element) return gsap.to({}, {});

    // Ensure we start from a collapsed state so there's always something to animate
    gsap.set(element, { height: 0, opacity: 0, overflow: "hidden" });

    return gsap.to(element, {
        height: "100%",
        opacity: 1,
        duration,
        ease: "expo.inOut",
        clearProps: "height,overflow", // restore natural layout after animation
    });
};

/**
 * Animates a column closed from current height → 0.
 */
export const animateColumnClose = (
    element: HTMLElement | null,
    duration = 0.4,
): gsap.core.Tween | gsap.core.Timeline => {
    if (!element) return gsap.to({}, {});

    return gsap.to(element, {
        height: 0,
        opacity: 0,
        duration,
        ease: "power2.inOut",
        overflow: "hidden",
    });
};

/**
 * Simultaneously opens one column and closes another.
 */
export const createColumnTimeline = (
    openElement: HTMLElement | null,
    closeElement: HTMLElement | null,
    duration = 0.5,
): gsap.core.Timeline => {
    const tl = gsap.timeline();

    if (closeElement) {
        tl.to(
            closeElement,
            {
                height: 0,
                opacity: 0,
                duration,
                ease: "power2.inOut",
                overflow: "hidden",
            },
            0,
        );
    }

    if (openElement) {
        // Make sure it starts collapsed before opening
        gsap.set(openElement, { height: 0, opacity: 0, overflow: "hidden" });
        tl.to(
            openElement,
            {
                height: "auto",
                opacity: 1,
                duration,
                ease: "power2.inOut",
                clearProps: "height,overflow",
            },
            0,
        );
    }

    return tl;
};

// TASK CARD ANIMATIONS

/**
 * Staggers cards in from below with a fade.
 * duration and stagger are in seconds.
 */
export const animateCardsIn = (
    elements: HTMLElement[] | NodeListOf<Element>,
    options: AnimationOptions = {},
): gsap.core.Tween => {
    const { duration = 0.4, stagger = 0.05, ease = "back.out(1.4)" } = options;

    return gsap.from(elements, {
        opacity: 0,
        y: 20,
        duration,
        stagger,
        ease,
    });
};

/**
 * Fades and slides a single card upward, then removes it from the DOM.
 */
export const animateCardRemove = (
    element: HTMLElement | null,
    duration = 0.2,
): gsap.core.Tween => {
    if (!element) return gsap.to({}, {});

    return gsap.to(element, {
        opacity: 0,
        y: -20,
        duration,
        ease: "power2.in",
        onComplete: () => element.remove(),
    });
};

/**
 * Pulses an element to 95% scale and back — useful for drag-cancel feedback.
 */
export const createReversibleAnimation = (
    element: HTMLElement | null,
    options: AnimationOptions = {},
): gsap.core.Tween => {
    if (!element) return gsap.to({}, {});

    const { duration = 0.2, ease = "power2.inOut" } = options;

    return gsap.to(element, {
        opacity: 0.5,
        scale: 0.95,
        duration,
        ease,
        yoyo: true,
        repeat: 1,
    });
};

// FLIP-BASED CARD EXPANSION

let activeCard: HTMLElement | null = null;

/**
 * Expands a card into a centered detail panel using GSAP Flip.
 *
 * Flow:
 *  1. Fit detail panel on top of the card (Flip.fit)
 *  2. Capture that initial state (Flip.getState)
 *  3. Move detail panel to its final centered position
 *  4. Animate FROM the captured state → final position (Flip.from)
 */
export const animateCardExpand = (
    cardItem: HTMLElement | null,
    detailPanel: HTMLElement | null,
    options: CardExpandOptions = {},
): gsap.core.Timeline => {
    const {
        duration = 0.5,
        ease = "power2.inOut",
        onComplete,
        overlaySelector = ".card-overlay",
        contentSelector = ".card-content",
    } = options;

    if (!cardItem || !detailPanel) return gsap.timeline();

    // If a different card is already open, collapse it first, then re-expand
    if (activeCard && activeCard !== cardItem) {
        return animateCardCollapse(detailPanel, {
            duration,
            ease,
            onComplete: () => animateCardExpand(cardItem, detailPanel, options),
        });
    }

    const overlay = document.querySelector(overlaySelector);
    const contentPanel = detailPanel.querySelector(contentSelector);
    const allCards = gsap.utils.toArray<HTMLElement>(".card-item");

    const tl = gsap.timeline();

    Flip.fit(detailPanel, cardItem, { scale: true });
    const state = Flip.getState(detailPanel);

    gsap.set(detailPanel, {
        clearProps: "all",
        position: "fixed",
        top: "50%",
        left: "50%",
        xPercent: -50,
        yPercent: -50,
        visibility: "visible",
        overflow: "hidden",
        zIndex: 100,
    });

    tl.to(
        allCards,
        {
            opacity: 0.3,
            scale: 0.98,
            stagger: {
                amount: 0.2,
                from: allCards.indexOf(cardItem),
            },
            duration: duration * 0.6,
        },
        0,
    );

    // Fade in overlay
    if (overlay) {
        tl.to(overlay, { opacity: 1, duration: duration * 0.6 }, 0);
    }

    // Step 4: Animate from card position → final centered position
    tl.add(
        Flip.from(state, {
            duration,
            ease,
            scale: true,
            onComplete: () => {
                gsap.set(detailPanel, { overflow: "auto" });
                onComplete?.();
            },
        }),
        0.05,
    );

    // Slide content panel in from above
    if (contentPanel) {
        gsap.set(contentPanel, { yPercent: -100, opacity: 0 });
        tl.to(
            contentPanel,
            {
                yPercent: 0,
                opacity: 1,
                duration: duration * 0.9,
                ease: "power2.out",
            },
            duration * 0.3,
        );
    }

    activeCard = cardItem;
    document.addEventListener("click", handleCardClickOutside);

    return tl;
};

/**
 * Collapses the detail panel back to the originating card using GSAP Flip.
 */
export const animateCardCollapse = (
    detailPanel: HTMLElement | null,
    options: CardExpandOptions = {},
): gsap.core.Timeline => {
    const { duration = 0.5, ease = "power2.inOut", onComplete } = options;

    if (!detailPanel || !activeCard) return gsap.timeline();

    document.removeEventListener("click", handleCardClickOutside);

    const overlay = document.querySelector(".card-overlay");
    const contentPanel = detailPanel.querySelector(".card-content");
    const allCards = gsap.utils.toArray<HTMLElement>(".card-item");
    const originCard = activeCard; // capture ref before nulling

    const tl = gsap.timeline();

    gsap.set(detailPanel, { overflow: "hidden" });

    // Snapshot expanded state, then fit panel back onto the origin card
    const state = Flip.getState(detailPanel);
    Flip.fit(detailPanel, originCard, { scale: true });

    // Slide content out first
    if (contentPanel) {
        tl.to(
            contentPanel,
            { yPercent: -100, opacity: 0, duration: duration * 0.4 },
            0,
        );
    }

    // Fade overlay out
    if (overlay) {
        tl.to(overlay, { opacity: 0, duration: duration * 0.6 }, 0);
    }

    // Restore sibling cards
    tl.to(
        allCards,
        {
            opacity: 1,
            scale: 1,
            stagger: { amount: 0.2, from: allCards.indexOf(originCard) },
            duration: duration * 0.6,
        },
        0,
    );

    // Animate from expanded back to card position
    tl.add(
        Flip.from(state, {
            scale: true,
            duration,
            ease,
            onInterrupt: () => tl.kill(),
            onComplete: () => {
                gsap.set(detailPanel, {
                    visibility: "hidden",
                    clearProps: "all",
                });
                onComplete?.();
            },
        }),
        duration * 0.1,
    );

    activeCard = null;

    return tl;
};

function handleCardClickOutside(e: Event) {
    const target = e.target as HTMLElement;
    const detailPanel = document.querySelector(".card-detail-panel");

    if (
        detailPanel?.contains(target) ||
        target.closest(".card-item") ||
        target.closest("[data-no-close]")
    ) {
        return;
    }

    animateCardCollapse(detailPanel as HTMLElement);
}

export const closeActiveCard = (): gsap.core.Timeline => {
    const detailPanel = document.querySelector(
        ".card-detail-panel",
    ) as HTMLElement;
    return animateCardCollapse(detailPanel);
};

// DRAGGABLE

export const makeDraggableColumn = (
    element: HTMLElement | null,
    bounds: string | HTMLElement = "body",
    onDragEnd?: (this: Draggable) => void,
): Draggable | null => {
    if (!element) return null;

    return Draggable.create(element, {
        type: "x",
        bounds,
        edgeResistance: 0.65,
        inertia: true,
        onDragEnd,
    })[0];
};

export const makeDraggableCard = (
    element: HTMLElement | null,
    bounds: string | HTMLElement = "body",
    onDragEnd?: (this: Draggable) => void,
): Draggable | null => {
    if (!element) return null;

    return Draggable.create(element, {
        type: "x,y",
        bounds,
        edgeResistance: 0.65,
        inertia: true,
        onDragEnd,
    })[0];
};

// MOTION PATH

export const animateAlongPath = (
    element: HTMLElement | null,
    pathSelector: string,
    duration = 2,
): gsap.core.Tween => {
    if (!element) return gsap.to({}, {});

    return gsap.to(element, {
        motionPath: {
            path: pathSelector,
            autoRotate: true,
            align: pathSelector,
        },
        duration,
        ease: "power1.inOut",
    });
};

// TEXT

export const animateTextCount = (
    element: HTMLElement | null,
    startValue: number,
    endValue: number,
    duration = 1,
): gsap.core.Tween => {
    if (!element) return gsap.to({}, {});

    const counter = { value: startValue };

    return gsap.to(counter, {
        value: endValue,
        duration,
        ease: "power2.out",
        onUpdate() {
            element.textContent = Math.round(counter.value).toString();
        },
    });
};

// UTILITIES

export const killAllAnimations = (element: HTMLElement | null): void => {
    if (!element) return;
    gsap.killTweensOf(element);
};

export const killAnimationsOnClass = (className: string): void => {
    const elements = document.querySelectorAll(`.${className}`);
    elements.forEach((el) => gsap.killTweensOf(el));
};

export const pauseAllAnimations = (): void => {
    gsap.globalTimeline.pause();
};

export const resumeAllAnimations = (): void => {
    gsap.globalTimeline.play();
};

export const getAnimationProgress = (element: HTMLElement | null): number => {
    if (!element) return 0;
    const tweens = gsap.getTweensOf(element);
    return tweens.length > 0 ? tweens[0].progress() : 0;
};
