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

// column animations

export const animateColumnOpen = (
    element: HTMLElement | null,
    duration = 0.5,
): gsap.core.Tween => {
    if (!element) return gsap.to({}, {});

    return gsap.to(element, {
        height: "auto",
        opacity: 1,
        duration,
        ease: "power2.inOut",
    });
};

export const animateColumnClose = (
    element: HTMLElement | null,
    duration = 0.5,
): gsap.core.Tween => {
    if (!element) return gsap.to({}, {});

    return gsap.to(element, {
        height: 0,
        opacity: 0,
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
    const { duration = 0.4, stagger = 0.1, ease = "back.out" } = options;

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
