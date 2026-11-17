// 표시 언어 결정: ?lang= 주소 값 > 직접 고른 언어 > 기기 언어 (ko/ja/zh 외에는 en)
(function () {
  var NAMES = { en: 'English', ko: '한국어', ja: '日本語', zh: '简体中文' };
  var HTML_LANG = { en: 'en', ko: 'ko', ja: 'ja', zh: 'zh-Hans' };
  var KEY = 'site-lang';
  var root = document.documentElement;

  function normalize(value) {
    var code = String(value || '').toLowerCase().slice(0, 2);
    return NAMES[code] ? code : null;
  }

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function store(lang) {
    try { localStorage.setItem(KEY, lang); } catch (e) {}
  }

  function fromQuery() {
    var match = location.search.match(/[?&]lang=([A-Za-z-]+)/);
    return match ? normalize(match[1]) : null;
  }

  function fromDevice() {
    var code = String(navigator.language || '').toLowerCase().slice(0, 2);
    return code === 'ko' || code === 'ja' || code === 'zh' ? code : 'en';
  }

  function apply(lang) {
    root.setAttribute('data-lang', lang);
    root.lang = HTML_LANG[lang];
    var block = document.querySelector('.l-' + lang);
    if (block && block.getAttribute('data-title')) document.title = block.getAttribute('data-title');
    var label = document.querySelector('[data-lang-label]');
    if (label) label.textContent = NAMES[lang];
    var buttons = document.querySelectorAll('[data-set-lang]');
    for (var i = 0; i < buttons.length; i++) {
      if (buttons[i].getAttribute('data-set-lang') === lang) buttons[i].setAttribute('aria-current', 'true');
      else buttons[i].removeAttribute('aria-current');
    }
  }

  var queryLang = fromQuery();
  if (queryLang) store(queryLang);
  var current = queryLang || normalize(stored()) || fromDevice();

  // 본문이 그려지기 전에 언어를 정해 깜빡임을 막는다
  root.setAttribute('data-lang', current);
  root.lang = HTML_LANG[current];

  document.addEventListener('DOMContentLoaded', function () {
    apply(current);
    var menu = document.querySelector('.lang-menu');
    if (!menu) return;

    menu.addEventListener('click', function (event) {
      var button = event.target.closest('[data-set-lang]');
      if (!button) return;
      current = button.getAttribute('data-set-lang');
      store(current);
      apply(current);
      menu.removeAttribute('open');
      if (queryLang && history.replaceState) {
        history.replaceState(null, '', location.pathname + location.hash);
        queryLang = null;
      }
    });

    document.addEventListener('click', function (event) {
      if (!menu.contains(event.target)) menu.removeAttribute('open');
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') menu.removeAttribute('open');
    });
  });
})();
