"use strict";

function initParallaxSwiper(swiperEl, options = {}) {
  const interleaveOffset = 0.85;

  return new Swiper(swiperEl, {
    slidesPerView: 1,
    loop: true,
    speed: 1500,
    watchSlidesProgress: true,
    grabCursor: true,
    ...options,
    on: {
      progress(swiper) {
        swiper.slides.forEach((slide) => {
          const slideProgress = slide.progress || 0;
          const innerOffset = swiper.width * interleaveOffset;
          const innerTranslate = slideProgress * innerOffset;

          if (!isNaN(innerTranslate)) {
            const image = slide.querySelector(".image");
            if (image) {
              image.style.transform = `translate3d(${innerTranslate}px, 0, 0)`;
            }
          }
        });
      },
      touchStart(swiper) {
        swiper.slides.forEach((slide) => {
          slide.style.transition = "";
        });
      },
      setTransition(swiper, speed) {
        const easing = "cubic-bezier(0.25, 0.1, 0.25, 1)";
        swiper.slides.forEach((slide) => {
          slide.style.transition = `${speed}ms ${easing}`;
          const image = slide.querySelector(".image");
          if (image) image.style.transition = `${speed}ms ${easing}`;
        });
      },
      ...(options.on || {}),
    },
  });
}

function initSectionNews() {
  const section = document.querySelector("[data-section-news]");
  if (!section || typeof Swiper === "undefined") return;

  const background = section.querySelector("[data-news-background]");
  const backgroundImage = background?.querySelector("img");
  if (backgroundImage && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.fromTo(
      backgroundImage,
      { yPercent: -6 },
      {
        yPercent: 6,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top center",
          end: "bottom center",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      }
    );
  }

  const slider = section.querySelector("[data-news-swiper]");
  const copy = section.querySelector("[data-news-copy]");
  const titleLink = section.querySelector("[data-news-title-link]");
  const date = section.querySelector("[data-news-date]");
  const description = section.querySelector("[data-news-description]");
  const prevButton = section.querySelector("[data-news-prev]");
  const nextButton = section.querySelector("[data-news-next]");
  if (!slider || !copy || !titleLink || !date || !description) return;

  const updateContent = (swiper) => {
    const slide = swiper.slides[swiper.activeIndex];
    const entry = slide?.querySelector("[data-news-entry]")?.content;
    const entryTitle = entry?.querySelector("[data-news-entry-title]");
    const entryDate = entry?.querySelector("[data-news-entry-date]");
    const entryDescription = entry?.querySelector("[data-news-entry-description]");
    if (!entryTitle || !entryDate || !entryDescription) return;

    titleLink.textContent = entryTitle.textContent.trim();
    titleLink.href = entryTitle.getAttribute("href") || "#";
    date.textContent = entryDate.textContent.trim();
    date.dateTime = entryDate.getAttribute("datetime") || "";
    description.textContent = entryDescription.textContent.trim();
  };

  let displayedIndex = null;
  const syncContentToSlide = (swiper, shouldAnimate = true) => {
    if (displayedIndex === swiper.realIndex) return;
    displayedIndex = swiper.realIndex;
    updateContent(swiper);
    if (!shouldAnimate) return;

    if (typeof copy.animate === "function") {
      copy.animate(
        [
          { opacity: 0, transform: "translateY(30px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        {
          duration: 400,
          easing: "ease-out",
          fill: "both",
        }
      );
    } else {
      copy.style.opacity = "0";
      copy.style.transform = "translateY(30px)";
      requestAnimationFrame(() => {
        copy.style.transition = "opacity 400ms ease-out, transform 400ms ease-out";
        copy.style.opacity = "1";
        copy.style.transform = "translateY(0)";
      });
    }
  };

  initParallaxSwiper(slider, {
    navigation: {
      prevEl: prevButton,
      nextEl: nextButton,
    },
    on: {
      init(swiper) {
        displayedIndex = swiper.realIndex;
        updateContent(swiper);
      },
      realIndexChange(swiper) {
        syncContentToSlide(swiper);
      },
      slideChangeTransitionStart(swiper) {
        syncContentToSlide(swiper);
      },
    },
  });
}

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
  initSectionNews();
  initSectionMoment();
}

document.addEventListener("DOMContentLoaded", () => {
  init();
});
