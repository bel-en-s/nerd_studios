import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
    const url = `${API_BASE}/api/collections/product_variants/records?filter=(product='${productId}' && active=true)`;
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

function renderGallery(product, variantImages) {
  const images = variantImages && variantImages.length > 0
    ? variantImages
    : (product.images || []);
  if (images.length === 0) {
    return `<div class="product-gallery-image" style="background:#e3e3e3;aspect-ratio:3/2"></div>`;
  }
  return images.map(img =>
    `<img class="product-gallery-image" src="${API_BASE}/api/files/products/${product.id}/${img}" alt="${product.name}" />`
  ).join("");
}

function renderProduct(product, options, variants) {
  const hasImages = product.images && product.images.length > 0;
  const images = hasImages ? product.images : [];
  const categoryLabels = { tops: "Tops", outerwear: "Outerwear", bottoms: "Bottoms", accessories: "Accessories", archive_rental: "Archive Rental" };
  const labelLabels = { made_to_order: "Made to Order", ready_to_ship: "Ready to Ship", one_of_one: "One of One", archive_rental: "Archive Rental" };

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
  if (options.length > 0) {
    optionsHTML = `<div class="product-options">`;
    for (const opt of options) {
      const values = Array.isArray(opt.values) ? opt.values : [];
      const isColor = opt.kind === "color";
      optionsHTML += `
        <div class="product-option-group">
          <span class="product-option-label">${opt.kind}</span>
          <div class="product-option-values" data-kind="${opt.kind}">
            ${values.map(v =>
              isColor
                ? `<button class="option-btn option-color ${selected[opt.kind] === v ? 'active' : ''}" data-value="${v}" style="background:${colorMap[v.toLowerCase()] || '#ccc'}" title="${v}"></button>`
                : `<button class="option-btn ${selected[opt.kind] === v ? 'active' : ''}" data-value="${v}">${v}</button>`
            ).join("")}
          </div>
        </div>`;
    }
    optionsHTML += `</div>`;
  }

  const stockText = currentVariant
    ? (currentVariant.stock > 0 ? `${currentVariant.stock} en stock` : "Sin stock")
    : "Sin stock";

  page.innerHTML = `
    <div class="product-layout">
      <div class="product-gallery" id="product-gallery">
        ${renderGallery(product, currentVariant?.images)}
      </div>
      <div class="product-info-spacer"></div>
    </div>
    <div class="product-info">
      <a href="/shop.html" class="product-back">&larr; Volver al shop</a>
      <div class="product-meta">
        <span class="product-category">${categoryLabels[product.category] || product.category}</span>
        ${product.label ? `<span class="product-label">${labelLabels[product.label] || product.label}</span>` : ""}
      </div>
      <h1 class="product-name">${product.name}</h1>
      <span class="product-price" id="product-price">${minPrice ? formatARS(minPrice) : ""}</span>
      <div class="product-description">${product.description || ""}</div>
      ${optionsHTML}
      <div class="product-stock" id="product-stock">${stockText}</div>
      <div class="product-sku" id="product-sku">SKU: ${currentVariant ? currentVariant.sku : "—"}</div>
      <a href="/shop.html" class="product-shop-btn">Shop</a>
    </div>
  `;

  function alignInfo() {
    const spacer = document.querySelector(".product-info-spacer");
    const info = document.querySelector(".product-info");
    if (!spacer || !info) return;
    if (window.innerWidth <= 1000) {
      info.style.left = "";
      info.style.width = "";
      return;
    }
    const rect = spacer.getBoundingClientRect();
    info.style.left = rect.left + "px";
    info.style.width = rect.width + "px";
  }

  alignInfo();
  window.addEventListener("resize", alignInfo);

  const optionGroups = page.querySelectorAll(".product-option-values");
  optionGroups.forEach((group) => {
    const kind = group.dataset.kind;
    group.querySelectorAll(".option-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        group.querySelectorAll(".option-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        selected[kind] = btn.dataset.value;

        const match = findMatchingVariant(variants, selected);
        if (match) {
          currentVariant = match;
          document.getElementById("product-price").textContent = formatARS(match.price_ars);
          document.getElementById("product-stock").textContent = match.stock > 0 ? `${match.stock} en stock` : "Sin stock";
          document.getElementById("product-sku").textContent = `SKU: ${match.sku}`;
          const gallery = document.getElementById("product-gallery");
          if (gallery) {
            gallery.innerHTML = renderGallery(product, match.images);
          }
        }
      });
    });
  });

  gsap.from([`.product-gallery > *`, `.product-info`], {
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
