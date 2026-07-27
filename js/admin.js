// Lógica do ADMIN — versão estática para GitHub Pages.
//
// Não existe mais server.js pra gravar o db.json de verdade. Então:
// 1. Ao abrir, carregamos o db.json publicado (fetch) OU, se já existir
//    um rascunho salvo neste navegador (localStorage), carregamos o
//    rascunho — assim você não perde o que estava editando ao dar F5.
// 2. Toda ação de adicionar/editar/remover produto atualiza esse
//    rascunho em memória e also salva no localStorage.
// 3. Pra publicar de verdade (todo mundo ver), use "Exportar db.json":
//    baixa o arquivo atualizado pra você substituir no repositório
//    do GitHub e dar push.

const DRAFT_KEY = "canecas_db_draft";
const IMGBB_API_KEY = "bb49178e11dff4322b7a699167535e57";

let db = { categories: [], products: [], nextId: 1 };
let currentView = "overview";

async function loadAll() {
  const draft = localStorage.getItem(DRAFT_KEY);
  if (draft) {
    db = JSON.parse(draft);
    document.getElementById("draft-banner").style.display = "block";
  } else {
    db = await fetch("db.json").then((r) => r.json());
  }
}

function persistDraft() {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(db));
  document.getElementById("draft-banner").style.display = "block";
}

// ---------- Exportar / descartar ----------

document.getElementById("export-btn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "db.json";
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById("restore-btn").addEventListener("click", async () => {
  if (!confirm("Descartar todas as alterações salvas neste navegador e voltar para o db.json publicado?")) return;
  localStorage.removeItem(DRAFT_KEY);
  document.getElementById("draft-banner").style.display = "none";
  db = await fetch("db.json").then((r) => r.json());
  render();
});

// ---------- Navegação da sidebar ----------

document.querySelectorAll(".admin-nav a").forEach((a) => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelectorAll(".admin-nav a").forEach((el) => el.classList.remove("active"));
    a.classList.add("active");
    currentView = a.dataset.view;
    render();
  });
});

function render() {
  const main = document.getElementById("admin-main-content");
  if (currentView === "overview") main.innerHTML = renderOverview();
  if (currentView === "products") { main.innerHTML = renderProductsView(); bindProductsView(); }
  if (currentView === "categories") { main.innerHTML = renderCategoriesView(); bindCategoriesView(); }
}

// ---------- Visão geral ----------

function renderOverview() {
  const totalStock = db.products.reduce((s, p) => s + (p.stock || 0), 0);
  const revenueEstimate = db.products.reduce((s, p) => s + (p.promo || p.price) * (p.reviews || 0) * 0.1, 0);
  return `
    <h1>Visão geral</h1>
    <div class="metrics">
      <div class="metric-card"><div class="label">Total de produtos</div><div class="value">${db.products.length}</div></div>
      <div class="metric-card"><div class="label">Itens em estoque</div><div class="value">${totalStock}</div></div>
      <div class="metric-card"><div class="label">Categorias</div><div class="value">${db.categories.length}</div></div>
      <div class="metric-card"><div class="label">Receita estimada</div><div class="value">${money(revenueEstimate)}</div></div>
    </div>
    <p style="font-size:13px;opacity:.6">Este site é estático (GitHub Pages) — os dados partem do <code>db.json</code> publicado no repositório. O que você edita aqui fica como rascunho neste navegador até você exportar e publicar.</p>
  `;
}

// ---------- Produtos (CRUD completo) ----------

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
  renderProductsTable(db.products);
  document.getElementById("new-product-btn").addEventListener("click", () => openModal());
  document.getElementById("admin-search").addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    renderProductsTable(db.products.filter((p) => p.name.toLowerCase().includes(q)));
  });
}

function renderProductsTable(list) {
  const tbody = document.getElementById("products-tbody");
  if (!tbody) return;
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-note">Nenhum produto encontrado.</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map((p) => `
    <tr>
      <td>${productThumb(p, 32)}</td>
      <td>${p.name}</td>
      <td>${categoryName(db.categories, p.category)}</td>
      <td>${money(p.promo || p.price)}</td>
      <td>${p.stock}</td>
      <td><span class="badge ${p.status}">${p.status === "ativo" ? "Ativo" : "Inativo"}</span></td>
      <td>
        <button class="link-btn" onclick="openModal(${p.id})">Editar</button>
        <button class="link-btn" onclick="removeProduct(${p.id})">Remover</button>
      </td>
    </tr>
  `).join("");
}

// ---------- Modal (criar / editar) ----------

const modal = document.getElementById("product-modal");
const form = document.getElementById("product-form");

function fillCategorySelect() {
  document.getElementById("p-category").innerHTML = db.categories.map((c) => `<option value="${c.id}">${c.name}</option>`).join("");
}

function openModal(id) {
  fillCategorySelect();
  const editing = id != null;
  document.getElementById("modal-title").textContent = editing ? "Editar Produto" : "Novo Produto";
  const p = editing ? db.products.find((p) => p.id === id) : null;

  document.getElementById("p-id").value = editing ? p.id : "";
  document.getElementById("p-name").value = editing ? p.name : "";
  document.getElementById("p-category").value = editing ? p.category : db.categories[0]?.id;
  document.getElementById("p-color").value = editing ? p.color : "white";
  document.getElementById("p-price").value = editing ? p.price : "";
  document.getElementById("p-promo").value = editing && p.promo != null ? p.promo : "";
  document.getElementById("p-stock").value = editing ? p.stock : 0;
  document.getElementById("p-status").value = editing ? p.status : "ativo";
  document.getElementById("p-rating").value = editing ? p.rating : 5;
  document.getElementById("p-reviews").value = editing ? p.reviews : 0;
  document.getElementById("p-personalizable").checked = editing ? !!p.personalizable : true;

  document.getElementById("p-image-file").value = "";
  document.getElementById("p-image-url").value = editing && p.image ? p.image : "";
  document.getElementById("p-image-status").textContent = "";
  const preview = document.getElementById("p-image-preview");
  if (editing && p.image) {
    preview.src = p.image;
    preview.style.display = "block";
  } else {
    preview.style.display = "none";
  }

  modal.classList.add("open");
}

function closeModal() {
  modal.classList.remove("open");
}
document.getElementById("modal-cancel").addEventListener("click", closeModal);

// Upload direto pro imgbb a partir do navegador (não existe mais
// servidor no meio). A chave fica visível no código-fonte do admin.js
// porque, num site estático, não tem onde mais escondê-la.
document.getElementById("p-image-file").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  const statusEl = document.getElementById("p-image-status");
  const preview = document.getElementById("p-image-preview");
  if (!file) return;

  statusEl.textContent = "Enviando imagem...";
  try {
    const formData = new FormData();
    formData.append("key", IMGBB_API_KEY);
    formData.append("image", file);

    const resp = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData,
    });
    const data = await resp.json();

    if (!data.success) {
      statusEl.textContent = "Falha no upload: " + (data.error?.message || "erro desconhecido");
      return;
    }

    document.getElementById("p-image-url").value = data.data.url;
    preview.src = data.data.url;
    preview.style.display = "block";
    statusEl.textContent = "Imagem enviada ✓";
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Falha ao enviar a imagem.";
  }
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = document.getElementById("p-id").value;

  const payload = {
    name: document.getElementById("p-name").value,
    category: document.getElementById("p-category").value,
    color: document.getElementById("p-color").value,
    price: Number(document.getElementById("p-price").value),
    promo: document.getElementById("p-promo").value !== "" ? Number(document.getElementById("p-promo").value) : null,
    stock: Number(document.getElementById("p-stock").value || 0),
    status: document.getElementById("p-status").value,
    rating: Number(document.getElementById("p-rating").value || 5),
    reviews: Number(document.getElementById("p-reviews").value || 0),
    personalizable: document.getElementById("p-personalizable").checked,
    image: document.getElementById("p-image-url").value || null,
  };

  if (id) {
    const idx = db.products.findIndex((p) => p.id === Number(id));
    if (idx !== -1) db.products[idx] = { ...db.products[idx], ...payload, id: Number(id) };
  } else {
    db.products.push({ id: db.nextId, ...payload });
    db.nextId += 1;
  }

  persistDraft();
  closeModal();
  render();
});

function removeProduct(id) {
  if (!confirm("Remover este produto do rascunho? Lembre de exportar o db.json depois para publicar.")) return;
  db.products = db.products.filter((p) => p.id !== id);
  persistDraft();
  render();
}

// ---------- Categorias (CRUD completo) ----------

function slugify(name) {
  return name
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "categoria";
}

function renderCategoriesView() {
  return `
    <div class="top-row">
      <h1 style="margin:0">Categorias</h1>
      <button class="btn btn-clay" id="new-category-btn">+ Nova Categoria</button>
    </div>
    <div class="admin-table-wrap">
      <table>
        <thead><tr><th>Cor</th><th>Nome</th><th>Produtos</th><th>Ações</th></tr></thead>
        <tbody>
          ${db.categories.map((c) => `
            <tr>
              <td><span style="display:inline-block;width:18px;height:18px;border-radius:50%;background:${c.swatch};"></span></td>
              <td>${c.name}</td>
              <td>${db.products.filter((p) => p.category === c.id).length}</td>
              <td>
                <button class="link-btn" onclick="openCategoryModal('${c.id}')">Editar</button>
                <button class="link-btn" onclick="removeCategory('${c.id}')">Remover</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function bindCategoriesView() {
  document.getElementById("new-category-btn").addEventListener("click", () => openCategoryModal());
}

const categoryModal = document.getElementById("category-modal");
const categoryForm = document.getElementById("category-form");

function openCategoryModal(id) {
  const editing = id != null;
  const c = editing ? db.categories.find((c) => c.id === id) : null;
  document.getElementById("category-modal-title").textContent = editing ? "Editar Categoria" : "Nova Categoria";
  document.getElementById("c-id").value = editing ? c.id : "";
  document.getElementById("c-name").value = editing ? c.name : "";
  document.getElementById("c-swatch").value = editing ? c.swatch : "#C1622D";
  categoryModal.classList.add("open");
}

function closeCategoryModal() {
  categoryModal.classList.remove("open");
}
document.getElementById("category-modal-cancel").addEventListener("click", closeCategoryModal);

categoryForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = document.getElementById("c-id").value;
  const name = document.getElementById("c-name").value.trim();
  const swatch = document.getElementById("c-swatch").value;

  if (id) {
    const cat = db.categories.find((c) => c.id === id);
    cat.name = name;
    cat.swatch = swatch;
  } else {
    let newId = slugify(name);
    // evita duas categorias com o mesmo id
    let suffix = 2;
    while (db.categories.some((c) => c.id === newId)) {
      newId = `${slugify(name)}-${suffix}`;
      suffix += 1;
    }
    db.categories.push({ id: newId, name, swatch });
  }

  persistDraft();
  closeCategoryModal();
  render();
});

function removeCategory(id) {
  const linked = db.products.filter((p) => p.category === id).length;
  if (linked > 0) {
    alert(`Essa categoria tem ${linked} produto(s) vinculado(s). Mude a categoria desses produtos (ou remova-os) antes de excluir a categoria.`);
    return;
  }
  if (!confirm("Remover esta categoria do rascunho? Lembre de exportar o db.json depois para publicar.")) return;
  db.categories = db.categories.filter((c) => c.id !== id);
  persistDraft();
  render();
}

// ---------- Início ----------

document.getElementById("admin-logo").innerHTML = `${mugSVG("white", 26)} <span style="margin-left:6px;font-family:var(--font-display)">Painel Admin</span>`;

loadAll().then(render);
