// ===== api.js =====
// Cadastre-se em https://jsonbin.io e crie um bin
// Cole o conteúdo do seu db.json lá
const JSONBIN_BIN_ID = 'SEU_BIN_ID_AQUI';
const JSONBIN_API_KEY = 'SUA_API_KEY_AQUI'; // X-Master-Key

// Chave do imgBB (pode deixar aqui porque é pública mesmo)
const IMGBB_API_KEY = 'bb49178e11dff4322b7a699167535e57';

// ===== Leitura do db.json =====
async function readDB() {
  try {
    const resp = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
      headers: {
        'X-Master-Key': JSONBIN_API_KEY
      }
    });
    
    if (!resp.ok) throw new Error('Erro ao ler banco de dados');
    
    const data = await resp.json();
    return data.record; // O JSONBin retorna { record: {...} }
  } catch (error) {
    console.error('Erro no readDB:', error);
    // Retorna um db vazio em caso de erro
    return { products: [], categories: [], nextId: 1 };
  }
}

// ===== Escrita no db.json =====
async function writeDB(db) {
  try {
    const resp = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_API_KEY
      },
      body: JSON.stringify(db)
    });
    
    if (!resp.ok) throw new Error('Erro ao salvar banco de dados');
    
    return await resp.json();
  } catch (error) {
    console.error('Erro no writeDB:', error);
    throw error;
  }
}

// ===== Upload de imagem para o imgBB =====
async function uploadImage(base64) {
  try {
    const form = new FormData();
    form.append('key', IMGBB_API_KEY);
    form.append('image', base64);
    
    const resp = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: form
    });
    
    const data = await resp.json();
    
    if (!data.success) {
      throw new Error('Falha no upload: ' + JSON.stringify(data));
    }
    
    return data.data.url;
  } catch (error) {
    console.error('Erro no uploadImage:', error);
    throw error;
  }
}

// ===== Funções auxiliares para o admin =====
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
    // Editando produto existente
    const idx = db.products.findIndex(p => p.id === product.id);
    if (idx !== -1) {
      db.products[idx] = { ...db.products[idx], ...product };
    }
  } else {
    // Novo produto
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

// Exporta as funções (disponíveis globalmente)
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
