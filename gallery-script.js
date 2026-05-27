import gsap from "gsap";

const curtain = document.querySelector(".page-transition");
if (curtain) {
  gsap.set(curtain, { scaleY: 1, transformOrigin: "center" });
  gsap.to(curtain, {
    scaleY: 0,
    duration: 0.8,
    ease: "power4.inOut",
    delay: 0.15,
  });
}

function navigateWithTransition(url) {
  if (!curtain || url === window.location.pathname) {
    window.location.href = url;
    return;
  }
  gsap.to(curtain, {
    scaleY: 1,
    duration: 0.8,
    ease: "power4.inOut",
    onComplete: () => {
      window.location.href = url;
    },
  });
}

let target = 0;
let current = 0;
const ease = 0.075;

const slider = document.querySelector(".slider");
const sliderWrapper = document.querySelector(".slider-wrapper");
const slides = document.querySelectorAll(".slide");

let maxScroll = sliderWrapper.scrollWidth - window.innerWidth;

let touchStartY = 0;
let isTouching = false;
let touchVelocity = 0;

function lerp(start, end, factor) {
  return start + (end - start) * factor;
}

function updateScaleAndPosition() {
  slides.forEach((slide) => {
    const rect = slide.getBoundingClientRect();
    const centerPosition = (rect.left + rect.right) / 2;
    const distanceFromCenter = centerPosition - window.innerWidth / 2;

    let scale, offsetX;
    if (distanceFromCenter > 0) {
      scale = Math.min(1.75, 1 + distanceFromCenter / window.innerWidth);
      offsetX = (scale - 1) * 300;
    } else {
      scale = Math.max(
        0.5,
        1 - Math.abs(distanceFromCenter) / window.innerWidth
      );
      offsetX = 0;
    }

    gsap.set(slide, { scale: scale, x: offsetX });
  });
}

function update() {
  if (!isTouching && Math.abs(touchVelocity) > 0.1) {
    target += touchVelocity;
    target = Math.max(0, target);
    target = Math.min(maxScroll, target);
    touchVelocity *= 0.92;
  }

  current = lerp(current, target, ease);

  gsap.set(".slider-wrapper", {
    x: -current,
  });

  updateScaleAndPosition();

  requestAnimationFrame(update);
}

window.addEventListener("resize", () => {
  maxScroll = sliderWrapper.scrollWidth - window.innerWidth;
});

window.addEventListener("wheel", (e) => {
  target += e.deltaY;
  target = Math.max(0, target);
  target = Math.min(maxScroll, target);
});

slider.addEventListener("touchstart", (e) => {
  touchStartY = e.touches[0].clientY;
  touchVelocity = 0;
  isTouching = true;
});

slider.addEventListener("touchmove", (e) => {
  if (!isTouching) return;
  const currentY = e.touches[0].clientY;
  const deltaY = touchStartY - currentY;
  touchStartY = currentY;
  touchVelocity = deltaY;

  target += deltaY;
  target = Math.max(0, target);
  target = Math.min(maxScroll, target);
});

slider.addEventListener("touchend", () => {
  isTouching = false;
});

update();

const menuToggle = document.querySelector(".menu-toggle");
const navLinksContainer = document.querySelector(".nav-links");

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    menuToggle.classList.toggle("active");
    navLinksContainer.classList.toggle("active");
  });
}

const navLinks = document.querySelectorAll(".nav-links a");
navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    const href = link.getAttribute("href");
    if (!href || href === "#" || href === window.location.pathname) return;
    e.preventDefault();
    if (menuToggle) {
      menuToggle.classList.remove("active");
      navLinksContainer.classList.remove("active");
    }
    navigateWithTransition(href);
  });
});

const modal = document.getElementById("imageModal");
const modalImage = modal.querySelector(".modal-image");
const modalClose = modal.querySelector(".modal-close");

let currentSlideIndex = -1;

slides.forEach((slide, i) => {
  slide.addEventListener("click", () => {
    const img = slide.querySelector("img");
    if (!img) return;
    currentSlideIndex = i;
    modalImage.src = img.src;
    modalImage.alt = img.alt;
    modal.classList.add("open");
  });
});

function updateModalImage() {
  const slide = slides[currentSlideIndex];
  if (!slide) return;
  const img = slide.querySelector("img");
  if (!img) return;
  modalImage.src = img.src;
  modalImage.alt = img.alt;
}

function closeModal() {
  modal.classList.remove("open");
  modalImage.src = "";
  currentSlideIndex = -1;
}

modalClose.addEventListener("click", closeModal);
modalImage.addEventListener("click", closeModal);

document.querySelector(".modal-prev").addEventListener("click", (e) => {
  e.stopPropagation();
  if (currentSlideIndex > 0) {
    currentSlideIndex--;
    updateModalImage();
  }
});

document.querySelector(".modal-next").addEventListener("click", (e) => {
  e.stopPropagation();
  if (currentSlideIndex < slides.length - 1) {
    currentSlideIndex++;
    updateModalImage();
  }
});

document.addEventListener("keydown", (e) => {
  if (!modal.classList.contains("open")) return;
  if (e.key === "Escape") {
    closeModal();
  } else if (e.key === "ArrowLeft" && currentSlideIndex > 0) {
    currentSlideIndex--;
    updateModalImage();
  } else if (e.key === "ArrowRight" && currentSlideIndex < slides.length - 1) {
    currentSlideIndex++;
    updateModalImage();
  }
});
