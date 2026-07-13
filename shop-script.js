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
    onComplete: () => {
      window.location.href = url;
    },
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

const productGrid = document.getElementById("product-grid");
const productCount = document.getElementById("product-count");
const filterBtns = document.querySelectorAll(".filter-btn");

let allProducts = [];
let currentFilter = "all";

const categoryLabels = {
  tops: "Tops",
  outerwear: "Outerwear",
  bottoms: "Bottoms",
  accessories: "Accessories",
  archive_rental: "Archive Rental",
};

const labelLabels = {
  made_to_order: "Made to Order",
  ready_to_ship: "Ready to Ship",
  one_of_one: "One of One",
  archive_rental: "Archive Rental",
};

async function fetchProducts(category) {
  try {
    let filter = "(active=true)";
    if (category && category !== "all") {
      filter = `(category='${category}')`;
    }
    const url = `${API_BASE}/api/collections/products/records?sort=-created&filter=${encodeURIComponent(filter)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.error("Error fetching products:", err);
    return [];
  }
}

async function fetchVariants(productId) {
  try {
    const url = `${API_BASE}/api/collections/product_variants/records?filter=(product='${productId}')&sort=price_ars`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.error("Error fetching variants:", err);
    return [];
  }
}

function renderProducts(products) {
  if (products.length === 0) {
    productGrid.innerHTML = `<div class="shop-empty"><p>No hay productos en esta categoria.</p></div>`;
    if (productCount) productCount.textContent = "0 productos";
    return;
  }

  if (productCount) productCount.textContent = `${products.length} producto${products.length !== 1 ? "s" : ""}`;

  productGrid.innerHTML = products
    .map((p) => {
      const hasImages = p.images && p.images.length > 0;
      const hasSecondary = hasImages && p.images.length > 1;
      const imageUrl = hasImages
        ? `${API_BASE}/api/files/products/${p.id}/${p.images[0]}`
        : null;
      const secondaryUrl = hasSecondary
        ? `${API_BASE}/api/files/products/${p.id}/${p.images[1]}`
        : null;

      const price = p.variantPrice || null;
      const variantCount = p.variantCount || 0;

      return `
        <a href="/product.html?slug=${p.slug}" class="product-card" data-slug="${p.slug}">
          <div class="product-card-image-wrapper">
            ${
              imageUrl
                ? `<img class="product-card-image primary" src="${imageUrl}" alt="${p.name}" loading="lazy" />
                   ${secondaryUrl ? `<img class="product-card-image secondary" src="${secondaryUrl}" alt="${p.name}" loading="lazy" />` : ''}`
                : `<div class="product-card-image-placeholder">${p.name.charAt(0)}</div>`
            }
          </div>
          ${p.label ? `<span class="product-card-label">${labelLabels[p.label] || p.label}</span>` : ""}
          <div class="product-card-info">
            <span class="product-card-category">${categoryLabels[p.category] || p.category}</span>
            <h3 class="product-card-name">${p.name}</h3>
            ${
              price
                ? `<span class="product-card-price">${formatARS(price)}</span>`
                : ""
            }
            ${
              variantCount > 0
                ? `<span class="product-card-variants">${variantCount} variante${variantCount !== 1 ? "s" : ""}</span>`
                : ""
            }
          </div>
        </a>
      `;
    })
    .join("");

  gsap.from(".product-card", {
    opacity: 0,
    y: 20,
    duration: 0.5,
    stagger: 0.04,
    ease: "power2.out",
  });
}

async function loadProducts(category) {
  currentFilter = category || "all";

  filterBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === currentFilter);
  });

  productGrid.innerHTML = `<div class="loader-shop"><p>Cargando productos...</p></div>`;

  const records = await fetchProducts(currentFilter);

  const enriched = await Promise.all(
    records.map(async (p) => {
      const variants = await fetchVariants(p.id);
      const prices = variants.filter((v) => v.price_ars).map((v) => v.price_ars);
      const minPrice = prices.length > 0 ? Math.min(...prices) : null;
      return {
        ...p,
        variantPrice: minPrice,
        variantCount: variants.length,
      };
    })
  );

  renderProducts(enriched);
}

filterBtns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    loadProducts(btn.dataset.filter);
  });
});

const params = new URLSearchParams(window.location.search);
const initialFilter = params.get("categoria") || "all";
loadProducts(initialFilter);
