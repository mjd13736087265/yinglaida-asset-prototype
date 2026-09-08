/* ============================================================
 * 英莱达资管 · 移动端底部 Tab 共享组件（唯一 Tab 数据源）
 * ------------------------------------------------------------
 * 挂载方式（.phone 内、.screen 之后 + body 末尾引入本脚本）：
 *   <div class="m-tab" id="amsTab" data-variant="admin" data-active="area"></div>
 *   <script src="相对路径/assets/m-tab.js"></script>
 *
 * - data-variant：admin = 移动管理端 4 Tab（工作台/片区/收租/我的）
 *                 user  = 移动用户端 4 Tab（首页/房源/消息/我的）
 * - data-active ：当前页 Tab id；房态/房源详情等二级页用 map/room，
 *                 归位高亮见下方 ALIAS；缺省或空 = 不高亮任何 Tab
 * - 路径推算同 nav.js（currentScript.src → 主页原型/ 为 base），
 *   任意目录深度可用，GitHub Pages 子路径可用。
 * - ★ 新模块上线时：把下方 TABS 对应项加上 href，改一次全站生效；
 *   禁止在新页面手写底部 Tab。
 * ============================================================ */
(function () {
  var script = document.currentScript;
  var mount = document.getElementById('amsTab');
  if (!script || !mount) return;

  var src = script.src;
  var cut = src.lastIndexOf('/assets/');
  var base = cut >= 0 ? src.slice(0, cut + 1) : './'; // …/00-整体需求/主页原型/
  var root = base + '../../';                          // 站点根

  function icon(inner) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>';
  }
  /* 图标逐字沿用现有页面 SVG（管理端取 m-admin-home，用户端取 m-user-home） */
  var IC = {
    aHome: icon('<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>'),
    build: icon('<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/><path d="M11 21v-3h2v3"/>'),
    coin:  icon('<circle cx="12" cy="12" r="8.5"/><path d="M8.5 8l3.5 4.5L15.5 8"/><path d="M12 12.5V17"/><path d="M9.5 13.5h5"/>'),
    user:  icon('<circle cx="12" cy="7.8" r="3.6"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>'),
    uHome: icon('<path d="M3.5 10.5L12 3l8.5 7.5"/><path d="M5.5 9.5V20a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.5"/><path d="M10 21v-6h4v6"/>'),
    msg:   icon('<path d="M5.5 4h13a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H9.5L4 20.5V5.5A1.5 1.5 0 0 1 5.5 4z"/><path d="M8 8.5h8M8 12h5"/>')
  };

  /* ========== TABS：移动端底部 Tab 唯一数据源 ==========
   * 无 href = 后续占位（不可点）；新模块上线时补 href 即可。
   * ================================================== */
  var TABS = {
    admin: [
      { id: 'home', text: '工作台', href: base + 'm-admin-home.html',                  icon: IC.aHome },
      { id: 'area', text: '片区',   href: root + '02-片区管理/原型/m-admin-areas.html', icon: IC.build },
      { id: 'rent', text: '收租',                                                      icon: IC.coin },
      { id: 'my',   text: '我的',                                                      icon: IC.user }
    ],
    user: [
      { id: 'home',  text: '首页', href: base + 'm-user-home.html',                   icon: IC.uHome },
      { id: 'rooms', text: '房源', href: root + '02-片区管理/原型/m-user-rooms.html',  icon: IC.build },
      { id: 'msg',   text: '消息',                                                    icon: IC.msg },
      { id: 'my',    text: '我的',                                                    icon: IC.user }
    ]
  };

  /* 二级页 active 归位：房态/房间详情 → 所属一级 Tab */
  var ALIAS = {
    admin: { map: 'area', room: 'area' },
    user:  { room: 'rooms', myrooms: '' }
  };

  var variant = mount.getAttribute('data-variant') || 'admin';
  var tabs = TABS[variant] || TABS.admin;
  var active = mount.getAttribute('data-active') || '';
  if (ALIAS[variant] && Object.prototype.hasOwnProperty.call(ALIAS[variant], active)) {
    active = ALIAS[variant][active];
  }

  var h = '';
  tabs.forEach(function (t) {
    var inner = t.icon + '\n' + t.text;
    if (t.id === active && active) {
      h += '<div class="ti on">' + inner + '</div>';
    } else if (t.href) {
      h += '<a class="ti" href="' + t.href + '">' + inner + '</a>';
    } else {
      h += '<div class="ti">' + inner + '</div>';
    }
  });
  mount.innerHTML = h;
})();
