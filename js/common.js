// ===== common.js =====
function money(value) {
  return `R$ ${Number(value).toFixed(2)}`;
}

// SVG da caneca (usado no logo e hero)
function mugSVG(color = '#2B1B12', size = 32) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 6L6 26H22L20 6H8Z" fill="${color}" opacity="0.15"/>
    <path d="M10 6L8.5 24H19.5L18 6H10Z" fill="${color}" opacity="0.3"/>
    <rect x="10" y="6" width="8" height="18" rx="1" fill="${color}" opacity="0.6"/>
    <path d="M22 10C23.5 10 24 11 24 13C24 15 23.5 16 22 16" stroke="${color}" stroke-width="1.5" fill="none"/>
    <path d="M23 8C25 8 26 10 26 13C26 16 25 18 23 18" stroke="${color}" stroke-width="1" opacity="0.3" fill="none"/>
  </svg>`;
}

// Inicializa o logo em todo lugar que tiver #logo-mug
document.addEventListener('DOMContentLoaded', () => {
  const logoEl = document.getElementById('logo-mug');
  if (logoEl) {
    logoEl.innerHTML = mugSVG('#2B1B12', 28);
  }
  
  const heroMug = document.getElementById('hero-mug');
  if (heroMug) {
    heroMug.innerHTML = mugSVG('#C1622D', 80);
  }
  
  const adminLogo = document.getElementById('admin-logo');
  if (adminLogo) {
    adminLogo.innerHTML = mugSVG('#FBF3E7', 26) + ' <span style="margin-left:6px;font-family:var(--font-display)">Painel Admin</span>';
  }
});
