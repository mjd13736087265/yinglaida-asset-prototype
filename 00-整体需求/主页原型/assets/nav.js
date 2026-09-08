/* ============================================================
 * 英莱达资产管理系统 · PC 侧边栏共享组件（唯一菜单数据源）
 * ------------------------------------------------------------
 * 挂载方式（页面 body 内 .layout 首位 + body 末尾引入本脚本）：
 *   <aside class="sidebar" id="amsNav" data-active="home"
 *          data-ver="V1.1 原型 · 本期范围：片区管理"></aside>
 *   <script src="相对路径/assets/nav.js"></script>
 *
 * - data-active：当前页菜单 id（对照表见 原型对接规范.md §7）；
 *   命中子项 id 时该子项高亮（.mi-sub.on），父级组默认展开并加 .parent-on
 * - data-ver  ：底部版本行文案，缺省 "V1.1 原型"
 * - 路径推算：基于 document.currentScript.src 截到「主页原型/」为 base，
 *   base + '../../' 为站点根；任意目录深度可用，GitHub Pages 子路径可用，
 *   禁止使用 / 开头的绝对路径。
 * - 带 children 的菜单组：点击一级行 = 展开/收起子菜单（toggle，不跳转），
 *   箭头随状态旋转；当前组默认展开，其余组默认收起。
 * - ★ 新模块上线时：把下方 MENU 对应项加上 href（或 children），
 *   改一次全站生效；禁止在新页面手写侧边栏。
 * ============================================================ */
(function () {
  var script = document.currentScript;
  var mount = document.getElementById('amsNav');
  if (!script || !mount) return;

  var src = script.src;
  var cut = src.lastIndexOf('/assets/');
  var base = cut >= 0 ? src.slice(0, cut + 1) : './'; // …/00-整体需求/主页原型/
  var root = base + '../../';                          // 站点根（02-需求设计/ 或 Pages 仓库根）

  /* 图标（逐字沿用 pc-home.html 侧边栏 SVG：viewBox 24、stroke 1.6、圆角线帽） */
  function icon(inner) {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>';
  }
  var IC = {
    home:     icon('<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>'),
    area:     icon('<path d="M9 20l-5.5-2.5v-13L9 7l6-2.5L20.5 7v13L15 17.5 9 20z"/><path d="M9 7v13M15 4.5v13"/>'),
    room:     icon('<path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5"/><path d="M10 21v-6h4v6"/>'),
    map:      icon('<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M7 14v-3M11 14V8M15 14v-4"/><path d="M9 21h6"/>'),
    contract: icon('<path d="M7 3h8l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M15 3v4h4"/><path d="M9 12h6M9 16h6"/>'),
    rent:     icon('<circle cx="12" cy="12" r="9"/><path d="M9 9.5h6M9 13h6M12 7.5v9"/><path d="M10.5 9.5c0 2 3 2 3 3.5"/>'),
    meter:    icon('<path d="M13 2L5 13.5h5L10 22l8-11.5h-5L13 2z"/>'),
    service:  icon('<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2-2 2.8-2.8z"/>'),
    approval: icon('<path d="M9 11.5l2 2 4-4.5"/><path d="M7 3h10a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/>'),
    system:   icon('<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2-1.2L14.2 3h-4l-.4 2.7a7 7 0 0 0-2 1.2l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2-1.2l.4 2.7h4l.4-2.7a7 7 0 0 0 2-1.2l2.3 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z"/>')
  };
  /* 子菜单组箭头（chevron，与组件图标同风格） */
  var ARR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9.5l6 6 6-6"/></svg>';

  /* ========== MENU：全站 PC 菜单唯一数据源 ==========
   * { g }    分组标题
   * { id, text, href, icon }  菜单项；无 href = 「后续」占位（.lock，无链接）
   * { id, text, icon, children:[{id,text,href}] }  带子菜单的组：
   *   一级行点击 = 展开/收起（不跳转）；active 命中子项时该组默认展开、
   *   父级行加 .parent-on 高亮，其余组默认收起。
   * ★ 新模块上线：给对应项补 href / children 即可（如收费管理已解锁 rent 组）。
   * ================================================== */
  var MENU = [
    { g: '运营' },
    { id: 'home', text: '工作台',   href: base + 'pc-home.html',                          icon: IC.home },
    { id: 'area', text: '片区管理', href: root + '02-片区管理/原型/pc-area-list.html',     icon: IC.area },
    { id: 'room', text: '房源管理', href: root + '02-片区管理/原型/pc-room-list.html',     icon: IC.room },
    { id: 'map',  text: '房态监控', href: root + '02-片区管理/原型/pc-room-map.html',      icon: IC.map },
    { g: '财务' },
    { id: 'contract', text: '合同管理',       icon: IC.contract },
    { id: 'rent',     text: '收费管理',       icon: IC.rent, children: [
      { id: 'charge-home',     text: '收费工作台', href: root + '03-收费管理/原型/pc-charge-home.html' },
      { id: 'charge-bills',    text: '账单管理',   href: root + '03-收费管理/原型/pc-bills.html' },
      { id: 'charge-verify',   text: '收款核销',   href: root + '03-收费管理/原型/pc-verify.html' },
      { id: 'charge-overdue',  text: '欠费管理',   href: root + '03-收费管理/原型/pc-overdue.html' },
      { id: 'charge-deposit',  text: '押金管理',   href: root + '03-收费管理/原型/pc-deposit.html' },
      { id: 'charge-special',  text: '特殊处理',   href: root + '03-收费管理/原型/pc-special.html' },
      { id: 'charge-invoice',  text: '票据管理',   href: root + '03-收费管理/原型/pc-invoice.html' },
      { id: 'charge-settings', text: '规则配置',   href: root + '03-收费管理/原型/pc-charge-settings.html' }
    ] },
    { id: 'meter',    text: '水电管理',       icon: IC.meter },
    { g: '服务' },
    { id: 'service',  text: '物业服务（报修）', icon: IC.service },
    { id: 'approval', text: '审批中心',       icon: IC.approval },
    { g: '系统' },
    { id: 'system',   text: '系统管理',       icon: IC.system }
  ];

  var active = mount.getAttribute('data-active') || '';
  var ver = mount.getAttribute('data-ver') || 'V1.1 原型';

  /* 子菜单样式集中注入（页面零手写；取色沿用 app.css 侧边栏体系的变量与既有色值） */
  var st = document.createElement('style');
  st.textContent =
    '.mi-parent .mi-arr{margin-left:auto;display:flex;align-items:center}'
  + '.mi-parent .mi-arr svg{width:12px;height:12px;color:#5f739c;transform:rotate(-90deg);transition:transform .2s}'
  + '.mi-parent.open .mi-arr svg{transform:rotate(0)}'
  + '.mi-parent.parent-on{background:var(--navy-hi);color:#fff;border-left-color:#4f83ff}'
  + '.mi-parent.parent-on .mi-arr svg{color:#7d92b8}'
  + '.mi-subs{display:none}'
  + '.mi-subs.open{display:block}'
  + '.mi-sub{display:flex;align-items:center;gap:10px;padding:9px 18px 9px 44px;font-size:13px;cursor:pointer;border-left:3px solid transparent;user-select:none;color:inherit;text-decoration:none}'
  + '.mi-sub:hover{background:var(--navy-hi);color:#fff}'
  + '.mi-sub.on{background:var(--navy-hi);color:#fff;border-left-color:#4f83ff}';
  document.head.appendChild(st);

  var h = '';
  /* 品牌头 */
  h += '<div class="logo">'
     + '<span class="mark"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'
     + '<path d="M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16"/><path d="M14 9h5a1 1 0 0 1 1 1v11"/><path d="M2 21h20"/><path d="M7 8h2M7 12h2M7 16h2M17 13h1M17 17h1"/>'
     + '</svg></span>'
     + '<span style="font-size:14px">英莱达资产管理系统<small>YINGLAIDA AMS</small></span>'
     + '</div>';

  /* 菜单 */
  h += '<nav class="menu">';
  MENU.forEach(function (it) {
    if (it.g) { h += '<div class="mg">' + it.g + '</div>'; return; }
    var inner = '<span class="ic">' + it.icon + '</span>' + it.text
              + (it.href || it.children ? '' : '<span class="lock">后续</span>');
    if (it.children) {
      /* 带子菜单的组：一级行 toggle 展开/收起，不跳转 */
      var kidOn = it.children.some(function (c) { return c.id === active; });
      h += '<div class="mi mi-parent' + (kidOn ? ' parent-on open' : '') + '" data-group="' + it.id + '">'
         + inner + '<span class="mi-arr">' + ARR + '</span></div>'
         + '<div class="mi-subs' + (kidOn ? ' open' : '') + '" data-group="' + it.id + '">';
      it.children.forEach(function (c) {
        if (c.id === active) {
          h += '<div class="mi-sub on">' + c.text + '</div>';
        } else {
          h += '<a class="mi-sub" href="' + c.href + '">' + c.text + '</a>';
        }
      });
      h += '</div>';
    } else if (it.id === active) {
      h += '<div class="mi on">' + inner + '</div>';
    } else if (it.href) {
      h += '<a class="mi" href="' + it.href + '" style="color:inherit;text-decoration:none">' + inner + '</a>';
    } else {
      h += '<div class="mi">' + inner + '</div>';
    }
  });
  h += '</nav>';

  /* 底部「切换演示端」上弹菜单 */
  h += '<details class="endsw">'
     + '<summary><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 8h11l-3.5-3.5"/><path d="M17 16H6l3.5 3.5"/></svg>切换演示端'
     + '<span class="arr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg></span></summary>'
     + '<div class="endsw-menu">'
     + '<a href="' + base + 'm-admin-home.html">移动管理端（小程序）</a>'
     + '<a href="' + base + 'm-user-home.html">移动用户端（小程序）</a>'
     + '</div>'
     + '</details>';

  /* 版本行 */
  h += '<div class="who">' + ver + '</div>';

  mount.innerHTML = h;

  /* 子菜单组展开/收起交互（toggle，不跳转） */
  mount.querySelectorAll('.mi-parent').forEach(function (p) {
    p.addEventListener('click', function () {
      var g = p.getAttribute('data-group');
      var subs = mount.querySelector('.mi-subs[data-group="' + g + '"]');
      if (!subs) return;
      var open = subs.classList.toggle('open');
      p.classList.toggle('open', open);
    });
  });
})();
