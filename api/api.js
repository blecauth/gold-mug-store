// ===== api.js (versão com feedback visual) =====
// 🔑 CONFIGURAÇÃO - SUBSTITUA AQUI!
const JSONBIN_BIN_ID = '6a640028da38895dfe8c5ea7';     // Ex: '67a1b2c3d4e5f6a7b8c9d0e1'
const JSONBIN_API_KEY = '$2a$10$k9q9AXcFxytut6gJNxBlme4YjsJXzjG8AcbXRo7QOyZ/srE35/qHG';   // Ex: '$2a$10$abc123...'

const IMGBB_API_KEY = 'bb49178e11dff4322b7a699167535e57';

// ===== MOSTRA STATUS NA TELA =====
function showStatus(msg, isError = false) {
  const el = document.getElementById('api-status');
  if (!el) {
    // Se não existir, cria um
    const div = document.createElement('div');
    div.id = 'api-status';
    div.style.cssText = 'position:fixed;bottom:10px;left:10px;right:10px;padding:10px;background:#333;color:#fff;border-radius:8px;font-size:12px;z-index:999;text-align:center;';
    document.body.appendChild(div);
    div.textContent = msg;
    if (isError) div.style.background = '#c0392b';
    else div.style.background = '#27ae60';
  } else {
    el.textContent = msg;
    if (isError) el.style.background = '#c0392b';
    else el.style.background = '#27ae60';
  }
  console.log(msg);
}

// ===== TESTE INICIAL =====
showStatus('🔄 Conectando ao JSONBin...');

// ===== Leitura do db.json =====
async function readDB() {
  try {
    const url = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`;
    showStatus('📡 Buscando dados...');
    
    const resp = await fetch(url, {
      headers: { 'X-Master-Key': JSONBIN_API_KEY }
    });
    
    if (!resp.ok) {
      const errorText = await resp.text();
      showStatus(`❌ Erro ${resp.status}: ${errorText}`, true);
      throw new Error(`HTTP ${resp.status}`);
    }
    
    const data = await resp.json();
    showStatus(`✅ ${data.record?.products?.length || 0} produtos carregados!`);
    
    if (data.record) {
      return data.record;
    }
    return data;
  } catch (error) {
    showStatus(`❌ Erro: ${error.message}`, true);
    return { products: [], categories: [], nextId: 1 };
  }
}

// ===== Escrita no db.json =====
async function writeDB(db) {
  try {
    const url = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;
    showStatus('💾 Salvando dados...');
    
    const resp = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_API_KEY
      },
      body: JSON.stringify(db)
    });
    
    if (!resp.ok) {
      const errorText = await resp.text();
      showStatus(`❌ Erro ao salvar: ${resp.status}`, true);
      throw new Error(`HTTP ${resp.status}`);
    }
    
    showStatus('✅ Dados salvos com sucesso!');
    return await resp.json();
  } catch (error) {
    showStatus(`❌ Erro ao salvar: ${error.message}`, true);
    throw error;
  }
}

// ===== Upload imagem =====
async function uploadImage(base64) {
  try {
    showStatus('📸 Enviando imagem...');
    const form = new FormData();
    form.append('key', IMGBB_API_KEY);
    form.append('image', base64);
    
    const resp = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: form
    });
    
    const data = await resp.json();
    
    if (!data.success) {
      showStatus('❌ Falha no upload da imagem', true);
      throw new Error('Falha no upload');
    }
    
    showStatus('✅ Imagem enviada!');
    return data.data.url;
  } catch (error) {
    showStatus(`❌ Erro no upload: ${error.message}`, true);
    throw error;
  }
}

// ===== Funções auxiliares =====
async function getProducts() {
  const db = await readDB();
  return db.products || [];
}

async function getCategories() {
  const db = await readDB();
  return db.categories || [];
}

async function saveProduct(product) {
  const db = await readDB();
  
  if (product.id) {
    const idx = db.products.findIndex(p => p.id === product.id);
    if (idx !== -1) {
      db.products[idx] = { ...db.products[idx], ...product };
    }
  } else {
    product.id = db.nextId || 1;
    db.products.push(product);
    db.nextId = (db.nextId || 1) + 1;
  }
  
  await writeDB(db);
  return product;
}

async function deleteProduct(id) {
  const db = await readDB();
  db.products = db.products.filter(p => p.id !== id);
  await writeDB(db);
}

// ===== EXPORTA =====
window.api = {
  readDB,
  writeDB,
  uploadImage,
  getProducts,
  getCategories,
  saveProduct,
  deleteProduct,
  IMGBB_API_KEY
};

// ===== TESTE AUTOMÁTICO AO CARREGAR =====
setTimeout(async () => {
  try {
    const db = await readDB();
    if (db.products && db.products.length > 0) {
      showStatus(`✅ Pronto! ${db.products.length} produtos carregados`);
    } else {
      showStatus('⚠️ Nenhum produto encontrado', true);
    }
  } catch (e) {
    showStatus('❌ Erro ao carregar', true);
  }
}, 1000);
