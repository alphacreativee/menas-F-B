"use strict";

function initSectionMoment() {
  const section = document.querySelector(".sectionMoment");
  const lightbox = document.querySelector("[data-moment-lightbox]");

  if (!section || !lightbox) return;

  const track = section.querySelector("[data-moment-track]");
  const list = section.querySelector("[data-moment-list]");
  const images = Array.from(list.querySelectorAll(".moment-item img"));
  const activeImage = lightbox.querySelector("[data-moment-active-image]");
  const counter = lightbox.querySelector("[data-moment-counter]");
  const thumbnails = lightbox.querySelector("[data-moment-thumbnails]");
  const zoomLevel = lightbox.querySelector("[data-moment-zoom-level]");
  const zoomInButton = lightbox.querySelector("[data-moment-zoom-in]");
  const zoomOutButton = lightbox.querySelector("[data-moment-zoom-out]");

  if (!track || !list || images.length === 0) return;

  const duplicate = list.cloneNode(true);
  duplicate.setAttribute("aria-hidden", "true");
  duplicate.removeAttribute("data-moment-list");
  duplicate.querySelectorAll("[data-moment-index]").forEach((item) => {
    item.removeAttribute("data-moment-index");
    item.removeAttribute("aria-label");
  });
  track.appendChild(duplicate);

  let currentIndex = 0;
  let zoom = 100;
  let returnFocusTo = null;

  images.forEach((image, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "moment-thumbnail";
    button.dataset.momentThumbnail = String(index);
    button.setAttribute("aria-label", `Mở hình ${index + 1}`);
    const thumb = document.createElement("img");
    thumb.src = image.currentSrc || image.src;
    thumb.alt = "";
    button.appendChild(thumb);
    thumbnails.appendChild(button);
  });

  const updateZoom = () => {
    activeImage.style.transform = `scale(${zoom / 100})`;
    zoomLevel.textContent = `${zoom}%`;
    zoomOutButton.disabled = zoom <= 100;
    zoomInButton.disabled = zoom >= 200;
  };

  const showImage = (index) => {
    currentIndex = (index + images.length) % images.length;
    const image = images[currentIndex];
    activeImage.src = image.currentSrc || image.src;
    activeImage.alt = image.alt;
    counter.textContent = `${currentIndex + 1} / ${images.length}`;
    thumbnails.querySelectorAll(".moment-thumbnail").forEach((button, i) => {
      const isActive = i === currentIndex;
      button.classList.toggle("is-active", isActive);
      if (isActive) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    });
    zoom = 100;
    updateZoom();
  };

  const openLightbox = (index, trigger) => {
    returnFocusTo = trigger || document.activeElement;
    showImage(index);
    lightbox.inert = false;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    lightbox.querySelector("[data-moment-close]").focus();
  };

  const closeLightbox = () => {
    if (!lightbox.classList.contains("is-open")) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    lightbox.inert = true;
    if (returnFocusTo instanceof HTMLElement) returnFocusTo.focus();
  };

  section.addEventListener("click", (event) => {
    const item = event.target.closest("[data-moment-index]");
    if (item) openLightbox(Number(item.dataset.momentIndex), item);
  });

  section.addEventListener("keydown", (event) => {
    const item = event.target.closest("[data-moment-index]");
    if (!item) return;
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    openLightbox(Number(item.dataset.momentIndex), item);
  });

  thumbnails.addEventListener("click", (event) => {
    const button = event.target.closest("[data-moment-thumbnail]");
    if (button) showImage(Number(button.dataset.momentThumbnail));
  });

  lightbox.querySelector("[data-moment-close]").addEventListener("click", closeLightbox);
  lightbox.querySelector("[data-moment-previous]").addEventListener("click", () => {
    showImage(currentIndex - 1);
  });
  lightbox.querySelector("[data-moment-next]").addEventListener("click", () => {
    showImage(currentIndex + 1);
  });
  zoomInButton.addEventListener("click", () => {
    zoom = Math.min(200, zoom + 25);
    updateZoom();
  });
  zoomOutButton.addEventListener("click", () => {
    zoom = Math.max(100, zoom - 25);
    updateZoom();
  });

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  // Keep the page scroll position and scrollbar unchanged while viewing images.
  lightbox.addEventListener(
    "wheel",
    (event) => {
      if (!event.target.closest("[data-moment-thumbnails]")) event.preventDefault();
    },
    { passive: false }
  );
  lightbox.addEventListener(
    "touchmove",
    (event) => {
      if (!event.target.closest("[data-moment-thumbnails]")) event.preventDefault();
    },
    { passive: false }
  );

  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") showImage(currentIndex - 1);
    if (event.key === "ArrowRight") showImage(currentIndex + 1);
  });
}

function init() {
  initSectionMoment();
}

document.addEventListener("DOMContentLoaded", () => {
  init();
});
