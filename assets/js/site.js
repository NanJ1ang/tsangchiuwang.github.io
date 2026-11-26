/* ==========================================================================
   Tsang Chiu Wang — portfolio behaviour
   No dependencies. Everything degrades to a static, readable page.
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  var DPR = Math.min(window.devicePixelRatio || 1, 2);

  function clamp(v, a, b) {
    return v < a ? a : v > b ? b : v;
  }

  /* ---------------------------------------------------------- header */
  var header = document.querySelector(".site-header");
  if (header) {
    var lastState = false;
    var onScroll = function () {
      var scrolled = window.scrollY > 24;
      if (scrolled !== lastState) {
        header.classList.toggle("is-scrolled", scrolled);
        lastState = scrolled;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ------------------------------------------------------- hero video */
  var heroes = document.querySelectorAll("video.hero-video");
  if (heroes.length) {
    var setLabel = function (video, playing) {
      var btn = video.parentNode.querySelector("[data-video-toggle]");
      if (!btn) return;
      btn.textContent = playing ? "Pause loop" : "Play loop";
      btn.setAttribute("aria-pressed", playing ? "true" : "false");
    };

    var play = function (video) {
      var p = video.play();
      if (p && typeof p.catch === "function") {
        p.then(function () { setLabel(video, true); }).catch(function () { setLabel(video, false); });
      } else {
        setLabel(video, true);
      }
    };

    Array.prototype.forEach.call(heroes, function (video) {
      var btn = video.parentNode.querySelector("[data-video-toggle]");
      if (reduceMotion.matches) {
        video.removeAttribute("autoplay");
        video.pause();
        setLabel(video, false);
      } else {
        play(video);
      }
      if (btn) {
        btn.addEventListener("click", function () {
          if (video.paused) play(video);
          else { video.pause(); setLabel(video, false); }
        });
      }
      video.addEventListener("play", function () { setLabel(video, true); });
      video.addEventListener("pause", function () { setLabel(video, false); });
    });

    var syncHeroes = function () {
      Array.prototype.forEach.call(heroes, function (video) {
        if (reduceMotion.matches) { video.pause(); setLabel(video, false); }
        else if (video.paused) play(video);
      });
    };
    if (typeof reduceMotion.addEventListener === "function") {
      reduceMotion.addEventListener("change", syncHeroes);
    } else if (typeof reduceMotion.addListener === "function") {
      reduceMotion.addListener(syncHeroes);
    }
  }

  /* ---------------------------------------------------------- reveals */
  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length) {
    if ("IntersectionObserver" in window && !reduceMotion.matches) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-in");
              io.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
      );
      reveals.forEach(function (el) {
        io.observe(el);
      });
    } else {
      reveals.forEach(function (el) {
        el.classList.add("is-in");
      });
    }
  }

  /* ---------------------------------------------------------- home canvas */
  var homeCanvas = document.querySelector("[data-home-canvas]");
  if (homeCanvas) {
    var ctx = homeCanvas.getContext("2d");
    var width = 0;
    var height = 0;
    var lines = [];
    var particles = [];
    var ripples = [];
    var pointer = { x: -9999, y: -9999, active: false };
    var raf = 0;
    var visible = true;

    function seedScene() {
      lines = [];
      particles = [];
      var count = width < 700 ? 9 : 17;
      for (var i = 0; i < count; i++) {
        lines.push({
          y: (height / (count + 1)) * (i + 1),
          alpha: 0.05 + Math.random() * 0.07,
          phase: Math.random() * Math.PI * 2,
          drift: 0.4 + Math.random() * 0.8
        });
      }
      var pcount = width < 700 ? 18 : 42;
      for (var p = 0; p < pcount; p++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: 0.6 + Math.random() * 1.1,
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.12,
          alpha: 0.1 + Math.random() * 0.22
        });
      }
    }

    function resize() {
      var rect = homeCanvas.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      homeCanvas.width = Math.round(width * DPR);
      homeCanvas.height = Math.round(height * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      seedScene();
      draw(0);
    }

    function lineY(line, x, t) {
      var base = line.y + Math.sin(x * 0.004 + line.phase + t * 0.00012) * 4 * line.drift;
      if (!pointer.active) return base;
      var dx = x - pointer.x;
      var dy = base - pointer.y;
      var d = Math.sqrt(dx * dx + dy * dy);
      var reach = 190;
      if (d > reach) return base;
      var falloff = 1 - d / reach;
      falloff = falloff * falloff * (3 - 2 * falloff);
      return base + dy * falloff * -0.06 + (pointer.y - base) * falloff * 0.06;
    }

    function draw(t) {
      ctx.clearRect(0, 0, width, height);

      // ripples first, under the lines
      for (var r = ripples.length - 1; r >= 0; r--) {
        var rp = ripples[r];
        rp.r += 2.4;
        rp.a *= 0.985;
        if (rp.r > 320 || rp.a < 0.01) {
          ripples.splice(r, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(10,10,10," + rp.a.toFixed(3) + ")";
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // lines
      var step = 22;
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        ctx.beginPath();
        for (var x = 0; x <= width + step; x += step) {
          var y = lineY(line, x, t);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = "rgba(10,10,10," + line.alpha.toFixed(3) + ")";
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }

      // particles
      for (var j = 0; j < particles.length; j++) {
        var pt = particles[j];
        pt.x += pt.vx;
        pt.y += pt.vy;
        if (pt.x < -10) pt.x = width + 10;
        if (pt.x > width + 10) pt.x = -10;
        if (pt.y < -10) pt.y = height + 10;
        if (pt.y > height + 10) pt.y = -10;

        var near = 0;
        if (pointer.active) {
          var ddx = pt.x - pointer.x;
          var ddy = pt.y - pointer.y;
          var dist = Math.sqrt(ddx * ddx + ddy * ddy);
          near = clamp(1 - dist / 180, 0, 1);
        }
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.r + near * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(10,10,10," + (pt.alpha + near * 0.35).toFixed(3) + ")";
        ctx.fill();
      }

      if (visible && !reduceMotion.matches) raf = requestAnimationFrame(draw);
    }

    function loop() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", function () {
      clearTimeout(resize._t);
      resize._t = setTimeout(resize, 150);
    });

    if (!reduceMotion.matches) {
      window.addEventListener(
        "pointermove",
        function (e) {
          var rect = homeCanvas.getBoundingClientRect();
          pointer.x = e.clientX - rect.left;
          pointer.y = e.clientY - rect.top;
          pointer.active = rect.width > 0 && e.clientY > rect.top - 40;
          if (visible) loop();
        },
        { passive: true }
      );
      window.addEventListener("pointerdown", function (e) {
        var rect = homeCanvas.getBoundingClientRect();
        if (e.clientY < rect.top) return;
        ripples.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, r: 8, a: 0.22 });
        if (visible) loop();
      });
      document.addEventListener("visibilitychange", function () {
        visible = !document.hidden;
        if (visible) loop();
        else cancelAnimationFrame(raf);
      });
      loop();
    }
  }

  /* ---------------------------------------------------------- work preview */
  var preview = document.querySelector("[data-work-preview]");
  if (preview && finePointer.matches && !reduceMotion.matches) {
    var previewImg = preview.querySelector("img");
    var rows = document.querySelectorAll("[data-preview-src]");
    var targetX = 0;
    var targetY = 0;
    var curX = 0;
    var curY = 0;
    var moving = false;

    function tick() {
      curX += (targetX - curX) * 0.16;
      curY += (targetY - curY) * 0.16;
      preview.style.transform =
        "translate3d(" + curX + "px," + curY + "px,0) translate(-50%,-50%)";
      if (Math.abs(targetX - curX) > 0.4 || Math.abs(targetY - curY) > 0.4) {
        requestAnimationFrame(tick);
      } else {
        moving = false;
      }
    }

    document.addEventListener(
      "pointermove",
      function (e) {
        targetX = e.clientX;
        targetY = e.clientY;
        if (!moving) {
          moving = true;
          requestAnimationFrame(tick);
        }
      },
      { passive: true }
    );

    rows.forEach(function (row) {
      row.addEventListener("pointerenter", function () {
        var src = row.getAttribute("data-preview-src");
        if (!src) return;
        if (previewImg.getAttribute("src") !== src) previewImg.setAttribute("src", src);
        preview.classList.add("is-visible");
      });
      row.addEventListener("pointerleave", function () {
        preview.classList.remove("is-visible");
      });
      row.addEventListener("focus", function () {
        var src = row.getAttribute("data-preview-src");
        if (src) previewImg.setAttribute("src", src);
      });
    });
  }

  /* ---------------------------------------------------------- ripple study */
  var rippleCanvas = document.querySelector("[data-ripple]");
  if (rippleCanvas) {
    var rctx = rippleCanvas.getContext("2d");
    var RW = 0;
    var RH = 0;
    var rings = [];
    var targetRing = { x: 0.62, y: 0.5 };
    var currentRing = { x: 0.62, y: 0.5 };
    var rRipples = [];
    var rRaf = 0;
    var rVisible = true;

    function rResize() {
      var rect = rippleCanvas.getBoundingClientRect();
      RW = Math.max(1, Math.round(rect.width));
      RH = Math.max(1, Math.round(rect.height));
      rippleCanvas.width = Math.round(RW * DPR);
      rippleCanvas.height = Math.round(RH * DPR);
      rctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      rDraw();
    }

    function rDraw() {
      rctx.clearRect(0, 0, RW, RH);

      // measuring grid
      rctx.strokeStyle = "rgba(10,10,10,0.06)";
      rctx.lineWidth = 1;
      var gx = Math.max(40, RW / 12);
      var gy = Math.max(40, RH / 8);
      for (var x = gx; x < RW; x += gx) {
        rctx.beginPath();
        rctx.moveTo(x, 0);
        rctx.lineTo(x, RH);
        rctx.stroke();
      }
      for (var y = gy; y < RH; y += gy) {
        rctx.beginPath();
        rctx.moveTo(0, y);
        rctx.lineTo(RW, y);
        rctx.stroke();
      }

      currentRing.x += (targetRing.x - currentRing.x) * 0.08;
      currentRing.y += (targetRing.y - currentRing.y) * 0.08;
      var cx = currentRing.x * RW;
      var cy = currentRing.y * RH;
      var base = Math.min(RW, RH) * 0.06;

      // expanding click ripples
      for (var r = rRipples.length - 1; r >= 0; r--) {
        var rp = rRipples[r];
        rp.r += 2.2;
        rp.a *= 0.986;
        if (rp.a < 0.01) {
          rRipples.splice(r, 1);
          continue;
        }
        rctx.beginPath();
        rctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        rctx.strokeStyle = "rgba(10,10,10," + rp.a.toFixed(3) + ")";
        rctx.lineWidth = 0.9;
        rctx.stroke();
      }

      // idle rings
      for (var i = 0; i < 9; i++) {
        var rad = base + i * base * 0.62;
        rctx.beginPath();
        rctx.arc(cx, cy, rad, 0, Math.PI * 2);
        rctx.strokeStyle = "rgba(10,10,10," + (0.42 - i * 0.036).toFixed(3) + ")";
        rctx.lineWidth = 0.9;
        rctx.stroke();
      }

      // crosshair
      rctx.strokeStyle = "rgba(10,10,10,0.55)";
      rctx.lineWidth = 1;
      rctx.beginPath();
      rctx.moveTo(cx - 16, cy);
      rctx.lineTo(cx + 16, cy);
      rctx.moveTo(cx, cy - 16);
      rctx.lineTo(cx, cy + 16);
      rctx.stroke();

      if (rVisible && !reduceMotion.matches) rRaf = requestAnimationFrame(rDraw);
    }

    function rLoop() {
      cancelAnimationFrame(rRaf);
      rRaf = requestAnimationFrame(rDraw);
    }

    rResize();
    window.addEventListener("resize", function () {
      clearTimeout(rResize._t);
      rResize._t = setTimeout(rResize, 150);
    });

    rippleCanvas.addEventListener("pointermove", function (e) {
      var rect = rippleCanvas.getBoundingClientRect();
      targetRing.x = clamp((e.clientX - rect.left) / rect.width, 0.08, 0.92);
      targetRing.y = clamp((e.clientY - rect.top) / rect.height, 0.1, 0.9);
      if (rVisible && !reduceMotion.matches) rLoop();
    });

    rippleCanvas.addEventListener("pointerleave", function () {
      targetRing.x = 0.62;
      targetRing.y = 0.5;
      rLoop();
    });

    rippleCanvas.addEventListener("pointerdown", function (e) {
      var rect = rippleCanvas.getBoundingClientRect();
      rRipples.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        r: 6,
        a: 0.36
      });
      rLoop();
    });

    if (!reduceMotion.matches) rLoop();
  }

  /* -------------------------------------------------- missing images */
  function markMissing(img) {
    if (!img || img.dataset.missing) return;
    img.dataset.missing = "1";
    var box = document.createElement("div");
    box.className = "img-missing";
    var w = Number(img.getAttribute("width")) || 4;
    var h = Number(img.getAttribute("height")) || 3;
    box.style.aspectRatio = w + " / " + h;
    var name = document.createElement("span");
    name.className = "img-missing__name";
    name.textContent = (img.getAttribute("src") || "").split("/").pop();
    var hint = document.createElement("span");
    hint.className = "img-missing__hint";
    hint.textContent = img.getAttribute("alt") || "";
    box.appendChild(name);
    if (hint.textContent) box.appendChild(hint);
    img.replaceWith(box);
  }

  var previewBox = document.querySelector("[data-work-preview]");
  document.querySelectorAll("img").forEach(function (img) {
    if (previewBox && previewBox.contains(img)) {
      img.addEventListener("error", function () {
        previewBox.classList.add("is-missing");
      });
      return;
    }
    img.addEventListener("error", function () {
      markMissing(img);
    });
    if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) markMissing(img);
  });

  /* ---------------------------------------------------------- year */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ------------------------------------------------- embedded work */
  document.querySelectorAll("[data-embed-reload]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var block = btn.closest(".embed-block");
      var frame = block && block.querySelector("iframe");
      if (!frame) return;
      var src = frame.getAttribute("src");
      frame.setAttribute("src", "about:blank");
      window.setTimeout(function () {
        frame.setAttribute("src", src);
      }, 60);
    });
  });
})();
