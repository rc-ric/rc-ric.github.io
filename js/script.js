document.addEventListener("DOMContentLoaded", () => {
  const preloaderEl = document.getElementById("site-preloader");
  const preloaderBarEl = document.getElementById("preloader-bar");
  const preloaderPercentEl = document.getElementById("preloader-percent");
  const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const scrollTopBtn = document.getElementById("scroll-top-btn");

  const allImages = document.querySelectorAll("img");
  allImages.forEach((imageEl, imageIndex) => {
    imageEl.decoding = "async";
    if (imageIndex === 0) {
      imageEl.loading = "eager";
      imageEl.fetchPriority = "high";
    } else {
      imageEl.loading = "lazy";
      imageEl.fetchPriority = "low";
    }
  });

  const eagerImages = [...allImages].filter(
    (imageEl) => imageEl.loading !== "lazy",
  );

  if (preloaderEl) {
    document.body.style.overflow = "hidden";
    const preloaderProgressbarEl = preloaderEl.querySelector(
      "[role='progressbar']",
    );

    const trackableResources = [
      ...eagerImages,
      ...document.querySelectorAll(
        "link[rel='stylesheet'][href], script[src], source[src]",
      ),
    ].filter((el) => !el.closest("#site-preloader"));

    const totalSteps = Math.max(1, trackableResources.length + 1);
    let completedSteps = 0;
    let targetPercent = 1;
    let visualPercent = 1;
    let loaderHidden = false;
    const doneSet = new WeakSet();

    const applyProgressToUi = (progressValue) => {
      const safeValue = Math.min(100, Math.max(1, progressValue));
      if (preloaderBarEl) preloaderBarEl.style.width = `${safeValue}%`;
      if (preloaderPercentEl) preloaderPercentEl.textContent = `${safeValue}%`;
      preloaderProgressbarEl?.setAttribute("aria-valuenow", String(safeValue));
    };

    const animateProgress = () => {
      if (visualPercent < targetPercent) {
        const delta = targetPercent - visualPercent;
        visualPercent += Math.max(1, Math.ceil(delta * 0.16));
        if (visualPercent > targetPercent) {
          visualPercent = targetPercent;
        }
        applyProgressToUi(visualPercent);
      }
      if (!loaderHidden) {
        window.requestAnimationFrame(animateProgress);
      }
    };

    const syncTargetFromSteps = () => {
      const ratio = completedSteps / totalSteps;
      targetPercent = Math.min(99, Math.max(1, Math.floor(ratio * 99)));
    };

    const markStepComplete = (resourceEl) => {
      if (doneSet.has(resourceEl)) return;
      doneSet.add(resourceEl);
      completedSteps += 1;
      syncTargetFromSteps();
    };

    trackableResources.forEach((resourceEl) => {
      if (resourceEl.tagName === "IMG" && resourceEl.complete) {
        markStepComplete(resourceEl);
        return;
      }
      if (
        resourceEl.tagName === "LINK" &&
        resourceEl.rel === "stylesheet" &&
        resourceEl.sheet
      ) {
        markStepComplete(resourceEl);
        return;
      }
      if (
        resourceEl.tagName === "SCRIPT" &&
        (resourceEl.readyState === "loaded" ||
          resourceEl.readyState === "complete")
      ) {
        markStepComplete(resourceEl);
        return;
      }
      resourceEl.addEventListener("load", () => markStepComplete(resourceEl), {
        once: true,
      });
      resourceEl.addEventListener("error", () => markStepComplete(resourceEl), {
        once: true,
      });
    });

    syncTargetFromSteps();
    applyProgressToUi(1);
    window.requestAnimationFrame(animateProgress);

    window.addEventListener(
      "load",
      () => {
        completedSteps = totalSteps;
        targetPercent = 100;

        const hideLoader = () => {
          if (loaderHidden) return;
          loaderHidden = true;
          preloaderEl.classList.add("is-hidden");
          window.setTimeout(() => {
            preloaderEl.remove();
          }, 480);
          document.body.style.overflow = "";
        };

        const waitForVisual100 = () => {
          if (visualPercent >= 100) {
            window.setTimeout(hideLoader, 220);
            return;
          }
          window.requestAnimationFrame(waitForVisual100);
        };

        waitForVisual100();
      },
      { once: true },
    );
  }

  // ── Cursor glow ──
  if (!isTouchDevice && !prefersReducedMotion) {
    const cursorGlow = document.createElement("div");
    cursorGlow.id = "cursor-glow";
    document.body.appendChild(cursorGlow);
    document.addEventListener("mousemove", (e) => {
      cursorGlow.style.left = e.clientX + "px";
      cursorGlow.style.top = e.clientY + "px";
    });
  }

  // Header Scroll Effect — drive blur via inline style for reliability
  const header = document.getElementById("header");
  const navFloating = document.querySelector(".nav-floating");

  const lowFx = isTouchDevice || prefersReducedMotion;
  if (navFloating) {
    navFloating.classList.add("nav-fx-dynamic");
    navFloating.classList.toggle("is-low-fx", lowFx);
  }
  let lastNavScrolledState = null;
  let lastScrollTopState = null;
  let scrollUpdateQueued = false;

  const applyScrollUi = () => {
    const scrolled = window.scrollY > 40;
    const showScrollTop = window.scrollY > 420;

    if (header && lastNavScrolledState !== scrolled) {
      header.classList.toggle("nav-scrolled", scrolled);
    }

    if (navFloating && lastNavScrolledState !== scrolled) {
      navFloating.classList.toggle("is-scrolled", scrolled);
    }

    if (scrollTopBtn && lastScrollTopState !== showScrollTop) {
      scrollTopBtn.classList.toggle("is-visible", showScrollTop);
    }

    lastNavScrolledState = scrolled;
    lastScrollTopState = showScrollTop;
  };

  const onScroll = () => {
    if (scrollUpdateQueued) return;
    scrollUpdateQueued = true;
    requestAnimationFrame(() => {
      applyScrollUi();
      scrollUpdateQueued = false;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });

  applyScrollUi();

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });
  }

  // Mobile Menu Toggle (full-screen overlay)
  const menuBtn = document.getElementById("menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  const openMenu = () => {
    const mobileJoinLink = mobileMenu?.querySelector("a.join-link");
    mobileJoinLink?.classList.remove("is-active");
    menuBtn.classList.add("open");
    mobileMenu.classList.add("open");
    document.body.style.overflow = "hidden";
  };
  const closeMenu = () => {
    menuBtn.classList.remove("open");
    mobileMenu.classList.remove("open");
    document.body.style.overflow = "";
  };

  if (menuBtn)
    menuBtn.addEventListener("click", () =>
      mobileMenu.classList.contains("open") ? closeMenu() : openMenu(),
    );
  if (mobileMenu) {
    const mobileJoinLink = mobileMenu.querySelector("a.join-link");
    mobileMenu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        if (a === mobileJoinLink) {
          mobileJoinLink.classList.add("is-active");
        }
        closeMenu();
      }),
    );
  }

  // Hero copy: character-by-character typewriter replay
  const typewriterText = document.getElementById("typewriter-text");
  if (typewriterText) {
    const fullText = typewriterText.textContent.replace(/\s+/g, " ").trim();
    const replayDelayMs = 30000;
    const initialDelayMs = 900;
    const typingDurationMs = isTouchDevice ? 4200 : 4000;
    let animationFrameId;
    let replayTimerId;

    if (prefersReducedMotion) {
      typewriterText.textContent = fullText;
    } else {
      const reservedHeight = typewriterText.offsetHeight;
      typewriterText.style.minHeight = `${reservedHeight}px`;

      const clearTypewriterLoop = () => {
        window.cancelAnimationFrame(animationFrameId);
        window.clearTimeout(replayTimerId);
      };

      const runTypewriter = () => {
        clearTypewriterLoop();
        typewriterText.textContent = "";

        const startTypingAt = performance.now();

        const step = (timestamp) => {
          const progress = Math.min(
            (timestamp - startTypingAt) / typingDurationMs,
            1,
          );
          const visibleLength = Math.min(
            fullText.length,
            Math.floor(progress * fullText.length),
          );

          typewriterText.textContent = fullText.slice(0, visibleLength);

          if (progress < 1) {
            animationFrameId = window.requestAnimationFrame(step);
            return;
          }

          typewriterText.textContent = fullText;
          replayTimerId = window.setTimeout(runTypewriter, replayDelayMs);
        };

        animationFrameId = window.requestAnimationFrame(step);
      };

      replayTimerId = window.setTimeout(runTypewriter, initialDelayMs);
    }
  }

  // ── Universal Scroll-triggered Reveal ──
  // Collect all reveal classes including new ones
  const revealSelectors = [
    ".reveal-text",
    ".reveal-card",
    ".section-title-wrap",
    ".reveal-left",
    ".reveal-right",
    ".reveal-pop",
    ".reveal-line",
    ".stagger-children",
    ".reveal-blur",
    ".gallery-grid",
    ".bento-grid",
    ".stats-grid",
    ".footer-glass",
    ".timeline-item",
    ".section-draw-line",
  ].join(",");

  const allRevealEls = document.querySelectorAll(revealSelectors);

  // Exclude hero section elements from scroll observer (they auto-animate)
  const nonHeroRevealEls = [...allRevealEls].filter(
    (el) => !el.closest("#home"),
  );

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -30px 0px" },
  );

  nonHeroRevealEls.forEach((el) => revealObserver.observe(el));

  // Hero auto-reveal
  document
    .querySelectorAll("#home .reveal-text, #home .reveal-card")
    .forEach((el) => el.classList.add("in-view"));

  // ── Subtle scroll-based parallax on background orbs ──
  const orb1 = document.querySelector(".orb-1");
  const orb3 = document.querySelector(".orb-3");
  let ticking = false;
  if (!isTouchDevice && !prefersReducedMotion) {
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            const sy = window.scrollY;
            if (orb1) orb1.style.transform = `translateY(${sy * 0.12}px)`;
            if (orb3) orb3.style.transform = `translateY(${sy * -0.08}px)`;
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true },
    );
  }

  // Mouse Parallax
  const homeSection = document.getElementById("home");
  const joinSection = document.getElementById("join");
  const modelContainer = document.getElementById("model-container");
  const joinFrame = document.querySelector(".join-frame");
  const hudTags = document.querySelectorAll(".hud-tag");

  const handleParallax = (e, container, m = 1) => {
    const x = (window.innerWidth - e.pageX * 2) / (100 / m);
    const y = (window.innerHeight - e.pageY * 2) / (100 / m);
    container.style.transform = `translateX(${x}px) translateY(${y}px)`;
    return { x, y };
  };

  if (
    !isTouchDevice &&
    !prefersReducedMotion &&
    homeSection &&
    modelContainer
  ) {
    homeSection.addEventListener("mousemove", (e) => {
      const { x, y } = handleParallax(e, modelContainer);
      hudTags.forEach((tag) => {
        const d = parseFloat(tag.getAttribute("data-depth") || 0.5);
        tag.style.transform = `translateX(${x * d * 20}px) translateY(${
          y * d * 20
        }px)`;
      });
    });
    homeSection.addEventListener("mouseleave", () => {
      modelContainer.style.transform = "none";
      hudTags.forEach((t) => (t.style.transform = "none"));
    });
  }
  if (!isTouchDevice && !prefersReducedMotion && joinSection && joinFrame) {
    joinSection.addEventListener("mousemove", (e) =>
      handleParallax(e, joinFrame, 0.3),
    );
    joinSection.addEventListener(
      "mouseleave",
      () => (joinFrame.style.transform = "none"),
    );
  }

  // Stat Counters
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.getAttribute("data-target"));
        const suffix = el.querySelector(".stat-suffix")?.outerHTML || "";
        let start = 0;
        const step = (ts) => {
          if (!start) start = ts;
          const p = Math.min((ts - start) / 1600, 1);
          const e = 1 - Math.pow(1 - p, 3);
          el.innerHTML = Math.floor(e * target) + suffix;
          if (p < 1) requestAnimationFrame(step);
          else el.innerHTML = target + suffix;
        };
        requestAnimationFrame(step);
        counterObserver.unobserve(el);
      });
    },
    { threshold: 0.5 },
  );
  document
    .querySelectorAll(".stat-num[data-target]")
    .forEach((el) => counterObserver.observe(el));

  // Active nav on scroll
  const sections = Array.from(document.querySelectorAll("section[id]"));
  const navItems = Array.from(
    document.querySelectorAll(".nav-item:not(.nav-btn-join)"),
  );

  const setActiveNavItem = (sectionId) => {
    navItems.forEach((item) => {
      item.classList.toggle(
        "is-active",
        item.getAttribute("href") === `#${sectionId}`,
      );
    });
  };

  const updateActiveNavOnScroll = () => {
    if (!sections.length || !navItems.length) return;

    const headerOffset = header?.offsetHeight || 0;
    const probeY = window.scrollY + headerOffset + window.innerHeight * 0.35;

    let currentSectionId = sections[sections.length - 1].id;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;

      if (probeY >= sectionTop && probeY < sectionBottom) {
        currentSectionId = section.id;
      }
    });

    setActiveNavItem(currentSectionId);
  };

  updateActiveNavOnScroll();
  window.addEventListener("scroll", updateActiveNavOnScroll, {
    passive: true,
  });
  window.addEventListener("resize", updateActiveNavOnScroll);
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const targetId = item.getAttribute("href")?.replace("#", "");
      if (targetId) setActiveNavItem(targetId);
    });
  });

  // ── Feature card: auto-shine on scroll-in ──
  const featureCards = document.querySelectorAll(".feature-card");
  const featureObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const shine = entry.target.querySelector(".feature-card-shine");
          if (shine) {
            shine.style.transition = "left 0.7s ease";
            shine.style.left = "150%";
            setTimeout(() => {
              shine.style.transition = "";
              shine.style.left = "";
            }, 800);
          }
          featureObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 },
  );
  featureCards.forEach((c) => featureObserver.observe(c));

  // ── About section: word-by-word reveal ──
  const aboutTextBlocks = document.querySelectorAll(".about-text-block");
  const aboutObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in-view");
        // Stagger each word
        const words = entry.target.querySelectorAll(".word-reveal span");
        words.forEach((w, i) => {
          w.style.transitionDelay = `${i * 22}ms`;
        });
        aboutObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.15 },
  );
  aboutTextBlocks.forEach((b) => aboutObserver.observe(b));

  // ── About headings: char-by-char ──
  const aboutHeadings = document.querySelectorAll(".about-heading");
  const headingObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in-view");
        const chars = entry.target.querySelectorAll(".char-reveal span");
        chars.forEach((c, i) => {
          c.style.transitionDelay = `${i * 40}ms`;
        });
        headingObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.5 },
  );
  aboutHeadings.forEach((h) => headingObserver.observe(h));

  // ── About images ──
  const aboutImgs = document.querySelectorAll(".about-img-wrap");
  const imgObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in-view");
        imgObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.1 },
  );
  aboutImgs.forEach((i) => imgObserver.observe(i));

  // ── About label ──
  const aboutLabel = document.querySelector("#about .about-label");
  if (aboutLabel) {
    const lObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            aboutLabel.classList.add("in-view");
            lObs.disconnect();
          }
        });
      },
      { threshold: 0.5 },
    );
    lObs.observe(aboutLabel);
  }
  const footerGlass = document.querySelector(".footer-glass");
  if (footerGlass) {
    const fObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            footerGlass.classList.add("in-view");
            fObserver.unobserve(footerGlass);
          }
        });
      },
      { threshold: 0.1 },
    );
    fObserver.observe(footerGlass);
  }
});

// Lightbox
function openLightbox(el) {
  const img = el.querySelector("img");
  document.getElementById("lightbox-img").src = img.src;
  document.getElementById("lightbox").classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeLightbox() {
  document.getElementById("lightbox").classList.remove("open");
  document.body.style.overflow = "";
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeLightbox();
  }
});
