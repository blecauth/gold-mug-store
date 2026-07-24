// ===== admin.js =====
let products = [];
let categories = [];
let currentView = 'overview';

// ===== Inicialização =====
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  setupAdminNavigation();
  render();
});

// ===== Carregar dados =====
async function loadData() {
  const db = await api.readDB();
  products = db.products || [];
  categories = db.categories || [];
}

// ===== Navegação =====
function setupAdminNavigation() {
  document.querySelectorAll('.admin-nav a').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.admin-nav a').forEach(el => el.classList.remove('active'));
      a.classList.add('active');
      currentView = a.dataset.view;
      render();
    });
  });
}

// ===== Renderização =====
function render() {
  const main = document.getElementById('admin-main');
  if (!main) return;
  
  if (currentView === 'overview') {
    main.innerHTML = renderOverview();
  } else if (currentView === 'products') {
    main.innerHTML = renderProductsView();
    bindProductsView();
  } else if (currentView === 'categories') {
    main.innerHTML = renderCategoriesView();
  }
}

// ===== Visão geral =====
function renderOverview() {
  const totalStock = products.reduce((s, p) => s + (p.stock || 0), 0);
  const revenueEstimate = products.reduce((s, p) => s + (p.promo || p.price) * (p.reviews || 0) * 0.1, 0);
  
  return `
    <h1>Visão geral</h1>
    <div class="metrics">
      <div class="metric-card"><div class="label">Total de produtos</div><div class="value">${products.length}</div></div>
      <div class="metric-card"><div class="label">Itens em estoque</div><div class="value">${totalStock}</div></div>
      <div class="metric-card"><div class="label">Categorias</div><div class="value">${categories.length}</div></div>
      <div class="metric-card"><div class="label">Receita estimada</div><div class="value">R$ ${revenueEstimate.toFixed(2)}</div></div>
    </div>
    <p style="font-size:13px;opacity:.6;">Os dados são armazenados no JSONBin.io e atualizados em tempo real.</p>
  `;
}

// ===== Produtos =====
function renderProductsView() {
  return `
    <div class="top-row">
      <h1 style="margin:0">Produtos</h1>
      <button class="btn btn-clay" id="new-product-btn">+ Novo Produto</button>
    </div>
    <input class="search-input" id="admin-search" placeholder="Buscar por nome..." style="margin-bottom:14px;width:260px" />
    <div class="admin-table-wrap">
      <table>
        <thead>
          <tr><th>Imagem</th><th>Nome</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th>Status</th><th>Ações</th></tr>
        </thead>
        <tbody id="products-tbody"></tbody>
      </table>
    </div>
  `;
}

function bindProductsView() {
  renderProductsTable(products);
  
  document.getElementById('new-product-btn')?.addEventListener('click', () => openModal());
  
  document.getElementById('admin-search')?.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(q));
    renderProductsTable(filtered);
  });
}

function renderProductsTable(list) {
  const tbody = document.getElementById('products-tbody');
  if (!tbody) return;
  
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-note">Nenhum produto encontrado.</td></tr>`;
    return;
  }
  
  tbody.innerHTML = list.map(p => `
    <tr>
      <td>${p.image ? `<img src="${p.image}" style="width:32px;height:32px;object-fit:cover;border-radius:6px;" />` : '☕'}</td>
      <td>${p.name}</td>
      <td>${categoryName(categories, p.category)}</td>
      <td>R$ ${(p.promo || p.price).toFixed(2)}</td>
      <td>${p.stock || 0}</td>
      <td><span class="badge ${p.status}">${p.status === 'ativo' ? 'Ativo' : 'Inativo'}</span></td>
      <td>
        <button class="link-btn" onclick="openModal(${p.id})">Editar</button>
        <button class="link-btn" onclick="removeProduct(${p.id})">Remover</button>
      </td>
    </tr>
  `).join('');
}

// ===== Modal =====
const modal = document.getElementById('product-modal');
const form = document.getElementById('product-form');

function fillCategorySelect() {
  const select = document.getElementById('p-category');
  if (!select) return;
  select.innerHTML = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

function openModal(id) {
  fillCategorySelect();
  
  const editing = id != null;
  document.getElementById('modal-title').textContent = editing ? 'Editar Produto' : 'Novo Produto';
  
  const p = editing ? products.find(p => p.id === id) : null;
  
  document.getElementById('p-id').value = editing ? p.id : '';
  document.getElementById('p-name').value = editing ? p.name : '';
  document.getElementById('p-category').value = editing ? p.category : categories[0]?.id || '';
  document.getElementById('p-color').value = editing ? p.color : 'white';
  document.getElementById('p-price').value = editing ? p.price : '';
  document.getElementById('p-promo').value = editing && p.promo != null ? p.promo : '';
  document.getElementById('p-stock').value = editing ? p.stock : 0;
  document.getElementById('p-status').value = editing ? p.status : 'ativo';
  document.getElementById('p-rating').value = editing ? p.rating : 5;
  document.getElementById('p-reviews').value = editing ? p.reviews : 0;
  document.getElementById('p-personalizable').checked = editing ? !!p.personalizable : true;
  
  document.getElementById('p-image-file').value = '';
  document.getElementById('p-image-url').value = editing && p.image ? p.image : '';
  
  const preview = document.getElementById('p-image-preview');
  if (editing && p.image) {
    preview.src = p.image;
    preview.style.display = 'block';
  } else {
    preview.style.display = 'none';
  }
  
  document.getElementById('p-image-status').textContent = '';
  
  modal?.classList.add('open');
}

function closeModal() {
  modal?.classList.remove('open');
}

document.getElementById('modal-cancel')?.addEventListener('click', closeModal);

// ===== Upload de imagem =====
document.getElementById('p-image-file')?.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const statusEl = document.getElementById('p-image-status');
  const preview = document.getElementById('p-image-preview');
  
  if (!file) return;
  
  statusEl.textContent = 'Enviando imagem...';
  
  try {
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    
    const url = await api.uploadImage(base64);
    
    document.getElementById('p-image-url').value = url;
    preview.src = url;
    preview.style.display = 'block';
    statusEl.textContent = 'Imagem enviada ✓';
  } catch (err) {
    console.error(err);
    statusEl.textContent = 'Falha ao enviar a imagem.';
  }
});

// ===== Salvar produto =====
form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const id = document.getElementById('p-id').value;
  const product = {
    id: id ? Number(id) : undefined,
    name: document.getElementById('p-name').value,
    category: document.getElementById('p-category').value,
    color: document.getElementById('p-color').value,
    price: Number(document.getElementById('p-price').value),
    promo: document.getElementById('p-promo').value ? Number(document.getElementById('p-promo').value) : null,
    stock: Number(document.getElementById('p-stock').value),
    status: document.getElementById('p-status').value,
    rating: Number(document.getElementById('p-rating').value),
    reviews: Number(document.getElementById('p-reviews').value),
    personalizable: document.getElementById('p-personalizable').checked,
    image: document.getElementById('p-image-url').value || null
  };
  
  try {
    await api.saveProduct(product);
    await loadData();
    closeModal();
    render();
  } catch (error) {
    console.error('Erro ao salvar:', error);
    alert('Erro ao salvar produto. Tente novamente.');
  }
});

// ===== Remover produto =====
async function removeProduct(id) {
  if (!confirm('Remover este produto? Essa ação não pode ser desfeita.')) return;
  
  try {
    await api.deleteProduct(id);
    await loadData();
    render();
  } catch (error) {
    console.error('Erro ao remover:', error);
    alert('Erro ao remover produto.');
  }
}

// ===== Categorias =====
function renderCategoriesView() {
  return `
    <h1>Categorias</h1>
    <div class="admin-table-wrap">
      <table>
        <thead><tr><th>Nome</th><th>Produtos</th></tr></thead>
        <tbody>
          ${categories.map(c => `
            <tr><td>${c.name}</td><td>${products.filter(p => p.category === c.id).length}</td></tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ===== Utilitário =====
function categoryName(categories, id) {
  const cat = categories.find(c => c.id === id);
  return cat ? cat.name : id;
}

// Torna funções globais para os botões
window.openModal = openModal;
window.removeProduct = removeProduct;
