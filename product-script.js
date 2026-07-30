import gsap from "gsap";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8090";

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
    onComplete: () => { window.location.href = url; },
  });
}

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

const formatARS = (value) => {
  return "$ " + value.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");

const page = document.getElementById("product-page");

async function fetchProduct(slug) {
  try {
    const url = `${API_BASE}/api/collections/products/records?filter=${encodeURIComponent(`(slug='${slug}')`)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.items?.[0] || null;
  } catch (err) {
    console.error("Error fetching product:", err);
    return null;
  }
}

async function fetchOptions(productId) {
  try {
    const url = `${API_BASE}/api/collections/product_options/records?filter=(product='${productId}')`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.error("Error fetching options:", err);
    return [];
  }
}

async function fetchVariants(productId) {
  try {
    const url = `${API_BASE}/api/collections/product_variants/records?filter=(product='${productId}')`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.error("Error fetching variants:", err);
    return [];
  }
}

function findMatchingVariant(variants, selected) {
  for (const v of variants) {
    const opts = v.options || {};
    const keys = Object.keys(selected);
    if (keys.length === 0) return v;
    let match = true;
    for (const k of keys) {
      if (opts[k] !== selected[k]) {
        match = false;
        break;
      }
    }
    if (match) return v;
  }
  return null;
}

function renderCarousel(product, images, activeIndex) {
  if (!images || images.length === 0) {
    return `<div class="gallery-placeholder"></div>`;
  }
  return `
    <div class="gallery-carousel">
      <button class="gallery-arrow gallery-arrow-left" aria-label="Anterior">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>
      <div class="gallery-track">
        ${images.map((img, i) => `
          <img class="gallery-slide ${i === activeIndex ? 'active' : ''}" src="${API_BASE}/api/files/products/${product.id}/${img}" alt="${product.name}" />
        `).join("")}
      </div>
      <button class="gallery-arrow gallery-arrow-right" aria-label="Siguiente">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </button>
      <div class="gallery-dots">
        ${images.map((_, i) => `<span class="gallery-dot ${i === activeIndex ? 'active' : ''}" data-index="${i}"></span>`).join("")}
      </div>
    </div>
  `;
}

function setupCarousel(images) {
  const carousel = document.querySelector(".gallery-carousel");
  if (!carousel) return;
  const slides = carousel.querySelectorAll(".gallery-slide");
  const dots = carousel.querySelectorAll(".gallery-dot");
  const leftArrow = carousel.querySelector(".gallery-arrow-left");
  const rightArrow = carousel.querySelector(".gallery-arrow-right");
  if (slides.length === 0) return;

  let currentIndex = 0;
  slides.forEach((s, i) => { if (s.classList.contains("active")) currentIndex = i; });

  function goTo(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    currentIndex = index;
    slides.forEach((s, i) => s.classList.toggle("active", i === currentIndex));
    dots.forEach((d, i) => d.classList.toggle("active", i === currentIndex));
  }

  leftArrow.addEventListener("click", () => goTo(currentIndex - 1));
  rightArrow.addEventListener("click", () => goTo(currentIndex + 1));
  dots.forEach(d => {
    d.addEventListener("click", () => goTo(parseInt(d.dataset.index)));
  });
}

function renderProduct(product, options, variants) {
  const images = (product.images && product.images.length > 0) ? product.images : [];
  const categoryLabels = { tops: "Tops", outerwear: "Outerwear", bottoms: "Bottoms", accessories: "Accessories", archive_rental: "Archive Rental" };

  const minPrice = variants.length > 0
    ? Math.min(...variants.filter(v => v.price_ars).map(v => v.price_ars))
    : null;

  let initialVariant = variants.find(v => v.stock > 0) || variants[0] || null;
  const selected = initialVariant ? { ...initialVariant.options } : {};
  let currentVariant = initialVariant;

  const colorMap = {
    negro: "#1a1a1a",
    blanco: "#f0f0f0",
    gris: "#999",
    oliva: "#6b6e4b",
    beige: "#e8dcc8",
    crudo: "#f5ecd7",
    celeste: "#b3d4e0",
    verde: "#5c7a5c",
    indigo: "#3f51b5",
    naranja: "#e67e22",
    "negro/blanco": "linear-gradient(135deg, #1a1a1a 50%, #f0f0f0 50%)",
    "rojo/crema": "linear-gradient(135deg, #c0392b 50%, #f5ecd7 50%)",
  };

  let optionsHTML = "";
  const colorOption = options.find(o => o.kind === "color");
  if (colorOption) {
    const values = Array.isArray(colorOption.values) ? colorOption.values : [];
    optionsHTML = `
      <div class="product-options">
        <div class="product-option-group">
          <div class="product-option-values" data-kind="color">
            ${values.map(v =>
              `<button class="option-btn option-color ${selected.color === v ? 'active' : ''}" data-value="${v}" style="background:${colorMap[v.toLowerCase()] || '#ccc'}" title="${v}"></button>`
            ).join("")}
          </div>
        </div>
      </div>`;
  }

  page.innerHTML = `
    <a href="/shop.html" class="product-back">&larr; Volver</a>
    <div class="product-gallery-section">
      ${renderCarousel(product, currentVariant?.images || images, 0)}
    </div>
    <div class="product-info-section">
      <h1 class="product-name">${product.name}</h1>
      <span class="product-category">${categoryLabels[product.category] || product.category}</span>
      <span class="product-price" id="product-price">${minPrice ? formatARS(minPrice) : ""}</span>
      ${optionsHTML}
      <button class="add-to-bag-btn" id="add-to-bag-btn">Add to Bag</button>
    </div>
    <div class="cart-popup-overlay" id="cart-popup">
      <div class="cart-popup">
        <p class="cart-popup-msg">Agregado!</p>
        <div class="cart-popup-buttons">
          <button class="cart-popup-btn secondary" id="popup-continue">Seguir comprando</button>
          <button class="cart-popup-btn primary" id="popup-cart">Ver mi carrito</button>
        </div>
      </div>
    </div>
  `;

  setupCarousel(currentVariant?.images || images);

  document.getElementById("add-to-bag-btn").addEventListener("click", () => {
    if (currentVariant) {
      window.cart.add({
        id: product.id,
        slug: product.slug,
        name: product.name,
        image: (currentVariant?.images?.[0] || product.images?.[0]),
        price: currentVariant.price_ars,
        sku: currentVariant.sku,
        options: { ...selected },
        quantity: 1,
      });
    }
    document.getElementById("cart-popup").classList.add("open");
  });

  document.getElementById("popup-continue").addEventListener("click", () => {
    document.getElementById("cart-popup").classList.remove("open");
  });

  document.getElementById("popup-cart").addEventListener("click", () => {
    document.getElementById("cart-popup").classList.remove("open");
    window.cart.open();
  });

  const optionGroup = page.querySelector(".product-option-values");
  if (optionGroup) {
    optionGroup.querySelectorAll(".option-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        optionGroup.querySelectorAll(".option-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        selected.color = btn.dataset.value;

        const match = findMatchingVariant(variants, selected);
        if (match) {
          currentVariant = match;
          document.getElementById("product-price").textContent = formatARS(match.price_ars);
          const gallerySection = document.querySelector(".product-gallery-section");
          if (gallerySection) {
            gallerySection.innerHTML = renderCarousel(product, match.images || images, 0);
            setupCarousel(match.images || images);
          }
        }
      });
    });
  }

  gsap.from([".gallery-carousel", ".product-info-section"], {
    opacity: 0,
    y: 20,
    duration: 0.6,
    stagger: 0.1,
    ease: "power2.out",
  });
}

async function init() {
  if (!slug) {
    page.innerHTML = `<div class="product-404"><h2>Producto no encontrado</h2><p>No se especifico un producto.</p></div>`;
    return;
  }

  const product = await fetchProduct(slug);
  if (!product) {
    page.innerHTML = `<div class="product-404"><h2>Producto no encontrado</h2><p>El producto que buscas no existe.</p></div>`;
    return;
  }

  const [options, variants] = await Promise.all([
    fetchOptions(product.id),
    fetchVariants(product.id),
  ]);

  renderProduct(product, options, variants);
}

init();
