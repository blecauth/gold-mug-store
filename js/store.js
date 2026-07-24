// ===== store.js =====
let products = [];
let categories = [];
let cart = [];

// ===== Inicialização =====
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  setupEventListeners();
  loadCart();
});

// ===== Carregar dados do JSONBin =====
async function loadData() {
  try {
    const db = await api.readDB();
    products = db.products || [];
    categories = db.categories || [];
    renderProducts();
    renderCategories();
    updateResultCount();
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    document.getElementById('product-grid').innerHTML = `
      <p class="empty-note">Erro ao carregar produtos. Tente novamente.</p>
    `;
  }
}

// ===== Renderizar produtos =====
function renderProducts(filtered = null) {
  const grid = document.getElementById('product-grid');
  const list = filtered || products;
  
  if (list.length === 0) {
    grid.innerHTML = `<p class="empty-note">Nenhum produto encontrado.</p>`;
    return;
  }
  
  grid.innerHTML = list.map(p => `
    <div class="card" data-id="${p.id}">
      <div class="card-thumb">
        ${p.image ? `<img src="${p.image}" alt="${p.name}" style="max-height:120px;max-width:100%;border-radius:8px;" />` : '☕'}
      </div>
      <div class="card-cat">${categoryName(categories, p.category)}</div>
      <h3>${p.name}</h3>
      <div class="stars">${'★'.repeat(Math.round(p.rating || 0))}${'☆'.repeat(5 - Math.round(p.rating || 0))}</div>
      <div class="price-row">
        <div>
          ${p.promo ? `<span class="price promo-old">R$ ${p.price.toFixed(2)}</span> <span class="price">R$ ${p.promo.toFixed(2)}</span>` : `<span class="price">R$ ${p.price.toFixed(2)}</span>`}
        </div>
        <button class="add-btn" onclick="addToCart(${p.id})">+</button>
      </div>
      ${p.personalizable ? '<span style="font-size:10px;opacity:.5;">✏️ Personalizável</span>' : ''}
    </div>
  `).join('');
}

// ===== Renderizar categorias =====
function renderCategories() {
  const grid = document.getElementById('category-grid');
  if (!grid) return;
  
  const allCat = { id: 'all', name: 'Todos' };
  const allCategories = [allCat, ...categories];
  
  grid.innerHTML = allCategories.map(c => `
    <button class="cat-chip" onclick="filterByCategory('${c.id}')">
      <div class="cat-swatch" style="background:${c.color || '#ddd'}"></div>
      <span>${c.name}</span>
    </button>
  `).join('');
}

// ===== Filtros =====
function filterByCategory(categoryId) {
  const filtered = categoryId === 'all' 
    ? products 
    : products.filter(p => p.category === categoryId);
  renderProducts(filtered);
  updateResultCount(filtered.length);
}

function updateResultCount(count = null) {
  const el = document.getElementById('result-count');
  if (el) {
    const total = count !== null ? count : products.length;
    el.textContent = `${total} produto${total !== 1 ? 's' : ''}`;
  }
}

// ===== Busca =====
document.getElementById('search-input')?.addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(q) || 
    categoryName(categories, p.category).toLowerCase().includes(q)
  );
  renderProducts(filtered);
  updateResultCount(filtered.length);
});

// ===== Carrinho =====
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  
  saveCart();
  updateCartUI();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCartUI();
}

function updateQuantity(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  
  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }
  
  saveCart();
  updateCartUI();
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCart() {
  const saved = localStorage.getItem('cart');
  if (saved) {
    try {
      cart = JSON.parse(saved);
    } catch {
      cart = [];
    }
  }
  updateCartUI();
}

function updateCartUI() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const countEl = document.getElementById('cart-count');
  if (countEl) {
    countEl.textContent = count;
    countEl.style.display = count > 0 ? 'flex' : 'none';
  }
  
  renderCartItems();
}

function renderCartItems() {
  const container = document.getElementById('cart-items');
  const summary = document.getElementById('cart-summary');
  
  if (!container) return;
  
  if (cart.length === 0) {
    container.innerHTML = '<p style="opacity:.5;text-align:center;padding:20px;">Seu carrinho está vazio</p>';
    if (summary) summary.innerHTML = '';
    return;
  }
  
  const total = cart.reduce((sum, item) => sum + (item.promo || item.price) * item.quantity, 0);
  
  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="thumb">${item.image ? `<img src="${item.image}" style="width:40px;height:40px;object-fit:cover;border-radius:6px;" />` : '☕'}</div>
      <div style="flex:1;">
        <div style="font-weight:500;">${item.name}</div>
        <div style="font-size:12px;opacity:.6;">R$ ${(item.promo || item.price).toFixed(2)}</div>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        <button onclick="updateQuantity(${item.id}, -1)" style="border:1px solid #ccc;border-radius:50%;width:24px;height:24px;cursor:pointer;">-</button>
        <span>${item.quantity}</span>
        <button onclick="updateQuantity(${item.id}, 1)" style="border:1px solid #ccc;border-radius:50%;width:24px;height:24px;cursor:pointer;">+</button>
      </div>
    </div>
  `).join('');
  
  if (summary) {
    summary.innerHTML = `
      <div class="row"><span>Subtotal</span><span>R$ ${total.toFixed(2)}</span></div>
      <div class="row" style="font-size:12px;opacity:.6;"><span>Frete</span><span>Calculado no checkout</span></div>
      <div class="total">Total: R$ ${total.toFixed(2)}</div>
      <button class="btn btn-clay" style="width:100%;margin-top:8px;" onclick="checkout()">Finalizar Compra</button>
    `;
  }
}

function checkout() {
  if (cart.length === 0) {
    alert('Seu carrinho está vazio!');
    return;
  }
  alert('Pedido enviado! (Modo demonstração)');
  cart = [];
  saveCart();
  updateCartUI();
  document.getElementById('cart-drawer')?.classList.remove('open');
  document.getElementById('cart-overlay')?.classList.remove('open');
}

// ===== Carrinho UI =====
function setupEventListeners() {
  // Abrir carrinho
  document.getElementById('cart-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('cart-drawer')?.classList.add('open');
    document.getElementById('cart-overlay')?.classList.add('open');
  });
  
  // Fechar carrinho
  document.getElementById('cart-close')?.addEventListener('click', () => {
    document.getElementById('cart-drawer')?.classList.remove('open');
    document.getElementById('cart-overlay')?.classList.remove('open');
  });
  
  document.getElementById('cart-overlay')?.addEventListener('click', () => {
    document.getElementById('cart-drawer')?.classList.remove('open');
    document.getElementById('cart-overlay')?.classList.remove('open');
  });
}

// ===== Utilitários =====
function categoryName(categories, id) {
  const cat = categories.find(c => c.id === id);
  return cat ? cat.name : id;
}
