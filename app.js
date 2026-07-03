/*
 * جميع بيانات المتجر القابلة للتعديل موجودة هنا.
 * غيّر السعر أو الرقم أو الروابط ثم احفظ الملف فقط.
 */
const STORE_CONFIG = Object.freeze({
  brandName: "لذيذ يا حامض",
  phoneLocal: "0557277294",
  whatsappInternational: "966557277294",
  instagramUrl: "https://instagram.com/Lazeez_yahamid",
  tiktokUrl: "https://www.tiktok.com/@Lazeez_yahamid",
  product: {
    name: "ورق عنب (طبق)",
    currentPrice: 15,
    oldPrice: 25,
    description: "ورق عنب محشي بالأرز والتوابل العربية الأصيلة، مقدّم بشكل فاخر مع الليمون الطازج.",
  },
});

const state = {
  quantity: 1,
  lastOrder: null,
};

const views = [...document.querySelectorAll("[data-view]")];
const form = document.querySelector("#order-form");
const addressField = document.querySelector("#address-field");
const addressInput = document.querySelector("#customer-address");
const quantityOutput = document.querySelector("#quantity-output");
const totalOutput = document.querySelector("#order-total-value");
const homeOnlyElements = document.querySelectorAll("[data-home-only]");

function applyStoreConfig() {
  document.querySelectorAll("[data-product-name]").forEach((element) => {
    element.textContent = STORE_CONFIG.product.name;
  });
  document.querySelectorAll("[data-current-price]").forEach((element) => {
    element.textContent = STORE_CONFIG.product.currentPrice;
  });
  document.querySelectorAll("[data-old-price]").forEach((element) => {
    element.textContent = STORE_CONFIG.product.oldPrice;
  });
  document.querySelectorAll("[data-product-description]").forEach((element) => {
    element.textContent = STORE_CONFIG.product.description;
  });
  document.querySelectorAll("[data-store-phone]").forEach((element) => {
    element.textContent = STORE_CONFIG.phoneLocal;
  });
  document.querySelectorAll("[data-store-phone-link]").forEach((element) => {
    element.href = `tel:${STORE_CONFIG.phoneLocal}`;
  });
  document.querySelectorAll("[data-store-whatsapp]").forEach((element) => {
    element.href = `https://wa.me/${STORE_CONFIG.whatsappInternational}`;
  });
  document.querySelectorAll("[data-instagram-link]").forEach((element) => {
    element.href = STORE_CONFIG.instagramUrl;
  });
  document.querySelectorAll("[data-tiktok-link]").forEach((element) => {
    element.href = STORE_CONFIG.tiktokUrl;
  });
  document.querySelector("#current-year").textContent = new Date().getFullYear();
  updateQuantity(1);
}

function showView(viewName, updateHistory = true) {
  const safeView = viewName === "ready" && !state.lastOrder ? "home" : viewName;

  views.forEach((view) => {
    const isActive = view.dataset.view === safeView;
    view.hidden = !isActive;
    view.classList.toggle("is-active", isActive);
  });

  homeOnlyElements.forEach((element) => {
    element.hidden = safeView !== "home";
  });

  if (updateHistory) {
    const hash = safeView === "home" ? "#home" : `#${safeView}`;
    if (window.location.hash !== hash) {
      window.history.pushState({ view: safeView }, "", hash);
    }
  }

  window.scrollTo({ top: 0, behavior: "smooth" });

  window.setTimeout(() => {
    const title = document.querySelector(`[data-view="${safeView}"] h1`);
    if (safeView !== "home" && title) {
      title.setAttribute("tabindex", "-1");
      title.focus({ preventScroll: true });
    }
  }, 80);
}

function updateQuantity(nextQuantity) {
  state.quantity = Math.max(1, Math.min(99, nextQuantity));
  quantityOutput.textContent = state.quantity;
  totalOutput.textContent = state.quantity * STORE_CONFIG.product.currentPrice;
  const decreaseButton = document.querySelector('[data-quantity="decrease"]');
  decreaseButton.disabled = state.quantity === 1;
  decreaseButton.setAttribute("aria-disabled", String(state.quantity === 1));
}

function updateFulfillment() {
  const method = form.elements.fulfillment.value;
  const needsAddress = method === "delivery";
  addressField.hidden = !needsAddress;
  addressInput.required = needsAddress;

  if (!needsAddress) {
    clearFieldError(addressInput);
  }
}

function normalizeDigits(value) {
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
  const easternDigits = "۰۱۲۳۴۵۶۷۸۹";
  return value
    .replace(/[٠-٩]/g, (digit) => arabicDigits.indexOf(digit))
    .replace(/[۰-۹]/g, (digit) => easternDigits.indexOf(digit))
    .replace(/[^\d+]/g, "");
}

function isValidSaudiMobile(value) {
  const normalized = normalizeDigits(value).replace(/^\+/, "");
  return /^05\d{8}$/.test(normalized) || /^9665\d{8}$/.test(normalized);
}

function setFieldError(input, message) {
  const field = input.closest(".field");
  const error = field?.querySelector(".field-error");
  field?.classList.add("is-invalid");
  input.setAttribute("aria-invalid", "true");
  if (error) {
    error.textContent = message;
    if (error.id) input.setAttribute("aria-describedby", error.id);
  }
}

function clearFieldError(input) {
  const field = input.closest(".field");
  const error = field?.querySelector(".field-error");
  field?.classList.remove("is-invalid");
  input.removeAttribute("aria-invalid");
  input.removeAttribute("aria-describedby");
  if (error) error.textContent = "";
}

function validateForm() {
  const nameInput = form.elements.name;
  const mobileInput = form.elements.mobile;
  const errors = [];

  [nameInput, mobileInput, addressInput].forEach(clearFieldError);

  if (nameInput.value.trim().length < 2) {
    const error = "اكتب الاسم من حرفين على الأقل.";
    setFieldError(nameInput, error);
    errors.push(nameInput);
  }

  if (!isValidSaudiMobile(mobileInput.value)) {
    const error = "أدخل رقم جوال سعودي صحيح، مثل 05XXXXXXXX.";
    setFieldError(mobileInput, error);
    errors.push(mobileInput);
  }

  if (form.elements.fulfillment.value === "delivery" && addressInput.value.trim().length < 5) {
    const error = "أدخل عنوان التوصيل بشكل واضح.";
    setFieldError(addressInput, error);
    errors.push(addressInput);
  }

  if (errors.length) {
    errors[0].focus();
    return false;
  }

  return true;
}

function buildOrder() {
  const fulfillment = form.elements.fulfillment.value;
  return {
    product: STORE_CONFIG.product.name,
    quantity: state.quantity,
    total: state.quantity * STORE_CONFIG.product.currentPrice,
    name: form.elements.name.value.trim(),
    mobile: normalizeDigits(form.elements.mobile.value.trim()),
    fulfillment,
    methodLabel: fulfillment === "delivery" ? "توصيل" : "استلام من المحل",
    address: fulfillment === "delivery" ? addressInput.value.trim() : "",
    notes: form.elements.notes.value.trim(),
  };
}

function buildWhatsappMessage(order) {
  const lines = [
    `مرحباً ${STORE_CONFIG.brandName} 👋`,
    "أود تأكيد الطلب التالي:",
    "",
    `• المنتج: ${order.product}`,
    `• الكمية: ${order.quantity}`,
    `• إجمالي المنتجات: ${order.total} ريال`,
    "",
    `• الاسم: ${order.name}`,
    `• رقم الجوال: ${order.mobile}`,
    `• طريقة الاستلام: ${order.methodLabel}`,
  ];

  if (order.fulfillment === "delivery") {
    lines.push(`• عنوان التوصيل: ${order.address}`);
  }

  lines.push(`• ملاحظات: ${order.notes || "لا يوجد"}`);

  if (order.fulfillment === "delivery") {
    lines.push("", "ملاحظة: رسوم التوصيل غير مشمولة ويتم تحديدها عبر واتساب.");
  }

  return lines.join("\n");
}

function updateReadyView(order) {
  document.querySelector("#summary-quantity").textContent = order.quantity;
  document.querySelector("#summary-method").textContent = order.methodLabel;
  document.querySelector("#summary-total").textContent = order.total;
  const message = buildWhatsappMessage(order);
  document.querySelector("#whatsapp-order-link").href =
    `https://wa.me/${STORE_CONFIG.whatsappInternational}?text=${encodeURIComponent(message)}`;
}

document.querySelectorAll("[data-go]").forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.go));
});

document.querySelectorAll("[data-quantity]").forEach((button) => {
  button.addEventListener("click", () => {
    const difference = button.dataset.quantity === "increase" ? 1 : -1;
    updateQuantity(state.quantity + difference);
  });
});

form.elements.fulfillment.forEach((radio) => {
  radio.addEventListener("change", updateFulfillment);
});

form.querySelectorAll("input, textarea").forEach((input) => {
  input.addEventListener("input", () => clearFieldError(input));
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validateForm()) return;

  state.lastOrder = buildOrder();
  updateReadyView(state.lastOrder);
  showView("ready");
});

window.addEventListener("popstate", () => {
  const requestedView = window.location.hash.replace("#", "");
  showView(["home", "order", "ready"].includes(requestedView) ? requestedView : "home", false);
});

applyStoreConfig();
updateFulfillment();

const initialView = window.location.hash.replace("#", "");
showView(["home", "order", "ready"].includes(initialView) ? initialView : "home", false);
