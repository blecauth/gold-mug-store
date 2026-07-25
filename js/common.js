// Funções compartilhadas entre a loja (store.js) e o admin (admin.js).

const MUG_COLORS = {
  white: "#FFFFFF",
  black: "#232323",
  blue: "#3B5C7A",
  red: "#A13D2B",
  green: "#4B6355",
  yellow: "#D9A441",
};

function money(v) {
  return Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Devolve o SVG (string) de uma caneca estilizada na cor pedida.
// É o mesmo elemento visual usado como "foto" do produto na loja e
// como miniatura nas tabelas do admin.
function mugSVG(colorId, size = 100) {
  const hex = MUG_COLORS[colorId] || MUG_COLORS.white;
  return `
    <svg viewBox="0 0 200 200" width="${size}" height="${size}">
      <ellipse cx="100" cy="178" rx="55" ry="8" fill="#2B1B12" opacity="0.08"/>
      <path d="M45 55 h95 v95 a47.5 47.5 0 0 1 -95 0 z" fill="${hex}" stroke="#2B1B12" stroke-opacity="0.15" stroke-width="2"/>
      <path d="M140 75 q30 0 30 30 q0 30 -30 30" fill="none" stroke="${hex}" stroke-width="12"/>
      <path d="M140 75 q30 0 30 30 q0 30 -30 30" fill="none" stroke="#2B1B12" stroke-opacity="0.15" stroke-width="2"/>
    </svg>`;
}

// Miniatura do produto: usa a foto (imgbb ou exemplo) quando existir,
// senão cai no desenho da caneca (mugSVG) como antes.
// fill=true -> a imagem preenche 100% do container (para cards e modal,
//              que já têm um tamanho/altura definidos via CSS).
// fill=false -> a imagem usa o tamanho fixo em pixels informado
//              (para miniaturas pequenas: carrinho, tabela do admin).
function productThumb(p, size = 100, fill = false) {
  if (p.image) {
    const style = fill
      ? "width:100%;height:100%;object-fit:cover;border-radius:12px;display:block;"
      : `width:${size}px;height:${size}px;object-fit:cover;border-radius:10px;display:block;`;
    return `<img src="${p.image}" alt="${p.name}" style="${style}" />`;
  }
  return mugSVG(p.color, size);
}

function starsHTML(rating) {
  const rounded = Math.round(rating);
  return "★".repeat(rounded) + "☆".repeat(5 - rounded);
}

function categoryName(categories, id) {
  const c = categories.find((c) => c.id === id);
  return c ? c.name : id;
}
