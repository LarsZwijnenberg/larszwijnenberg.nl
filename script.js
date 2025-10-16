document.addEventListener("DOMContentLoaded", function () {
  const header = document.getElementById("siteHeader");
  const scrollTopBtn = document.getElementById("scrollTopBtn");
  const headerDownload = document.getElementById("headerDownloadCV");
  const downloadButtons = document.querySelectorAll(
    '[data-role="download-cv"]'
  );
  const SCROLL_SHOW_THRESHOLD = 24;

  function updateHeaderHeight() {
    const h = header ? header.offsetHeight : 64;
    document.documentElement.style.setProperty("--header-height", h + "px");
  }
  updateHeaderHeight();
  window.addEventListener("resize", updateHeaderHeight);

  let ticking = false;
  function updateButtonVisibility() {
    const y =
      window.scrollY ||
      window.pageYOffset ||
      document.documentElement.scrollTop;
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
      const y =
        target.getBoundingClientRect().top + window.pageYOffset - headerH - 10;
      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
      setTimeout(function () {
        try {
          const mobilePanel = document.querySelector(".sm:hidden [x-show]");
          if (mobilePanel && getComputedStyle(mobilePanel).display !== "none") {
            const menuBtn = document.querySelector(
              '.sm:hidden button[aria-label="menu"]'
            );
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
    URL.revokeObjectURL(url);
  }
  async function tryDownload(url) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok)
        throw new Error("Kon CV niet laden (status " + res.status + ")");
      const blob = await res.blob();
      const parts = url.split("/");
      const filename = parts[parts.length - 1] || "CV.pdf";
      triggerBrowserDownload(blob, filename);
    } catch (err) {
      window.location.href = url;
    }
  }
  downloadButtons.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      const url = btn.getAttribute("href");
      if (!url) return;
      e.preventDefault();
      tryDownload(url);
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
});

function downloadVc(docxUrl) {
  fetch('https://wordtopdf.larszwijnenberg.nl/convert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ docxUrl })
  })
  .then(res => res.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.pdf'; //bestandsnaam
    document.body.appendChild(a);
    a.click();
    a.remove();
  })
  .catch(err => console.error(err));
}
