// ===== api.js =====
// 🔑 CONFIGURAÇÃO - SUBSTITUA AQUI!
const JSONBIN_BIN_ID = '6a640028da38895dfe8c5ea7';     // Ex: '5f8a9b3e8e0a3a1b2c3d4e5f'
const JSONBIN_API_KEY = '$2a$10$k9q9AXcFxytut6gJNxBlme4YjsJXzjG8AcbXRo7QOyZ/srE35/qHG';   // Ex: '$2a$10$abc123...'

const IMGBB_API_KEY = 'bb49178e11dff4322b7a699167535e57';

// ===== TESTE: Verifica se a API está funcionando =====
console.log('🚀 api.js carregado!');
console.log('📦 BIN ID:', JSONBIN_BIN_ID);
console.log('🔑 API KEY:', JSONBIN_API_KEY ? '✅ Configurada' : '❌ FALTANDO!');

// ===== Leitura do db.json =====
async function readDB() {
  console.log('📖 readDB() chamado...');
  
  if (!JSONBIN_BIN_ID || JSONBIN_BIN_ID === 'SEU_BIN_ID_AQUI') {
    console.error('❌ ERRO: Configure o BIN_ID no api.js!');
    return { products: [], categories: [], nextId: 1 };
  }
  
  try {
    const url = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`;
    console.log('🌐 Buscando:', url);
    
    const resp = await fetch(url, {
      headers: {
        'X-Master-Key': JSONBIN_API_KEY
      }
    });
    
    console.log('📡 Status da resposta:', resp.status);
    
    if (!resp.ok) {
      const errorText = await resp.text();
      console.error('❌ Erro HTTP:', resp.status, errorText);
      throw new Error(`HTTP ${resp.status}: ${errorText}`);
    }
    
    const data = await resp.json();
    console.log('✅ Dados recebidos!', data);
    
    // O JSONBin retorna { record: {...} }
    if (data.record) {
      return data.record;
    } else {
      console.warn('⚠️ Resposta sem "record", usando data direto:', data);
      return data;
    }
  } catch (error) {
    console.error('❌ Erro no readDB:', error.message);
    // Retorna um db vazio em caso de erro
    return { products: [], categories: [], nextId: 1 };
  }
}

// ===== Escrita no db.json =====
async function writeDB(db) {
  console.log('✏️ writeDB() chamado...');
  
  if (!JSONBIN_BIN_ID || JSONBIN_BIN_ID === 'SEU_BIN_ID_AQUI') {
    console.error('❌ ERRO: Configure o BIN_ID no api.js!');
    throw new Error('BIN_ID não configurado');
  }
  
  try {
    const url = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;
    console.log('🌐 Enviando para:', url);
    
    const resp = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_API_KEY
      },
      body: JSON.stringify(db)
    });
    
    console.log('📡 Status da resposta:', resp.status);
    
    if (!resp.ok) {
      const errorText = await resp.text();
      console.error('❌ Erro HTTP:', resp.status, errorText);
      throw new Error(`HTTP ${resp.status}: ${errorText}`);
    }
    
    const data = await resp.json();
    console.log('✅ Dados salvos!', data);
    return data;
  } catch (error) {
    console.error('❌ Erro no writeDB:', error.message);
    throw error;
  }
}

// ===== Upload de imagem para o imgBB =====
async function uploadImage(base64) {
  console.log('📸 uploadImage() chamado...');
  
  try {
    const form = new FormData();
    form.append('key', IMGBB_API_KEY);
    form.append('image', base64);
    
    console.log('🌐 Enviando para imgBB...');
    const resp = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: form
    });
    
    const data = await resp.json();
    console.log('📡 Resposta imgBB:', data);
    
    if (!data.success) {
      throw new Error('Falha no upload: ' + JSON.stringify(data));
    }
    
    console.log('✅ Imagem enviada! URL:', data.data.url);
    return data.data.url;
  } catch (error) {
    console.error('❌ Erro no uploadImage:', error.message);
    throw error;
  }
}

// ===== Funções auxiliares para o admin =====
async function getProducts() {
  console.log('📦 getProducts() chamado');
  const db = await readDB();
  return db.products || [];
}

async function getCategories() {
  console.log('🏷️ getCategories() chamado');
  const db = await readDB();
  return db.categories || [];
}

async function saveProduct(product) {
  console.log('💾 saveProduct() chamado', product);
  const db = await readDB();
  
  if (product.id) {
    // Editando produto existente
    const idx = db.products.findIndex(p => p.id === product.id);
    if (idx !== -1) {
      db.products[idx] = { ...db.products[idx], ...product };
    } else {
      console.warn('⚠️ Produto não encontrado para editar:', product.id);
    }
  } else {
    // Novo produto
    product.id = db.nextId || 1;
    db.products.push(product);
    db.nextId = (db.nextId || 1) + 1;
  }
  
  await writeDB(db);
  console.log('✅ Produto salvo com sucesso!');
  return product;
}

async function deleteProduct(id) {
  console.log('🗑️ deleteProduct() chamado para ID:', id);
  const db = await readDB();
  const originalLength = db.products.length;
  db.products = db.products.filter(p => p.id !== id);
  
  if (db.products.length === originalLength) {
    console.warn('⚠️ Produto não encontrado para remover:', id);
  }
  
  await writeDB(db);
  console.log('✅ Produto removido com sucesso!');
}

// ===== EXPORTA AS FUNÇÕES GLOBALMENTE =====
window.api = {
  readDB,
  writeDB,
  uploadImage,
  getProducts,
  getCategories,
  saveProduct,
  deleteProduct,
  IMGBB_API_KEY,
  // Versões de teste para diagnóstico
  _testRead: async () => {
    console.log('🧪 Teste de leitura:');
    const data = await readDB();
    console.log('📊 Dados lidos:', data);
    return data;
  },
  _testWrite: async () => {
    console.log('🧪 Teste de escrita:');
    const db = await readDB();
    db._test = { timestamp: new Date().toISOString() };
    await writeDB(db);
    console.log('✅ Escrita teste realizada!');
    return db;
  }
};

console.log('✅ api.js carregado com sucesso!');
console.log('💡 Para testar, abra o console e digite:');
console.log('   await api._testRead()  ← para testar leitura');
console.log('   await api._testWrite() ← para testar escrita');
