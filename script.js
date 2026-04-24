import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/all";

if (history.scrollRestoration) {
  history.scrollRestoration = "manual";
}
window.scrollTo(0, 0);

document.addEventListener("DOMContentLoaded", () => {
  window.scrollTo(0, 0);
  gsap.registerPlugin(CustomEase, SplitText, ScrollTrigger);
  ScrollTrigger.clearScrollMemory("manual");
  CustomEase.create("hop", "0.9, 0, 0.1, 1");

  const video = document.querySelector(".hero-bg video");
  if (video) {
    video.muted = true;
    video.play().catch(() => {
      // Ignorar error si el autoplay es bloqueado por el navegador
    });

    const playVideo = () => {
      if (video.paused) {
        video.play();
      }
      document.removeEventListener("touchstart", playVideo);
      document.removeEventListener("click", playVideo);
    };

    document.addEventListener("touchstart", playVideo, { passive: true });
    document.addEventListener("click", playVideo, { passive: true });
  }

  const splitText = (selector, type, className) => {
    return SplitText.create(selector, {
      type: type,
      [`${type}Class`]: className,
      mask: type,
    });
  };

  const headerSplit = splitText(".header h1", "chars", "char");
  const navSplit = splitText("nav a", "words", "word");
  const footerSplit = splitText(".hero-footer p", "words", "word");

  const counterProgress = document.querySelector(".preloader-counter h1");
  const counterContainer = document.querySelector(".preloader-counter");
  const counter = { value: 0 };


  const tl = gsap.timeline({
    onComplete: () => {
      window.scrollTo(0, 0);
      document.body.classList.remove("loading");
    }
  });

  tl.to(counter, {
    value: 100,
    duration: 3,
    ease: "power3.out",

    onUpdate: () => {
      counterProgress.textContent = Math.floor(counter.value);
    },

    onComplete: () => {
      const counterSplit = splitText(counterProgress, "chars", "digit");
      gsap.to(counterSplit.chars, {
        x: "-100%",
        duration: 0.75,
        ease: "power3.out",
        stagger: 0.1,
        delay: 1,
        onComplete: () => {
          counterContainer.remove();
        },
      });
    },
  });

  tl.to(
    counterContainer,
    {
      scale: 1,
      duration: 3,
      ease: "power3.out",
    },
    "<"
  );

  tl.to(
    ".progress-bar",
    {
      scaleX: 1,
      duration: 3,
      ease: "power3.out",
    },
    "<"
  );

  tl.to(
    ".hero-bg",
    {
      clipPath: "polygon(35% 35%, 65% 35%, 65% 65%, 35% 65%)",
      duration: 1.5,
      ease: "hop",
    },
    4.5
  );

  tl.to(
    ".hero-bg video",
    {
      scale: 1.5,
      duration: 1.5,
      ease: "hop",
    },
    "<"
  );

  tl.to(
    ".hero-bg",
    {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      duration: 2,
      ease: "hop",
    },
    6
  );

  tl.to(
    ".hero-bg video",
    {
      scale: 1,
      duration: 2,
      ease: "hop",
    },
    6
  );

  tl.to(
    ".progress",
    {
      scaleX: 1,
      duration: 2,
      ease: "hop",
    },
    6
  );

  tl.to(
    ".header h1 .char",
    {
      x: "0%",
      duration: 1,
      ease: "power4.out",
      stagger: 0.075,
    },
    7
  );

  tl.to(
    "nav a .word",
    {
      y: "0%",
      duration: 1,
      ease: "power4.out",
      stagger: 0.075,
    },
    7.5
  );

  tl.to(
    ".hero-footer p .word",
    {
      y: "0%",
      duration: 1,
      ease: "power4.out",
      stagger: 0.075,
    },
    7.5
  );

  // --- HORIZONTAL SCROLL LOGIC ---
  const sections = gsap.utils.toArray(".panel");
  const scrollContainer = document.querySelector(".horizontal-scroll-container");

  const scrollTween = gsap.to(scrollContainer, {
    x: () => -(scrollContainer.scrollWidth - window.innerWidth),
    ease: "none",
    scrollTrigger: {
      trigger: ".horizontal-scroll-wrapper",
      pin: true,
      scrub: 1.5,
      end: () => "+=" + (scrollContainer.scrollWidth - window.innerWidth)
    }
  });

  // Simulated Pin for Text Panels
  const pinPanels = gsap.utils.toArray(".pin-panel");
  if (pinPanels.length > 0) {
    let mm = gsap.matchMedia();

    pinPanels.forEach(panel => {
      const title = panel.querySelector(".section-title");
      const paragraph = panel.querySelector(".section-paragraph");
      const content = panel.querySelector(".pin-content");
      if (!title || !paragraph || !content) return;

      const pSplit = splitText(paragraph, "words", "word");

      mm.add("(min-width: 1001px)", () => {
        gsap.to(content, {
          x: () => panel.offsetWidth - window.innerWidth,
          ease: "none",
          scrollTrigger: {
            trigger: panel,
            containerAnimation: scrollTween,
            start: "left left",
            end: "right right",
            scrub: true
          }
        });

        gsap.set(pSplit.words, { opacity: 0, y: "100%" });
        gsap.to(pSplit.words, {
          opacity: 1,
          y: "0%",
          ease: "none",
          stagger: 0.05,
          scrollTrigger: {
            trigger: panel,
            containerAnimation: scrollTween,
            start: "left left",
            end: "right right",
            scrub: 1
          }
        });
      });

      mm.add("(max-width: 1000px)", () => {
        const pinDistance = () => panel.offsetWidth - window.innerWidth;

        gsap.to(content, {
          x: pinDistance,
          ease: "none",
          scrollTrigger: {
            trigger: panel,
            containerAnimation: scrollTween,
            start: "left left",
            end: "right right",
            scrub: true
          }
        });

        gsap.set(pSplit.words, { opacity: 0, y: "100%" });
        gsap.to(pSplit.words, {
          opacity: 1,
          y: "0%",
          ease: "none",
          stagger: 0.05,
          scrollTrigger: {
            trigger: panel,
            containerAnimation: scrollTween,
            start: "left left",
            end: "right right",
            scrub: 1
          }
        });
      });
    });
  }

  const revealTexts = gsap.utils.toArray(".reveal-text");
  revealTexts.forEach((text) => {
    // Skip section titles as they are animated independently
    if (text.classList.contains("section-title")) return;

    const textSplit = splitText(text, "words", "word");

    gsap.set(textSplit.words, { opacity: 0, y: "100%" });

    gsap.to(textSplit.words, {
      opacity: 1,
      y: "0%",
      duration: 1,
      ease: "power4.out",
      stagger: 0.05,
      scrollTrigger: {
        trigger: text.parentElement,
        containerAnimation: scrollTween,
        start: "left center",
        toggleActions: "play none none reverse"
      }
    });
  });

  // Fade to black on the last panel
  const shopPanel = document.querySelector("#panel-shop");
  if (shopPanel) {
    gsap.to(".hero-bg", {
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: shopPanel,
        containerAnimation: scrollTween,
        start: "left right",
        end: "center center",
        scrub: true
      }
    });
  }

  // Back to start button
  const backBtn = document.querySelector(".back-to-top");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      const proxy = { y: window.scrollY };
      gsap.to(proxy, {
        y: 0,
        duration: 1.5,
        ease: "power3.inOut",
        onUpdate: () => window.scrollTo(0, proxy.y)
      });
    });
  }

  // Navbar smooth scroll
  const navLinks = document.querySelectorAll(".nav-links a");
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const targetPanel = document.querySelector(targetId);
      if (targetPanel) {
        // Calculamos el inicio del panel
        let targetScroll = targetPanel.offsetLeft;

        // Si es un panel con animación (texto anclado), sumamos su propio scroll interno 
        // para que al llegar, la animación del texto esté completamente desplegada.
        if (targetPanel.classList.contains("pin-panel")) {
          targetScroll += targetPanel.offsetWidth - window.innerWidth;
        }

        const proxy = { y: window.scrollY };
        gsap.to(proxy, {
          y: targetScroll,
          duration: 1.5,
          ease: "power3.inOut",
          onUpdate: () => window.scrollTo(0, proxy.y)
        });
      }
    });
  });

  window.addEventListener('beforeunload', () => {
    window.scrollTo(0, 0);
  });
});

