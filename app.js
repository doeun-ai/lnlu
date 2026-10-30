/* 핸드메이드 대시보드 · 모바일 앱 */
(function () {
'use strict';

// ───────── 기본 도구 ─────────
var $app = document.getElementById('app');
function lsGet(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function num(v) { var n = Number(String(v == null ? '' : v).replace(/[^0-9.\-]/g, '')); return isFinite(n) ? n : 0; }
function won(n) { n = Math.round(n || 0); return (n < 0 ? '−₩' : '₩') + Math.abs(n).toLocaleString('ko-KR'); }
function signWon(n) { return (n > 0 ? '+' : '') + won(n); }
function pad(n) { return (n < 10 ? '0' : '') + n; }
function today() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function curMonth() { return today().slice(0, 7); }
function addMonths(ym, k) { var y = +ym.slice(0, 4), m = +ym.slice(5, 7) - 1 + k; y += Math.floor(m / 12); m = ((m % 12) + 12) % 12; return y + '-' + pad(m + 1); }
function lastDay(ym) { return new Date(+ym.slice(0, 4), +ym.slice(5, 7), 0).getDate(); }
function addDays(ds, k) { var d = new Date(ds + 'T00:00:00'); d.setDate(d.getDate() + k); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function mLabel(ym) { return (+ym.slice(5, 7)) + '월'; }
function mdLabel(ds) { return ds ? (+ds.slice(5, 7)) + '/' + (+ds.slice(8, 10)) : ''; }
function keyLabel(k) { k = String(k || ''); return k.length > 7 ? mdLabel(k) : (k ? mLabel(k) : ''); }
function uid(p) { return p + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase(); }
function normTxt(s) { return String(s || '').toLowerCase().replace(/[\s_\-·()\[\]\/.,]/g, ''); }

var ICON = {
  back: '<svg width="22" height="22" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  close: '<svg width="20" height="20" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  prev: '<svg width="16" height="16" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  next: '<svg width="16" height="16" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  down: '<svg width="18" height="18" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  up: '<svg width="18" height="18" viewBox="0 0 24 24"><path d="M6 15l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  gear: '<svg width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  search: '<svg width="18" height="18" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  scan: '<svg width="20" height="20" viewBox="0 0 24 24"><path d="M4 8V5h3M17 5h3v3M20 16v3h-3M7 19H4v-3M8 8v8M11 8v8M14 8v8M17 8v8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>'
};
var NAV = [
  ['home', '홈', '<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>'],
  ['channel', '채널', '<path d="M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9h16M10 20v-5h4v5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>'],
  ['stock', '작업실', '<path d="M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>'],
  ['book', '정산', '<path d="M6 3.5h12v17l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9 8.5h6M9 12h6M9 15.5h3.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'],
  ['ledger', '가계부', '<rect x="4" y="5" width="16" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M4 10h16M8 15h3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>']
];
var COLORS = ['#8DB8EA', '#F4A88A', '#F6D57E', '#A8D5B5', '#C9B6E8', '#F2B5C8', '#9FD8DF', '#D9C3A5'];
var MAKE_CATS = ['공임비', '부자재', '제품포장'];
var EXTRA_CATS = ['물류비', '운영비', '홍보', 'etc'];
var THEMES = {
  expense: { name: '지출', soft: '#D6E6F9', ink: '#1F3F66' },
  income: { name: '수입', soft: '#E2F1E6', ink: '#1E5631' },
  loan: { name: '대출', soft: '#FCE4D8', ink: '#6B3015' },
  personal: { name: '투자', soft: '#EEE8F8', ink: '#4A3A6E' },
  salary: { name: '급여', soft: '#EDEDF0', ink: '#3A3A3C' }
};
var CHIP = { '수입': ['#E2F1E6', '#1E5631'], '지출': ['#E3EDF9', '#1F3F66'], '대출': ['#FCE4D8', '#6B3015'], '투자': ['#EEE8F8', '#4A3A6E'], '급여': ['#F2F2F7', '#3A3A3C'] };
var SUB_TITLE = { '정산입금': '정산 입금', '기타수입': '기타 수입', '받기': '대출 받기', '갚기': '대출 갚기', '이자발생': '이자 발생', '넣기': '투자금 넣기', '가져가기': '투자금 가져가기' };

// ───────── 상태 ─────────
var API_URL = 'https://script.google.com/macros/s/AKfycbxsM29cscboIF9rJZ6cO2wrSDKQJJ_kTkJt2cl2QiBx2izd8Wdi-cRaAuLwXFYa382VQQ/exec';
var S = {
  cfg: { url: API_URL, pin: (lsGet('hm_cfg') || {}).pin || '' },
  data: lsGet('hm_data'),
  ver: 1,
  route: null,
  ui: {},
  toast: null,
  loading: false
};

// ───────── 서버 ─────────
function api(action, payload) {
  var body = Object.assign({ action: action, pin: S.cfg.pin }, payload || {});
  return fetch(S.cfg.url, { method: 'POST', body: JSON.stringify(body) })
    .then(function (r) { return r.json(); })
    .then(function (j) { if (!j.ok) throw new Error(j.error === 'PIN' ? 'PIN이 맞지 않아요' : j.error); return j.data; });
}
function loadAll(silent) {
  if (!S.cfg.pin) { go('settings'); return Promise.resolve(); }
  S.loading = !S.data;
  if (!silent) render();
  return api('load').then(function (d) {
    S.data = d; S.ver++; S.loading = false; lsSet('hm_data', d); render();
  }).catch(function (e) {
    S.loading = false;
    toast('불러오기 실패 · ' + e.message);
    if (!S.data) go('settings'); else render();
  });
}
function persist() { S.ver++; lsSet('hm_data', S.data); }
function push(op) {
  // op: {action, table, row|rows|id|ids}
  return api(op.action, op).catch(function (e) {
    toast('저장 실패 · ' + e.message);
    return loadAll(true);
  });
}
function upsertLocal(table, row) {
  var key = table === 'products' ? 'code' : 'id';
  var list = S.data[table];
  for (var i = 0; i < list.length; i++) if (list[i][key] === row[key]) { list[i] = row; return; }
  list.push(row);
}
function saveRow(table, row) { upsertLocal(table, row); persist(); return push({ action: 'save', table: table, row: row }); }
function saveRows(table, rows) { rows.forEach(function (r) { upsertLocal(table, r); }); persist(); return push({ action: 'saveMany', table: table, rows: rows }); }
function removeRow(table, id) {
  var key = table === 'products' ? 'code' : 'id';
  S.data[table] = S.data[table].filter(function (r) { return r[key] !== id; }); persist();
  return push({ action: 'remove', table: table, id: id });
}
function removeRows(table, ids) {
  S.data[table] = S.data[table].filter(function (r) { return ids.indexOf(r.id) < 0; }); persist();
  return push({ action: 'removeMany', table: table, ids: ids });
}
function replaceRows(table, oldIds, rows) {
  // 수정: 예전 묶음을 지우고 새 묶음 저장 (서버도 순서대로)
  S.data[table] = S.data[table].filter(function (r) { return oldIds.indexOf(r.id) < 0; });
  rows.forEach(function (r) { upsertLocal(table, r); }); persist();
  return api('removeMany', { table: table, ids: oldIds }).then(function () { return api('saveMany', { table: table, rows: rows }); })
    .catch(function (e) { toast('저장 실패 · ' + e.message); return loadAll(true); });
}
function saveCode(row) {
  S.data.codes = S.data.codes.filter(function (c) { return !(c.channel === row.channel && c.label === row.label); });
  S.data.codes.push(row); persist();
  return push({ action: 'saveCode', row: row });
}
function removeCode(row) {
  S.data.codes = S.data.codes.filter(function (c) { return !(c.channel === row.channel && c.label === row.label); }); persist();
  return push({ action: 'removeCode', row: row });
}

// ───────── 계산 ─────────
// 잠금: 마지막 사용 후 30분이 지나면 PIN 입력
var LOCK_MS = 30 * 60 * 1000;
function touch() { try { localStorage.setItem('hm_last', String(Date.now())); } catch (e) {} }
function needLock() { var t = 0; try { t = +localStorage.getItem('hm_last') || 0; } catch (e) {} return !!S.cfg.pin && Date.now() - t > LOCK_MS; }
function lock() { S.locked = true; S.lk = { pin: '', err: '', shake: false }; }
var DER = null;
function D() {
  if (DER && DER.v === S.ver) return DER;
  var d = S.data, t = today();
  var P = {}, C = {}, chList = d.channels.slice().sort(function (a, b) { return (a.order || 99) - (b.order || 99); });
  d.products.forEach(function (p) { P[p.code] = p; });
  chList.forEach(function (c) { C[c.id] = c; });
  var ws = {}, chStock = {}, sales = {}, days = {}, reg = {}, orderQty = 0;
  function W(code) { return ws[code] || (ws[code] = { order: 0, dm: 0, inq: 0 }); }
  d.stock.forEach(function (r) {
    var q = num(r.qty);
    if (r.kind === '발주') { W(r.code).order += q; orderQty += q; }
    else if (r.kind === '하자마케팅') W(r.code).dm += q;
    else if (r.kind === '입고') {
      if (r.code) W(r.code).inq += q;
      var cs = chStock[r.channel] || (chStock[r.channel] = {});
      cs[r.code] = (cs[r.code] || 0) + q;
    } else if (r.kind === '판매') {
      var m = r.saleMonth || String(r.date).slice(0, 7);
      (reg[r.channel] || (reg[r.channel] = {}))[m] = true;
      if (!r.code) return;
      var cs2 = chStock[r.channel] || (chStock[r.channel] = {});
      cs2[r.code] = (cs2[r.code] || 0) - q;
      var sc = sales[r.channel] || (sales[r.channel] = {});
      var o = sc[m] || (sc[m] = { qty: 0, rev: 0, last: '' });
      o.qty += q; o.rev += q * num(P[r.code] && P[r.code].price);
      if (r.date > o.last) o.last = r.date;
      var dc = days[r.channel] || (days[r.channel] = {}), dd = dc[r.date] || (dc[r.date] = { qty: 0, rev: 0 });
      dd.qty += q; dd.rev += q * num(P[r.code] && P[r.code].price);
    }
  });
  function wsStock(code) { var w = ws[code]; return w ? w.order - w.dm - w.inq : 0; }
  // 가계부
  var L = { settled: 0, etcInc: 0, spent: 0, loan: 0, personal: 0, salary: 0, cats: {}, chExtra: {}, salaries: [], dep: {} };
  d.ledger.forEach(function (r) {
    var a = num(r.amount);
    if (r.type === '수입') {
      if (r.sub === '정산입금') {
        L.settled += a;
        var k = r.channel + '|' + r.settleMonth, o = L.dep[k] || (L.dep[k] = { paid: 0, done: false });
        o.paid += a; if (r.settleDone === true) o.done = true;
      } else L.etcInc += a;
    } else if (r.type === '지출') {
      L.spent += a; L.cats[r.category] = (L.cats[r.category] || 0) + a;
      if (r.sub === '부가비용' && r.channel) L.chExtra[r.channel] = (L.chExtra[r.channel] || 0) + a;
    } else if (r.type === '대출') {
      if (r.sub === '받기') L.loan += a;
      else if (r.sub === '갚기') L.loan -= a;
      else if (r.sub === '이자발생') { L.loan += a; L.spent += a; L.cats['대출이자'] = (L.cats['대출이자'] || 0) + a; }
    } else if (r.type === '투자') {
      if (r.sub === '넣기') { L.loan -= a; L.personal += a; }
      else { L.loan += a; L.personal -= a; }
    } else if (r.type === '급여') { L.salary += a; L.salaries.push(r); }
  });
  L.card = L.loan + L.personal + L.settled + L.etcInc - L.spent - L.salary;
  // 정산 건
  var settles = [];
  Object.keys(sales).forEach(function (ch) {
    var c = C[ch]; if (!c) return;
    var daily = c.payBase === '일수';
    var src = daily ? days[ch] || {} : sales[ch];
    Object.keys(src).forEach(function (k) {
      var s = src[k]; if (s.qty <= 0) return;
      var expected = Math.round(s.rev * (1 - num(c.fee) / 100));
      var dep = L.dep[ch + '|' + k] || { paid: 0, done: false };
      var done = dep.done || (expected > 0 ? dep.paid >= expected * 0.9 : dep.paid > 0);
      var due = daily ? addDays(k, num(c.payDays) || 7) : dueDate(c, k, s.last);
      settles.push({ ch: ch, key: k, daily: daily, label: daily ? mdLabel(k) : mLabel(k), qty: s.qty, expected: expected, paid: dep.paid, remain: Math.max(0, expected - dep.paid), done: done, due: due, late: !done && due && t > due });
    });
  });
  DER = { v: S.ver, P: P, C: C, chList: chList, ws: ws, wsStock: wsStock, chStock: chStock, sales: sales, reg: reg, orderQty: orderQty, L: L, settles: settles };
  return DER;
}
function dueDate(c, m, last) {
  if (c.payBase === '일수') return addDays(last || (m + '-' + pad(lastDay(m))), num(c.payDays) || 7);
  var tm = addMonths(m, num(c.payMonth) || 1);
  var day = c.payDay === '말일' || !c.payDay ? lastDay(tm) : Math.min(num(c.payDay), lastDay(tm));
  return tm + '-' + pad(day);
}
function isClosed(c) { return c && c.status === '퇴점'; }
function openChannels() { return D().chList.filter(function (c) { return !isClosed(c); }); }
function chName(id) { var c = D().C[id]; return c ? c.name : (id || ''); }
function chColor(id) { var c = D().C[id]; return (c && c.color) || '#C7C7CC'; }
function prodName(code) { var p = D().P[code]; return p ? (p.option || p.name) : code; }
function catTag(code) { var p = D().P[code]; return p && p.category ? '<span style="font-size:12px;font-weight:400;color:var(--faint);margin-right:6px">' + esc(p.category) + '</span>' : ''; }
function prodFull(code) { var p = D().P[code]; return p ? (p.category ? p.category + ' · ' : '') + (p.option || p.name) : code; }
function activeProducts() { return S.data.products.filter(function (p) { return p.active !== '중지'; }); }
function categories() { var a = []; activeProducts().forEach(function (p) { if (p.category && a.indexOf(p.category) < 0) a.push(p.category); }); return a; }
function chStockOf(ch, code) { var s = D().chStock[ch]; return s && s[code] || 0; }
function soldOf(code) { var t = 0; S.data.stock.forEach(function (r) { if (r.kind === '판매' && r.code === code) t += num(r.qty); }); return t; }
function chStockTotal(ch) { var s = D().chStock[ch] || {}, t = 0; Object.keys(s).forEach(function (k) { t += s[k]; }); return t; }
function payoutText(c) {
  if (c.payBase === '일수') return '판매 후 ' + (num(c.payDays) || 7) + '일 이내 입금';
  return (num(c.payMonth) === 2 ? '다다음 달 ' : '다음 달 ') + (c.payDay === '말일' || !c.payDay ? '말일' : c.payDay + '일') + ' 입금';
}
function chActiveIn(c, m) {
  if (c.openDate && c.openDate.slice(0, 7) > m) return false;
  if (isClosed(c) && c.closeDate && c.closeDate.slice(0, 7) < m) return false;
  return true;
}

// ───────── 라우팅 ─────────
function parseHash() {
  var h = location.hash.replace(/^#\/?/, '') || 'home';
  var qi = h.indexOf('?'), path = qi >= 0 ? h.slice(0, qi) : h, q = {};
  if (qi >= 0) new URLSearchParams(h.slice(qi + 1)).forEach(function (v, k) { q[k] = v; });
  var parts = path.split('/').map(decodeURIComponent);
  return { name: parts[0], id: parts[1] || '', q: q };
}
function go(path, replace) {
  var h = '#/' + path;
  if (replace) history.replaceState(null, '', h); else location.hash = h;
  if (replace) onRoute();
}
function onRoute() {
  S.route = parseHash(); S.ui = {}; S.swiped = null;
  stopScan();
  render(); window.scrollTo(0, 0);
}
window.addEventListener('hashchange', onRoute);

// ───────── 렌더 ─────────
function render() {
  var ae = document.activeElement, fid = ae && ae.id, sel = null, digits = null;
  try { if (fid && ae.selectionStart != null) sel = [ae.selectionStart, ae.selectionEnd]; } catch (e) {}
  // 금액칸(쉼표 자동)은 커서 앞 숫자 개수로 위치를 되살림
  if (fid && ae.dataset && ae.dataset.money && sel) digits = ae.value.slice(0, sel[0]).replace(/[^0-9]/g, '').length;
  var r = S.route || parseHash();
  var html;
  if (r.name !== 'settings' && !S.data) html = '<div class="loading"><span class="spin"></span>불러오는 중</div>';
  else if (S.locked) html = VIEWS.lock();
  else html = (VIEWS[r.name] || VIEWS.home)(r);
  $app.innerHTML = html + toastHtml();
  if (fid) {
    var el = document.getElementById(fid);
    if (el) {
      el.focus({ preventScroll: true });
      if (digits != null) { var v = el.value, pos = 0, cnt = 0; while (pos < v.length && cnt < digits) { if (/[0-9]/.test(v[pos])) cnt++; pos++; } sel = [pos, pos]; }
      try { if (sel) el.setSelectionRange(sel[0], sel[1]); } catch (e) {}
    }
  }
  afterRender();
}
function nav(on) {
  return '<nav class="nav" aria-label="하단 메뉴">' + NAV.map(function (n) {
    return '<a href="#/' + n[0] + '" class="' + (on === n[0] ? 'on' : '') + '"' + (on === n[0] ? ' aria-current="page"' : '') + '><svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">' + n[2] + '</svg>' + n[1] + '</a>';
  }).join('') + '</nav>';
}
function subHead(title, backHref, right) {
  return '<header class="sub-head"><a class="icon-btn" href="' + backHref + '" aria-label="닫기">' + ICON.close + '</a><span class="title">' + esc(title) + '</span>' + (right || '<span style="width:44px"></span>') + '</header>';
}
function toast(msg, undo) {
  S.toast = { msg: msg, undo: undo || null, at: Date.now() };
  render();
  var at = S.toast.at;
  setTimeout(function () { if (S.toast && S.toast.at === at) { S.toast = null; render(); } }, undo ? 6000 : 3000);
}
function toastHtml() {
  if (!S.toast) return '';
  return '<div class="toast" role="status">' + esc(S.toast.msg) + (S.toast.undo ? '<button type="button" data-a="undo">되돌리기</button>' : '') + '</div>';
}
function stepper(key, code, qty, label) {
  var id = 'q_' + key + '_' + code;
  return '<div class="stepper"><button type="button" data-a="dec" data-k="' + key + '" data-c="' + esc(code) + '" aria-label="' + esc(label) + ' 하나 빼기">−</button>' +
    '<input id="' + esc(id) + '" type="number" inputmode="numeric" class="' + (qty ? 'has' : '') + '" data-q="' + key + '" data-c="' + esc(code) + '" value="' + (qty || '') + '" placeholder="0" aria-label="' + esc(label) + ' 수량">' +
    '<button type="button" data-a="inc" data-k="' + key + '" data-c="' + esc(code) + '" aria-label="' + esc(label) + ' 하나 더하기">+</button></div>';
}
function chipsHtml(list, cur, act, extraCls) {
  return '<div class="chips" role="group">' + list.map(function (c) {
    var v = Array.isArray(c) ? c[0] : c, l = Array.isArray(c) ? c[1] : c;
    return '<button type="button" class="chip ' + (extraCls && extraCls(v) || '') + (cur === v ? ' on' : '') + '" data-a="' + act + '" data-v="' + esc(v) + '" aria-pressed="' + (cur === v) + '">' + esc(l) + '</button>';
  }).join('') + '</div>';
}
function seg(list, cur, act) {
  return '<div class="seg" role="group">' + list.map(function (s) {
    return '<button type="button" class="' + (cur === s[0] ? 'on' : '') + '" data-a="' + act + '" data-v="' + s[0] + '" aria-pressed="' + (cur === s[0]) + '">' + esc(s[1]) + '</button>';
  }).join('') + '</div>';
}
function selectHtml(id, model, opts, cur, extra) {
  return '<select id="' + id + '" data-m="' + model + '"' + (extra || '') + '>' + opts.map(function (o) {
    var v = Array.isArray(o) ? o[0] : o, l = Array.isArray(o) ? o[1] : o;
    return '<option value="' + esc(v) + '"' + (String(v) === String(cur) ? ' selected' : '') + '>' + esc(l) + '</option>';
  }).join('') + '</select>';
}
function swipeRow(key, inner, editAct, delAct) {
  var on = S.swiped === key;
  return '<div class="swipe"><div class="acts"><button type="button" class="e" data-a="' + editAct + '" data-v="' + esc(key) + '">수정</button><button type="button" class="d" data-a="' + delAct + '" data-v="' + esc(key) + '">삭제</button></div>' +
    '<div class="front" data-sw="' + esc(key) + '" style="transform: translateX(' + (on ? -144 : 0) + 'px)">' + inner + '</div></div>';
}

var VIEWS = {};

// ───────── 홈 ─────────
VIEWS.home = function () {
  var d = D(), u = S.ui, cm = curMonth();
  var months = []; for (var i = 5; i >= 0; i--) months.push(addMonths(cm, -i));
  if (u.mi == null) u.mi = 5;
  var m = months[u.mi];
  var chs = d.chList.filter(function (c) { return chActiveIn(c, m) || (d.sales[c.id] && d.sales[c.id][m]); });
  var qty = 0, rev = 0, missing = 0, todos = [];
  // TO-DO: 월과 상관없이 전체 (판매수량 미등록 + 미정산 전부)
  d.chList.forEach(function (c) {
    if (c.type !== '위탁' || isClosed(c)) return;
    var start = c.openDate ? c.openDate.slice(0, 7) : addMonths(cm, -1);
    for (var mm = start; mm <= cm; mm = addMonths(mm, 1)) {
      if (d.reg[c.id] && d.reg[c.id][mm]) continue;
      todos.push({ o: 1, title: c.name + ' ' + mLabel(mm) + ' 판매수량', est: '', red: false, dot: '#F4A88A', act: '등록', cls: '', href: '#/register?kind=sale&mode=' + (c.defaultMode === '수기' ? 'manual' : 'auto') + '&ch=' + encodeURIComponent(c.id) + '&month=' + mm });
    }
  });
  var rows = chs.map(function (c) {
    var s = d.sales[c.id] && d.sales[c.id][m];
    var regd = d.reg[c.id] && d.reg[c.id][m];
    var unknown = c.type === '위탁' && !regd;
    if (s) { qty += s.qty; rev += s.rev; }
    if (unknown && !isClosed(c)) missing++;
    return '<div class="row"><span class="dot" style="background:' + esc(c.color) + '"></span><span style="flex:1 1 auto;color:var(--ink2)">' + esc((isClosed(c) ? '(퇴점) ' : '') + c.name) + '</span>' +
      '<span style="flex:0 0 52px;text-align:right;color:' + (unknown ? 'var(--mute)' : 'var(--ink)') + '">' + (unknown ? '-' : (s ? s.qty : 0) + '개') + '</span>' +
      '<span style="flex:0 0 96px;text-align:right;font-weight:600;color:' + (unknown ? 'var(--mute)' : 'var(--ink)') + '">' + (unknown ? '-' : won(s ? s.rev : 0)) + '</span></div>';
  }).join('');
  d.settles.filter(function (s) { return !s.done; }).sort(function (x, y) { return x.due < y.due ? -1 : 1; }).forEach(function (s) {
    todos.push({ o: s.late ? 0 : 2, title: chName(s.ch) + ' ' + s.label + ' 정산', est: '예상 ' + won(s.remain || s.expected), red: s.late, dot: s.late ? '#C9302C' : '#A7C4E5', act: '입금', cls: 'green',
      href: '#/book?pay=' + encodeURIComponent(s.ch) + '&month=' + s.key + '&amt=' + (s.remain || s.expected) });
  });
  if (true) {
    d.chList.forEach(function (c) {
      if (isClosed(c) || c.feeType !== '한번에' || !c.contractEnd) return;
      var left = (new Date(c.contractEnd) - new Date(today())) / 864e5;
      if (left <= 14) todos.push({ o: 1, title: c.name + ' 입점 계약 연장', est: mdLabel(c.contractEnd) + ' 종료', red: left < 0, dot: '#F6D57E', act: '설정', cls: '', href: '#/chset/' + encodeURIComponent(c.id) });
    });
  }
  todos.sort(function (a, b) { return a.o - b.o; });
  var qOf = function (mm) { var t = 0; d.chList.forEach(function (c) { var s = d.sales[c.id] && d.sales[c.id][mm]; if (s) t += s.qty; }); return t; };
  var totals = months.map(qOf), maxQ = Math.max.apply(null, totals.concat([1]));
  var bars = months.map(function (mm, i) {
    var on = i === u.mi;
    var segs = d.chList.map(function (c) { var s = d.sales[c.id] && d.sales[c.id][mm]; var h = s ? Math.round(s.qty / maxQ * 80) : 0; return h > 0 ? '<div style="height:' + h + 'px;background:' + esc(c.color) + '"></div>' : ''; }).join('');
    var fg = on ? 'var(--ink)' : 'var(--mute)', w = on ? 700 : 400;
    return '<button type="button" class="bar" data-a="homeMonth" data-v="' + i + '" aria-pressed="' + on + '" aria-label="' + mLabel(mm) + '로 이동"><small style="color:' + fg + ';font-weight:' + w + '">' + totals[i] + '</small><div class="stack" style="opacity:' + (on ? 1 : 0.45) + '">' + segs + '</div><small style="color:' + fg + ';font-weight:' + w + '">' + mLabel(mm) + '</small></button>';
  }).join('');
  var prevQ = u.mi > 0 ? totals[u.mi - 1] : null;
  var note = missing ? '위탁 매장 ' + missing + '곳 수량이 아직 없어서 집계 중이에요' : (prevQ !== null ? '전월 대비 판매수량 ' + (qty - prevQ >= 0 ? '+' : '−') + Math.abs(qty - prevQ) + '개' : '');
  // 재고 확인
  var low = activeProducts().filter(function (p) { return d.wsStock(p.code) <= 3; }).map(function (p) {


    var open = S.ui.openLow === p.code;
    var split = d.chList.filter(function (c) { return chStockOf(c.id, p.code) || !isClosed(c); }).map(function (c) {
      return '<div style="display:flex;flex-direction:column;gap:2px;padding:8px;border-radius:10px;background:#F5F5F7;min-width:0"><span style="font-size:11px;color:var(--mute);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(c.name) + '</span><b style="font-size:15px">' + chStockOf(c.id, p.code) + '</b></div>';
    }).join('');
    return '<div style="border-bottom:1px solid var(--line)"><button type="button" data-a="openLow" data-v="' + esc(p.code) + '" aria-expanded="' + open + '" style="display:flex;justify-content:space-between;align-items:center;gap:8px;width:100%;min-height:48px;padding:8px 16px;border:0;background:transparent;text-align:left"><span style="font-size:15px;font-weight:600">' + catTag(p.code) + esc(prodName(p.code)) + '</span><span style="flex:0 0 auto;display:flex;align-items:center;gap:6px"><span class="tag need">작업실 ' + d.wsStock(p.code) + '</span><span style="font-size:12px;color:var(--faint)">매장 ' + d.chList.reduce(function (a, c) { return a + chStockOf(c.id, p.code); }, 0) + '</span></span></button>' +
      (open ? '<div class="grid4" style="padding:0 16px 12px">' + split + '</div>' : '') + '</div>';
  });
  var allStock = 0;
  activeProducts().forEach(function (p) { allStock += d.wsStock(p.code); d.chList.forEach(function (c) { allStock += chStockOf(c.id, p.code); }); });
  return '<main class="with-nav">' +
    '<header class="top"><div style="display:flex;flex-direction:column;gap:4px"><span class="eyebrow">' + m.slice(0, 4) + '년</span><h1>홈</h1></div>' +
    '<div class="pill" role="group" aria-label="월 선택"><button type="button" data-a="homePrev" aria-label="이전 달"' + (u.mi === 0 ? ' disabled' : '') + '>' + ICON.prev + '</button><span>' + mLabel(m) + '</span><button type="button" data-a="homeNext" aria-label="다음 달"' + (u.mi === 5 ? ' disabled' : '') + '>' + ICON.next + '</button></div></header>' +
    '<section class="card pad" aria-label="매출" style="gap:16px"><div style="display:flex;justify-content:space-between;align-items:flex-end;gap:12px"><div style="display:flex;flex-direction:column;gap:4px"><span class="eyebrow">' + mLabel(m) + ' 매출</span><span class="big">' + won(rev) + '</span></div><div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px"><span class="eyebrow">판매수량</span><span style="font-size:22px;font-weight:700">' + qty + '개</span></div></div>' +
    (note ? '<span style="font-size:13px;color:' + (missing ? 'var(--warn-ink)' : 'var(--mute)') + '">' + note + '</span>' : '') +
    '<div class="bars">' + bars + '</div><div style="display:flex;flex-direction:column;border-top:1px solid var(--line)">' + rows + '</div></section>' +
    '<section class="card" aria-label="TO-DO"><div style="display:flex;justify-content:space-between;align-items:baseline;padding:16px 16px 6px"><h2>TO-DO</h2><span class="eyebrow">' + (todos.length ? todos.length + '건' : '') + '</span></div>' +
    (todos.length ? todos.map(function (t) {
      return '<a class="list-row" href="' + t.href + '"><span class="dot" style="background:' + t.dot + '"></span><span style="flex:1 1 auto;font-size:14px;font-weight:600;color:' + (t.red ? 'var(--red)' : 'var(--ink)') + '">' + esc(t.title) + (t.est ? '<span style="margin-left:6px;font-size:12px;font-weight:400;color:var(--faint)">' + esc(t.est) + '</span>' : '') + '</span><span class="act ' + t.cls + '">' + t.act + '</span></a>';
    }).join('') : '<div style="padding:14px 16px 18px;font-size:14px;color:#1A6B30">판매수량 등록과 정산이 모두 끝났어요</div>') + '</section>' +
    '<div class="tiles"><a class="tile" href="#/register?kind=sale&mode=manual" style="background:#D6E6F9;color:#1F3F66"><b>수기 판매등록</b><span style="color:#3B5A80">한 건씩</span></a><a class="tile" href="#/register?kind=sale&mode=auto" style="background:#FCE4D8;color:#6B3015"><b>자동 판매등록</b><span style="color:#8A5038">붙여넣기로 한 번에</span></a></div>' +
    '<section aria-label="재고 확인" style="display:flex;flex-direction:column;gap:8px"><div class="sec-title"><h2>재고 확인</h2><span class="eyebrow">지금 기준 · 전체 ' + allStock + '개</span></div><div class="card" style="border-radius:16px">' + (low.length ? low.join('') : '<div class="empty">작업실 재고가 3개 이하인 제품이 없어요</div>') + '</div></section>' +
    '</main>' + nav('home');
};

// ───────── 채널 ─────────
VIEWS.channel = function (r) {
  var d = D(), u = S.ui;
  var list = d.chList.filter(function (c) { return !isClosed(c); }).concat(d.chList.filter(isClosed));
  if (!list.length) return '<main class="with-nav"><header class="top"><h1>채널</h1></header><a class="tile" href="#/chset/new" style="background:#D6E6F9;color:#1F3F66"><b>+ 채널 추가</b></a></main>' + nav('channel');
  var c = d.C[r.id] || list[0];
  var closed = isClosed(c);
  var menu = '';
  if (u.menu) {
    var first = true;
    menu = '<div class="menu" role="listbox" aria-label="채널 선택" style="top:96px">' + list.map(function (x) {
      var sep = isClosed(x) && first; if (isClosed(x)) first = false;
      var on = x.id === c.id;
      return '<button type="button" role="option" aria-selected="' + on + '" class="' + (sep ? 'sep' : '') + '" data-a="pickCh" data-v="' + esc(x.id) + '" style="background:' + (on ? '#F2F6FC' : 'transparent') + ';font-weight:' + (on ? 700 : 500) + ';color:' + (isClosed(x) ? 'var(--mute)' : 'var(--ink)') + '"><span class="dot" style="background:' + esc(x.color) + '"></span><span style="flex:1 1 auto">' + esc((isClosed(x) ? '(퇴점) ' : '') + x.name) + '</span><span aria-hidden="true">' + (on ? '✓' : '') + '</span></button>';
    }).join('') + '<a href="#/chset/new" style="color:var(--blue);font-weight:600">+ 채널 추가</a></div>';
  }
  var sales = d.sales[c.id] || {}, rev = 0, sold = 0;
  Object.keys(sales).forEach(function (m) { rev += sales[m].rev; sold += sales[m].qty; });
  var extra = d.L.chExtra[c.id] || 0;
  var feeTxt = c.feeType === '매월' ? '입점료 매월' + (num(c.feeAmount) ? ' ' + won(c.feeAmount) : '') : (c.feeType === '한번에' ? '입점료 한 번에' + (c.contractEnd ? ' · ~' + c.contractEnd.replace(/-/g, '.') : '') : '입점료 없음');
  var setting = '수수료 ' + num(c.fee) + '% · ' + payoutText(c) + ' · ' + feeTxt;
  var cm = curMonth(), months = []; for (var i = 5; i >= 0; i--) months.push(addMonths(cm, -i));
  var series = months.map(function (m) { var s = sales[m]; var regd = d.reg[c.id] && d.reg[c.id][m]; return s ? s.qty : (c.type === '위탁' && !regd ? null : 0); });
  var maxM = Math.max.apply(null, series.map(function (v) { return v || 0; }).concat([1]));
  var bars = series.map(function (v, i) {
    var last = i === series.length - 1;
    return '<div style="flex:1 1 0;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:4px;height:100%"><small style="font-size:11px;font-weight:' + (last ? 700 : 400) + '">' + (v === null ? '-' : v) + '</small><div style="width:100%;height:' + (v ? Math.round(v / maxM * 84) : 3) + 'px;border-radius:6px;background:' + (v ? esc(c.color) : '#E5E5EA') + '"></div><small style="font-size:11px;color:var(--mute);font-weight:' + (last ? 700 : 400) + '">' + mLabel(months[i]) + '</small></div>';
  }).join('');
  // 제품별 재고 (이 채널에 입고된 적 있는 제품)
  var cs = d.chStock[c.id] || {};
  var byCat = {};
  // 제품 등록 순서대로 (시트 '제품' 탭 순서)
  var pIdx = {}; S.data.products.forEach(function (p, i) { pIdx[p.code] = i; });
  Object.keys(cs).sort(function (a, b) { return (pIdx[a] == null ? 1e9 : pIdx[a]) - (pIdx[b] == null ? 1e9 : pIdx[b]); }).forEach(function (code) {
    if (!code) return;
    var p = d.P[code]; var cat = p ? p.category : '기타';
    (byCat[cat] || (byCat[cat] = [])).push([code, cs[code]]);
  });
  var cats = Object.keys(byCat).map(function (cat) {
    var all = byCat[cat];
    var total = all.reduce(function (a, p) { return a + p[1]; }, 0);
    var out = all.filter(function (p) { return p[1] <= 0; }).length;
    var shown = u.low ? all.filter(function (p) { return p[1] <= 1; }) : all;
    if (u.low && !shown.length) return '';
    var open = u.openCat === cat || u.low;
    return '<div style="border-bottom:1px solid var(--line)"><button type="button" data-a="openCat" data-v="' + esc(cat) + '" aria-expanded="' + open + '" style="display:flex;align-items:center;gap:8px;width:100%;min-height:52px;padding:0 16px;border:0;background:transparent;text-align:left">' +
      '<span style="flex:1 1 auto;font-size:15px;font-weight:600">' + esc(cat) + ' <span style="font-weight:400;color:var(--mute);font-size:13px">' + all.length + '종</span></span>' +
      (out ? '<span class="tag need">품절 ' + out + '</span>' : '') + '<span style="font-size:14px;font-weight:600">' + total + '개</span><span aria-hidden="true" style="color:var(--mute);font-size:12px">' + (open ? '▲' : '▼') + '</span></button>' +
      (open ? '<div style="padding:0 16px 8px">' + shown.map(function (p) { return '<div class="row" style="min-height:40px"><span style="flex:1 1 auto;color:var(--ink2)">' + catTag(p[0]) + esc(prodName(p[0])) + '</span><span style="font-weight:600;color:' + (p[1] <= 0 ? 'var(--warn-ink)' : 'var(--ink)') + '">' + (p[1] <= 0 ? (p[1] < 0 ? p[1] + '개' : '품절') : p[1] + '개') + '</span></div>'; }).join('') + '</div>' : '') + '</div>';
  }).join('');
  var logs = batches(S.data.stock.filter(function (x) { return x.channel === c.id && (x.kind === '판매' || x.kind === '입고'); }));
  return '<main class="with-nav" style="position:relative">' +
    '<header class="top"><div style="display:flex;flex-direction:column;gap:4px;min-width:0"><span class="eyebrow">채널</span><h1><button type="button" data-a="chMenu" aria-expanded="' + !!u.menu + '" aria-haspopup="listbox" style="display:flex;align-items:center;gap:6px;padding:0;border:0;background:transparent;font-size:30px;font-weight:700;letter-spacing:-0.02em;color:' + (closed ? 'var(--mute)' : 'var(--ink)') + '">' + esc((closed ? '(퇴점) ' : '') + c.name) + (u.menu ? ICON.up : ICON.down) + '</button></h1></div>' +
    '<a class="icon-btn" href="#/chset/' + encodeURIComponent(c.id) + '" aria-label="채널 설정" style="background:#FFFFFF">' + ICON.gear + '</a></header>' + menu +
    '<a href="#/chset/' + encodeURIComponent(c.id) + '" style="display:flex;justify-content:space-between;gap:8px;padding:0 4px;font-size:13px;color:var(--mute)"><span>' + esc(setting) + '</span></a>' +
    (closed ? '<div class="card pad" style="flex-direction:row;align-items:center;justify-content:space-between;background:#EDEDF0;padding:14px 16px"><div style="display:flex;flex-direction:column;gap:2px"><b style="font-size:15px">' + esc((c.closeDate || '').replace(/-/g, '.')) + ' 퇴점</b><span class="eyebrow">지난 기록만 볼 수 있어요</span></div><button type="button" class="act" data-a="reopen" data-v="' + esc(c.id) + '">다시 열기</button></div>' : '') +
    '<section class="card pad" aria-label="매출 요약"><div style="display:flex;flex-direction:column;gap:4px"><span class="eyebrow">순매출</span><span style="font-size:30px;font-weight:700;letter-spacing:-0.02em">' + won(rev - extra) + '</span></div>' +
    '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px"><div class="box2"><small>누적매출</small><b>' + won(rev) + '</b></div><div class="box2"><small>부가비용</small><b>' + won(-extra) + '</b></div></div></section>' +
    '<section style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px"><div class="card pad" style="gap:4px;padding:16px"><span class="eyebrow">보유재고</span><b style="font-size:22px">' + chStockTotal(c.id) + '개</b></div><div class="card pad" style="gap:4px;padding:16px"><span class="eyebrow">누적판매</span><b style="font-size:22px">' + sold + '개</b></div></section>' +
    (closed ? '' : '<div class="tiles"><a class="tile" href="#/register?kind=sale&mode=' + (c.defaultMode === '수기' ? 'manual' : 'auto') + '&ch=' + encodeURIComponent(c.id) + '" style="background:var(--sale-bg);color:var(--sale-ink);min-height:56px"><b>판매 등록</b></a><a class="tile" href="#/register?kind=in&mode=manual&ch=' + encodeURIComponent(c.id) + '" style="background:var(--in-bg);color:var(--in-ink);min-height:56px"><b>입고 등록</b></a></div>') +
    '<section class="card pad" aria-label="월별 판매수량"><div style="display:flex;justify-content:space-between;align-items:baseline"><h2>월별 판매수량</h2></div><div style="display:flex;align-items:flex-end;gap:10px;height:120px">' + bars + '</div></section>' +
    '<section aria-label="제품별 재고" style="display:flex;flex-direction:column;gap:8px"><div class="sec-title"><h2>제품별 재고</h2><a href="#/stock" style="font-size:14px;font-weight:600">작업실</a></div>' +
    '<div class="chips"><button type="button" class="chip warn' + (u.low ? ' on' : '') + '" data-a="toggleLow" aria-pressed="' + !!u.low + '">1개 이하</button></div>' +
    '<div class="card" style="border-radius:16px">' + (cats || '<div class="empty">입고된 제품이 없어요</div>') + '</div></section>' +
    logSection(logs) + chLedger(c.id) + '</main>' + nav('channel');
};
function chLedger(ch) {
  var u = S.ui, n = u.ledMore ? 200 : 6;
  var recs = S.data.ledger.filter(function (x) { return x.channel === ch; })
    .sort(function (x, y) { return (y.date + (y.createdAt || '') + y.id) < (x.date + (x.createdAt || '') + x.id) ? -1 : 1; });
  var html = recs.slice(0, n).map(function (x) {
    var c = CHIP[x.type] || CHIP['급여'], v = recAmt(x);
    var sub = [x.sub === '정산입금' && x.settleMonth ? keyLabel(x.settleMonth) + '분' : '', x.memo].filter(function (t) { return t; }).join(' · ');
    return '<div style="display:flex;align-items:center;gap:10px;min-height:56px;padding:8px 16px;border-bottom:1px solid var(--line)"><span style="flex:0 0 40px;font-size:12px;color:var(--mute)">' + esc(x.date.slice(5).replace('-', '.')) + '</span><span class="tag" style="background:' + c[0] + ';color:' + c[1] + '">' + esc(x.type) + '</span><span style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:2px"><span style="font-size:15px;font-weight:600">' + esc(recTitle(x)) + '</span>' + (sub ? '<span style="font-size:12px;color:var(--mute);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(sub) + '</span>' : '') + '</span><span style="flex:0 0 auto;font-size:15px;font-weight:600;color:' + (v > 0 ? 'var(--green)' : 'var(--ink)') + '">' + signWon(v || 0) + '</span></div>';
  }).join('');
  return '<section aria-label="지출 · 정산 내역" style="display:flex;flex-direction:column;gap:8px"><h2 style="margin:0;padding:0 4px;font-size:19px;font-weight:700">지출 · 정산 내역</h2><div class="card" style="border-radius:16px">' + (html || '<div class="empty">이 채널로 기록한 지출·정산이 없어요</div>') +
    (recs.length > n ? '<button type="button" data-a="ledMore" class="text-btn" style="width:100%;font-size:14px">더 보기</button>' : '') + '</div></section>';
}
function findBatch(id) {
  var all = batches(S.data.stock);
  for (var i = 0; i < all.length; i++) if (all[i].items.some(function (x) { return x.id === id; })) return all[i];
  return null;
}
function batches(rows) {
  var g = {}, order = [];
  rows.forEach(function (x) {
    var k = x.kind + '|' + x.date + '|' + (x.saleMonth || '') + '|' + (x.channel || '') + '|' + String(x.createdAt || '').slice(0, 16) + '|' + (x.kind === '입고' ? (num(x.qty) < 0 ? 'r' : 'i') : '');
    if (!g[k]) { g[k] = { kind: x.kind, date: x.date, saleMonth: x.saleMonth, channel: x.channel, created: x.createdAt || '', items: [] }; order.push(k); }
    if (x.code) g[k].items.push(x);
  });
  return order.map(function (k) { return g[k]; }).filter(function (b) { return b.items.length; })
    .sort(function (a, b) { return (b.date + b.created) < (a.date + a.created) ? -1 : 1; });
}
function logSection(logs) {
  var u = S.ui, n = u.logMore ? 40 : 6;
  var st = { '판매': ['#D6E6F9', '#1F3F66'], '입고': ['#E2F1E6', '#1E5631'], '발주': ['#FBEFC8', '#6B4E14'], '하자마케팅': ['#FCE4D8', '#6B3015'] };
  var html = logs.slice(0, n).map(function (l, i) {
    var tot = l.items.reduce(function (a, x) { return a + num(x.qty); }, 0);
    var text = l.kind === '판매' ? mLabel(l.saleMonth || l.date.slice(0, 7)) + ' 판매 ' + tot + '개' : (l.kind === '입고' && tot < 0 ? '회수 ' + Math.abs(tot) + '개' : l.items.length + '종 ' + tot + '개');
    if (l.kind === '입고' && l.channel && S.route.name !== 'channel') text = chName(l.channel) + ' · ' + text;
    var open = u.openLog === i, s = st[l.kind] || st['입고'];
    var key = l.items[0].id;
    return swipeRow(key, '<div><button type="button" data-a="openLog" data-v="' + i + '" aria-expanded="' + open + '" style="display:flex;align-items:center;gap:10px;width:100%;min-height:52px;padding:0 16px;border:0;background:transparent;text-align:left">' +
      '<span class="tag" style="background:' + s[0] + ';color:' + s[1] + '">' + (l.kind === '하자마케팅' ? '하자·마케팅' : l.kind) + '</span><span style="flex:1 1 auto;font-size:14px;font-weight:600">' + esc(text) + '</span><span class="eyebrow">' + mdLabel(l.date) + '</span><span aria-hidden="true" style="color:var(--mute);font-size:12px">' + (open ? '▲' : '▼') + '</span></button>' +
      (open ? '<div style="padding:0 16px 8px">' + l.items.map(function (x) { var q = num(x.qty); return '<div class="row" style="min-height:38px"><span style="flex:1 1 auto;color:var(--ink2)">' + catTag(x.code) + esc(prodName(x.code)) + '</span><span style="font-weight:600;color:' + (q < 0 ? 'var(--warn-ink)' : 'var(--ink)') + '">' + (q > 0 && l.kind === '입고' ? '+' : '') + q + '개</span></div>'; }).join('') + '</div>' : '') + '</div>', 'logEdit', 'logDel');
  }).join('');
  return '<section aria-label="최근 이력" style="display:flex;flex-direction:column;gap:8px"><h2 style="margin:0;padding:0 4px;font-size:19px;font-weight:700">최근 이력</h2><div class="card" style="border-radius:16px">' + (html || '<div class="empty">아직 이력이 없어요</div>') +
    (logs.length > n ? '<button type="button" data-a="logMore" class="text-btn" style="width:100%;font-size:14px">더 보기</button>' : '') + '</div></section>';
}

// ───────── 채널 추가 · 설정 ─────────
VIEWS.chset = function (r) {
  var d = D(), u = S.ui, isNew = r.id === 'new' || !d.C[r.id];
  if (!u.f) {
    var c = isNew ? { id: '', name: '', type: '위탁', color: COLORS[d.chList.length % COLORS.length], openDate: today(), fee: '', payBase: '월', payDays: 7, payMonth: 1, payDay: '말일', defaultMode: '자동', feeType: '없음', feeAmount: '', contractStart: today(), contractEnd: '', status: '운영', closeDate: '', memo: '', order: d.chList.length + 1 } : Object.assign({}, d.C[r.id]);
    u.f = c;
  }
  var f = u.f;
  var payDays = f.payBase === '일수';
  var prevM = curMonth();
  var preview = payDays ? '예: ' + mdLabel(today()) + ' 판매 등록 → ' + mdLabel(addDays(today(), num(f.payDays) || 7)) + '까지 입금' : '예: ' + mLabel(prevM) + ' 판매분 → ' + mdLabel(dueDate(f, prevM, '')) + ' 입금 예정';
  return subHead(isNew ? '채널 추가' : '채널 설정', isNew ? '#/channel' : '#/channel/' + encodeURIComponent(f.id), '<button type="button" class="text-btn" data-a="saveCh">저장</button>') +
    '<main>' +
    '<section class="card" aria-label="기본 정보"><label class="field"><span class="lbl">채널 이름</span><input id="f_name" data-m="f.name" value="' + esc(f.name) + '" placeholder="예: 위탁 매장 D"></label>' +
    '<div class="field"><span class="lbl">유형</span><div style="width:180px">' + seg([['온라인', '온라인'], ['위탁', '위탁']], f.type, 'chType') + '</div></div>' +
    '<div class="field"><span class="lbl">색상</span><div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end">' + COLORS.map(function (col) { var on = f.color === col; return '<button type="button" data-a="chColor" data-v="' + col + '" aria-pressed="' + on + '" aria-label="색상 ' + col + '" style="width:26px;height:26px;border-radius:13px;border:' + (on ? '2px solid #1D1D1F' : '2px solid transparent') + ';background:' + col + ';box-shadow:inset 0 0 0 2px #fff"></button>'; }).join('') + '</div></div>' +
    '<label class="field"><span class="lbl">입점일</span><input id="f_open" type="date" data-m="f.openDate" value="' + esc(f.openDate) + '"></label></section>' +
    '<div class="sec-title"><h2 style="font-size:17px">수수료 · 정산</h2></div>' +
    '<section class="card"><label class="field"><span class="lbl">수수료율</span><span style="display:flex;align-items:center;gap:4px;flex:1 1 auto;justify-content:flex-end"><input id="f_fee" type="number" inputmode="decimal" data-m="f.fee" value="' + esc(f.fee) + '" placeholder="0" style="max-width:80px">%</span></label>' +
    '<div class="field"><span class="lbl">입금 기준</span><div style="width:200px">' + seg([['일수', '판매 등록 후'], ['월', '판매월 기준']], f.payBase, 'payBase') + '</div></div>' +
    (payDays ? '<label class="field"><span class="lbl">입금 시점</span><span style="display:flex;align-items:center;gap:6px">판매 등록 후 <input id="f_days" type="number" inputmode="numeric" data-m="f.payDays" value="' + esc(f.payDays) + '" style="width:44px;text-align:center;border:1px solid var(--line2);border-radius:8px;height:32px;flex:0 0 auto"> 일 이내</span></label>'
      : '<div class="field"><span class="lbl">입금 시점</span><span style="display:flex;align-items:center;gap:6px">판매월 ' + selectHtml('f_pm', 'f.payMonth', [['1', '다음 달'], ['2', '다다음 달']], f.payMonth, ' style="text-align:center;border:1px solid var(--line2);border-radius:8px;height:32px;padding:0 8px;flex:0 0 auto"') + selectHtml('f_pd', 'f.payDay', [['말일', '말일'], ['5', '5일'], ['10', '10일'], ['15', '15일'], ['20', '20일'], ['25', '25일']], f.payDay, ' style="text-align:center;border:1px solid var(--line2);border-radius:8px;height:32px;padding:0 8px;flex:0 0 auto"') + '</span></div>') +
    '<div class="field" style="color:var(--mute);font-size:13px">' + esc(preview) + '</div></section>' +
    '<div class="sec-title"><h2 style="font-size:17px">주로 쓰는 판매 등록 방식</h2></div>' +
    '<section class="card"><div class="field">' + '<div style="flex:1 1 auto">' + seg([['수기', '수기 등록'], ['자동', '자동 등록']], f.defaultMode, 'defMode') + '</div></div></section>' +
    '<div class="sec-title"><h2 style="font-size:17px">입점료</h2></div>' +
    '<section class="card"><div class="field"><div style="flex:1 1 auto">' + seg([['없음', '없음'], ['매월', '매월'], ['한번에', '한 번에']], f.feeType || '없음', 'feeType') + '</div></div>' +
    (f.feeType === '매월' ? '<label class="field"><span class="lbl">매월</span><span style="display:flex;align-items:center;gap:4px">₩<input id="f_fa" type="number" inputmode="numeric" data-m="f.feeAmount" value="' + esc(f.feeAmount) + '" placeholder="0" style="max-width:120px"></span></label>' : '') +
    (f.feeType === '한번에' ? '<label class="field"><span class="lbl">낸 금액</span><span style="display:flex;align-items:center;gap:4px">₩<input id="f_fa" type="number" inputmode="numeric" data-m="f.feeAmount" value="' + esc(f.feeAmount) + '" placeholder="0" style="max-width:120px"></span></label>' +
      '<div class="field"><span class="lbl">계약 기간</span><span style="display:flex;align-items:center;gap:4px"><input id="f_cs" type="date" data-m="f.contractStart" value="' + esc(f.contractStart) + '" style="max-width:118px;font-size:13px">~<input id="f_ce" type="date" data-m="f.contractEnd" value="' + esc(f.contractEnd) + '" style="max-width:118px;font-size:13px"></span></div>' : '') +
    '</section>' +
    '<div class="sec-title"><h2 style="font-size:17px">메모</h2></div>' +
    '<section class="card" style="padding:12px"><textarea id="f_memo" class="box" rows="3" data-m="f.memo" placeholder="담당자 연락처, 진열 위치 등" style="border:0;background:transparent">' + esc(f.memo) + '</textarea></section>' +
    '<button type="button" class="btn" data-a="saveCh" style="background:#D6E6F9;color:#1F3F66">채널 저장</button>' +
    (!isNew && !isClosed(f) ? '<a href="#/chclose/' + encodeURIComponent(f.id) + '" style="text-align:center;padding:12px;color:var(--red);font-size:15px;font-weight:600">퇴점 처리</a>' : '') +
    '</main>';
};

// ───────── 퇴점 ─────────
VIEWS.chclose = function (r) {
  var d = D(), u = S.ui, c = d.C[r.id];
  if (!c) return subHead('퇴점 처리', '#/channel', '') + '<main><div class="empty">채널을 찾을 수 없어요</div></main>';
  if (u.done) {
    return subHead('퇴점 처리', '#/channel/' + encodeURIComponent(c.id), '') + '<main><section class="card pad" style="align-items:center;text-align:center;gap:10px;padding:32px 20px"><span style="width:56px;height:56px;border-radius:28px;background:var(--in-bg);color:var(--in-ink);display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:700">✓</span><b style="font-size:20px">' + esc(c.name) + ' 퇴점 완료</b><span class="muted" style="font-size:14px;line-height:1.5">' + (u.recalled ? '회수한 ' + u.recalled + '개는 작업실 재고로 옮겼어요.<br>' : '') + (u.unpaid ? '남은 정산 ' + u.unpaid + '건은 홈 TO-DO에서 계속 챙겨요.' : '') + '</span></section><a class="btn" href="#/channel/' + encodeURIComponent(c.id) + '" style="display:flex;align-items:center;justify-content:center;background:#D6E6F9;color:#1F3F66">채널로 돌아가기</a></main>';
  }
  var lastM = ''; Object.keys(d.reg[c.id] || {}).forEach(function (m) { if (m > lastM) lastM = m; });
  var stock = chStockTotal(c.id);
  var unpaid = d.settles.filter(function (s) { return s.ch === c.id && !s.done; });
  var unpaidSum = unpaid.reduce(function (a, s) { return a + s.remain; }, 0);
  if (!u.date) u.date = today();
  var item = function (ok, icon, title, sub, extra) {
    return '<div style="display:flex;gap:12px;padding:14px 16px;border-bottom:1px solid var(--line)"><span aria-hidden="true" style="flex:0 0 auto;width:24px;height:24px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;background:' + (ok ? 'var(--in-bg)' : 'var(--warn-bg)') + ';color:' + (ok ? 'var(--in-ink)' : 'var(--warn-ink)') + '">' + icon + '</span><div style="flex:1 1 auto;display:flex;flex-direction:column;gap:4px"><b style="font-size:15px">' + title + '</b><span class="eyebrow">' + sub + '</span>' + (extra || '') + '</div></div>';
  };
  return subHead('퇴점 처리', '#/chset/' + encodeURIComponent(c.id), '') + '<main>' +
    '<div style="padding:0 4px"><b style="font-size:22px">' + esc(c.name) + '</b></div>' +
    '<section class="card" aria-label="확인할 것">' +
    item(!!lastM, lastM ? '✓' : '!', '마지막 판매수량 등록', lastM ? mLabel(lastM) + '분까지 등록돼 있어요' : '등록된 판매가 없어요') +
    item(stock === 0, stock === 0 ? '✓' : '!', '남은 재고 회수', stock === 0 ? '매장에 남은 재고가 없어요' : '매장에 ' + stock + '개 남아 있어요', stock !== 0 ? '<button type="button" class="act green" data-a="recallAll" data-v="' + esc(c.id) + '" style="align-self:flex-start;margin-top:4px;padding:8px 12px">전량 회수 · ' + stock + '개</button>' : '') +
    (unpaid.length ? item(false, '!', '미정산 ' + unpaid.length + '건 · ' + won(unpaidSum), unpaid.map(function (s) { return s.label + '분'; }).join(' · ') + '. 퇴점 후에도 입금될 때까지 홈 TO-DO에 남아요') : item(true, '✓', '미정산 없음', '정산이 모두 끝났어요')) +
    '</section>' +
    '<section class="card"><label class="field"><span class="lbl">퇴점일</span><input id="cl_date" type="date" data-m="date" value="' + esc(u.date) + '"></label>' +
    '<label class="field"><span class="lbl">입점료 환불</span><span style="display:flex;align-items:center;gap:4px;flex:1 1 auto;min-width:0;justify-content:flex-end">₩<input id="cl_ref" style="width:100%;min-width:0;flex:1 1 auto" type="number" inputmode="numeric" data-m="refund" value="' + esc(u.refund || '') + '" placeholder="없으면 비워두기"></span></label></section>' +
    '<button type="button" class="btn" data-a="closeCh" data-v="' + esc(c.id) + '"' + (stock !== 0 ? ' disabled' : '') + ' style="background:#F7D8D6;color:var(--red)">' + (stock !== 0 ? '재고를 먼저 회수해 주세요' : '퇴점 처리') + '</button></main>';
};

// ───────── 등록 (판매 / 입고 · 자동 / 수기) ─────────
VIEWS.register = function (r) {
  var d = D(), u = S.ui;
  var opens = openChannels();
  if (!u.init) {
    u.init = true;
    u.kind = r.q.kind === 'in' ? 'in' : 'sale';
    u.mode = r.q.mode === 'manual' ? 'manual' : 'auto';
    u.ch = r.q.ch && d.C[r.q.ch] ? r.q.ch : (opens[0] && opens[0].id);
    u.date = today(); u.month = r.q.month || curMonth();
    u.qty = {}; u.cat = '전체'; u.q = ''; u.paste = ''; u.matched = null; u.orig = {};
    var eb = r.q.edit && findBatch(r.q.edit);
    if (eb) {
      u.editIds = eb.items.map(function (x) { return x.id; }); u.created = eb.created;
      u.kind = eb.kind === '판매' ? 'sale' : 'in'; u.mode = 'manual'; u.ch = eb.channel; u.date = eb.date; u.month = eb.saleMonth || eb.date.slice(0, 7);
      eb.items.forEach(function (x) { u.qty[x.code] = num(x.qty); u.orig[x.code] = num(x.qty); });
    }
  }
  if (u.editIds && d.C[u.ch] && opens.indexOf(d.C[u.ch]) < 0) opens = opens.concat([d.C[u.ch]]);
  var c = d.C[u.ch] || {};
  var isSale = u.kind === 'sale', online = c.type === '온라인';
  var th = isSale ? ['var(--sale-bg)', 'var(--sale-ink)'] : ['var(--in-bg)', 'var(--in-ink)'];
  var months = []; for (var i = 0; i < 6; i++) months.push(addMonths(curMonth(), -i));
  if (months.indexOf(u.month) < 0) months.push(u.month);
  var head = subHead(u.editIds ? '기록 수정' : '등록', u.editIds ? '#/channel/' + encodeURIComponent(u.ch) : '#/home', '') +
    '<main style="padding-top:8px">' + (u.editIds ? '' :
    '<div role="group" aria-label="등록 종류" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px">' + [['sale', '판매', '#D6E6F9', '#1F3F66'], ['in', '입고', '#E2F1E6', '#1E5631']].map(function (k) {
      var on = u.kind === k[0];
      return '<button type="button" data-a="regKind" data-v="' + k[0] + '" aria-pressed="' + on + '" style="min-height:48px;border:' + (on ? '1.5px solid ' + k[3] : '1px solid #E5E5EA') + ';border-radius:14px;background:' + (on ? k[2] : '#FFFFFF') + ';color:' + (on ? k[3] : '#6E6E73') + ';font-size:16px;font-weight:700">' + k[1] + '</button>';
    }).join('') + '</div>' +
    seg([['manual', '수기 등록'], ['auto', '자동 등록']], u.mode, 'regMode')) +
    '<section class="card"><label class="field"><span class="lbl">채널</span>' + selectHtml('rg_ch', 'ch', opens.map(function (x) { return [x.id, x.name]; }), u.ch) + '</label>' +
    (isSale && online ? '<label class="field"><span class="lbl">판매일</span><input id="rg_date" type="date" data-m="date" value="' + esc(u.date) + '"></label>' : '') +
    (isSale && !online ? '<label class="field"><span class="lbl">판매 월</span>' + selectHtml('rg_month', 'month', months.map(function (m) { return [m, m.slice(0, 4) + '년 ' + mLabel(m)]; }), u.month) + '</label>' : '') +
    (!isSale ? '<label class="field"><span class="lbl">입고일</span><input id="rg_date" type="date" data-m="date" value="' + esc(u.date) + '"></label>' : '') + '</section>';
  var lines = [], tq = 0, kinds = 0, back = 0, warn = '';
  function info(code, q) {
    var o = num(u.orig[code]), cs = chStockOf(u.ch, code) + (isSale ? o : -o), w = d.wsStock(code) + (isSale ? 0 : o);
    if (isSale) return '매장 ' + cs + (q ? ' → ' + (cs - q) : '');
    return '매장 ' + cs + (q ? ' → ' + (cs + q) : '') + ' · 작업실 ' + w + (q ? ' → ' + (w - q) : '');
  }
  if (u.mode === 'manual') {
    var cats = ['전체'].concat(categories());
    var qq = normTxt(u.q);
    var prods = activeProducts().filter(function (p) {
      if (u.cat !== '전체' && p.category !== u.cat) return false;
      if (qq && normTxt(p.name + p.option + p.code).indexOf(qq) < 0) return false;
      return true;
    });
    Object.keys(u.qty).forEach(function (code) { var q = num(u.qty[code]); if (q) { tq += isSale ? q : Math.max(q, 0); kinds++; if (q < 0) back += -q; if (isSale && q > chStockOf(u.ch, code)) warn = ' · 매장 재고보다 많은 제품이 있어요'; } });
    lines.push('<label class="search">' + ICON.search + '<input id="rg_q" type="search" data-m="q" data-live="1" value="' + esc(u.q) + '" placeholder="제품 검색" aria-label="제품 검색"></label>');
    lines.push(chipsHtml(cats, u.cat, 'regCat'));
    lines.push('<div class="card" style="border-radius:16px">' + (prods.length ? prods.map(function (p) {
      var q = num(u.qty[p.code]);
      return '<div class="prod"><div class="nm"><b>' + catTag(p.code) + esc(prodName(p.code)) + '</b><small>' + esc(info(p.code, q)) + '</small></div>' + stepper('qty', p.code, u.qty[p.code], prodName(p.code)) + '</div>';
    }).join('') : '<div class="empty">제품이 없어요</div>') + '</div>');
    var summary = kinds + '종 · ' + (isSale ? '판매 ' + tq + '개' : '입고 ' + tq + '개' + (back ? ' · 회수 ' + back + '개' : '')) + warn;
    var zeroOk = isSale && !online && kinds === 0;
    return head + lines.join('') + '</main>' +
      '<div class="footer-bar"><div class="sum">' + esc(summary) + '</div><button type="button" class="btn" data-a="regSave" style="background:' + th[0] + ';color:' + th[1] + '"' + (kinds || zeroOk ? '' : ' disabled') + '>' + (u.editIds ? '수정 완료' : zeroOk ? mLabel(u.month) + ' 판매 0개로 등록' : (isSale ? '판매 등록' : '입고 등록')) + '</button></div>';
  }
  // 자동
  if (!u.matched) {
    return head + '<section class="card pad" aria-label="붙여넣기" style="gap:12px"><h2>' + (isSale ? '매장 판매 내역 붙여넣기' : '입고 내역 붙여넣기') + '</h2>' +
      '<textarea id="rg_paste" class="box" rows="8" data-m="paste" placeholder="' + (isSale ? '바코드  제품명  수량\n예) 8809912340011  파우치 크림  9' : '제품명  수량\n회수는 -2 처럼 마이너스로') + '">' + esc(u.paste) + '</textarea>' +
      '<div style="display:flex;gap:8px"><button type="button" class="btn" data-a="clip" style="flex:1 1 0;background:#F2F2F7;color:var(--ink2);font-weight:600">클립보드 붙여넣기</button><button type="button" class="btn" data-a="match" style="flex:1 1 0;background:' + th[0] + ';color:' + th[1] + '">자동 매칭</button></div></section></main>';
  }
  var linked = 0, need = 0;
  var tagTxt = { code: '바코드로 연결', store: '매장 코드로 연결', name: '제품명으로 연결', need: '연결 필요', learn: '매장 코드 저장 · 다음부터 자동' };
  var rowsHtml = u.matched.map(function (m, i) {
    if (m.skip) return '';
    var q = num(m.qty);
    if (m.code) { linked++; tq += isSale ? q : Math.max(q, 0); if (q < 0) back += -q; } else need++;
    var tag = !isSale && q < 0 && m.code ? '<span class="tag back">회수</span>' : '<span class="tag ' + (m.tag === 'learn' ? 'store' : m.tag) + '">' + tagTxt[m.tag] + '</span>';
    var body = m.code
      ? '<div style="display:flex;align-items:center;gap:10px"><div class="nm" style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:2px"><b style="font-size:15px;font-weight:600">' + catTag(m.code) + esc(prodName(m.code)) + '</b><small style="font-size:12px;color:var(--mute)">' + esc(info(m.code, q)) + '</small></div>' + stepper('m', String(i), m.qty, prodName(m.code)) + '</div>'
      : '<label style="display:flex;flex-direction:column;gap:6px;font-size:13px;color:var(--warn-ink)">어떤 제품인가요? (수량 ' + q + ')' +
        selectHtml('rg_link' + i, 'link.' + i, [['', '제품 선택']].concat(activeProducts().map(function (p) { return [p.code, prodFull(p.code)]; })).concat([['skip', '이번엔 건너뛰기']]), '', ' class="box" style="min-height:40px;border:1px solid var(--line2);border-radius:10px;padding:0 10px;background:#fff"') + '</label>';
    return '<div style="display:flex;flex-direction:column;gap:8px;padding:12px 16px;border-bottom:1px solid var(--line)"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><span style="font-size:12px;color:var(--faint);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(m.src) + '</span>' + tag + '</div>' + body + '</div>';
  }).join('');
  return head + '<section class="card" aria-label="매칭 결과"><div style="display:flex;justify-content:space-between;align-items:center;padding:16px 16px 8px"><div style="display:flex;flex-direction:column;gap:2px"><h2>매칭 결과</h2><span class="eyebrow">' + linked + '건 연결' + (need ? ' · ' + need + '건 확인 필요' : '') + '</span></div><button type="button" class="act" data-a="rematch">다시 붙여넣기</button></div>' + rowsHtml + '</section>' +
    '<section class="card pad" aria-label="저장" style="gap:12px"><div style="display:flex;justify-content:space-between;font-size:14px"><span class="muted">' + (isSale ? '판매수량' : '입고수량') + '</span><b>' + tq + '개' + (back ? ' · 회수 ' + back + '개' : '') + '</b></div><div style="display:flex;justify-content:space-between;font-size:14px"><span class="muted">채널</span><b>' + esc(c.name || '') + (isSale && !online ? ' · ' + mLabel(u.month) : '') + '</b></div>' +
    '<button type="button" class="btn" data-a="regSave" style="background:' + th[0] + ';color:' + th[1] + '"' + (linked && !need ? '' : ' disabled') + '>' + (need ? '연결 필요 ' + need + '건을 골라주세요' : (isSale ? '판매 등록' : '입고 등록')) + '</button></section></main>';
};
function parsePaste(text, ch) {
  var d = D();
  var codes = S.data.codes.filter(function (c) { return c.channel === ch || c.channel === '공통'; });
  var byLabel = {}; codes.forEach(function (c) { byLabel[normTxt(c.label)] = c.code; });
  var byName = {}; activeProducts().forEach(function (p) { byName[normTxt(p.name + p.option)] = p.code; byName[normTxt(p.name + ' ' + p.option)] = p.code; if (!p.option) byName[normTxt(p.name)] = p.code; });
  var out = [];
  String(text || '').split(/\r?\n/).forEach(function (line) {
    var src = line.trim(); if (!src) return;
    var toks = src.split(/\t|,|\s{2,}|\s+(?=-?\d+\s*(개|ea)?$)/).map(function (t) { return (t || '').trim(); }).filter(function (t) { return t && t !== '개' && t !== 'ea'; });
    var qty = null, qi = -1;
    for (var i = toks.length - 1; i >= 0; i--) { var m = toks[i].replace(/개|ea/gi, '').trim(); if (/^-?\d{1,4}$/.test(m)) { qty = +m; qi = i; break; } }
    if (qty === null) { var mm = src.match(/(-?\d{1,4})\s*(개|ea)?\s*$/i); if (mm) { qty = +mm[1]; src.slice(0, mm.index); } }
    if (qty === null) return;
    var rest = toks.filter(function (_, i) { return i !== qi; });
    var token = rest.filter(function (t) { return /^[A-Za-z0-9\-]{4,}$/.test(t) && /\d/.test(t); })[0] || '';
    var label = rest.filter(function (t) { return t !== token; }).join(' ');
    var code = '', tag = 'need';
    if (token && d.P[token]) { code = token; tag = 'code'; }
    else if (token && byLabel[normTxt(token)]) { code = byLabel[normTxt(token)]; tag = 'store'; }
    else if (label && byLabel[normTxt(label)]) { code = byLabel[normTxt(label)]; tag = 'store'; }
    else if (label && byName[normTxt(label)]) { code = byName[normTxt(label)]; tag = 'name'; }
    if (code && d.P[code] && d.P[code].active === '중지') { code = ''; tag = 'need'; }
    var prev = code && out.filter(function (o) { return o.code === code && !o.skip; })[0];
    if (prev) { prev.qty = num(prev.qty) + qty; prev.src += ' / ' + line.trim(); return; }
    out.push({ src: line.trim(), token: token, label: label, qty: qty, code: code, tag: tag });
  });
  return out;
}

// ───────── 작업실 ─────────
VIEWS.stock = function () {
  var d = D(), u = S.ui;
  if (!u.cat) u.cat = '전체';
  var tot = { order: 0, dm: 0, inq: 0 };
  activeProducts().forEach(function (p) { var w = d.ws[p.code]; if (w) { tot.order += w.order; tot.dm += w.dm; tot.inq += w.inq; } });
  var qq = normTxt(u.q);
  var prods = activeProducts().filter(function (p) {
    if (u.cat === '1개 이하') { if (d.wsStock(p.code) > 1) return false; }
    else if (u.cat !== '전체' && p.category !== u.cat) return false;
    if (qq && normTxt(p.name + p.option + p.code).indexOf(qq) < 0) return false;
    return true;
  });
  var rows = prods.map(function (p) {
    var w = d.ws[p.code] || { order: 0, dm: 0, inq: 0 }, s = d.wsStock(p.code), open = u.open === p.code;
    var split = d.chList.filter(function (c) { return chStockOf(c.id, p.code) || (!isClosed(c)); }).map(function (c) {
      return '<div style="display:flex;flex-direction:column;gap:2px;padding:8px;border-radius:10px;background:#F5F5F7;min-width:0"><span style="font-size:11px;color:var(--mute);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(c.name) + '</span><b style="font-size:15px">' + chStockOf(c.id, p.code) + '</b></div>';
    }).join('');
    var inner = '<button type="button" data-a="openProd" data-v="' + esc(p.code) + '" aria-expanded="' + open + '" style="display:flex;align-items:center;gap:10px;width:100%;min-height:48px;padding:8px 16px;border:0;background:transparent;text-align:left"><span style="flex:1 1 auto;min-width:0;font-size:15px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + catTag(p.code) + esc(prodName(p.code)) + '</span><span style="font-size:15px;font-weight:700;color:' + (s <= 1 ? 'var(--warn-ink)' : 'var(--ink)') + '">' + s + '개</span></button>' +
      (open ? '<div style="padding:0 16px 6px;font-size:12px;color:var(--mute)">발주 ' + w.order + ' · 하자·마케팅 ' + w.dm + ' · 입점 ' + w.inq + ' (판매 ' + soldOf(p.code) + ')</div><div class="grid4" style="padding:0 16px 12px">' + split + '</div>' : '');
    return swipeRow(p.code, inner, 'editProd', 'delProd');
  }).join('');
  var logs = batches(S.data.stock.filter(function (x) { return x.kind === '발주' || x.kind === '하자마케팅'; }));
  return '<main class="with-nav"><header class="top"><div style="display:flex;flex-direction:column;gap:4px"><h1>작업실</h1></div><a href="#/product/new" class="act" style="padding:8px 14px;font-size:14px;background:#FFFFFF">+ 제품</a></header>' +
    '<section class="card pad" aria-label="작업실 재고"><span class="eyebrow">작업실 재고</span><span class="big">' + (tot.order - tot.dm - tot.inq) + '개</span>' +
    '<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px"><div class="box2"><small>발주</small><b>' + tot.order + '</b></div><div class="box2"><small>하자·마케팅</small><b>−' + tot.dm + '</b></div><div class="box2"><small>입점</small><b>−' + tot.inq + '</b></div></div></section>' +
    '<div class="tiles"><a class="tile" href="#/stockentry" style="background:var(--ord-bg);color:var(--ord-ink);min-height:56px"><b>발주 등록</b></a><a class="tile" href="#/register?kind=in&mode=manual" style="background:var(--in-bg);color:var(--in-ink);min-height:56px"><b>입고 등록</b></a></div>' +
    '<section aria-label="제품별 재고" style="display:flex;flex-direction:column;gap:8px"><div class="sec-title"><h2>제품</h2><span class="eyebrow">' + activeProducts().length + '종</span></div>' +
    '<label class="search">' + ICON.search + '<input id="st_q" type="search" data-m="q" data-live="1" value="' + esc(u.q || '') + '" placeholder="제품 검색" aria-label="제품 검색"></label>' +
    chipsHtml(['전체'].concat(categories()).concat(['1개 이하']), u.cat, 'stCat', function (v) { return v === '1개 이하' ? 'warn' : ''; }) +
    '<div class="card" style="border-radius:16px">' + (rows || '<div class="empty">제품이 없어요</div>') + '</div></section>' +
    logSection(logs) + '</main>' + nav('stock');
};

VIEWS.stockentry = function (r) {
  var u = S.ui, d = D();
  if (!u.init) {
    u.init = true; u.kind = '발주'; u.date = today(); u.cat = '전체'; u.qty = {}; u.orig = {};
    var eb = r.q.edit && findBatch(r.q.edit);
    if (eb) { u.editIds = eb.items.map(function (x) { return x.id; }); u.created = eb.created; u.kind = eb.kind; u.date = eb.date; eb.items.forEach(function (x) { u.qty[x.code] = num(x.qty); u.orig[x.code] = num(x.qty); }); }
  }
  var prods = activeProducts().filter(function (p) { return u.cat === '전체' || p.category === u.cat; });
  var kinds = 0, tq = 0;
  Object.keys(u.qty).forEach(function (k) { var q = num(u.qty[k]); if (q) { kinds++; tq += q; } });
  var label = u.kind === '발주' ? '발주' : '하자·마케팅';
  return subHead(u.editIds ? '기록 수정' : '발주 등록', '#/stock', '') + '<main style="padding-top:8px">' + (u.editIds ? '' : seg([['발주', '발주'], ['하자마케팅', '하자·마케팅']], u.kind, 'seKind')) +
    '<section class="card"><label class="field"><span class="lbl">날짜</span><input id="se_date" type="date" data-m="date" value="' + esc(u.date) + '"></label></section>' +
    chipsHtml(['전체'].concat(categories()), u.cat, 'seCat') +
    '<div class="card" style="border-radius:16px">' + prods.map(function (p) {
      var q = num(u.qty[p.code]), o = num(u.orig[p.code]), s = d.wsStock(p.code) - (u.kind === '발주' ? o : -o);
      var after = u.kind === '발주' ? s + q : s - q;
      return '<div class="prod"><div class="nm"><b>' + catTag(p.code) + esc(prodName(p.code)) + '</b><small>작업실 ' + s + (q ? ' → ' + after : '') + '</small></div>' + stepper('qty', p.code, u.qty[p.code], prodName(p.code)) + '</div>';
    }).join('') + '</div></main>' +
    '<div class="footer-bar"><div class="sum">' + kinds + '종 · ' + label + ' ' + tq + '개</div><button type="button" class="btn" data-a="seSave" style="background:' + (u.kind === '발주' ? 'var(--ord-bg)' : 'var(--loan-bg)') + ';color:' + (u.kind === '발주' ? 'var(--ord-ink)' : 'var(--loan-ink)') + '"' + (kinds ? '' : ' disabled') + '>' + label + (u.editIds ? ' 수정 완료' : ' 등록') + '</button></div>';
};

// ───────── 제품 추가 · 수정 ─────────
VIEWS.product = function (r) {
  var d = D(), u = S.ui, isNew = r.id === 'new' || !d.P[r.id];
  if (!u.f) u.f = isNew ? { code: '', category: categories()[0] || '', name: '', option: '', price: '', season: '', active: '사용', created: today() } : Object.assign({}, d.P[r.id]);
  var f = u.f;
  var cats = categories(); if (f.category && cats.indexOf(f.category) < 0) cats.push(f.category);
  var store = isNew ? [] : S.data.codes.filter(function (c) { return c.code === f.code; });
  return subHead(isNew ? '제품 추가' : '제품 수정', '#/stock', '<button type="button" class="text-btn" data-a="saveProd">저장</button>') + '<main>' +
    '<div class="sec-title"><h2 style="font-size:17px">카테고리</h2></div>' +
    '<div style="display:flex;flex-wrap:wrap;gap:8px">' + cats.map(function (c) { return '<button type="button" class="chip' + (f.category === c ? ' on' : '') + '" data-a="pCat" data-v="' + esc(c) + '">' + esc(c) + '</button>'; }).join('') +
    (u.newCat ? '<input id="p_newcat" class="box" data-m="newCatName" value="' + esc(u.newCatName || '') + '" placeholder="새 카테고리 이름" style="width:160px;min-height:36px;border-radius:18px"><button type="button" class="chip on" data-a="addCat">추가</button>' : '<button type="button" class="chip" data-a="newCat" style="color:var(--blue)">+ 새 카테고리</button>') + '</div>' +
    '<div class="sec-title"><h2 style="font-size:17px">제품 정보</h2></div>' +
    '<section class="card"><div class="field"><span class="lbl">제품코드</span><input id="p_code" data-m="f.code" value="' + esc(f.code) + '" placeholder="바코드 번호"' + (isNew ? '' : ' readonly style="color:var(--mute)"') + '>' + (isNew ? '<button type="button" class="icon-btn" data-a="scan" aria-label="바코드 스캔" style="width:36px;height:36px;background:#F2F2F7;border-radius:10px">' + ICON.scan + '</button>' : '') + '</div>' +
    (u.scanning ? '<div style="padding:0 16px 12px"><video id="scanVideo" class="scan" playsinline muted></video><button type="button" class="text-btn" data-a="stopScan" style="width:100%">스캔 닫기</button></div>' : '') +
    '<label class="field"><span class="lbl">제품명</span><input id="p_name" data-m="f.name" value="' + esc(f.name) + '" placeholder="예: 펠트 키링"></label>' +
    '<label class="field"><span class="lbl">옵션</span><input id="p_opt" data-m="f.option" value="' + esc(f.option) + '" placeholder="색상 · 디자인 (선택)"></label>' +
    '<label class="field"><span class="lbl">판매가</span><span style="display:flex;align-items:center;gap:4px;flex:1 1 auto;justify-content:flex-end">₩<input id="p_price" type="number" inputmode="numeric" data-m="f.price" value="' + esc(f.price) + '" placeholder="0" style="max-width:140px"></span></label></section>' +
    (isNew ? '' : '<div class="sec-title"><h2 style="font-size:17px">매장 자체 바코드</h2></div><section class="card">' + (store.length ? store.map(function (s, i) { return '<div class="field"><span class="lbl" style="color:var(--mute);font-size:14px">' + esc(s.channel === '공통' ? '공통' : chName(s.channel)) + '</span><span style="flex:1 1 auto;text-align:right;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(s.label) + '</span><button type="button" class="icon-btn" data-a="delCode" data-v="' + i + '" aria-label="' + esc(s.label) + ' 삭제" style="width:32px;height:32px;color:var(--mute)">×</button></div>'; }).join('') : '<div class="empty">아직 없어요</div>') + '</section>') +
    '<button type="button" class="btn" data-a="saveProd" style="background:#D6E6F9;color:#1F3F66">제품 저장</button></main>';
};
var scanStream = null, scanTimer = null, zxReader = null;
function stopScan() {
  if (scanTimer) { clearInterval(scanTimer); scanTimer = null; }
  if (zxReader) { try { zxReader.reset(); } catch (e) {} zxReader = null; }
  if (scanStream) { scanStream.getTracks().forEach(function (t) { t.stop(); }); scanStream = null; }
}
function startScan() {
  var v = document.getElementById('scanVideo'); if (!v) return;
  function found(code) { stopScan(); S.ui.f.code = code; S.ui.scanning = false; render(); toast('바코드를 읽었어요'); }
  if ('BarcodeDetector' in window) {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(function (st) {
      scanStream = st; v.srcObject = st; v.play();
      var det = new window.BarcodeDetector();
      scanTimer = setInterval(function () { det.detect(v).then(function (r) { if (r && r[0]) found(r[0].rawValue); }).catch(function () {}); }, 300);
    }).catch(function () { S.ui.scanning = false; render(); toast('카메라를 열 수 없어요'); });
    return;
  }
  var load = window.ZXing ? Promise.resolve() : new Promise(function (ok, no) { var s = document.createElement('script'); s.src = 'https://unpkg.com/@zxing/library@0.21.3/umd/index.min.js'; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
  load.then(function () {
    zxReader = new window.ZXing.BrowserMultiFormatReader();
    zxReader.decodeFromVideoDevice(undefined, 'scanVideo', function (res) { if (res) found(res.getText()); });
  }).catch(function () { S.ui.scanning = false; render(); toast('스캔을 지원하지 않는 브라우저예요'); });
}

// ───────── 정산 (가계부 기록) ─────────
VIEWS.book = function (r) {
  var d = D(), u = S.ui;
  if (!u.init) {
    u.init = true; u.type = 'expense'; u.sub = { expense: 'extra', income: 'settle', loan: 'take', personal: 'in' };
    u.cat = '물류비'; u.ch = ''; u.amt = ''; u.memo = ''; u.date = today(); u.settle = ''; u.editId = null;
    u.filter = '전체'; u.filter2 = '전체'; u.q = ''; u.limit = 60;
    if (r.q.pay) { u.type = 'income'; u.sub.income = 'settle'; u.ch = r.q.pay; u.settle = r.q.month || ''; u.amt = r.q.amt || ''; }
  }
  var th = THEMES[u.type];
  var subDefs = { expense: [['make', '제작 비용'], ['extra', '부가 비용']], income: [['settle', '정산 입금'], ['etc', '기타 수입']], loan: [['take', '대출 받기'], ['repay', '대출 갚기'], ['interest', '이자 발생']], personal: [['in', '투자금 넣기'], ['out', '투자금 가져가기']] };
  var curSub = u.sub[u.type];
  var isSettle = u.type === 'income' && curSub === 'settle';
  var needCh = isSettle || (u.type === 'expense' && curSub === 'extra');
  var chOpts = isSettle ? d.chList.map(function (c) { return [c.id, (isClosed(c) ? '(퇴점) ' : '') + c.name]; }) : [['', '없음']].concat(d.chList.filter(function (c) { return !isClosed(c) || c.id === u.ch; }).map(function (c) { return [c.id, (isClosed(c) ? '(퇴점) ' : '') + c.name]; }));
  if (isSettle && !u.ch && d.chList[0]) u.ch = d.chList[0].id;
  var settleOpts = [];
  if (isSettle) {
    var editing = u.editId && S.data.ledger.filter(function (x) { return x.id === u.editId; })[0];
    d.settles.filter(function (s) { return s.ch === u.ch && (!s.done || s.key === u.settle || (editing && editing.settleMonth === s.key)); })
      .sort(function (a, b) { return a.key < b.key ? 1 : -1; })
      .forEach(function (s) { settleOpts.push([s.key, s.label + '분 · 예상 ' + won(s.done ? s.expected : (s.remain || s.expected)) + (s.done ? ' · 완료' : '')]); });
    if (!settleOpts.length) settleOpts.push(['', '들어올 정산 없음']);
    if (!u.settle || !settleOpts.some(function (o) { return o[0] === u.settle; })) u.settle = settleOpts[0][0];
  }
  var a = num(u.amt), ready = a > 0 && (!isSettle || u.settle);
  var eff = { acct: 0, loan: 0, personal: 0 };
  if (u.type === 'income') eff.acct = a;
  if (u.type === 'expense' || u.type === 'salary') eff.acct = -a;
  if (u.type === 'loan') { if (curSub === 'take') { eff.loan = a; eff.acct = a; } if (curSub === 'repay') { eff.loan = -a; eff.acct = -a; } if (curSub === 'interest') eff.loan = a; }
  if (u.type === 'personal') { if (curSub === 'in') { eff.loan = -a; eff.personal = a; } else { eff.loan = a; eff.personal = -a; } }
  var sgn = function (v) { return (v > 0 ? '+' : '−') + '₩' + Math.abs(v).toLocaleString('ko-KR'); };
  var effects = [];
  if (u.type === 'loan' || u.type === 'personal') {
    effects.push(eff.acct ? ['사업계좌 ' + sgn(eff.acct), 'var(--ink)'] : ['사업계좌 변화 없음', 'var(--faint)']);
    effects.push(['마이너스통장 잔액 ' + (eff.loan ? sgn(-eff.loan) : '변화 없음'), eff.loan ? 'var(--ink)' : 'var(--faint)']);
    if (u.type === 'personal') effects.push(['개인투자금 ' + sgn(-eff.personal), 'var(--ink)']);
    if (curSub === 'interest') effects.push(['부가 비용 · 대출이자로 함께 기록', '#6B3015']);
  }
  var subName = (subDefs[u.type] || []).filter(function (s) { return s[0] === curSub; }).map(function (s) { return s[1]; })[0];
  var title = u.type === 'expense' ? u.cat : (u.type === 'salary' ? '급여' : subName);
  var editRec = u.editId && S.data.ledger.filter(function (x) { return x.id === u.editId; })[0];
  var entry = '<section id="entry" class="card" aria-label="가계부 기록" style="box-shadow:' + (editRec ? '0 0 0 2px #F5C76B' : 'none') + '">' +
    (editRec ? '<div style="display:flex;align-items:center;gap:8px;padding:12px 16px;background:#FFF6E5;color:#8A5A00;font-size:14px;font-weight:600">기록 수정 · ' + esc(mdLabel(editRec.date) + ' ' + recTitle(editRec)) + '</div>' : '') +
    '<div style="padding:12px 12px 0">' + '<div class="seg" role="group" aria-label="기록 종류">' + ['expense', 'income', 'loan', 'personal', 'salary'].map(function (k) { var on = u.type === k, t = THEMES[k]; return '<button type="button" data-a="bType" data-v="' + k + '" aria-pressed="' + on + '" style="background:' + (on ? t.soft : 'transparent') + ';color:' + (on ? t.ink : 'var(--mute)') + ';font-weight:' + (on ? 700 : 500) + ';box-shadow:none">' + t.name + '</button>'; }).join('') + '</div></div>' +
    '<div style="display:flex;flex-direction:column;gap:6px;padding:16px 16px 8px"><div style="display:flex;justify-content:space-between;align-items:center"><span class="eyebrow">' + th.name + ' 금액</span><input id="bk_date" type="date" data-m="date" value="' + esc(u.date) + '" aria-label="날짜" style="border:0;background:transparent;font-size:14px;color:var(--mute);text-align:right"></div>' +
    '<label style="display:flex;align-items:baseline;gap:6px"><span style="font-size:28px;font-weight:700;color:' + (a ? 'var(--ink)' : 'var(--ghost)') + '">₩</span><input id="bk_amt" type="text" inputmode="numeric" data-m="amt" data-live="1" data-money="1" aria-label="금액" placeholder="0" value="' + (a ? a.toLocaleString('ko-KR') : '') + '" style="flex:1 1 auto;min-width:0;border:0;background:transparent;font-size:34px;font-weight:700;letter-spacing:-0.03em"></label></div>' +
    (subDefs[u.type] ? '<div style="display:flex;flex-direction:column;gap:10px;padding:4px 16px 12px">' + seg(subDefs[u.type], curSub, 'bSub') +
      (u.type === 'expense' ? chipsHtml(curSub === 'make' ? MAKE_CATS : EXTRA_CATS, u.cat, 'bCat') : '') + '</div>' : '') +
    (needCh ? '<label class="field"><span class="lbl">채널</span>' + selectHtml('bk_ch', 'ch', chOpts, u.ch) + '</label>' : '') +
    (isSettle ? '<label class="field"><span class="lbl">정산 건</span>' + selectHtml('bk_settle', 'settle', settleOpts, u.settle) + '</label>' : '') +
    '<label class="field"><span class="lbl">내용</span><input id="bk_memo" data-m="memo" value="' + esc(u.memo) + '" placeholder="선택"></label>' +
    (effects.length ? '<div style="display:flex;flex-wrap:wrap;gap:6px 12px;padding:10px 16px;border-top:1px solid var(--line);font-size:13px">' + effects.map(function (e) { return '<span style="color:' + e[1] + '">' + e[0] + '</span>'; }).join('') + '</div>' : '') +
    '<div style="display:flex;gap:8px;padding:6px 16px 16px">' + (editRec ? '<button type="button" data-a="bCancel" style="flex:0 0 96px;min-height:50px;border:1px solid var(--line2);border-radius:14px;background:#FFFFFF;font-size:16px;font-weight:600">취소</button>' : '') +
    '<button type="button" class="btn" data-a="bSave"' + (ready ? '' : ' disabled') + ' style="flex:1 1 auto;background:' + th.soft + ';color:' + th.ink + '">' + (editRec ? '수정 완료' : (ready ? esc(title) + ' ' + won(a) + ' 기록' : '기록')) + '</button></div></section>';
  // 기록 목록
  var sub2Map = { '지출': ['전체', '공임비', '부자재', '제품포장', '물류비', '운영비', '홍보', '대출이자', 'etc'], '수입': ['전체', '정산 입금', '기타 수입'], '대출': ['전체', '대출 받기', '대출 갚기', '이자 발생'], '투자': ['전체', '투자금 넣기', '투자금 가져가기'] };
  var qq = String(u.q || '').trim().toLowerCase().replace(/,/g, '');
  var recs = S.data.ledger.slice().sort(function (x, y) { return (y.date + (y.createdAt || '') + y.id) < (x.date + (x.createdAt || '') + x.id) ? -1 : 1; }).filter(function (x) {
    if (u.filter !== '전체' && x.type !== u.filter) return false;
    if (sub2Map[u.filter] && u.filter2 !== '전체' && recTitle(x) !== u.filter2) return false;
    if (qq) { var hay = [x.type, recTitle(x), chName(x.channel), x.memo, String(x.amount), x.settleMonth ? keyLabel(x.settleMonth) + '분' : ''].join(' ').toLowerCase(); if (hay.indexOf(qq) < 0) return false; }
    return true;
  });
  var list = recs.slice(0, u.limit).map(function (x) {
    var c = CHIP[x.type] || CHIP['급여'], v = recAmt(x), noAcct = v === null;
    var sub = [chName(x.channel), x.sub === '정산입금' && x.settleMonth ? keyLabel(x.settleMonth) + '분' : '', x.memo].filter(function (s) { return s; }).join(' · ');
    var inner = '<div style="display:flex;align-items:center;gap:10px;min-height:60px;padding:8px 16px;background:' + (u.editId === x.id ? '#FFF6E5' : '#FFFFFF') + ';opacity:' + (u.editId && u.editId !== x.id ? 0.55 : 1) + '"><span style="flex:0 0 40px;font-size:12px;color:var(--mute)">' + esc(x.date.slice(5).replace('-', '.')) + '</span><span class="tag" style="background:' + c[0] + ';color:' + c[1] + '">' + esc(x.type) + '</span><span style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:2px"><span style="font-size:15px;font-weight:600">' + esc(recTitle(x)) + '</span>' + (sub ? '<span style="font-size:12px;color:var(--mute);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(sub) + '</span>' : '') + '</span><span style="flex:0 0 auto;font-size:15px;font-weight:600;color:' + (noAcct ? 'var(--ghost)' : (v > 0 ? 'var(--green)' : 'var(--ink)')) + '">' + (noAcct ? won(num(x.amount)) : signWon(v)) + '</span></div>';
    return swipeRow(x.id, inner, 'bEdit', 'bDel');
  }).join('');
  return '<main class="with-nav"><header class="top"><h1>정산</h1></header>' +
    '<a href="#/ledger" aria-label="예상 카드잔액 · 가계부로 이동" style="display:flex;justify-content:space-between;align-items:center;gap:8px;min-height:44px;padding:0 16px;border-radius:14px;background:#EEE8F8;color:var(--ink)"><span style="font-size:13px;color:#4A4458">예상 카드잔액</span><span style="font-size:16px;font-weight:700">' + won(d.L.card) + '</span></a>' + entry +
    '<section aria-label="기록" style="display:flex;flex-direction:column;gap:8px"><h2 style="margin:0;padding:0 4px;font-size:19px;font-weight:700">기록</h2>' +
    '<label class="search">' + ICON.search + '<input id="bk_q" type="search" data-m="q" data-live="1" value="' + esc(u.q) + '" placeholder="메모 · 카테고리 · 채널 · 금액 검색" aria-label="기록 검색"></label>' +
    '<div style="display:flex;gap:8px"><label style="flex:1 1 0;display:flex">' + selectHtml('bk_f1', 'filter', ['전체', '지출', '수입', '대출', '투자', '급여'], u.filter, ' aria-label="분류" class="fsel" style="font-weight:600;color:var(--ink)"') + '</label>' +
    '<label style="flex:1 1 0;display:flex">' + selectHtml('bk_f2', 'filter2', sub2Map[u.filter] || ['세부 없음'], sub2Map[u.filter] ? u.filter2 : '세부 없음', ' aria-label="세부 분류" class="fsel" style="' + (sub2Map[u.filter] ? 'background:#FFFFFF;color:var(--ink)' : 'background:#EDEDF0;color:var(--faint)') + '"' + (sub2Map[u.filter] ? '' : ' disabled')) + '</label></div>' +
    '<div style="display:flex;justify-content:space-between;padding:2px 4px 0;font-size:13px;color:var(--mute)"><span>' + recs.length + '건</span></div>' +
    '<div class="card" style="border-radius:16px">' + (list || '<div class="empty">기록이 없어요</div>') + (recs.length > u.limit ? '<button type="button" data-a="bMore" class="text-btn" style="width:100%;font-size:14px">더 보기</button>' : '') + '</div></section></main>' + nav('book');
};
function recTitle(x) {
  if (x.type === '지출') return x.category || '지출';
  if (x.type === '급여') return '급여';
  return SUB_TITLE[x.sub] || x.sub || x.type;
}
function recAmt(x) {
  var a = num(x.amount);
  if (x.type === '수입') return a;
  if (x.type === '지출' || x.type === '급여') return -a;
  if (x.type === '대출') return x.sub === '받기' ? a : (x.sub === '갚기' ? -a : null);
  return null;
}
function bookRecord(u) {
  var d = D(), curSub = u.sub[u.type], a = num(u.amt);
  var rec = { id: u.editId || uid('L'), date: u.date || today(), type: THEMES[u.type].name, sub: '', category: '', channel: '', settleMonth: '', settleDone: false, amount: a, memo: u.memo || '' };
  if (u.editId) { var old = S.data.ledger.filter(function (x) { return x.id === u.editId; })[0]; if (old) rec.createdAt = old.createdAt; }
  if (u.type === 'expense') { rec.sub = curSub === 'make' ? '제작비용' : '부가비용'; rec.category = u.cat; if (curSub === 'extra') rec.channel = u.ch || ''; }
  if (u.type === 'income') {
    if (curSub === 'settle') {
      rec.sub = '정산입금'; rec.channel = u.ch; rec.settleMonth = u.settle;
      var s = d.settles.filter(function (x) { return x.ch === u.ch && x.key === u.settle; })[0];
      var before = s ? s.paid - (u.editId ? num((S.data.ledger.filter(function (x) { return x.id === u.editId; })[0] || {}).amount) : 0) : 0;
      rec.settleDone = !!s && before + a >= s.expected * 0.9;
    } else rec.sub = '기타수입';
  }
  if (u.type === 'loan') { rec.sub = { take: '받기', repay: '갚기', interest: '이자발생' }[curSub]; if (curSub === 'interest') rec.category = '대출이자'; }
  if (u.type === 'personal') rec.sub = curSub === 'in' ? '넣기' : '가져가기';
  return rec;
}

// ───────── 가계부 요약 ─────────
VIEWS.ledger = function () {
  var d = D(), L = d.L, u = S.ui;
  if (u.debtOpen == null) { u.debtOpen = true; u.payOpen = true; }
  var oq = d.orderQty || 0;
  function group(title, cats) {
    var total = 0; cats.forEach(function (c) { total += L.cats[c] || 0; });
    var max = Math.max.apply(null, cats.map(function (c) { return L.cats[c] || 0; }).concat([1]));
    return '<section class="card pad" aria-label="' + title + '"><div style="display:flex;justify-content:space-between;align-items:baseline"><h2>' + title + '</h2><b style="font-size:17px">' + won(total) + '</b></div>' +
      '<span class="eyebrow">개당 ' + (oq ? won(Math.round(total / oq)) : '-') + ' · 발주 총수량 ' + oq + '개 기준</span>' +
      cats.map(function (c) { var v = L.cats[c] || 0; return '<div style="display:flex;flex-direction:column;gap:6px"><div style="display:flex;justify-content:space-between;font-size:14px"><span>' + c + '</span><span><strong>' + won(v) + '</strong> <span class="muted">· 개당 ' + (oq ? won(Math.round(v / oq)) : '-') + '</span></span></div><div style="height:6px;border-radius:3px;background:#F2F2F7"><div style="height:100%;width:' + Math.round(v / max * 100) + '%;border-radius:3px;background:' + (title === '제작 비용' ? '#8DB8EA' : '#A8D5B5') + '"></div></div></div>'; }).join('') + '</section>';
  }
  var profit = L.settled + L.etcInc - L.spent;
  var sal = L.salaries.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
  return '<main class="with-nav"><header class="top"><div style="display:flex;flex-direction:column;gap:4px"><span class="eyebrow">누적</span><h1>가계부</h1></div></header>' +
    '<section class="card pad" aria-label="예상 카드잔액" style="background:#EEE8F8;gap:12px"><span style="font-size:13px;color:#4A4458">예상 카드잔액 · 사업계좌</span><span style="font-size:34px;font-weight:700;letter-spacing:-0.03em">' + won(L.card) + '</span>' +
    '<div style="display:flex;flex-direction:column;gap:8px;padding-top:10px;border-top:1px solid #DDD3F0">' +
    '<div style="display:flex;justify-content:space-between;font-size:13px"><span style="color:#4A4458"><span style="display:inline-block;width:16px;font-weight:700;color:var(--ink)">−</span>마이너스통장(대출)</span><span>' + won(L.loan) + '</span></div>' +
    '<div style="display:flex;justify-content:space-between;font-size:13px"><span style="color:#4A4458"><span style="display:inline-block;width:16px;font-weight:700;color:var(--ink)">−</span>개인투자금</span><span>' + won(L.personal) + '</span></div></div>' +
    '<div style="display:flex;justify-content:space-between;align-items:baseline;padding-top:10px;border-top:1px solid #DDD3F0"><span style="font-size:14px;font-weight:700">출금 가능 금액</span><span style="font-size:18px;font-weight:700">' + won(L.card - L.loan - L.personal) + '</span></div></section>' +
    '<section class="card pad" aria-label="손익"><div style="display:flex;flex-direction:column;gap:4px"><span class="eyebrow">순수익 · 총매출 − 총사용금액</span><span style="font-size:30px;font-weight:700;letter-spacing:-0.02em;color:var(--green)">' + won(profit) + '</span></div>' +
    '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px"><div class="box2"><small>총매출 · 입금 기준</small><b style="font-size:15px;font-weight:600">' + won(L.settled + L.etcInc) + '</b></div><div class="box2"><small>총사용금액</small><b style="font-size:15px;font-weight:600">' + won(L.spent) + '</b></div></div></section>' +
    '<section class="card" aria-label="대출금"><button type="button" data-a="tDebt" aria-expanded="' + u.debtOpen + '" style="display:flex;justify-content:space-between;align-items:center;gap:8px;min-height:60px;padding:0 16px;border:0;background:transparent;text-align:left"><span style="font-size:17px;font-weight:700">대출금</span><span style="display:flex;align-items:center;gap:10px"><span style="font-size:17px;font-weight:700">' + won(-(L.loan + L.personal)) + '</span><span aria-hidden="true" style="color:var(--mute);font-size:12px">' + (u.debtOpen ? '▲' : '▼') + '</span></span></button>' +
    (u.debtOpen ? '<div style="padding:0 16px 8px"><div class="row" style="border-top:1px solid rgba(0,0,0,0.07)"><span style="flex:1 1 auto;color:var(--ink2)">마이너스통장(대출)</span><span style="font-weight:600">' + won(-L.loan) + '</span></div><div class="row" style="border-top:1px solid rgba(0,0,0,0.07)"><span style="flex:1 1 auto;color:var(--ink2)">개인투자금</span><span style="font-weight:600">' + won(-L.personal) + '</span></div></div>' : '') + '</section>' +
    '<section class="card" aria-label="급여 지출 내역"><button type="button" data-a="tPay" aria-expanded="' + u.payOpen + '" style="display:flex;justify-content:space-between;align-items:center;gap:8px;min-height:60px;padding:0 16px;border:0;background:transparent;text-align:left"><span style="font-size:17px;font-weight:700">급여 지출 내역</span><span style="display:flex;align-items:center;gap:10px"><span style="font-size:17px;font-weight:700">' + won(L.salary) + '</span><span aria-hidden="true" style="color:var(--mute);font-size:12px">' + (u.payOpen ? '▲' : '▼') + '</span></span></button>' +
    (u.payOpen && sal.length ? '<div style="padding:0 16px 8px">' + sal.map(function (s) { return '<div class="row" style="border-top:1px solid rgba(0,0,0,0.07)"><span style="flex:1 1 auto;color:var(--ink2)">' + esc(s.date.replace(/-/g, '.')) + '</span><span style="font-weight:600">' + won(num(s.amount)) + '</span></div>'; }).join('') + '</div>' : '') + '</section>' +
    group('제작 비용', MAKE_CATS) + group('부가 비용', ['운영비', '물류비', '홍보', '대출이자', 'etc']) +
    '<a href="#/settings" style="text-align:center;padding:8px;font-size:13px;color:var(--faint)">PIN 변경</a>' +
    '</main>' + nav('ledger');
};

// ───────── 연결 설정 ─────────
function keypad(st, title, act, withHead) {
  var n = Math.max(4, st.pin.length);
  var dots = '';
  for (var i = 0; i < n; i++) dots += '<span style="width:14px;height:14px;border-radius:7px;' + (i < st.pin.length ? 'background:var(--ink)' : 'border:1.5px solid var(--ghost)') + '"></span>';
  var key = function (v, label, extra) { return '<button type="button" data-a="' + act + '" data-v="' + v + '" aria-label="' + (label || v) + '" style="height:68px;border:0;border-radius:34px;background:' + (extra ? 'transparent' : '#FFFFFF') + ';font-size:' + (extra ? '16px' : '28px') + ';font-weight:' + (extra ? 600 : 500) + ';color:' + (v === 'ok' ? 'var(--blue)' : 'var(--ink)') + '">' + (label || v) + '</button>'; };
  return '<main style="align-items:center;justify-content:center;gap:28px;min-height:' + (withHead ? 'calc(100vh - 56px)' : '100vh') + '">' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:18px"><b style="font-size:20px">' + (st.busy ? '<span class="spin"></span>확인 중' : title) + '</b>' +
    '<div class="' + (st.shake ? 'shake' : '') + '" style="display:flex;gap:16px;height:16px;align-items:center">' + dots + '</div>' +
    '<span style="font-size:13px;color:var(--red);min-height:18px">' + esc(st.err || '') + '</span></div>' +
    '<div style="display:grid;grid-template-columns:repeat(3,68px);gap:16px 24px">' +
    ['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(function (k) { return key(k); }).join('') +
    key('ok', '확인', true) + key('0') + key('del', '⌫', true) + '</div>';
}
VIEWS.settings = function () {
  var u = S.ui;
  if (u.pin == null) u.pin = '';
  return (S.data ? subHead('PIN 변경', '#/ledger', '') : '') + keypad(u, 'PIN 입력', 'pinKey', !!S.data) +
    (S.data ? '<button type="button" data-a="reload" class="text-btn" style="font-size:14px;color:var(--faint)">시트에서 다시 불러오기</button>' : '') + '</main>';
};
VIEWS.lock = function () { return keypad(S.lk, 'PIN 입력', 'lockKey', false) + '</main>'; };

// ───────── 이벤트 ─────────
function setPath(obj, path, val) { var p = path.split('.'); var o = obj; for (var i = 0; i < p.length - 1; i++) o = o[p[i]] || (o[p[i]] = {}); o[p[p.length - 1]] = val; }
document.addEventListener('input', function (e) {
  var el = e.target;
  if (el.dataset.q) { qtySet(el.dataset.q, el.dataset.c, el.value); return; }
  if (el.dataset.m) {
    var v = el.value; if (el.dataset.money) v = String(v).replace(/[^0-9]/g, '');
    setPath(S.ui, el.dataset.m, v);
    if (el.dataset.live) render();
  }
});
document.addEventListener('change', function (e) {
  var el = e.target;
  if (el.dataset.q) { qtySet(el.dataset.q, el.dataset.c, el.value); render(); return; }
  if (!el.dataset.m) return;
  var m = el.dataset.m;
  if (m.indexOf('link.') === 0) { linkPick(+m.slice(5), el.value); return; }
  setPath(S.ui, m, el.value);
  if (m === 'filter') S.ui.filter2 = '전체';
  if (m === 'ch' && S.route.name === 'book') S.ui.settle = '';
  if (m === 'ch' && S.route.name === 'register' && S.ui.matched) S.ui.matched = parsePaste(S.ui.paste, S.ui.ch);
  // 글자 입력칸은 다시 그리지 않음 (다른 칸으로 옮겨갈 때 끊기지 않게)
  if (el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && /^(text|password|search)$/.test(el.type))) return;
  render();
});
function qtySet(key, code, v) {
  var n = String(v).trim() === '' ? '' : parseInt(v, 10) || 0;
  if (key === 'm') S.ui.matched[+code].qty = n === '' ? 0 : n;
  else S.ui.qty[code] = n;
  if (S.route.name === 'register' || S.route.name === 'stockentry') render();
}
function linkPick(i, code) {
  var m = S.ui.matched[i]; if (!m) return;
  if (code === 'skip') m.skip = true;
  else if (code) { m.code = code; m.tag = 'learn'; m.learn = true; }
  render();
}
var swipeX = null, swipeKey = null, swiped = false;
document.addEventListener('pointerdown', function (e) { var f = e.target.closest('[data-sw]'); if (f) { swipeX = e.clientX; swipeKey = f.dataset.sw; } swiped = false; });
document.addEventListener('pointerup', function (e) {
  if (swipeX == null) return;
  var dx = e.clientX - swipeX, key = swipeKey; swipeX = null;
  if (dx < -30) { S.swiped = key; swiped = true; render(); }
  else if (dx > 30 && S.swiped) { S.swiped = null; swiped = true; render(); }
});
document.addEventListener('click', function (e) {
  if (swiped) { swiped = false; e.preventDefault(); e.stopPropagation(); return; }
  var el = e.target.closest('[data-a]');
  if (!el) { if (S.swiped && !e.target.closest('.swipe')) { S.swiped = null; render(); } return; }
  var fn = ACT[el.dataset.a]; if (!fn) return;
  e.preventDefault();
  if (S.swiped && el.dataset.a !== 'bEdit' && el.dataset.a !== 'bDel' && el.dataset.a !== 'editProd' && el.dataset.a !== 'delProd') { S.swiped = null; }
  fn(el.dataset.v, el);
}, true);

var ACT = {
  undo: function () { var t = S.toast; S.toast = null; if (t && t.undo) t.undo(); render(); },
  homePrev: function () { if (S.ui.mi > 0) { S.ui.mi--; render(); } },
  homeNext: function () { if (S.ui.mi < 5) { S.ui.mi++; render(); } },
  homeMonth: function (v) { S.ui.mi = +v; render(); },
  chMenu: function () { S.ui.menu = !S.ui.menu; render(); },
  pickCh: function (v) { go('channel/' + encodeURIComponent(v)); },
  openCat: function (v) { S.ui.openCat = S.ui.openCat === v ? null : v; render(); },
  toggleLow: function () { S.ui.low = !S.ui.low; render(); },
  openLog: function (v) { S.ui.openLog = S.ui.openLog === +v ? null : +v; render(); },
  logMore: function () { S.ui.logMore = true; render(); },
  openLow: function (v) { S.ui.openLow = S.ui.openLow === v ? null : v; render(); },
  logEdit: function (v) {
    var b = findBatch(v); if (!b) return; S.swiped = null;
    if (b.kind === '발주' || b.kind === '하자마케팅') go('stockentry?edit=' + encodeURIComponent(v));
    else go('register?mode=manual&edit=' + encodeURIComponent(v));
  },
  logDel: function (v) {
    var b = findBatch(v); if (!b) return; S.swiped = null;
    var rows = b.items.map(function (x) { return Object.assign({}, x); });
    removeRows('stock', rows.map(function (x) { return x.id; }));
    toast('기록을 삭제했어요', function () { saveRows('stock', rows); });
  },
  ledMore: function () { S.ui.ledMore = true; render(); },
  reopen: function (v) { var c = Object.assign({}, D().C[v], { status: '운영', closeDate: '' }); saveRow('channels', c); toast('채널을 다시 열었어요'); render(); },
  chType: function (v) { var f = S.ui.f; f.type = v; f.payBase = v === '온라인' ? '일수' : '월'; f.defaultMode = v === '온라인' ? '수기' : '자동'; render(); },
  chColor: function (v) { S.ui.f.color = v; render(); },
  payBase: function (v) { S.ui.f.payBase = v; render(); },
  defMode: function (v) { S.ui.f.defaultMode = v; render(); },
  feeType: function (v) { S.ui.f.feeType = v; render(); },
  saveCh: function () {
    var f = Object.assign({}, S.ui.f); f.name = String(f.name || '').trim();
    if (!f.name) { toast('채널 이름을 적어주세요'); return; }
    if (!f.id) { var base = f.name.replace(/\s+/g, ''), id = base, n = 2; while (D().C[id]) id = base + n++; f.id = id; }
    ['fee', 'payDays', 'payMonth', 'feeAmount', 'order'].forEach(function (k) { f[k] = f[k] === '' ? '' : num(f[k]); });
    saveRow('channels', f); toast('채널을 저장했어요'); go('channel/' + encodeURIComponent(f.id));
  },
  recallAll: function (v) {
    var cs = D().chStock[v] || {}, rows = [], t = today(), at = new Date().toISOString().slice(0, 16).replace('T', ' '), sum = 0;
    Object.keys(cs).forEach(function (code) { if (code && cs[code] > 0) { rows.push({ id: uid('S'), date: t, kind: '입고', channel: v, code: code, qty: -cs[code], saleMonth: '', memo: '퇴점 회수', createdAt: at }); sum += cs[code]; } });
    if (!rows.length) return;
    S.ui.recalled = sum; saveRows('stock', rows); toast(sum + '개를 작업실로 회수했어요'); render();
  },
  closeCh: function (v) {
    var d = D(), c = Object.assign({}, d.C[v], { status: '퇴점', closeDate: S.ui.date || today() });
    saveRow('channels', c);
    var ref = num(S.ui.refund);
    // 입점료 환불: 그 채널 운영비에서 빠지도록 마이너스 지출로 기록 (환불 받은 날 = 오늘)
    if (ref > 0) saveRow('ledger', { id: uid('L'), date: today(), type: '지출', sub: '부가비용', category: '운영비', channel: v, settleMonth: '', settleDone: false, amount: -ref, memo: '입점료 환불' });
    S.ui.unpaid = D().settles.filter(function (s) { return s.ch === v && !s.done; }).length;
    S.ui.done = true; render();
  },
  regKind: function (v) { S.ui.kind = v; S.ui.qty = {}; if (S.ui.matched) S.ui.matched = parsePaste(S.ui.paste, S.ui.ch); render(); },
  regMode: function (v) { S.ui.mode = v; render(); },
  regCat: function (v) { S.ui.cat = v; render(); },
  dec: function (_, el) { step(el.dataset.k, el.dataset.c, -1); },
  inc: function (_, el) { step(el.dataset.k, el.dataset.c, 1); },
  clip: function () {
    if (!navigator.clipboard || !navigator.clipboard.readText) { toast('길게 눌러 붙여넣어 주세요'); return; }
    navigator.clipboard.readText().then(function (t) { S.ui.paste = t; render(); }).catch(function () { toast('길게 눌러 붙여넣어 주세요'); });
  },
  match: function () {
    var m = parsePaste(S.ui.paste, S.ui.ch);
    if (!m.length) { toast('수량이 있는 줄을 찾지 못했어요'); return; }
    S.ui.matched = m; render(); window.scrollTo(0, 0);
  },
  rematch: function () { S.ui.matched = null; render(); },
  regSave: function () {
    var u = S.ui, d = D(), c = d.C[u.ch]; if (!c) return;
    var isSale = u.kind === 'sale', online = c.type === '온라인';
    var at = new Date().toISOString().slice(0, 16).replace('T', ' ');
    var items = [];
    if (u.mode === 'manual') Object.keys(u.qty).forEach(function (code) { var q = num(u.qty[code]); if (q) items.push([code, q]); });
    else u.matched.forEach(function (m) { if (!m.skip && m.code && num(m.qty)) items.push([m.code, num(m.qty)]); });
    if (u.editIds) at = u.created || at;
    var date = isSale && !online && !u.editIds ? today() : (u.date || today());
    var sm = isSale ? (online ? date.slice(0, 7) : u.month) : '';
    var rows = items.map(function (it) { return { id: uid('S'), date: date, kind: isSale ? '판매' : '입고', channel: u.ch, code: it[0], qty: it[1], saleMonth: sm, memo: '', createdAt: at }; });
    if (!rows.length && isSale && !online) rows.push({ id: uid('S'), date: date, kind: '판매', channel: u.ch, code: '', qty: 0, saleMonth: sm, memo: '판매 없음', createdAt: at });
    if (!rows.length) return;
    if (u.editIds) { replaceRows('stock', u.editIds, rows); toast('기록을 수정했어요'); go('channel/' + encodeURIComponent(u.ch)); return; }
    if (u.mode === 'auto') u.matched.forEach(function (m) { if (m.learn && m.code) saveCode({ channel: u.ch, label: m.token || m.label, code: m.code }); });
    saveRows('stock', rows);
    var tot = items.reduce(function (a, it) { return a + it[1]; }, 0);
    toast(c.name + ' ' + (isSale ? (online ? '' : mLabel(sm) + ' ') + '판매 ' + tot + '개 등록' : '입고 ' + tot + '개 등록'));
    go('channel/' + encodeURIComponent(u.ch));
  },
  stCat: function (v) { S.ui.cat = v; render(); },
  openProd: function (v) { S.ui.open = S.ui.open === v ? null : v; render(); },
  editProd: function (v) { go('product/' + encodeURIComponent(v)); },
  delProd: function (v) {
    var p = Object.assign({}, D().P[v]); if (!p.code) return;
    S.swiped = null;
    saveRow('products', Object.assign({}, p, { active: '중지' }));
    toast(prodName(v) + ' 삭제했어요', function () { saveRow('products', p); });
  },
  seKind: function (v) { S.ui.kind = v; render(); },
  seCat: function (v) { S.ui.cat = v; render(); },
  seSave: function () {
    var u = S.ui, at = new Date().toISOString().slice(0, 16).replace('T', ' ');
    if (u.editIds) at = u.created || at;
    var rows = Object.keys(u.qty).filter(function (k) { return num(u.qty[k]); }).map(function (code) { return { id: uid('S'), date: u.date || today(), kind: u.kind, channel: '', code: code, qty: num(u.qty[code]), saleMonth: '', memo: '', createdAt: at }; });
    if (!rows.length) return;
    if (u.editIds) { replaceRows('stock', u.editIds, rows); toast('기록을 수정했어요'); go('stock'); return; }
    saveRows('stock', rows); toast((u.kind === '발주' ? '발주' : '하자·마케팅') + ' ' + rows.reduce(function (a, r) { return a + r.qty; }, 0) + '개 등록'); go('stock');
  },
  pCat: function (v) { S.ui.f.category = v; render(); },
  newCat: function () { S.ui.newCat = true; render(); var el = document.getElementById('p_newcat'); if (el) el.focus(); },
  addCat: function () { var n = String(S.ui.newCatName || '').trim(); if (n) S.ui.f.category = n; S.ui.newCat = false; S.ui.newCatName = ''; render(); },
  scan: function () { S.ui.scanning = true; render(); startScan(); },
  stopScan: function () { stopScan(); S.ui.scanning = false; render(); },
  delCode: function (v) { var f = S.ui.f; var list = S.data.codes.filter(function (c) { return c.code === f.code; }); var row = list[+v]; if (row) { removeCode(row); render(); } },
  saveProd: function () {
    var f = Object.assign({}, S.ui.f); f.code = String(f.code || '').trim(); f.name = String(f.name || '').trim();
    if (!f.code) { toast('제품코드를 적어주세요'); return; }
    if (!f.name) { toast('제품명을 적어주세요'); return; }
    var exist = D().P[f.code];
    if (exist && S.route.id === 'new' && exist.active !== '중지') { toast('이미 있는 제품코드예요'); return; }
    f.price = num(f.price); f.active = '사용'; if (!f.created) f.created = today();
    stopScan(); saveRow('products', f); toast('제품을 저장했어요'); go('stock');
  },
  bType: function (v) { var u = S.ui; u.type = v; u.ch = ''; u.settle = ''; u.memo = v === 'income' && u.sub.income === 'etc' ? '이자' : ''; if (v === 'expense') u.cat = u.sub.expense === 'make' ? '부자재' : '물류비'; render(); },
  bSub: function (v) { var u = S.ui; u.sub[u.type] = v; if (u.type === 'income') { u.memo = v === 'etc' ? '이자' : ''; u.ch = ''; } if (u.type === 'expense') u.cat = v === 'make' ? '부자재' : '물류비'; render(); },
  bCat: function (v) { S.ui.cat = v; render(); },
  bSave: function () {
    var u = S.ui; if (!(num(u.amt) > 0)) return;
    var rec = bookRecord(u), editing = !!u.editId;
    saveRow('ledger', rec);
    u.amt = ''; u.memo = u.type === 'income' && u.sub.income === 'etc' ? '이자' : ''; u.editId = null; u.date = today(); u.settle = '';
    if (location.hash.indexOf('pay=') >= 0) history.replaceState(null, '', '#/book');
    toast(editing ? '기록을 수정했어요' : recTitle(rec) + ' ' + won(rec.amount) + ' 기록했어요');
  },
  bCancel: function () { var u = S.ui; u.editId = null; u.amt = ''; u.memo = ''; u.date = today(); render(); },
  bEdit: function (v) {
    var x = S.data.ledger.filter(function (r) { return r.id === v; })[0]; if (!x) return;
    var u = S.ui, map = { '지출': 'expense', '수입': 'income', '대출': 'loan', '투자': 'personal', '급여': 'salary' };
    u.type = map[x.type]; u.editId = x.id; u.amt = String(num(x.amount)); u.memo = x.memo || ''; u.date = x.date; u.ch = x.channel || '';
    if (u.type === 'expense') { u.sub.expense = x.sub === '제작비용' ? 'make' : 'extra'; u.cat = x.category; }
    if (u.type === 'income') { u.sub.income = x.sub === '정산입금' ? 'settle' : 'etc'; u.settle = x.settleMonth || ''; }
    if (u.type === 'loan') u.sub.loan = { '받기': 'take', '갚기': 'repay', '이자발생': 'interest' }[x.sub] || 'take';
    if (u.type === 'personal') u.sub.personal = x.sub === '넣기' ? 'in' : 'out';
    S.swiped = null; render();
    var el = document.getElementById('entry'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },
  bDel: function (v) {
    var x = S.data.ledger.filter(function (r) { return r.id === v; })[0]; if (!x) return;
    S.swiped = null; removeRow('ledger', v);
    toast(x.sub === '정산입금' ? chName(x.channel) + ' ' + keyLabel(x.settleMonth) + '분이 다시 홈 TO-DO에 표시돼요' : '기록을 삭제했어요', function () { saveRow('ledger', x); });
  },
  bMore: function () { S.ui.limit += 100; render(); },
  tDebt: function () { S.ui.debtOpen = !S.ui.debtOpen; render(); },
  tPay: function () { S.ui.payOpen = !S.ui.payOpen; render(); },
  pinKey: function (v) {
    var u = S.ui; if (u.busy) return;
    u.err = ''; u.shake = false;
    if (v === 'del') u.pin = u.pin.slice(0, -1);
    else if (v === 'ok') { if (u.pin) ACT.tryPin(); return; }
    else if (u.pin.length < 8) u.pin += v;
    render();
  },
  lockKey: function (v) {
    var k = S.lk; k.err = ''; k.shake = false;
    if (v === 'del') k.pin = k.pin.slice(0, -1);
    else if (v !== 'ok' && k.pin.length < 8) k.pin += v;
    var full = k.pin.length >= S.cfg.pin.length;
    if ((v === 'ok' && k.pin) || full) {
      if (k.pin === S.cfg.pin) { S.locked = false; touch(); render(); return; }
      if (v === 'ok' || full) { k.pin = ''; k.err = 'PIN이 맞지 않아요'; k.shake = true; }
    }
    render();
  },
  tryPin: function () {
    var u = S.ui, prev = S.cfg.pin;
    S.cfg = { url: API_URL, pin: u.pin }; u.busy = true; render();
    api('load').then(function (d) {
      lsSet('hm_cfg', { pin: u.pin }); touch(); S.data = d; persist(); u.busy = false; go('home');
    }).catch(function (e) {
      S.cfg.pin = prev; u.busy = false; u.pin = ''; u.shake = true;
      u.err = /PIN/.test(e.message) ? 'PIN이 맞지 않아요' : '연결 실패 · ' + e.message; render();
    });
  },
  reload: function () { loadAll().then(function () { toast('다시 불러왔어요'); }); }
};
function step(key, code, dlt) {
  if (key === 'm') { var m = S.ui.matched[+code]; m.qty = num(m.qty) + dlt; }
  else { var cur = num(S.ui.qty[code]) + dlt; if (S.route.name === 'stockentry' || (S.route.name === 'register' && S.ui.kind === 'sale')) cur = Math.max(0, cur); S.ui.qty[code] = cur || ''; }
  render();
}
function afterRender() { if (S.ui.scanning && !scanStream && !zxReader && document.getElementById('scanVideo')) startScan(); }

// ───────── 시작 ─────────
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(function () {});
S.route = parseHash();
if (!S.cfg.pin) { history.replaceState(null, '', '#/settings'); S.route = parseHash(); render(); }
else { if (needLock()) lock(); render(); loadAll(true); }
document.addEventListener('visibilitychange', function () {
  if (document.visibilityState === 'hidden') { if (!S.locked) touch(); return; }
  if (needLock()) { lock(); render(); }
  if (S.cfg.pin && S.data) loadAll(true);
});
document.addEventListener('pointerdown', function () { if (!S.locked) touch(); }, true);
})();
