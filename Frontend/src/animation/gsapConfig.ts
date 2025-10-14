import { gsap } from "gsap";

export const fadeInUp = (target: string | HTMLElement, delay = 0): void => {
  gsap.fromTo(
    target,
    {
      opacity: 0,
      y: 50,
    },
    {
      opacity: 1,
      y: 0,
      duration: 1,
      delay,
      ease: "power3.out",
    }
  );
};

export const slideInFromLeft = (
  target: string | HTMLElement,
  delay = 0
): void => {
  gsap.fromTo(
    target,
    {
      opacity: 0,
      x: -100,
    },
    {
      opacity: 1,
      x: 0,
      duration: 1,
      delay,
      ease: "power3.out",
    }
  );
};

export const zoomIn = (target: string | HTMLElement, delay = 0): void => {
  gsap.fromTo(
    target,
    {
      scale: 0.8,
      opacity: 0,
    },
    {
      scale: 1,
      opacity: 1,
      duration: 1,
      delay,
      ease: "power3.out",
    }
  );
};

export const staggerReveal = (
  target: string | HTMLElement,
  delay = 0
): void => {
  gsap.fromTo(
    target,
    {
      opacity: 0,
      y: 20,
    },
    {
      opacity: 1,
      y: 0,
      duration: 1,
      delay,
      ease: "power3.out",
      stagger: 0.2, // Staggers the animation for child elements
    }
  );
};

export const bounceIn = (target: string | HTMLElement, delay = 0): void => {
  gsap.fromTo(
    target,
    {
      scale: 0.5,
      opacity: 0,
    },
    {
      scale: 1,
      opacity: 1,
      duration: 0.8,
      delay,
      ease: "bounce.out",
    }
  );
};
