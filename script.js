/* =========================================================
   Angie Cano | Retrato editorial
   Carrusel de polaroids (4 en 4), galería, visor y efectos
   ========================================================= */

// Datos de las fotos. Para añadir más, agrega una línea con su archivo.
const photos = [
  { src: "img/foto-01.jpg", title: "Blanco esencial",  tag: "retrato", label: "Retrato cenital" },
  { src: "img/foto-02.jpg", title: "Lunares",          tag: "moda",    label: "Moda casual" },
  { src: "img/foto-03.jpg", title: "Sombrero negro",   tag: "moda",    label: "Editorial noir" },
  { src: "img/foto-04.jpg", title: "Fucsia",           tag: "estudio", label: "Estudio color" },
  { src: "img/foto-05.jpg", title: "Lavanda",          tag: "moda",    label: "Moda urbana" },
  { src: "img/foto-06.jpg", title: "Marfil",           tag: "retrato", label: "Retrato editorial" },
  { src: "img/foto-07.jpg", title: "Verde y azul",     tag: "estudio", label: "Estudio clásico" },
  { src: "img/foto-08.jpg", title: "Rosa pálido",      tag: "estudio", label: "Estudio suave" },
  { src: "img/foto-09.jpg", title: "Frontal",          tag: "retrato", label: "Retrato frontal" }
];

const PER_PAGE = 4;
const AUTOPLAY_MS = 5500;
const totalPages = Math.ceil(photos.length / PER_PAGE);

const track = document.getElementById("track");
const dotsBox = document.getElementById("dots");
const progressBar = document.getElementById("progressBar");
const hero = document.querySelector(".hero");

let page = 0;
let busy = false;
let timer = null;
let progressStart = 0;
let rafId = null;

/* ---------- Carrusel de polaroids ---------- */

// Devuelve las 4 fotos de una página. Si faltan, vuelve al inicio.
function photosForPage(p) {
  return Array.from({ length: PER_PAGE }, (_, i) => {
    const index = (p * PER_PAGE + i) % photos.length;
    return { ...photos[index], index };
  });
}

function polaroidHTML(photo) {
  return `
    <figure class="polaroid is-entering" tabindex="0" data-index="${photo.index}">
      <span class="pin" aria-hidden="true"></span>
      <img src="${photo.src}" alt="Angie Cano, ${photo.label.toLowerCase()}" loading="eager">
      <figcaption>${photo.title}</figcaption>
    </figure>`;
}

function buildSlots() {
  track.innerHTML = "";
  for (let i = 0; i < PER_PAGE; i++) {
    const slot = document.createElement("div");
    slot.className = "slot";
    track.appendChild(slot);
  }
}

function fillPage(p) {
  const slots = track.querySelectorAll(".slot");
  photosForPage(p).forEach((photo, i) => {
    slots[i].innerHTML = polaroidHTML(photo);
    const card = slots[i].firstElementChild;
    card.style.animationDelay = `${i * 0.12}s, ${1.1 + i * 0.12}s`;
  });
  updateDots();
}

function goTo(target) {
  if (busy) return;
  busy = true;
  page = (target + totalPages) % totalPages;

  // Las fotos actuales suben una por una y salen
  const current = track.querySelectorAll(".polaroid");
  current.forEach((card, i) => {
    card.classList.remove("is-entering");
    card.style.animationDelay = `${i * 0.08}s`;
    card.classList.add("is-leaving");
  });

  const exitTime = current.length ? 700 + (current.length - 1) * 80 : 0;
  setTimeout(() => {
    fillPage(page);
    setTimeout(() => (busy = false), 600);
  }, exitTime);

  restartAutoplay();
}

function buildDots() {
  dotsBox.innerHTML = "";
  for (let i = 0; i < totalPages; i++) {
    const dot = document.createElement("button");
    dot.className = "dot";
    dot.setAttribute("aria-label", `Ir al grupo ${i + 1}`);
    dot.addEventListener("click", () => i !== page && goTo(i));
    dotsBox.appendChild(dot);
  }
}

function updateDots() {
  dotsBox.querySelectorAll(".dot").forEach((d, i) => d.classList.toggle("is-active", i === page));
}

/* Avance automático con barra de progreso */
function tick(now) {
  const elapsed = now - progressStart;
  progressBar.style.width = `${Math.min(elapsed / AUTOPLAY_MS, 1) * 100}%`;
  if (elapsed >= AUTOPLAY_MS) {
    goTo(page + 1);
    return;
  }
  rafId = requestAnimationFrame(tick);
}

function restartAutoplay() {
  cancelAnimationFrame(rafId);
  progressStart = performance.now();
  rafId = requestAnimationFrame(tick);
}

function pauseAutoplay() {
  cancelAnimationFrame(rafId);
  progressBar.style.width = "0";
}

document.getElementById("prev").addEventListener("click", () => goTo(page - 1));
document.getElementById("next").addEventListener("click", () => goTo(page + 1));

track.addEventListener("mouseenter", pauseAutoplay);
track.addEventListener("mouseleave", restartAutoplay);

// Deslizar con el dedo en celulares
let touchX = 0;
hero.addEventListener("touchstart", e => (touchX = e.touches[0].clientX), { passive: true });
hero.addEventListener("touchend", e => {
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) goTo(page + (dx < 0 ? 1 : -1));
});

// Pausar si la pestaña no está visible
document.addEventListener("visibilitychange", () => (document.hidden ? pauseAutoplay() : restartAutoplay()));

/* ---------- Galería del portafolio ---------- */
const grid = document.getElementById("grid");

function buildGrid() {
  grid.innerHTML = photos
    .map(
      (p, i) => `
      <article class="card reveal" data-tag="${p.tag}" data-index="${i}">
        <span class="card__num">${String(i + 1).padStart(2, "0")}</span>
        <img src="${p.src}" alt="Angie Cano, ${p.label.toLowerCase()}" loading="lazy">
        <div class="card__info">
          <h3>${p.title}</h3>
          <p>${p.label}</p>
        </div>
      </article>`
    )
    .join("");
}

document.getElementById("filters").addEventListener("click", e => {
  const btn = e.target.closest(".filter");
  if (!btn) return;
  document.querySelectorAll(".filter").forEach(f => f.classList.toggle("is-active", f === btn));
  const filter = btn.dataset.filter;
  grid.querySelectorAll(".card").forEach(card => {
    const show = filter === "todos" || card.dataset.tag === filter;
    card.classList.toggle("is-hidden", !show);
  });
});

/* ---------- Visor de imágenes ---------- */
const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbCaption = document.getElementById("lbCaption");
let lbIndex = 0;

function openLightbox(i) {
  lbIndex = i;
  showLightboxImage();
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  pauseAutoplay();
}

function showLightboxImage() {
  const p = photos[lbIndex];
  lbImg.src = p.src;
  lbImg.alt = `Angie Cano, ${p.label.toLowerCase()}`;
  lbCaption.textContent = `${p.title} · ${p.label}`;
}

function closeLightbox() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  restartAutoplay();
}

function stepLightbox(dir) {
  lbIndex = (lbIndex + dir + photos.length) % photos.length;
  showLightboxImage();
}

document.addEventListener("click", e => {
  const item = e.target.closest(".polaroid, .card");
  if (item) openLightbox(Number(item.dataset.index));
});

document.addEventListener("keydown", e => {
  if (e.key === "Enter" && document.activeElement.classList.contains("polaroid")) {
    openLightbox(Number(document.activeElement.dataset.index));
  }
  if (lightbox.classList.contains("is-open")) {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") stepLightbox(1);
    if (e.key === "ArrowLeft") stepLightbox(-1);
  } else if (window.scrollY < window.innerHeight * 0.6) {
    if (e.key === "ArrowRight") goTo(page + 1);
    if (e.key === "ArrowLeft") goTo(page - 1);
  }
});

document.getElementById("lbClose").addEventListener("click", closeLightbox);
document.getElementById("lbPrev").addEventListener("click", () => stepLightbox(-1));
document.getElementById("lbNext").addEventListener("click", () => stepLightbox(1));
lightbox.addEventListener("click", e => e.target === lightbox && closeLightbox());

/* ---------- Encabezado, menú y animaciones de scroll ---------- */
const header = document.getElementById("header");
const nav = document.getElementById("nav");
const menuToggle = document.getElementById("menuToggle");

window.addEventListener("scroll", () => header.classList.toggle("is-scrolled", window.scrollY > 40), { passive: true });

menuToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  menuToggle.classList.toggle("is-open", open);
  menuToggle.setAttribute("aria-expanded", open);
});
nav.querySelectorAll("a").forEach(a =>
  a.addEventListener("click", () => {
    nav.classList.remove("is-open");
    menuToggle.classList.remove("is-open");
  })
);

function countUp(el) {
  const target = Number(el.dataset.count);
  let n = 0;
  const step = () => {
    n++;
    el.textContent = String(n).padStart(2, "0");
    if (n < target) setTimeout(step, 120);
  };
  step();
}

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      entry.target.querySelectorAll("[data-count]").forEach(countUp);
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.15 }
);

/* ---------- Formulario ---------- */
document.getElementById("contactForm").addEventListener("submit", e => {
  e.preventDefault();
  const form = e.target;
  const status = document.getElementById("formStatus");
  if (!form.checkValidity()) {
    status.textContent = "Completa todos los campos con un correo válido.";
    return;
  }
  status.textContent = "Gracias. Tu mensaje fue enviado.";
  form.reset();
});

/* ---------- Inicio ---------- */
document.getElementById("year").textContent = new Date().getFullYear();
buildSlots();
buildDots();
fillPage(0);
buildGrid();
document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
restartAutoplay();
