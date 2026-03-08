// ── Tech Corners Custom Element ──
// Replaces the repeated 4-div corner pattern throughout the page.
// Usage: <tc-corners></tc-corners>
// Usage with custom classes on each corner: <tc-corners extra="!w-8 !h-8 opacity-30"></tc-corners>
class TechCorners extends HTMLElement {
  connectedCallback() {
    const extra = this.getAttribute("extra") || "";
    const cls = extra ? ` ${extra}` : "";
    this.innerHTML =
      `<div class="tech-corner tl${cls}"></div>` +
      `<div class="tech-corner tr${cls}"></div>` +
      `<div class="tech-corner bl${cls}"></div>` +
      `<div class="tech-corner br${cls}"></div>`;
  }
}
customElements.define("tc-corners", TechCorners);

// ── Activities / Feature Cards Data ──
// Card data extracted here to avoid repeating the same markup structure 6 times.
const FEATURE_CARDS = [
  {
    id: "workshops",
    title: "Weekly Workshops",
    body: "Hands-on sessions every week covering PCB design, ROS2, computer vision, SLAM, and embedded systems. Learn by building.",
  },
  {
    id: "bootcamps",
    title: "Technical Bootcamps",
    body: "Intensive multi-day bootcamps during breaks. Deep dives into advanced topics like machine learning, autonomous navigation, and system integration.",
  },
  {
    id: "fabrication",
    title: "Mechanical Design",
    body: "Master CAD software, 3D printing, CNC machining, and laser cutting. Design real robot chassis, enclosures, and mechanical systems from scratch.",
  },
  {
    id: "programming",
    title: "Embedded Systems",
    body: "Write firmware in C++ and Python for microcontrollers. Work with ROS2, Arduino, Raspberry Pi, and real-time control systems.",
  },
  {
    id: "competition",
    title: "Competitions",
    body: "Compete in FIRST Robotics, VEX, RoboCup, and other national robotics competitions. Test your skills against the best teams.",
  },
  {
    id: "projects",
    title: "Team Projects",
    body: "Collaborate on multi-month projects. Learn version control, system integration, testing, and professional engineering workflows.",
  },
];

document.addEventListener("DOMContentLoaded", () => {
  // ── Render Feature Cards ──
  // Cards are generated from FEATURE_CARDS data to avoid repeating identical markup.
  // DOM methods are used for title/body so text is always treated as plain text.
  const featuresGrid = document.getElementById("features-grid");
  if (featuresGrid) {
    for (const { id, title, body } of FEATURE_CARDS) {
      const card = document.createElement("div");
      card.className = "feature-card p-10 group";

      const shine = document.createElement("div");
      shine.className = "feature-card-shine";

      const label = document.createElement("div");
      label.className =
        "font-tech text-xs text-white/30 mb-6 group-hover:text-accent transition-colors";
      const commentSpan = document.createElement("span");
      commentSpan.className = "text-white/15";
      commentSpan.textContent = "// ";
      label.append(commentSpan, document.createTextNode(id));

      const heading = document.createElement("h3");
      heading.className = "font-display text-xl font-semibold mb-3";
      heading.textContent = title;

      const para = document.createElement("p");
      para.className = "text-white/50 text-sm leading-relaxed font-light";
      para.textContent = body;

      card.append(shine, label, heading, para);
      featuresGrid.appendChild(card);
    }
  }
        const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
        const prefersReducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;

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
        window.addEventListener(
          "scroll",
          () => {
            const scrolled = window.scrollY > 40;
            if (header) header.classList.toggle("nav-scrolled", scrolled);
            if (navFloating) {
              const lowFx = isTouchDevice || prefersReducedMotion;
              if (scrolled) {
                navFloating.style.backdropFilter = lowFx
                  ? "blur(14px) saturate(140%)"
                  : "blur(80px) saturate(220%)";
                navFloating.style.webkitBackdropFilter = lowFx
                  ? "blur(14px) saturate(140%)"
                  : "blur(80px) saturate(220%)";
                navFloating.style.background = "rgba(4,4,4,0.45)";
                navFloating.style.borderColor = "rgba(255,255,255,0.12)";
              } else {
                navFloating.style.backdropFilter = lowFx
                  ? "blur(10px) saturate(130%)"
                  : "blur(60px) saturate(200%)";
                navFloating.style.webkitBackdropFilter = lowFx
                  ? "blur(10px) saturate(130%)"
                  : "blur(60px) saturate(200%)";
                navFloating.style.background = "rgba(0,0,0,0.08)";
                navFloating.style.borderColor = "rgba(255,255,255,0.08)";
              }
            }
          },
          { passive: true }
        );

        // Mobile Menu Toggle (full-screen overlay)
        const menuBtn = document.getElementById("menu-btn");
        const mobileMenu = document.getElementById("mobile-menu");

        const openMenu = () => {
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
            mobileMenu.classList.contains("open") ? closeMenu() : openMenu()
          );
        mobileMenu &&
          mobileMenu
            .querySelectorAll("a")
            .forEach((a) => a.addEventListener("click", closeMenu));

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
          (el) => !el.closest("#home")
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
          { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
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
            { passive: true }
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

        if (!isTouchDevice && !prefersReducedMotion && homeSection && modelContainer) {
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
            handleParallax(e, joinFrame, 0.3)
          );
          joinSection.addEventListener(
            "mouseleave",
            () => (joinFrame.style.transform = "none")
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
          { threshold: 0.5 }
        );
        document
          .querySelectorAll(".stat-num[data-target]")
          .forEach((el) => counterObserver.observe(el));

        // Active nav on scroll
        const sections = document.querySelectorAll("section[id]");
        const navItems = document.querySelectorAll(
          ".nav-item:not(.nav-btn-join)"
        );
        const activeObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                navItems.forEach((item) => {
                  item.classList.toggle(
                    "is-active",
                    item.getAttribute("href") === "#" + entry.target.id
                  );
                });
              }
            });
          },
          { threshold: 0.4 }
        );
        sections.forEach((s) => activeObserver.observe(s));

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
          { threshold: 0.3 }
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
          { threshold: 0.15 }
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
          { threshold: 0.5 }
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
          { threshold: 0.1 }
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
            { threshold: 0.5 }
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
            { threshold: 0.1 }
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