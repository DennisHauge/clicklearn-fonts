/* ==========================================================================
   ClickLearn company-lookup card helpers
   1. Lucide icons (brand icon library): <i data-lucide="zap"></i>
   2. Company logo from the clicklearn-logos repo, with initials fallback:
      <div class="cl-logo" data-domain="allient.com">AL</div>
   Load at the end of the card:
   <script src="https://cdn.jsdelivr.net/gh/DennisHauge/clicklearn-fonts@main/card/clicklearn-card.js"></script>
   ========================================================================== */
(function () {
  var LUCIDE = 'https://unpkg.com/lucide@0.469.0/dist/umd/lucide.min.js';
  var LOGOS = 'https://cdn.jsdelivr.net/gh/DennisHauge/clicklearn-logos@main/logos/';
 
  function renderIcons() {
    try { if (window.lucide) window.lucide.createIcons(); } catch (e) {}
  }
 
  function loadIcons() {
    if (!document.querySelector('[data-lucide]')) return;
    if (window.lucide) return renderIcons();
    var s = document.createElement('script');
    s.src = LUCIDE;
    s.onload = renderIcons;
    document.head.appendChild(s);
  }
 
  function normDomain(d) {
    d = (d || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
    return d.split('/')[0];
  }
 
  function sha256Hex(text) {
    if (!(window.crypto && crypto.subtle)) return Promise.reject();
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) {
        return ('0' + b.toString(16)).slice(-2);
      }).join('');
    });
  }
 
  function loadLogos() {
    var els = document.querySelectorAll('.cl-logo[data-domain]');
    Array.prototype.forEach.call(els, function (el) {
      var domain = normDomain(el.getAttribute('data-domain'));
      if (!domain) return;
      sha256Hex(domain).then(function (hex) {
        var img = new Image();
        img.alt = el.getAttribute('data-name') || domain;
        img.onload = function () { el.textContent = ''; el.appendChild(img); };
        img.src = LOGOS + hex.slice(0, 20) + '.png';
      }).catch(function () { /* keep initials */ });
    });
  }
 
  function init() { loadIcons(); loadLogos(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
