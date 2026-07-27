// Lógica da LOJA (site público) — versão estática para GitHub Pages.
// Não existe mais servidor/API: os produtos vêm direto do db.json,
// buscado como um arquivo estático (fetch).

let allProducts = [];
let allCategories = [];
let activeCategory = null;
let cart = JSON.parse(localStorage.getItem("cart") || "[]");

async function loadData() {
  const db = await fetch("db.json").then((r) => r.json());
  allProducts = db.products;
  allCategories = db.categories;
  renderCategories();
  renderProducts();
  renderCart();
}

function renderCategories() {
  const el = document.getElementById("category-grid");
  el.innerHTML = `
    <button class="cat-chip" onclick="setCategory(null)">
      <span class="cat-swatch" style="background:#2B1B12"></span>
      <span>Todas</span>
    </button>
    ${allCategories.map((c) => `
      <button class="cat-chip" onclick="setCategory('${c.id}')">
        <span class="cat-swatch" style="background:${c.swatch}"></span>
        <span>${c.name}</span>
      </button>
    `).join("")}
  `;
}

function setCategory(id) {
  activeCategory = id;
  renderProducts();
  document.getElementById("produtos").scrollIntoView({ behavior: "smooth" });
}

function renderProducts() {
  const search = document.getElementById("search-input").value.trim().toLowerCase();
  let list = allProducts.filter((p) => p.status !== "inativo");
  if (activeCategory) list = list.filter((p) => p.category === activeCategory);
  if (search) list = list.filter((p) => p.name.toLowerCase().includes(search));

  document.getElementById("result-count").textContent = `${list.length} produtos encontrados`;

  const grid = document.getElementById("product-grid");
  if (list.length === 0) {
    grid.innerHTML = `<p class="empty-note">Nenhum produto encontrado.</p>`;
    return;
  }

  grid.innerHTML = list.map((p) => `
    <div class="card" onclick="openProductModal(${p.id})">
      <div class="card-thumb">${productThumb(p, 130, true)}</div>
      <p class="card-cat">${categoryName(allCategories, p.category)}</p>
      <h3>${p.name}</h3>
      <div class="stars">${starsHTML(p.rating)}</div>
      <div class="price-row">
        <div>
          ${p.promo
            ? `<span class="price promo-old">${money(p.price)}</span> <span class="price" style="color:var(--clay)">${money(p.promo)}</span>`
            : `<span class="price">${money(p.price)}</span>`}
        </div>
        <button class="add-btn" onclick="event.stopPropagation(); addToCart(${p.id})">Adicionar</button>
      </div>
    </div>
  `).join("");
}

// ---------- Modal de detalhes do produto ----------

let modalQty = 1;

function openProductModal(productId) {
  const p = allProducts.find((p) => p.id === productId);
  if (!p) return;
  modalQty = 1;
  renderProductModal(p);
  document.getElementById("product-view-modal").classList.add("open");
}

function renderProductModal(p) {
  const body = document.getElementById("product-modal-body");
  body.innerHTML = `
    <div style="display:flex;justify-content:center;background:var(--cream);border-radius:16px;padding:${p.image ? "0" : "20px"};margin-bottom:14px;height:240px;overflow:hidden;">
      ${productThumb(p, 200, true)}
    </div>
    <p class="card-cat">${categoryName(allCategories, p.category)}</p>
    <h2 style="margin:4px 0 6px;">${p.name}</h2>
    <div class="stars" style="margin-bottom:8px;">${starsHTML(p.rating)} <span style="font-size:11px;opacity:.5;">(${p.reviews} avaliações)</span></div>
    <p style="font-size:13px;opacity:.75;margin-bottom:10px;">
      ${p.description}${p.personalizable ? " Esta caneca aceita personalização com sua frase." : ""}
    </p>
    <div style="font-size:12px;opacity:.65;display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:14px;">
      <span>Modelo: ${categoryName(allCategories, p.category)}</span>
      <span>Capacidade: ${p.capacity_ml}ml</span>
      <span>Material: ${p.material}</span>
      <span>Cor: ${p.color}</span>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
      ${p.promo
        ? `<div><span class="price promo-old">${money(p.price)}</span> <span class="price" style="font-size:20px;color:var(--clay)">${money(p.promo)}</span></div>`
        : `<span class="price" style="font-size:20px;">${money(p.price)}</span>`}
      <div style="display:flex;align-items:center;gap:8px;border:1px solid rgba(43,27,18,.15);border-radius:999px;padding:4px 10px;">
        <button class="link-btn" onclick="changeModalQty(-1)">−</button>
        <span id="modal-qty" style="font-size:13px;">${modalQty}</span>
        <button class="link-btn" onclick="changeModalQty(1)">+</button>
      </div>
    </div>
    <button class="btn btn-dark" style="width:100%;" onclick="addToCart(${p.id}, modalQty); closeProductModal();">Adicionar ao Carrinho</button>
  `;
}

function changeModalQty(delta) {
  modalQty = Math.max(1, modalQty + delta);
  document.getElementById("modal-qty").textContent = modalQty;
}

function closeProductModal() {
  document.getElementById("product-view-modal").classList.remove("open");
}
document.getElementById("product-modal-close").addEventListener("click", closeProductModal);
document.getElementById("product-view-modal").addEventListener("click", (e) => {
  if (e.target.id === "product-view-modal") closeProductModal();
});

document.getElementById("search-input").addEventListener("input", renderProducts);

// ---------- Carrinho (estado do navegador — sempre foi assim, não muda) ----------

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

function addToCart(productId, qty = 1) {
  const existing = cart.find((it) => it.productId === productId);
  if (existing) existing.qty += qty;
  else cart.push({ productId, qty });
  saveCart();
  openCart();
}

function changeQty(productId, delta) {
  const it = cart.find((it) => it.productId === productId);
  if (!it) return;
  it.qty = Math.max(1, it.qty + delta);
  saveCart();
}

function removeFromCart(productId) {
  cart = cart.filter((it) => it.productId !== productId);
  saveCart();
}

function renderCart() {
  const count = cart.reduce((s, it) => s + it.qty, 0);
  const countEl = document.getElementById("cart-count");
  countEl.textContent = count;
  countEl.style.display = count > 0 ? "flex" : "none";

  const itemsEl = document.getElementById("cart-items");
  const summaryEl = document.getElementById("cart-summary");

  if (cart.length === 0) {
    itemsEl.innerHTML = `<p class="empty-note">Seu carrinho está vazio.</p>`;
    summaryEl.innerHTML = "";
    return;
  }

  let subtotal = 0;
  itemsEl.innerHTML = cart.map((it) => {
    const p = allProducts.find((p) => p.id === it.productId);
    if (!p) return "";
    const unit = p.promo || p.price;
    subtotal += unit * it.qty;
    return `
      <div class="cart-item">
        <div class="thumb">${productThumb(p, 46)}</div>
        <div style="flex:1">
          <p style="margin:0;font-size:13px;">${p.name}</p>
          <div style="display:flex;align-items:center;gap:6px;margin-top:4px;">
            <button class="link-btn" onclick="changeQty(${p.id}, -1)">−</button>
            <span style="font-size:12px;">${it.qty}</span>
            <button class="link-btn" onclick="changeQty(${p.id}, 1)">+</button>
          </div>
        </div>
        <div style="text-align:right;">
          <p style="margin:0;font-size:13px;font-weight:600;">${money(unit * it.qty)}</p>
          <button class="link-btn" onclick="removeFromCart(${p.id})">remover</button>
        </div>
      </div>
    `;
  }).join("");

  summaryEl.innerHTML = `
    <div class="row total"><span>Total</span><span>${money(subtotal)}</span></div>
    <p style="font-size:11px;opacity:.5;margin:2px 0 10px;">O frete será combinado após a compra.</p>
    <button class="btn btn-clay" style="width:100%" onclick="alert('Checkout simulado — pedido confirmado! (demo)'); cart = []; saveCart(); closeCart();">Finalizar Compra</button>
  `;
}

function openCart() {
  document.getElementById("cart-overlay").classList.add("open");
  document.getElementById("cart-drawer").classList.add("open");
}
function closeCart() {
  document.getElementById("cart-overlay").classList.remove("open");
  document.getElementById("cart-drawer").classList.remove("open");
}
document.getElementById("cart-btn").addEventListener("click", (e) => { e.preventDefault(); openCart(); });
document.getElementById("cart-close").addEventListener("click", closeCart);
document.getElementById("cart-overlay").addEventListener("click", closeCart);

document.getElementById("logo-mug").innerHTML = mugSVG("black", 26);
document.getElementById("hero-mug").innerHTML = mugSVG("white", 220);

loadData();
