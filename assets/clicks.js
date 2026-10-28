(function () {
  function kind(h) {
    if (/youtube\.com\/.*sub_confirmation=1/.test(h)) return 'click-youtube-suscribirse';
    if (/(^|\/\/)(www\.|music\.)?youtube\.com|youtu\.be/.test(h)) return 'click-youtube';
    if (/whatsapp\.com\/channel/.test(h)) return 'click-whatsapp';
    if (/t\.me\//.test(h)) return 'click-telegram';
    if (/open\.spotify\.com|music\.apple\.com|geo\.music\.apple\.com|music\.amazon\.com|deezer\.com|tidal\.com|pandora\.com|lnk\.to/.test(h)) return 'click-tienda';
    return '';
  }
  document.addEventListener('click', function (e) {
    var t = e.target, a = t && t.closest ? t.closest('a[href]') : null;
    if (!a || !window.goatcounter || typeof window.goatcounter.count !== 'function') return;
    var k = kind(a.href || '');
    if (k) window.goatcounter.count({ path: k, title: location.pathname, event: true });
  });
})();
