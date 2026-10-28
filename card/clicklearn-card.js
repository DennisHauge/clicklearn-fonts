/* ==========================================================================
   ClickLearn company-lookup card – renderer (v2)
   Draws the whole card from a small JSON block, so Claude only writes data.
 
   Usage in a card:
     <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/DennisHauge/clicklearn-fonts@main/card/clicklearn-card.css">
     <div data-cl-card="cl-data"></div>
     <script type="application/json" id="cl-data">{ ...card data... }</script>
     <script src="https://cdn.jsdelivr.net/gh/DennisHauge/clicklearn-fonts@main/card/clicklearn-card.js"></script>
 
   Modes: "full" (default), "quick" (header + tiles + next activity), "list" (many accounts).
   All text is inserted as text (never HTML). Links must be http(s).
   ========================================================================== */
(function () {
  'use strict';
  var LUCIDE = 'https://unpkg.com/lucide@0.469.0/dist/umd/lucide.min.js';
  var LOGOS = 'https://cdn.jsdelivr.net/gh/DennisHauge/clicklearn-logos@main/logos/';
 
  /* ---------- tiny DOM helpers ---------- */
  function h(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null && text !== '') e.textContent = String(text);
    return e;
  }
  function add(parent) {
    for (var i = 1; i < arguments.length; i++) { var c = arguments[i]; if (c) parent.appendChild(c); }
    return parent;
  }
  function icon(name) { var i = h('i'); i.setAttribute('data-lucide', name); return i; }
  function safeUrl(u) { return /^https?:\/\//i.test(u || '') ? u : null; }
  function openUrl(u) {
    u = safeUrl(u); if (!u) return;
    if (typeof window.openLink === 'function') window.openLink(u); else window.open(u, '_blank', 'noopener');
  }
  function ask(prompt) { if (prompt && typeof window.sendPrompt === 'function') window.sendPrompt(prompt); }
  function list(x) { return Array.isArray(x) ? x : []; }
 
  /* button: {text, url | prompt, primary, icon} */
  function button(b) {
    var el = h('button', 'cl-btn' + (b.primary ? ' cl-btn--primary' : ''));
    el.type = 'button';
    if (b.icon) el.appendChild(icon(b.icon));
    el.appendChild(document.createTextNode((b.text || '') + (b.prompt ? ' ↗' : '')));
    el.addEventListener('click', function () { if (b.prompt) ask(b.prompt); else openUrl(b.url); });
    return el;
  }
  function buttons(arr) {
    if (!list(arr).length) return null;
    var w = h('div', 'cl-btns');
    list(arr).forEach(function (b) { w.appendChild(button(b)); });
    return w;
  }
  function section(title, iconName) {
    var box = h('div', 'cl-box');
    var s = h('p', 'cl-sec');
    if (iconName) s.appendChild(icon(iconName));
    s.appendChild(document.createTextNode(title));
    box.appendChild(s);
    return box;
  }
  /* pill: {text, kind, icon} kind = customer|partner|prospect|former|outline|tier1..4|green|yellow|red|grey */
  function pill(p) {
    var e = h('span', 'cl-pill cl-pill--' + (p.kind || 'grey'));
    if (p.icon) e.appendChild(icon(p.icon));
    e.appendChild(document.createTextNode(p.text || ''));
    return e;
  }
 
  /* ---------- sections ---------- */
  function header(c) {
    var wrap = h('div', 'cl-header');
    var logo = h('div', 'cl-logo', c.initials || (c.name || '?').slice(0, 2).toUpperCase());
    if (c.domain) { logo.setAttribute('data-domain', c.domain); logo.setAttribute('data-name', c.name || ''); }
    var main = h('div', 'cl-header-main');
    var row = h('div', 'cl-titlerow');
    row.appendChild(h('span', 'cl-title', c.name));
    list(c.badges).forEach(function (b) { row.appendChild(pill(b)); });
    add(main, row, h('p', 'cl-info', c.info), h('p', 'cl-people', c.people));
    add(wrap, logo, main);
    if (safeUrl(c.crmUrl)) {
      var b = button({ text: 'Open in CRM', url: c.crmUrl, icon: 'external-link' });
      b.style.alignSelf = 'flex-start';
      wrap.appendChild(b);
    }
    return wrap;
  }
 
  /* tile: {label, value, unit, hint, warn, bant:[bool,bool,bool,bool]} */
  function tile(t) {
    var e = h('div', 'cl-tile' + (t.warn ? ' cl-tile--warn' : ''));
    e.appendChild(h('p', 'cl-tile-label', t.label));
    var v = h('p', 'cl-tile-value', t.value);
    if (t.unit) { v.appendChild(document.createTextNode(' ')); v.appendChild(h('span', 'cl-tile-unit', t.unit)); }
    if (Array.isArray(t.bant)) {
      'BANT'.split('').forEach(function (l, i) {
        v.appendChild(h('span', 'cl-bant-letter cl-bant-letter--' + (t.bant[i] ? 'on' : 'off'), l));
      });
    }
    e.appendChild(v);
    if (t.hint) e.appendChild(h('p', 'cl-tile-hint', t.hint));
    return e;
  }
  function tiles(arr, four) {
    var g = h('div', 'cl-tiles' + (four ? ' cl-tiles--4' : ''));
    list(arr).forEach(function (t) { g.appendChild(tile(t)); });
    return g;
  }
 
  /* next: {line, actions:[{title, due, dueKind:urgent|soon|later, meta:[..], buttons:[..]}]} */
  function nextActivity(n) {
    var box = h('div', 'cl-next');
    var s = h('p', 'cl-sec'); s.appendChild(icon('zap')); s.appendChild(document.createTextNode('Suggested next activity'));
    add(box, s, h('p', 'cl-next-line', n.line));
    list(n.actions).forEach(function (a, i) {
      var row = h('div', 'cl-action');
      var body = h('div');
      var top = h('div', 'cl-action-top');
      add(top, h('p', 'cl-action-title', a.title), a.due ? h('span', 'cl-due cl-due--' + (a.dueKind || 'later'), a.due) : null);
      body.appendChild(top);
      list(a.meta).forEach(function (m) { body.appendChild(h('p', 'cl-meta', m)); });
      add(body, buttons(a.buttons));
      add(row, h('div', 'cl-action-num', i + 1), body);
      box.appendChild(row);
    });
    return box;
  }
 
  /* bant: {cells:[{label,text,on}], warning, roles:[{role, who, muted, status, statusKind:ok|warn|bad|none, button}]} */
  function bant(b) {
    var box = section('BANT Overview');
    var g = h('div', 'cl-bant');
    list(b.cells).forEach(function (c) {
      var cell = h('div', 'cl-bant-cell' + (c.on ? ' cl-bant-cell--on' : ''));
      add(cell, h('b', null, c.label), document.createTextNode(c.text || ''));
      g.appendChild(cell);
    });
    box.appendChild(g);
    if (b.warning) box.appendChild(h('p', 'cl-warn', b.warning));
    list(b.roles).forEach(function (r) {
      var row = h('div', 'cl-role');
      var who = h('span', r.muted ? 'cl-sub' : null, r.who);
      var right = r.button ? button(r.button) : h('span', 'cl-status--' + (r.statusKind || 'none'), r.status);
      add(row, h('span', 'cl-role-label', r.role), who, right);
      box.appendChild(row);
    });
    return box;
  }
 
  /* lifecycle: {stages:[{name, kind, date, weight}], events:[{year} | {text, kind:opp|good|bad|next|other}]} */
  function relationship(l) {
    var box = section('Relationship timeline');
    var stages = list(l.stages);
    if (stages.length) {
      var cols = stages.map(function (s) { return (s.weight || 1) + 'fr'; }).join(' ');
      var bar = h('div', 'cl-stages'); bar.style.gridTemplateColumns = cols;
      var dates = h('div', 'cl-stage-dates'); dates.style.gridTemplateColumns = cols;
      stages.forEach(function (s, i) {
        var last = i === stages.length - 1;
        bar.appendChild(h('div', 'cl-stage cl-stage--' + (last ? 'current' : (s.kind || 'lead')), s.name));
        var d = h('span', last ? 'cl-now' : null, s.date);
        if (last) d.appendChild(h('b', null, 'Now'));
        dates.appendChild(d);
      });
      add(box, bar, dates);
    }
    var ev = h('div', 'cl-events');
    list(l.events).forEach(function (e) {
      if (e.year) ev.appendChild(h('p', 'cl-event-year', e.year));
      else ev.appendChild(h('div', 'cl-event' + (e.kind && e.kind !== 'other' ? ' cl-event--' + e.kind : ''), e.text));
    });
    box.appendChild(ev);
    return box;
  }
 
  /* contacts: [{name, title, email, emailKind:replied|opened|none|bad, linkedin:{text,url,primary} | linkedinPill:{text,kind,icon}}] */
  function contacts(arr) {
    var box = section('Key contacts');
    var head = h('div', 'cl-contacts-head');
    add(head, h('span', null, 'Contact'), h('span', null, 'Email'), h('span', null, 'LinkedIn'));
    box.appendChild(head);
    list(arr).forEach(function (c) {
      var row = h('div', 'cl-contact');
      var who = h('span');
      add(who, h('span', 'cl-contact-name', c.name), h('span', 'cl-contact-title', c.title));
      var right = h('span');
      if (c.linkedin) right.appendChild(button({ text: c.linkedin.text || 'Connect', url: c.linkedin.url, primary: c.linkedin.primary, icon: 'linkedin' }));
      else if (c.linkedinPill) right.appendChild(pill(c.linkedinPill));
      add(row, who, h('span', 'cl-email--' + (c.emailKind || 'none'), c.email), right);
      box.appendChild(row);
    });
    return box;
  }
 
  /* marketing: {tiles:[..4], months:[13 labels], rows:[{channel, empty} | {channel, cells:{"<0-12>":{n, kind:engaged|activity|noresponse, title, span}}}]} */
  function marketing(m) {
    var box = section('Marketing activity timeline');
    if (list(m.tiles).length) box.appendChild(tiles(m.tiles, true));
    var months = list(m.months);
    if (!months.length) return box;
    var g = h('div', 'cl-mt');
    g.appendChild(h('span', 'cl-mt-month'));
    months.forEach(function (mo) { g.appendChild(h('span', 'cl-mt-month', mo)); });
    list(m.rows).forEach(function (r) {
      g.appendChild(h('span', 'cl-mt-channel', r.channel));
      if (r.empty) { g.appendChild(h('span', 'cl-mt-empty', r.empty)); return; }
      var cells = r.cells || {};
      for (var i = 0; i < months.length; i++) {
        var c = cells[i] || cells[String(i)];
        var slot = h('span');
        if (c) {
          var d = h('span', 'cl-dot cl-dot--' + (c.kind || 'activity'), c.n);
          if (c.title) d.title = c.title;
          slot.appendChild(d);
          if (c.span > 1) { slot.style.gridColumn = 'span ' + c.span; i += c.span - 1; }
        }
        g.appendChild(slot);
      }
    });
    box.appendChild(g);
    return box;
  }
 
  /* pipeline: [{name, sub, amount, closed, overdue}] */
  function pipeline(arr) {
    var box = section('Pipeline');
    if (!list(arr).length) { box.appendChild(h('p', 'cl-sub', 'No opportunities in CRM')); return box; }
    list(arr).forEach(function (d) {
      var row = h('div', 'cl-deal' + (d.closed ? ' cl-deal--closed' : ''));
      var left = h('span');
      if (d.closed) left.textContent = d.name + (d.sub ? ' · ' + d.sub : '');
      else { add(left, h('span', 'cl-deal-name', d.name), h('br'), h('span', 'cl-sub', d.sub)); }
      var right = h('span', 'cl-deal-amount', d.amount);
      if (d.overdue) { right.appendChild(h('br')); right.appendChild(h('span', 'cl-overdue', d.overdue)); }
      add(row, left, right);
      box.appendChild(row);
    });
    return box;
  }
 
  /* signals: [{priority, date, text, source:{name,url}, sowhat}], background */
  function external(arr, background) {
    var box = section('External sources');
    if (!list(arr).length) box.appendChild(h('p', 'cl-sub', 'No notable new external signals in the last 12 months'));
    list(arr).forEach(function (s) {
      var w = h('div', 'cl-signal');
      var p = h('p');
      add(p, h('span', 'cl-priority', s.priority), document.createTextNode(' · ' + (s.date || '') + ' · ' + (s.text || '') + ' '));
      if (s.source && safeUrl(s.source.url)) {
        var a = h('a', null, '(' + (s.source.name || 'source') + ')');
        a.href = s.source.url; a.target = '_blank'; a.rel = 'noopener';
        a.addEventListener('click', function (ev) { ev.preventDefault(); openUrl(s.source.url); });
        p.appendChild(a);
      }
      add(w, p, s.sowhat ? h('p', 'cl-signal-sowhat', 'So what: ' + s.sowhat) : null);
      box.appendChild(w);
    });
    if (background) { var b = h('p', 'cl-signal-sowhat', 'Background: ' + background); b.style.marginTop = '8px'; box.appendChild(b); }
    return box;
  }
 
  /* footer: {text, links:[{text,url}], note} */
  function footer(f) {
    var p = h('p', 'cl-footer', f.text);
    list(f.links).forEach(function (l) {
      if (!safeUrl(l.url)) return;
      p.appendChild(document.createTextNode(' · '));
      var a = h('a', null, l.text); a.href = l.url; a.target = '_blank'; a.rel = 'noopener';
      a.addEventListener('click', function (ev) { ev.preventDefault(); openUrl(l.url); });
      p.appendChild(a);
    });
    if (f.note) { p.appendChild(h('br')); p.appendChild(document.createTextNode(f.note)); }
    return p;
  }
 
  /* list mode: {title, rows:[{name, domain, initials, badge:{text,kind}, tier:{text,kind}, pipeline, lastReply, bant:[4 bools], next, due, dueKind, crmUrl, prompt}]} */
  function listView(d) {
    var card = h('div', 'cl-card');
    var s = h('p', 'cl-sec'); s.appendChild(icon('list')); s.appendChild(document.createTextNode(d.title || 'Accounts'));
    card.appendChild(s);
    var head = h('div', 'cl-list-row cl-list-head');
    ['Company', 'Pipeline', 'Last reply', 'BANT', 'Next step', ''].forEach(function (t) { head.appendChild(h('span', null, t)); });
    card.appendChild(head);
    list(d.rows).forEach(function (r) {
      var row = h('div', 'cl-list-row');
      var co = h('span', 'cl-list-co');
      var logo = h('span', 'cl-logo cl-logo--sm', r.initials || (r.name || '?').slice(0, 2).toUpperCase());
      if (r.domain) logo.setAttribute('data-domain', r.domain);
      var txt = h('span');
      add(txt, h('span', 'cl-contact-name', r.name));
      var pills = h('span', 'cl-list-pills');
      if (r.badge) pills.appendChild(pill(r.badge));
      if (r.tier) pills.appendChild(pill(r.tier));
      add(txt, pills);
      add(co, logo, txt);
      var b = h('span');
      list(r.bant).forEach(function (on, i) { b.appendChild(h('span', 'cl-bant-letter cl-bant-letter--' + (on ? 'on' : 'off'), 'BANT'[i])); });
      var nx = h('span');
      add(nx, h('span', null, r.next), r.due ? h('span', 'cl-due cl-due--' + (r.dueKind || 'later'), r.due) : null);
      var act = h('span', 'cl-list-act');
      if (r.prompt) act.appendChild(button({ text: 'Full card', prompt: r.prompt, primary: true }));
      if (safeUrl(r.crmUrl)) act.appendChild(button({ text: 'CRM', url: r.crmUrl }));
      add(row, co, h('span', null, r.pipeline), h('span', null, r.lastReply), b, nx, act);
      card.appendChild(row);
    });
    if (d.footer) card.appendChild(footer(d.footer));
    return card;
  }
 
  /* ---------- main renderer ---------- */
  function render(target, d) {
    target.textContent = '';
    if (d.mode === 'list') { target.appendChild(listView(d)); return; }
    var card = h('div', 'cl-card');
    var sr = h('h2', 'cl-sr', 'Company card for ' + ((d.company && d.company.name) || 'company'));
    card.appendChild(sr);
    if (d.company) card.appendChild(header(d.company));
    if (d.kpis) card.appendChild(tiles(d.kpis));
    if (d.next) card.appendChild(nextActivity(d.next));
    if (d.mode !== 'quick') {
      if (d.bant) card.appendChild(bant(d.bant));
      if (d.lifecycle) card.appendChild(relationship(d.lifecycle));
      if (d.contacts) card.appendChild(contacts(d.contacts));
      if (d.marketing) card.appendChild(marketing(d.marketing));
      if (d.pipeline) card.appendChild(pipeline(d.pipeline));
      if (d.signals || d.background) card.appendChild(external(d.signals, d.background));
    } else if (d.quickPrompt) {
      var more = buttons([{ text: 'Show full card', prompt: d.quickPrompt, primary: true }]);
      if (more) { more.style.marginTop = '12px'; card.appendChild(more); }
    }
    if (d.footer) card.appendChild(footer(d.footer));
    target.appendChild(card);
  }
 
  /* ---------- icons + logos ---------- */
  function renderIcons() { try { if (window.lucide) window.lucide.createIcons(); } catch (e) {} }
  function loadIcons() {
    if (!document.querySelector('[data-lucide]')) return;
    if (window.lucide) return renderIcons();
    if (document.getElementById('cl-lucide')) return;
    var s = document.createElement('script'); s.id = 'cl-lucide'; s.src = LUCIDE; s.onload = renderIcons;
    document.head.appendChild(s);
  }
  function normDomain(x) {
    x = (x || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
    return x.split('/')[0];
  }
  function sha256Hex(text) {
    if (!(window.crypto && crypto.subtle && window.TextEncoder)) return Promise.reject();
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
    });
  }
  function loadLogos() {
    Array.prototype.forEach.call(document.querySelectorAll('.cl-logo[data-domain]'), function (el) {
      if (el.getAttribute('data-cl-logo')) return;
      el.setAttribute('data-cl-logo', '1');
      var domain = normDomain(el.getAttribute('data-domain'));
      if (!domain) return;
      sha256Hex(domain).then(function (hex) {
        var img = new Image();
        img.alt = el.getAttribute('data-name') || domain;
        img.onload = function () { el.textContent = ''; el.appendChild(img); };
        img.src = LOGOS + hex.slice(0, 20) + '.png';
      }).catch(function () {});
    });
  }
 
  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-cl-card]'), function (el) {
      var src = document.getElementById(el.getAttribute('data-cl-card'));
      if (!src) return;
      try { render(el, JSON.parse(src.textContent)); }
      catch (e) { el.textContent = 'The card data could not be read: ' + e.message; }
    });
    loadIcons();
    loadLogos();
  }
 
  window.ClickLearnCard = { render: function (el, data) { render(el, data); loadIcons(); loadLogos(); }, init: init };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
