(function () {
  "use strict";
  var WA = "https://wa.me/5493517463467?text=";
  var body = document.body;

  /* ---------- header al scrollear ---------- */
  function onScroll() { body.classList.toggle("scrolled", window.scrollY > 60); updateFloats(); }

  /* ---------- áreas: una sola fuente (el HTML del índice) ---------- */
  var list = document.getElementById("aList");
  var items = Array.prototype.slice.call(list.querySelectorAll("li[data-num]"));
  var PREVIEW = true; // boceto: solo existe el inicio
  function pageHref(slug) { return PREVIEW ? "#" : "./" + slug; }
  var areas = items.map(function (li) {
    return { li: li, num: li.dataset.num, slug: li.dataset.slug, title: li.querySelector(".t").textContent };
  });

  // mega menú, menú mobile, footer y select del formulario
  var megaCols = document.getElementById("megaCols");
  var mList = document.getElementById("mAreasList");
  var fAreas = document.getElementById("fAreas");
  var fSelect = document.getElementById("fArea");
  areas.forEach(function (a) {
    megaCols.insertAdjacentHTML("beforeend", '<a href="' + pageHref(a.slug) + '" data-soon><span>' + a.num + '</span>' + a.title + "</a>");
    mList.insertAdjacentHTML("beforeend", '<a href="' + pageHref(a.slug) + '" data-soon>' + a.title + "</a>");
    fAreas.insertAdjacentHTML("beforeend", '<li><a href="' + pageHref(a.slug) + '" data-soon>' + a.title + "</a></li>");
    var o = document.createElement("option"); o.value = a.title; o.textContent = a.title; fSelect.appendChild(o);
  });

  var panel = document.getElementById("aPanel");
  var panelHome = panel.parentNode;
  var pNum = document.getElementById("pNum"), pTitle = document.getElementById("pTitle");
  var pBody = document.getElementById("pBody"), pWa = document.getElementById("pWa"), pLink = document.getElementById("pLink");
  var mqStack = window.matchMedia("(max-width:1024px)");
  var current = null;

  // estado inicial: ninguna área abierta (en desktop el panel muestra una invitación)
  function reset() {
    current = null;
    areas.forEach(function (x) { x.li.querySelector(".a-btn").setAttribute("aria-expanded", "false"); });
    pNum.textContent = "";
    pTitle.textContent = "Elija un área";
    pBody.innerHTML = '<p class="p-sub">Seleccione una de las quince áreas para ver en qué podemos acompañarlo. Si no sabe cuál corresponde a su caso, consúltenos y lo orientamos.</p>';
    pWa.href = WA + encodeURIComponent("Hola, quisiera hacer una consulta con el estudio.");
    pLink.href = pageHref("areas.html");
    pLink.innerHTML = 'Ver todas <i class="ti ti-arrow-right"></i>';
    if (panel.parentNode !== panelHome) panelHome.appendChild(panel);
    panel.style.display = mqStack.matches ? "none" : "";
  }

  function select(a, opts) {
    opts = opts || {};
    var stacked = mqStack.matches;
    if (current === a && !opts.force) { reset(); return; } // segundo clic: cerrar
    areas.forEach(function (x) { x.li.querySelector(".a-btn").setAttribute("aria-expanded", x === a ? "true" : "false"); });
    current = a;
    pNum.textContent = a.num;
    pTitle.textContent = a.title;
    pBody.innerHTML = a.li.querySelector(".a-data").innerHTML;
    pWa.href = WA + encodeURIComponent("Hola, quisiera hacer una consulta sobre " + a.title.toLowerCase() + ".");
    pLink.href = pageHref(a.slug);
    pLink.innerHTML = 'Ver área <i class="ti ti-arrow-right"></i>';
    panel.style.display = "";
    if (stacked) a.li.appendChild(panel); else if (panel.parentNode !== panelHome) panelHome.appendChild(panel);
    panel.classList.remove("swap"); void panel.offsetWidth; panel.classList.add("swap");
    if (stacked && opts.scroll !== false) {
      var top = a.li.getBoundingClientRect().top + window.scrollY - 100;
      if (Math.abs(window.scrollY - top) > 40) window.scrollTo({ top: top, behavior: "smooth" });
    }
  }
  areas.forEach(function (a) {
    a.li.querySelector(".a-btn").addEventListener("click", function () { select(a); });
  });
  function relayout() {
    if (!current) { reset(); return; }
    if (mqStack.matches) current.li.appendChild(panel); else panelHome.appendChild(panel);
    panel.style.display = "";
  }
  (mqStack.addEventListener ? mqStack.addEventListener("change", relayout) : mqStack.addListener(relayout));
  reset();

  // filtros Personas / Empresas
  document.querySelectorAll(".tabs button").forEach(function (b) {
    b.addEventListener("click", function () {
      var f = b.dataset.filter;
      document.querySelectorAll(".tabs button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      areas.forEach(function (a) {
        a.li.classList.toggle("hide", !(f === "all" || a.li.dataset.g.split(" ").indexOf(f) > -1));
      });
      if (current && current.li.classList.contains("hide")) reset();
    });
  });

  // chips de "A quién asesoramos" → abren el área
  document.querySelectorAll("[data-go]").forEach(function (c) {
    c.addEventListener("click", function () {
      var a = areas.filter(function (x) { return x.num === c.dataset.go; })[0];
      if (!a) return;
      document.querySelector('.tabs button[data-filter="all"]').click();
      select(a, { force: true, scroll: false });
      var target = mqStack.matches ? a.li : document.getElementById("areas");
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 100, behavior: "smooth" });
    });
  });

  /* ---------- mega menú ---------- */
  var dd = document.getElementById("ddAreas"), ddBtn = dd.querySelector("button"), ddTimer;
  function ddSet(open) { dd.classList.toggle("open", open); ddBtn.setAttribute("aria-expanded", open ? "true" : "false"); }
  dd.addEventListener("mouseenter", function () { clearTimeout(ddTimer); ddSet(true); });
  dd.addEventListener("mouseleave", function () { ddTimer = setTimeout(function () { ddSet(false); }, 320); });
  ddBtn.addEventListener("click", function () { ddSet(!dd.classList.contains("open")); });
  document.addEventListener("click", function (e) { if (!dd.contains(e.target)) ddSet(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { ddSet(false); closeMenu(); closeModal(); } });

  /* ---------- menú mobile ---------- */
  var burger = document.getElementById("burger");
  function closeMenu() { body.classList.remove("menu-open"); burger.setAttribute("aria-expanded", "false"); }
  burger.addEventListener("click", function () {
    var open = !body.classList.contains("menu-open");
    body.classList.toggle("menu-open", open); burger.setAttribute("aria-expanded", open ? "true" : "false");
  });
  document.getElementById("moverlay").addEventListener("click", closeMenu);
  document.querySelectorAll("#mnav a").forEach(function (a) { a.addEventListener("click", closeMenu); });
  var mAreas = document.getElementById("mAreas");
  mAreas.querySelector("button").addEventListener("click", function () {
    var open = !mAreas.classList.contains("open");
    mAreas.classList.toggle("open", open); this.setAttribute("aria-expanded", open ? "true" : "false");
  });

  /* ---------- reveals + contadores ---------- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(".reveal,.reveal-left,.reveal-right");
  function countUp(el) {
    var target = +el.dataset.target, cur = 0, step = target / (1400 / 16);
    var t = setInterval(function () { cur += step; if (cur >= target) { cur = target; clearInterval(t); } el.textContent = Math.floor(cur); }, 16);
  }
  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { countUp(en.target); cio.unobserve(en.target); } });
    }, { threshold: 0.6 });
    document.querySelectorAll(".count").forEach(function (el) { el.textContent = "0"; cio.observe(el); });
  }

  /* ---------- flotantes: se ocultan al llegar al footer ---------- */
  var waFloat = document.getElementById("waFloat"), backToTop = document.getElementById("backToTop");
  var siteFooter = document.querySelector("footer.site"), footerVisible = false;
  function updateFloats() {
    var show = window.scrollY > 500 && !footerVisible;
    waFloat.classList.toggle("show", show); backToTop.classList.toggle("show", show);
  }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { footerVisible = en.isIntersecting; }); updateFloats();
    }, { threshold: 0 }).observe(siteFooter);
  }
  backToTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });

  /* ---------- formulario (FormSubmit + modal) ---------- */
  var form = document.getElementById("contactForm"), btn = document.getElementById("formSubmitBtn");
  var iframe = document.getElementById("formsubmit-iframe"), modal = document.getElementById("okModal"), sending = false;
  function validField(input) {
    var ok = input.value.trim() !== "" && (input.type !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim()));
    input.closest(".field").classList.toggle("err", !ok); return ok;
  }
  form.addEventListener("submit", function (e) {
    var ok = true;
    form.querySelectorAll("[required]").forEach(function (i) { if (!validField(i)) ok = false; });
    if (!ok) { e.preventDefault(); var f = form.querySelector(".field.err input,.field.err textarea"); if (f) f.focus(); return; }
    sending = true; btn.disabled = true; btn.textContent = "Enviando...";
  });
  form.querySelectorAll("[required]").forEach(function (i) {
    i.addEventListener("input", function () { if (i.closest(".field").classList.contains("err")) validField(i); });
  });
  iframe.addEventListener("load", function () {
    if (!sending) return;
    sending = false; form.reset(); btn.disabled = false; btn.textContent = "Enviar consulta";
    modal.classList.add("show");
  });
  function closeModal() { modal.classList.remove("show"); }
  modal.addEventListener("click", function (e) { if (e.target === modal || e.target.hasAttribute("data-close")) closeModal(); });

  document.addEventListener("click", function (e) {
    var l = e.target.closest('a[href="#"]'); if (l) e.preventDefault();
  });

  document.getElementById("year").textContent = new Date().getFullYear();
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
