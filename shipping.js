const API_BASE_SHIPPING = import.meta.env.VITE_API_URL || "http://127.0.0.1:8090";

const PROVINCES = {
  A: "Salta", B: "Buenos Aires", C: "CABA", D: "San Luis",
  E: "Entre Rios", F: "La Rioja", G: "Santiago del Estero", H: "Chaco",
  J: "San Juan", K: "Catamarca", L: "La Pampa", M: "Mendoza",
  N: "Misiones", P: "Formosa", Q: "Neuquen", R: "Rio Negro",
  S: "Santa Fe", T: "Tucuman", U: "Chubut", V: "Tierra del Fuego",
  W: "Corrientes", X: "Cordoba", Y: "Jujuy", Z: "Santa Cruz",
};

const DEFAULT_WEIGHT_G = 500;
const DEFAULT_DIMS = { height: 10, width: 20, length: 30 };

let shippingState = {
  deliveryType: "D",
  postalCode: "",
  streetName: "",
  streetNumber: "",
  city: "",
  provinceCode: "",
  recipientName: "",
  recipientEmail: "",
  agency: "",
  selectedRate: null,
  rates: [],
  loadingRates: false,
};

function getCartWeight() {
  const cart = window.cart?.getCart ? window.cart.getCart() : { items: [] };
  if (cart.items.length === 0) return 0;
  const totalWeight = cart.items.reduce((sum, i) => sum + (i.weight_g || DEFAULT_WEIGHT_G) * i.quantity, 0);
  return Math.max(1, Math.min(25000, totalWeight));
}

async function fetchRates() {
  if (!shippingState.postalCode) return;

  shippingState.loadingRates = true;
  refreshShippingUI();

  try {
    const weight = getCartWeight();
    const body = {
      postalCodeOrigin: "1757",
      postalCodeDestination: shippingState.postalCode,
      deliveredType: shippingState.deliveryType,
      dimensions: {
        weight: weight,
        height: DEFAULT_DIMS.height,
        width: DEFAULT_DIMS.width,
        length: DEFAULT_DIMS.length,
      },
    };

    const res = await fetch(`${API_BASE_SHIPPING}/shipping/rates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      shippingState.rates = [];
      shippingState.selectedRate = null;
    } else {
      const data = await res.json();
      shippingState.rates = data.rates || [];
      if (shippingState.rates.length > 0) {
        shippingState.selectedRate = shippingState.rates[0];
      }
    }
  } catch (e) {
    shippingState.rates = [];
    shippingState.selectedRate = null;
  }

  shippingState.loadingRates = false;
  refreshShippingUI();
}

async function fetchAgencies(provinceCode) {
  if (!provinceCode) return [];

  try {
    const res = await fetch(
      `${API_BASE_SHIPPING}/shipping/agencies?provinceCode=${provinceCode}`
    );
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // ignore
  }
  return [];
}

function renderProvinceSelect(selected) {
  let html = `<select class="shipping-select" id="shipping-province">`;
  html += `<option value="">Provincia...</option>`;
  for (const [code, name] of Object.entries(PROVINCES)) {
    html += `<option value="${code}" ${code === selected ? "selected" : ""}>${name}</option>`;
  }
  html += `</select>`;
  return html;
}

function renderRates() {
  if (shippingState.loadingRates) {
    return `<p class="shipping-loading">Calculando costo...</p>`;
  }
  if (!shippingState.postalCode) {
    return `<p class="shipping-hint">Ingresa tu codigo postal para ver el costo de envio</p>`;
  }
  if (shippingState.rates.length === 0) {
    return `<p class="shipping-no-rates">No hay cotizaciones disponibles para este CP</p>`;
  }
  return shippingState.rates.map((r, i) => {
    const checked = shippingState.selectedRate === r ? "checked" : "";
    return `
      <label class="shipping-rate-option ${shippingState.selectedRate === r ? "selected" : ""}">
        <input type="radio" name="shipping-rate" value="${i}" ${checked} />
        <div class="shipping-rate-info">
          <span class="shipping-rate-name">${r.productName}</span>
          <span class="shipping-rate-time">${r.deliveryTimeMin}-${r.deliveryTimeMax} dias</span>
        </div>
        <span class="shipping-rate-price">$${r.price.toFixed(0)}</span>
      </label>`;
  }).join("");
}

function refreshShippingUI() {
  const section = document.getElementById("cart-shipping");
  if (!section) return;

  const postalCode = shippingState.postalCode;
  const deliveryType = shippingState.deliveryType;

  section.innerHTML = `
    <h3 class="shipping-title">Envio</h3>

    <div class="shipping-fields">
      <input type="text" class="shipping-input" id="shipping-name"
        placeholder="Nombre completo" value="${escapeHtml(shippingState.recipientName)}" />
      <input type="email" class="shipping-input" id="shipping-email"
        placeholder="Email" value="${escapeHtml(shippingState.recipientEmail)}" />

      <div class="shipping-delivery-tabs">
        <button class="shipping-tab ${deliveryType === "D" ? "active" : ""}" data-type="D">
          A domicilio
        </button>
        <button class="shipping-tab ${deliveryType === "S" ? "active" : ""}" data-type="S">
          A sucursal
        </button>
      </div>

      <input type="text" class="shipping-input" id="shipping-cp"
        placeholder="Codigo Postal" value="${escapeHtml(postalCode)}"
        maxlength="8" />

      ${deliveryType === "D" ? `
        <input type="text" class="shipping-input" id="shipping-street"
          placeholder="Calle" value="${escapeHtml(shippingState.streetName)}" />
        <div style="display:flex; gap:0.5rem;">
          <input type="text" class="shipping-input" id="shipping-number"
            placeholder="Numero" value="${escapeHtml(shippingState.streetNumber)}"
            style="flex:1;" />
          <input type="text" class="shipping-input" id="shipping-city"
            placeholder="Ciudad" value="${escapeHtml(shippingState.city)}"
            style="flex:2;" />
        </div>
        ${renderProvinceSelect(shippingState.provinceCode)}
      ` : `
        ${renderProvinceSelect(shippingState.provinceCode)}
        <select class="shipping-select" id="shipping-agency">
          <option value="">Selecciona una sucursal...</option>
        </select>
        <p class="shipping-hint">Selecciona provincia para ver sucursales</p>
      `}

      <div class="shipping-rates" id="shipping-rates">
        ${renderRates()}
      </div>
    </div>
  `;

  bindShippingEvents();

  if (deliveryType === "S" && shippingState.provinceCode) {
    loadAgenciesForProvince(shippingState.provinceCode);
  }
}

async function loadAgenciesForProvince(provinceCode) {
  const select = document.getElementById("shipping-agency");
  if (!select) return;

  select.innerHTML = `<option value="">Cargando sucursales...</option>`;
  const agencies = await fetchAgencies(provinceCode);

  if (agencies.length === 0) {
    select.innerHTML = `<option value="">Sin sucursales en esta provincia</option>`;
    return;
  }

  select.innerHTML = `<option value="">Selecciona una sucursal...</option>` +
    agencies.map(a => {
      const addr = a.location?.address;
      const city = addr?.city || addr?.locality || "";
      return `<option value="${a.code}" ${shippingState.agency === a.code ? "selected" : ""}>
        ${a.name} - ${city}
      </option>`;
    }).join("");

  select.value = shippingState.agency;
}

function bindShippingEvents() {
  const nameEl = document.getElementById("shipping-name");
  const emailEl = document.getElementById("shipping-email");
  const cpEl = document.getElementById("shipping-cp");

  nameEl?.addEventListener("input", () => {
    shippingState.recipientName = nameEl.value;
  });
  emailEl?.addEventListener("input", () => {
    shippingState.recipientEmail = emailEl.value;
  });

  cpEl?.addEventListener("input", () => {
    shippingState.postalCode = cpEl.value;
  });
  cpEl?.addEventListener("blur", () => {
    if (cpEl.value !== shippingState.postalCode) {
      shippingState.postalCode = cpEl.value;
    }
    if (shippingState.postalCode) fetchRates();
  });
  cpEl?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && shippingState.postalCode) {
      e.preventDefault();
      cpEl.blur();
      fetchRates();
    }
  });

  document.querySelectorAll(".shipping-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      shippingState.deliveryType = tab.dataset.type;
      shippingState.agency = "";
      shippingState.selectedRate = null;
      shippingState.rates = [];
      if (shippingState.postalCode) fetchRates();
      else refreshShippingUI();
    });
  });

  const streetEl = document.getElementById("shipping-street");
  const numberEl = document.getElementById("shipping-number");
  const cityEl = document.getElementById("shipping-city");
  const provinceEl = document.getElementById("shipping-province");
  const agencyEl = document.getElementById("shipping-agency");

  streetEl?.addEventListener("input", () => {
    shippingState.streetName = streetEl.value;
  });
  numberEl?.addEventListener("input", () => {
    shippingState.streetNumber = numberEl.value;
  });
  cityEl?.addEventListener("input", () => {
    shippingState.city = cityEl.value;
  });
  provinceEl?.addEventListener("change", () => {
    shippingState.provinceCode = provinceEl.value;
    if (shippingState.deliveryType === "S" && provinceEl.value) {
      loadAgenciesForProvince(provinceEl.value);
    }
  });
  agencyEl?.addEventListener("change", () => {
    shippingState.agency = agencyEl.value;
  });

  const rateRadios = document.querySelectorAll('input[name="shipping-rate"]');
  rateRadios.forEach(radio => {
    radio.addEventListener("change", () => {
      const idx = parseInt(radio.value);
      shippingState.selectedRate = shippingState.rates[idx] || null;
      refreshShippingUI();
    });
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function initShippingUI() {
  const drawer = document.getElementById("cart-drawer");
  if (!drawer) {
    setTimeout(initShippingUI, 100);
    return;
  }

  if (document.getElementById("cart-shipping")) return;

  const cartItems = document.getElementById("cart-items");
  if (!cartItems) return;

  const shippingSection = document.createElement("div");
  shippingSection.className = "cart-shipping";
  shippingSection.id = "cart-shipping";
  cartItems.after(shippingSection);

  refreshShippingUI();
}

function getShippingInfo() {
  if (!shippingState.selectedRate || !shippingState.postalCode) return null;

  const info = {
    cost: Math.round(shippingState.selectedRate.price),
    deliveryType: shippingState.deliveryType,
    productType: shippingState.selectedRate.productType,
    recipientName: shippingState.recipientName,
    recipientEmail: shippingState.recipientEmail,
    postalCode: shippingState.postalCode,
  };

  if (shippingState.deliveryType === "S") {
    info.agency = shippingState.agency;
  } else {
    info.streetName = shippingState.streetName;
    info.streetNumber = shippingState.streetNumber;
    info.city = shippingState.city;
    info.provinceCode = shippingState.provinceCode;
  }

  return info;
}

function resetShipping() {
  shippingState = {
    deliveryType: "D",
    postalCode: "",
    streetName: "",
    streetNumber: "",
    city: "",
    provinceCode: "",
    recipientName: "",
    recipientEmail: "",
    agency: "",
    selectedRate: null,
    rates: [],
    loadingRates: false,
  };
  refreshShippingUI();
}

document.addEventListener("DOMContentLoaded", () => {
  initShippingUI();

  const observer = new MutationObserver(() => {
    if (!document.getElementById("cart-shipping") && document.getElementById("cart-drawer")) {
      initShippingUI();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
});

window.shipping = {
  getInfo: getShippingInfo,
  refresh: refreshShippingUI,
  reset: resetShipping,
};
