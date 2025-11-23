document.addEventListener("DOMContentLoaded", function () {
  const header = document.getElementById("siteHeader");
  const scrollTopBtn = document.getElementById("scrollTopBtn");
  const headerDownload = document.getElementById("headerDownloadCV");
  const downloadButtons = document.querySelectorAll('[data-role="download-cv"]');
  const SCROLL_SHOW_THRESHOLD = 24;

  function updateHeaderHeight() {
    const h = header ? header.offsetHeight : 64;
    document.documentElement.style.setProperty("--header-height", h + "px");
  }
  updateHeaderHeight();
  window.addEventListener("resize", updateHeaderHeight);

  let ticking = false;
  function updateButtonVisibility() {
    const y = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    const show = y > SCROLL_SHOW_THRESHOLD;
    if (scrollTopBtn) {
      if (show) {
        scrollTopBtn.classList.remove("floating-hidden");
        scrollTopBtn.classList.add("floating-visible");
      } else {
        scrollTopBtn.classList.add("floating-hidden");
        scrollTopBtn.classList.remove("floating-visible");
      }
    }
    if (headerDownload) {
      if (show) {
        headerDownload.classList.remove("hidden");
      } else {
        headerDownload.classList.add("hidden");
      }
    }
    ticking = false;
  }

  updateButtonVisibility();

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateButtonVisibility);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("load", updateButtonVisibility);
  window.addEventListener("hashchange", updateButtonVisibility);

  document.querySelectorAll("a[data-scroll]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      const href = a.getAttribute("href");
      if (!href || href === "#") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      const target = document.querySelector(href);
      if (!target) return;
      const headerH = header ? header.offsetHeight : 0;
      const y = target.getBoundingClientRect().top + window.pageYOffset - headerH - 10;
      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
      setTimeout(function () {
        try {
          const mobilePanel = document.querySelector(".sm:hidden [x-show]");
          if (mobilePanel && getComputedStyle(mobilePanel).display !== "none") {
            const menuBtn = document.querySelector('.sm:hidden button[aria-label="menu"]');
            if (menuBtn) menuBtn.click();
          }
        } catch (e) {}
      }, 260);
    });
  });

  function triggerBrowserDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "CV.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }


  async function downloadVc(pdfUrl) {
    try {
      let filename = "Lars_Zwijnenberg_CV.pdf";
      try {
        const parts = new URL(pdfUrl).pathname.split("/");
        filename = parts[parts.length - 1] || "Lars_Zwijnenberg_CV.pdf";
      } catch (e) {}

      const resp = await fetch(pdfUrl);

      if (!resp.ok) {
        throw new Error("PDF ophalen mislukt: " + resp.status);
      }

      const blob = await resp.blob();
      triggerBrowserDownload(blob, filename);
    } catch (err) {
      console.error("downloadVc mislukte:", err);
      alert(
        "Download mislukt: " +
          (err && err.message ? err.message : "Onbekende fout")
      );
    }
  }

  downloadButtons.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const pdfUrl = btn.dataset.docx || btn.getAttribute("href") || "";
      if (!pdfUrl) return;
      downloadVc(pdfUrl);
    });
  });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener("click", function (e) {
      e.preventDefault();
      scrollTopBtn.classList.add("floating-hidden");
      scrollTopBtn.classList.remove("floating-visible");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const personaImages = document.querySelectorAll(".persona-photo img");
  personaImages.forEach(function (img) {
    function markPlaceholder() {
      img.classList.add("is-hidden");
      const wrapper = img.closest(".persona-photo");
      if (wrapper) {
        wrapper.classList.add("show-placeholder");
      }
    }
    if (!img.complete) {
      img.addEventListener("error", markPlaceholder, { once: true });
    } else if (img.naturalWidth === 0) {
      markPlaceholder();
    }
  });

  const personaSliders = document.querySelectorAll("[data-persona-slider]");
  personaSliders.forEach(function (slider) {
    const viewport = slider.querySelector("[data-persona-viewport]");
    const track = slider.querySelector("[data-persona-track]");
    const slides = Array.from(slider.querySelectorAll("[data-persona-slide]"));
    if (!viewport || !track || slides.length === 0) return;

    const prevBtn = slider.querySelector("[data-persona-prev]");
    const nextBtn = slider.querySelector("[data-persona-next]");
    const dotsHost = slider.querySelector("[data-persona-dots]");
    const currentEl = slider.querySelector("[data-persona-current]");
    const totalEl = slider.querySelector("[data-persona-total]");
    const roleEl = slider.querySelector("[data-persona-role]");
    const dots = [];
    let autoplayId = null;
    let activeIndex = 0;
    let touchStartX = null;

    if (totalEl) {
      totalEl.textContent = String(slides.length).padStart(2, "0");
    }

    slides.forEach(function (slide, index) {
      slide.dataset.index = String(index);
      slide.setAttribute("role", "group");
      slide.setAttribute("aria-roledescription", "slide");
      slide.setAttribute("aria-hidden", "true");
      if (dotsHost) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "persona-dot";
        const label = slide.querySelector(".persona-role")?.textContent || `Slide ${index + 1}`;
        dot.setAttribute("aria-label", label.trim());
        dot.addEventListener("click", function () {
          focusSlide(index);
          resetAutoplay();
        });
        dotsHost.appendChild(dot);
        dots.push(dot);
      }
    });

    function focusSlide(nextIndex) {
      if (!slides.length) return;
      activeIndex = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, index) {
        const isActive = index === activeIndex;
        slide.setAttribute("aria-hidden", isActive ? "false" : "true");
        let state = "idle";
        if (isActive) {
          state = "active";
        } else if ((activeIndex === 0 && index === slides.length - 1) || index === activeIndex - 1) {
          state = "prev";
        } else if ((activeIndex === slides.length - 1 && index === 0) || index === activeIndex + 1) {
          state = "next";
        }
        slide.dataset.state = state;
      });

      if (currentEl) {
        currentEl.textContent = String(activeIndex + 1).padStart(2, "0");
      }

      if (roleEl) {
        const roleText =
          slides[activeIndex].dataset.role ||
          slides[activeIndex].querySelector(".persona-role")?.textContent ||
          "";
        roleEl.textContent = roleText.trim();
      }

      dots.forEach(function (dot, index) {
        dot.classList.toggle("is-active", index === activeIndex);
      });

      requestAnimationFrame(function () {
        centerSlide(slides[activeIndex]);
      });
    }

    function centerSlide(slide) {
      if (!slide) return;
      const viewportWidth = viewport.offsetWidth;
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
      const target = viewportWidth / 2 - slideCenter;
      track.style.transform = `translate3d(${target}px, 0, 0)`;
    }

    function go(delta) {
      focusSlide(activeIndex + delta);
      resetAutoplay();
    }

    function startAutoplay() {
      if (slides.length <= 1) return;
      autoplayId = window.setInterval(function () {
        focusSlide(activeIndex + 1);
      }, 7000);
    }

    function resetAutoplay() {
      if (autoplayId) {
        window.clearInterval(autoplayId);
      }
      startAutoplay();
    }

    prevBtn?.addEventListener("click", function () {
      go(-1);
    });

    nextBtn?.addEventListener("click", function () {
      go(1);
    });

    viewport.addEventListener(
      "touchstart",
      function (event) {
        touchStartX = event.changedTouches[0].clientX;
      },
      { passive: true }
    );

    viewport.addEventListener(
      "touchmove",
      function (event) {
        if (touchStartX == null) return;
        const currentX = event.changedTouches[0].clientX;
        const deltaX = currentX - touchStartX;
        if (Math.abs(deltaX) > 48) {
          go(deltaX < 0 ? 1 : -1);
          touchStartX = currentX;
        }
      },
      { passive: true }
    );

    viewport.addEventListener("touchend", function () {
      touchStartX = null;
    });

    window.addEventListener("resize", function () {
      focusSlide(activeIndex);
    });

    focusSlide(0);
    startAutoplay();
  });
});
