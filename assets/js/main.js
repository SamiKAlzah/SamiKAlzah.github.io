/* Sami Alzahrani portfolio: small, dependency-free interactions. */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- theme toggle ---------- */
  var themeBtn = $("[data-theme-toggle]");
  function syncThemeButton() {
    var isLight = root.getAttribute("data-theme") === "light";
    themeBtn.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", isLight ? "#f1f2f0" : "#0d0f10");
  }
  if (themeBtn) {
    syncThemeButton();
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      syncThemeButton();
    });
  }

  /* ---------- nav: border once scrolled (sentinel, no scroll listener) ---------- */
  var nav = $(".nav");
  var sentinel = $(".nav-sentinel");
  if (nav && sentinel && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      nav.classList.toggle("is-scrolled", !entries[0].isIntersecting);
    }).observe(sentinel);
  }

  /* ---------- mobile menu ---------- */
  var menuBtn = $(".nav__menu-btn");
  var panel = $("#nav-panel");
  function setMenu(open) {
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menuBtn.querySelector("use").setAttribute("href", open ? "#i-x" : "#i-list");
    panel.hidden = !open;
  }
  if (menuBtn && panel) {
    menuBtn.addEventListener("click", function () {
      setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
    });
    $$("a", panel).forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !panel.hidden) { setMenu(false); menuBtn.focus(); }
    });
  }

  /* ---------- active nav link ---------- */
  var navLinks = $$(".nav__links a");
  if (navLinks.length && "IntersectionObserver" in window) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var sectionObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.remove("is-active"); });
        var link = byId[entry.target.id];
        if (link) link.classList.add("is-active");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main section[id]").forEach(function (s) { sectionObs.observe(s); });
  }

  /* ---------- reveal on scroll ---------- */
  var revealEls = $$("[data-reveal]");
  if (!reduceMotion && "IntersectionObserver" in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          revealObs.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach(function (el) { revealObs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- hero loop: user control + pause when off screen ---------- */
  var heroVideo = $("#hero-video");
  var heroToggle = $("[data-hero-toggle]");
  var heroPausedByUser = reduceMotion;
  function setHeroButton(paused) {
    heroToggle.setAttribute("aria-pressed", String(paused));
    heroToggle.setAttribute("aria-label", paused ? "Play background video" : "Pause background video");
  }
  if (heroVideo && heroToggle) {
    setHeroButton(heroPausedByUser);
    var tryPlay = function () {
      var p = heroVideo.play();
      if (p && p.catch) p.catch(function () { setHeroButton(true); heroPausedByUser = true; });
    };
    if (!heroPausedByUser) tryPlay();
    heroToggle.addEventListener("click", function () {
      heroPausedByUser = !heroPausedByUser;
      setHeroButton(heroPausedByUser);
      if (heroPausedByUser) heroVideo.pause(); else tryPlay();
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        if (heroPausedByUser) return;
        if (entries[0].isIntersecting) tryPlay(); else heroVideo.pause();
      }, { threshold: 0.15 }).observe(heroVideo);
    }
  }

  /* ---------- RushLab gameplay player ---------- */
  var player = $("[data-player]");
  if (player) {
    var rlVideo = $("video", player);
    var cover = $(".player__cover", player);
    cover.addEventListener("click", function () {
      player.classList.add("is-playing");
      rlVideo.controls = true;
      if (heroVideo && !heroVideo.paused) heroVideo.pause();
      var p = rlVideo.play();
      if (p && p.catch) p.catch(function () {});
      rlVideo.focus();
    });
  }

  /* ---------- loop track buttons ---------- */
  var track = $(".loop__track");
  var prevBtn = $("[data-loop-prev]");
  var nextBtn = $("[data-loop-next]");
  if (track && prevBtn && nextBtn) {
    var steps = $$(".loop__step", track);
    var stepWidth = function () {
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return steps[0].getBoundingClientRect().width + gap;
    };
    prevBtn.addEventListener("click", function () {
      track.scrollBy({ left: -stepWidth(), behavior: reduceMotion ? "auto" : "smooth" });
    });
    nextBtn.addEventListener("click", function () {
      track.scrollBy({ left: stepWidth(), behavior: reduceMotion ? "auto" : "smooth" });
    });
    if ("IntersectionObserver" in window && steps.length) {
      var edgeObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var fully = entry.intersectionRatio > 0.9;
          if (entry.target === steps[0]) prevBtn.disabled = fully;
          if (entry.target === steps[steps.length - 1]) nextBtn.disabled = fully;
        });
      }, { root: track, threshold: [0, 0.9, 1] });
      edgeObs.observe(steps[0]);
      edgeObs.observe(steps[steps.length - 1]);
    }
  }

  /* ---------- A-7 dialogue ---------- */
  var a7 = $("[data-a7]");
  if (a7) {
    var log = $("[data-a7-log]", a7);
    var replies = $(".replies", a7);
    var resetBtn = $("[data-a7-reset]", a7);
    var typing = null;

    var line = function (who, mine) {
      var p = document.createElement("p");
      p.className = "console__line" + (mine ? " console__line--you" : "");
      var w = document.createElement("span");
      w.className = "console__who";
      w.textContent = who;
      var t = document.createElement("span");
      p.appendChild(w);
      p.appendChild(t);
      log.appendChild(p);
      return t;
    };

    var typeInto = function (el, text, done) {
      if (reduceMotion) { el.textContent = text; done(); return; }
      var caret = document.createElement("span");
      caret.className = "caret";
      caret.setAttribute("aria-hidden", "true");
      el.parentNode.appendChild(caret);
      var i = 0;
      typing = setInterval(function () {
        i += 1;
        el.textContent = text.slice(0, i);
        if (i >= text.length) {
          clearInterval(typing);
          typing = null;
          setTimeout(function () { caret.remove(); done(); }, 500);
        }
      }, 28);
    };

    $$(".reply", a7).forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (replies.hasAttribute("data-done")) return;
        replies.setAttribute("data-done", "");
        btn.setAttribute("aria-pressed", "true");
        $$(".reply", a7).forEach(function (b) { b.disabled = b !== btn; });
        line("You", true).textContent = btn.textContent;
        var target = line("A-7", false);
        setTimeout(function () {
          typeInto(target, btn.getAttribute("data-reply"), function () {
            resetBtn.hidden = false;
          });
        }, reduceMotion ? 0 : 350);
      });
    });

    resetBtn.addEventListener("click", function () {
      if (typing) { clearInterval(typing); typing = null; }
      log.innerHTML = "";
      replies.removeAttribute("data-done");
      $$(".reply", a7).forEach(function (b) {
        b.disabled = false;
        b.setAttribute("aria-pressed", "false");
      });
      resetBtn.hidden = true;
      $(".reply", a7).focus();
    });
  }

  /* ---------- work index: floating preview on fine pointers ---------- */
  var list = $("[data-work-list]");
  var preview = $("[data-preview]");
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 960px)");
  if (list && preview) {
    var rows = $$(".work-row", list);
    var imgs = rows.map(function (row) {
      var src = $(".work-row__thumb", row);
      var img = document.createElement("img");
      img.src = src.getAttribute("src");
      img.alt = "";
      img.decoding = "async";
      preview.appendChild(img);
      return img;
    });
    var tx = 0, ty = 0, x = 0, y = 0, raf = null, active = false;
    var tick = function () {
      x += (tx - x) * (reduceMotion ? 1 : 0.18);
      y += (ty - y) * (reduceMotion ? 1 : 0.18);
      preview.style.transform = "translate3d(" + x + "px," + y + "px,0)";
      if (active && (Math.abs(tx - x) > 0.3 || Math.abs(ty - y) > 0.3)) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
      }
    };
    var target = function (e) {
      var w = preview.offsetWidth, h = preview.offsetHeight;
      tx = Math.min(e.clientX + 28, window.innerWidth - w - 16);
      ty = Math.max(16, Math.min(e.clientY - h / 2, window.innerHeight - h - 16));
    };
    rows.forEach(function (row, i) {
      row.addEventListener("pointerenter", function (e) {
        if (!canHover.matches) return;
        imgs.forEach(function (img, j) { img.classList.toggle("is-current", j === i); });
        if (!active) {
          active = true;
          target(e);
          x = tx; y = ty;
          preview.style.transform = "translate3d(" + x + "px," + y + "px,0)";
        }
        preview.classList.add("is-on");
      });
      row.addEventListener("pointermove", function (e) {
        if (!canHover.matches) return;
        target(e);
        if (!raf) raf = requestAnimationFrame(tick);
      });
    });
    list.addEventListener("pointerleave", function () {
      active = false;
      preview.classList.remove("is-on");
    });
  }

  /* ---------- copy email ---------- */
  var toast = $("[data-toast]");
  var toastTimer = null;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-on"); }, 2200);
  }
  $$("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var label = $("[data-copy-label]", btn);
      var ok = function () {
        if (label) label.textContent = "Copied";
        showToast("Email copied to clipboard");
        setTimeout(function () { if (label) label.textContent = "Copy email"; }, 2000);
      };
      var fail = function () { showToast("Copy failed. The address is " + text); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(ok, fail);
      } else {
        fail();
      }
    });
  });

  /* ---------- footer year ---------- */
  var year = $("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());
})();
