/**
 * ARTEZ — универсальная шапка сайта.
 * Подключить: <script src="shared-header.js"></script> в <head> или начале <body>.
 * Автоматически вставляется первым элементом <body>.
 */
(function () {
  const HOME = 'https://artez.uz';

  const LOGO_SVG = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width:40px;height:40px;display:block">
    <defs>
      <linearGradient id="sh-navy" x1="15%" y1="0%" x2="85%" y2="100%">
        <stop offset="0%"   stop-color="#3576DE"/>
        <stop offset="45%"  stop-color="#15399A"/>
        <stop offset="100%" stop-color="#081C4D"/>
      </linearGradient>
      <linearGradient id="sh-cyan" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%"   stop-color="#33E2F2"/>
        <stop offset="100%" stop-color="#0CA9CC"/>
      </linearGradient>
      <clipPath id="sh-clip"><path d="M100,34 C132,70 155,102 155,128 C155,160 130,180 100,180 C70,180 45,160 45,128 C45,102 68,70 100,34 Z"/></clipPath>
      <mask id="sh-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200">
        <rect x="0" y="0" width="200" height="200" fill="#fff"/>
        <polyline points="78,118 100,76 122,118" fill="none" stroke="#000" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="-10" y="142" width="220" height="9" fill="#000"/>
        <rect x="-10" y="160" width="220" height="9" fill="#000"/>
      </mask>
    </defs>
    <circle cx="100" cy="100" r="92" fill="none" stroke="url(#sh-navy)" stroke-width="7" opacity="0.85"/>
    <g clip-path="url(#sh-clip)">
      <g mask="url(#sh-mask)">
        <rect x="0" y="0" width="200" height="200" fill="url(#sh-navy)"/>
        <rect x="-10" y="151" width="220" height="40" fill="url(#sh-cyan)"/>
      </g>
    </g>
  </svg>`;

  // Определяем базовый путь к главной (относительный или абсолютный)
  const isHome = location.hostname === 'artez.uz' && (location.pathname === '/' || location.pathname === '/index.html');
  const base = isHome ? '' : HOME;

  const NAV = [
    { label: 'Услуги',         href: base + '/#services'  },
    { label: 'Калькулятор',    href: base + '/#calc'       },
    { label: 'Личный кабинет', href: base + '/#cabinet'    },
    { label: 'Контакты',       href: base + '/#contacts'   },
  ];

  const CSS = `
    .sh-topbar{
      background:#163E3B;
      position:sticky; top:0; z-index:1000;
    }
    .sh-inner{
      max-width:1180px; margin:0 auto; padding:0 20px;
      display:flex; align-items:center; justify-content:space-between;
      height:68px; gap:20px;
    }
    .sh-logo{
      display:flex; align-items:center; gap:11px;
      color:#fff; text-decoration:none; flex-shrink:0;
    }
    .sh-logo:hover { opacity:.9; }
    .sh-logo-text { display:flex; flex-direction:column; line-height:1.1; }
    .sh-logo-title {
      font-family:"Sora",sans-serif; font-weight:800; font-size:21px; letter-spacing:.02em; color:#fff;
    }
    .sh-logo-tag {
      font-family:"Inter",sans-serif; font-size:10.5px; color:#9DB6B0; white-space:nowrap;
    }
    .sh-nav{
      display:flex; gap:26px; list-style:none;
    }
    .sh-nav a{
      font-size:15px; font-weight:500; color:#C9DEDA; text-decoration:none;
      transition:color .15s;
    }
    .sh-nav a:hover { color:#fff; }
    .sh-actions { display:flex; align-items:center; gap:12px; flex-shrink:0; }
    .sh-btn-order{
      display:inline-flex; align-items:center; gap:6px;
      padding:10px 20px; border-radius:999px;
      background:#F5A623; color:#2A1B05;
      font-family:"Sora",sans-serif; font-weight:700; font-size:14px;
      text-decoration:none; border:none; cursor:pointer;
      transition:background .15s;
    }
    .sh-btn-order:hover { background:#e09416; }
    .sh-menu-btn{
      display:none; background:none; border:none; cursor:pointer; padding:4px;
      color:#fff; font-size:22px; line-height:1;
    }
    @media(max-width:860px){
      .sh-nav { display:none; }
      .sh-nav.open { display:flex; flex-direction:column; gap:0;
        position:fixed; top:68px; left:0; right:0; background:#163E3B;
        padding:8px 20px 16px; z-index:999; border-top:1px solid rgba(255,255,255,.1);
      }
      .sh-nav.open a { padding:12px 0; border-bottom:1px solid rgba(255,255,255,.08); display:block; }
      .sh-menu-btn { display:block; }
    }
  `;

  // Вставляем стили
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  // Строим навигацию
  const navItems = NAV.map(n => `<li><a href="${n.href}">${n.label}</a></li>`).join('');

  const html = `
    <header class="sh-topbar">
      <div class="sh-inner">
        <a href="${HOME}" class="sh-logo">
          ${LOGO_SVG}
          <span class="sh-logo-text">
            <span class="sh-logo-title">ARTEZ</span>
            <span class="sh-logo-tag">Химчистка ковров, мебели, матрасов и штор</span>
          </span>
        </a>
        <nav id="sh-nav-list">
          <ul class="sh-nav">${navItems}</ul>
        </nav>
        <div class="sh-actions">
          <a href="${HOME}" class="sh-btn-order">Оставить заявку</a>
          <button class="sh-menu-btn" id="sh-menu-toggle" aria-label="Меню">☰</button>
        </div>
      </div>
    </header>
  `;

  // Вставляем первым дочерним элементом body
  document.body.insertAdjacentHTML('afterbegin', html);

  // Бургер-меню для мобильных
  document.getElementById('sh-menu-toggle').addEventListener('click', function () {
    const nav = document.querySelector('.sh-nav');
    nav.classList.toggle('open');
    this.textContent = nav.classList.contains('open') ? '✕' : '☰';
  });
})();
