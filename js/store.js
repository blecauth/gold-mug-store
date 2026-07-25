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
    <div class="card" onclick="addToCart(${p.id})">
      <div class="card-thumb">${productThumb(p, 90)}</div>
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

document.getElementById("search-input").addEventListener("input", renderProducts);

// ---------- Carrinho (estado do navegador — sempre foi assim, não muda) ----------

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

function addToCart(productId) {
  const existing = cart.find((it) => it.productId === productId);
  if (existing) existing.qty += 1;
  else cart.push({ productId, qty: 1 });
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

  const frete = 12.9;
  summaryEl.innerHTML = `
    <div class="row"><span>Subtotal</span><span>${money(subtotal)}</span></div>
    <div class="row"><span>Frete (simulado)</span><span>${money(frete)}</span></div>
    <div class="row total"><span>Total</span><span>${money(subtotal + frete)}</span></div>
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
