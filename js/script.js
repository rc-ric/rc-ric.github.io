document.addEventListener("DOMContentLoaded", () => {
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

  const recruitmentForm = document.getElementById("rcric-membership-form");
  if (recruitmentForm) {
    const classSelect = document.getElementById("entry.781799042");
    const facultyField = document.getElementById("faculty-field");
    const facultySelect = document.getElementById("entry.1736517053");
    const copyPaymentBtn = document.getElementById("copy-payment-btn");
    const copyPaymentStatus = document.getElementById("copy-payment-status");
    const interestCheckboxes = Array.from(
      document.querySelectorAll('[name="entry.274021497"]'),
    );
    const interestsError = document.getElementById("interests-error");
    const submitButton = document.getElementById("submit-button");
    const formStatus = document.getElementById("form-status");
    const googleFormResponseFrame = document.getElementById(
      "google-form-response",
    );

    const setFormStatus = (message, tone = "info") => {
      if (!formStatus) return;
      formStatus.textContent = message;
      formStatus.dataset.tone = tone;
    };

    const toggleFacultyField = () => {
      if (!facultyField || !facultySelect || !classSelect) return;

      facultyField.hidden = false;
      facultySelect.disabled = false;
      facultySelect.required = true;
    };

    const validateInterests = () => {
      const hasSelection = interestCheckboxes.some(
        (checkbox) => checkbox.checked,
      );

      if (interestsError) {
        interestsError.textContent = hasSelection
          ? ""
          : "Please select at least one area of interest.";
      }

      interestCheckboxes.forEach((checkbox) => {
        checkbox.setCustomValidity(
          hasSelection ? "" : "Please select at least one area of interest.",
        );
      });

      return hasSelection;
    };

    if (classSelect) {
      classSelect.addEventListener("change", toggleFacultyField);
      toggleFacultyField();
    }

    interestCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        validateInterests();
      });
    });

    if (copyPaymentBtn) {
      copyPaymentBtn.addEventListener("click", async () => {
        const paymentNumber = "01312526117";

        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(paymentNumber);
          } else {
            const tempInput = document.createElement("textarea");
            tempInput.value = paymentNumber;
            tempInput.setAttribute("readonly", "");
            tempInput.style.position = "fixed";
            tempInput.style.left = "-9999px";
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand("copy");
            document.body.removeChild(tempInput);
          }

          if (copyPaymentStatus) {
            copyPaymentStatus.textContent = "Payment number copied.";
            copyPaymentStatus.classList.add("is-success");
          }

          copyPaymentBtn.textContent = "Copied";
          window.setTimeout(() => {
            copyPaymentBtn.textContent = "Copy number";
            if (copyPaymentStatus) {
              copyPaymentStatus.textContent = "";
              copyPaymentStatus.classList.remove("is-success");
            }
          }, 1800);
        } catch (error) {
          if (copyPaymentStatus) {
            copyPaymentStatus.textContent =
              "Clipboard access failed. Please copy 01312526117 manually.";
            copyPaymentStatus.classList.add("is-error");
          }

          window.setTimeout(() => {
            if (copyPaymentStatus) {
              copyPaymentStatus.textContent = "";
              copyPaymentStatus.classList.remove("is-error");
            }
          }, 2600);
        }
      });
    }

    recruitmentForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!recruitmentForm.checkValidity()) {
        recruitmentForm.reportValidity();
        setFormStatus(
          "Please complete all required fields before submitting.",
          "error",
        );
        return;
      }

      if (!validateInterests()) {
        setFormStatus("Please select at least one area of interest.", "error");
        interestsError?.focus();
        return;
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";
      }

      setFormStatus(
        "Your application is being sent to Google Forms...",
        "info",
      );

      if (googleFormResponseFrame) {
        const handleFrameLoad = () => {
          setFormStatus(
            "The request reached Google Forms, but this page cannot verify whether the response was recorded because Google blocks cross-origin inspection. Please check your WhatsApp within 24–48 hours and contact the club if you do not receive confirmation.",
            "warning",
          );

          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Submit application";
          }
        };

        googleFormResponseFrame.addEventListener("load", handleFrameLoad, {
          once: true,
        });
      }

      recruitmentForm.submit();
    });

    validateInterests();
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
