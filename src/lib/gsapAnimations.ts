/* eslint-disable @typescript-eslint/no-unused-vars */
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { Flip } from "gsap/Flip";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { TextPlugin } from "gsap/TextPlugin";

gsap.registerPlugin(Draggable, Flip, MotionPathPlugin, TextPlugin);

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

// column animations

export const animateColumnOpen = (
    element: HTMLElement | null,
    duration = 0.3,
): gsap.core.Tween | gsap.core.Timeline => {
    if (!element) return gsap.to({}, {});

    const state = Flip.getState(element);

    gsap.set(element, { height: "auto", opacity: 1 });

    return Flip.from(state, {
        duration,
        ease: "expo.inOut",
    });
};

export const animateColumnClose = (
    element: HTMLElement | null,
    duration = 0.4,
): gsap.core.Tween | gsap.core.Timeline => {
    if (!element) return gsap.to({}, {});

    const state = Flip.getState(element);

    gsap.set(element, { height: 0, opacity: 0 });

    return Flip.from(state, {
        duration,
        ease: "power2.inOut",
    });
};

export const createColumnTimeline = (
    openElement: HTMLElement | null,
    closeElement: HTMLElement | null,
    duration = 0.5,
): gsap.core.Timeline => {
    const tl = gsap.timeline();

    if (openElement) {
        tl.to(openElement, {
            height: "auto",
            opacity: 1,
            duration,
            ease: "power2.inOut",
        });
    }

    if (closeElement) {
        tl.to(
            closeElement,
            {
                height: 0,
                opacity: 0,
                duration,
                ease: "power2.inOut",
            },
            0,
        );
    }

    return tl;
};

// task card animations

export const animateCardsIn = (
    elements: HTMLElement[] | NodeListOf<Element>,
    options: AnimationOptions = {},
): gsap.core.Tween => {
    const { duration = 5, stagger = 0.4, ease = "back.out" } = options;

    return gsap.from(elements, {
        opacity: 0,
        y: 20,
        duration,
        stagger,
        ease,
    });
};

export const animateCardRemove = (
    element: HTMLElement | null,
    duration = 0.3,
): gsap.core.Tween => {
    if (!element) return gsap.to({}, {});

    return gsap.to(element, {
        opacity: 0,
        y: -20,
        duration,
        ease: "power2.in",
    });
};

export const createReversibleAnimation = (
    element: HTMLElement | null,
    options: AnimationOptions = {},
): gsap.core.Tween => {
    if (!element) return gsap.to({}, {});

    const { duration = 0.4, ease = "power2.inOut" } = options;

    return gsap.to(element, {
        opacity: 0.5,
        scale: 0.95,
        duration,
        ease,
        yoyo: true,
        repeat: 1,
    });
};

// FLIP-based card expansion (like the CodePen example)

let activeCard: HTMLElement | null = null;
let expandTimeline: gsap.core.Timeline | null = null;

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

    // If a card is already open, close it first
    if (activeCard && activeCard !== cardItem) {
        return animateCardCollapse(detailPanel, {
            duration,
            ease,
            onComplete: () => animateCardExpand(cardItem, detailPanel, options),
        });
    }

    const overlay = document.querySelector(overlaySelector);
    const contentPanel = detailPanel.querySelector(contentSelector);

    const tl = gsap.timeline();

    // Fit the detail panel on top of the card item
    Flip.fit(detailPanel, cardItem, { scale: true });

    // Record the current state
    const state = Flip.getState(detailPanel);

    // Set the final state (centered, full size)
    gsap.set(detailPanel, { clearProps: "all" });
    gsap.set(detailPanel, {
        xPercent: -50,
        top: "50%",
        yPercent: -50,
        visibility: "visible",
        overflow: "hidden",
    });

    // Animate other cards fading out
    const allCards = gsap.utils.toArray(".card-item") as HTMLElement[];
    tl.to(
        allCards,
        {
            opacity: 0.3,
            stagger: {
                amount: 0.4,
                from: allCards.indexOf(cardItem),
            },
            duration: duration * 0.6,
        },
        0,
    );

    // Add overlay if it exists
    if (overlay) {
        tl.to(
            overlay,
            {
                opacity: 1,
                duration: duration * 0.6,
            },
            0,
        );
    }

    // Animate from scaled state to expanded state
    tl.add(
        Flip.from(state, {
            duration,
            ease,
            scale: true,
            onComplete: () => {
                gsap.set(detailPanel, { overflow: "auto" }); // Allow scrolling
                onComplete?.();
            },
        }),
        0.1,
    );

    // Slide in the content
    if (contentPanel) {
        gsap.set(contentPanel, { yPercent: -100 });
        tl.to(
            contentPanel,
            {
                yPercent: 0,
                opacity: 1,
                duration: duration * 0.9,
                ease: "power2.out",
            },
            0.05,
        );
    }

    activeCard = cardItem;
    expandTimeline = tl;

    // Add click outside to close
    document.addEventListener("click", handleCardClickOutside);

    return tl;
};

export const animateCardCollapse = (
    detailPanel: HTMLElement | null,
    options: CardExpandOptions = {},
): gsap.core.Timeline => {
    const { duration = 0.5, ease = "power2.inOut", onComplete } = options;

    if (!detailPanel || !activeCard) return gsap.timeline();

    document.removeEventListener("click", handleCardClickOutside);

    const overlay = document.querySelector(".card-overlay");
    const contentPanel = detailPanel.querySelector(".card-content");
    const allCards = gsap.utils.toArray(".card-item") as HTMLElement[];

    const tl = gsap.timeline();

    gsap.set(detailPanel, { overflow: "hidden" });

    // Record current state
    const state = Flip.getState(detailPanel);

    // Scale down to fit on original card
    Flip.fit(detailPanel, activeCard, { scale: true });

    // Slide content out
    if (contentPanel) {
        tl.to(contentPanel, { yPercent: -100, duration: duration * 0.6 }, 0);
    }

    // Fade cards back in
    tl.to(
        allCards,
        {
            opacity: 1,
            stagger: {
                amount: 0.4,
                from: allCards.indexOf(activeCard),
            },
            duration: duration * 0.6,
        },
        0,
    );

    // Fade out overlay
    if (overlay) {
        tl.to(overlay, { opacity: 0, duration: duration * 0.6 }, 0);
    }

    // Animate from expanded state back to card
    tl.add(
        Flip.from(state, {
            scale: true,
            duration,
            ease,
            onInterrupt: () => tl.kill(),
            onComplete: () => {
                gsap.set(detailPanel, { visibility: "hidden" });
                onComplete?.();
            },
        }),
        0.2,
    );

    activeCard = null;
    expandTimeline = null;

    return tl;
};

function handleCardClickOutside(e: Event) {
    const target = e.target as HTMLElement;
    const detailPanel = document.querySelector(".card-detail-panel");

    // Don't close if clicking inside the detail panel or on a card
    if (
        detailPanel?.contains(target) ||
        target.closest(".card-item") ||
        target.closest("[data-no-close]")
    ) {
        return;
    }

    const detailPanelEl = detailPanel as HTMLElement;
    animateCardCollapse(detailPanelEl);
}

export const closeActiveCard = (): gsap.core.Timeline => {
    const detailPanel = document.querySelector(
        ".card-detail-panel",
    ) as HTMLElement;
    return animateCardCollapse(detailPanel);
};

// draggable animations
export const makeDraggableColumn = (
    element: HTMLElement | null,
    onDragEnd?: (this: Draggable) => void,
): Draggable | null => {
    if (!element) return null;

    return Draggable.create(element, {
        type: "x",
        edgeResistance: 0.65,
        onDragEnd: onDragEnd,
    })[0];
};

export const makeDraggableCard = (
    element: HTMLElement | null,
    onDragEnd?: (this: Draggable) => void,
): Draggable | null => {
    if (!element) return null;

    return Draggable.create(element, {
        type: "x,y",
        edgeResistance: 0.65,
        onDragEnd: onDragEnd,
    })[0];
};

//motion path animation

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
        },
        duration,
        ease: "power1.inOut",
    });
};

// text animation

export const animateTextCount = (
    element: HTMLElement | null,
    startValue: number,
    endValue: number,
    duration = 1,
): gsap.core.Tween => {
    if (!element) return gsap.to({}, {});

    return gsap.to(
        { value: startValue },
        {
            value: endValue,
            duration,
            onUpdate: function () {
                element.textContent = Math.round(
                    this.targets()[0].value as number,
                ).toString();
            },
            ease: "power2.out",
        },
    );
};

//utils

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
