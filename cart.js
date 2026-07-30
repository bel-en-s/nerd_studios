const CART_KEY = "nerd_cart";
const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8090";

const formatARS = (value) => {
  return "$ " + value.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || { items: [] };
  } catch {
    return { items: [] };
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.items.find(i => i.sku === product.sku);
  if (existing) {
    existing.quantity += product.quantity || 1;
  } else {
    cart.items.push({ ...product, quantity: product.quantity || 1 });
  }
  saveCart(cart);
  updateBadge();
}

function removeFromCart(sku) {
  const cart = getCart();
  cart.items = cart.items.filter(i => i.sku !== sku);
  saveCart(cart);
  renderCart();
}

function updateQuantity(sku, delta) {
  const cart = getCart();
  const item = cart.items.find(i => i.sku === sku);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    cart.items = cart.items.filter(i => i.sku !== sku);
  }
  saveCart(cart);
  renderCart();
}

function getTotal() {
  const cart = getCart();
  return cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

function getItemCount() {
  const cart = getCart();
  return cart.items.reduce((sum, i) => sum + i.quantity, 0);
}

function updateBadge() {
  const count = getItemCount();
  document.querySelectorAll(".cart-count").forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? "flex" : "none";
  });
}

function renderCart() {
  const container = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");
  if (!container) return;

  const cart = getCart();
  updateBadge();

  if (cart.items.length === 0) {
    container.innerHTML = `<p class="cart-empty">Tu carrito está vacío</p>`;
    if (totalEl) totalEl.textContent = formatARS(0);
    return;
  }

  container.innerHTML = cart.items.map(item => `
    <div class="cart-item">
      <img class="cart-item-image" src="${API_BASE}/api/files/products/${item.id}/${item.image}" alt="${item.name}" />
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        ${item.options?.color ? `<p class="cart-item-option">${item.options.color}</p>` : ""}
        <p class="cart-item-price">${formatARS(item.price)}</p>
      </div>
      <div class="cart-item-qty">
        <button class="cart-qty-btn" data-sku="${item.sku}" data-delta="-1">−</button>
        <span>${item.quantity}</span>
        <button class="cart-qty-btn" data-sku="${item.sku}" data-delta="1">+</button>
      </div>
      <button class="cart-item-remove" data-sku="${item.sku}">✕</button>
    </div>
  `).join("");

  if (totalEl) totalEl.textContent = formatARS(getTotal());

  container.querySelectorAll(".cart-qty-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      updateQuantity(btn.dataset.sku, parseInt(btn.dataset.delta));
    });
  });

  container.querySelectorAll(".cart-item-remove").forEach(btn => {
    btn.addEventListener("click", () => {
      removeFromCart(btn.dataset.sku);
    });
  });
}

function openCart() {
  const overlay = document.getElementById("cart-overlay");
  if (!overlay) return;
  renderCart();
  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  const overlay = document.getElementById("cart-overlay");
  if (!overlay) return;
  overlay.classList.remove("open");
  document.body.style.overflow = "";
}

function initCartUI() {
  if (document.getElementById("cart-overlay")) return;

  const drawer = document.createElement("div");
  drawer.className = "cart-overlay";
  drawer.id = "cart-overlay";
  drawer.innerHTML = `
    <div class="cart-drawer">
      <div class="cart-header">
        <h2 class="cart-title">Carrito</h2>
        <button class="cart-close" id="cart-close">✕</button>
      </div>
      <div class="cart-items" id="cart-items">
        <p class="cart-empty">Tu carrito está vacío</p>
      </div>
      <div class="cart-footer">
        <div class="cart-total">
          <span>Total</span>
          <span id="cart-total">$ 0</span>
        </div>
        <button class="cart-checkout-btn">Checkout</button>
      </div>
    </div>
  `;
  document.body.appendChild(drawer);

  updateBadge();

  document.getElementById("cart-close").addEventListener("click", closeCart);
  drawer.addEventListener("click", (e) => {
    if (e.target === drawer) closeCart();
  });

  document.querySelectorAll(".nav-cart-btn, .nav-cart-link").forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      openCart();
    });
  });

  const checkoutBtn = document.querySelector(".cart-checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", async () => {
      const cart = getCart();
      if (cart.items.length === 0) return;

      checkoutBtn.disabled = true;
      checkoutBtn.textContent = "Procesando...";

      try {
        const res = await fetch(`${API_BASE}/checkout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: cart.items }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Error ${res.status}`);
        }

        const data = await res.json();
        window.location.href = data.init_point;
      } catch (err) {
        console.error("Checkout error:", err);
        alert("No se pudo iniciar el pago. Intentalo de nuevo.");
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = "Checkout";
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", initCartUI);

window.cart = {
  add: addToCart,
  open: openCart,
  close: closeCart,
};
