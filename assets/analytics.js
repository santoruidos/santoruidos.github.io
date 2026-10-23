(function () {
  'use strict';

  var KEY = 'santo_ruidos_analytics_consent';
  var MEASUREMENT_ID = 'G-XZ5V1051KF';
  var memoryChoice = null;
  var started = false;
  var musicOutboundHandlerInstalled = false;
  var consent = null;

  function readChoice() {
    try {
      var value = window.localStorage.getItem(KEY);
      return value === 'accepted' || value === 'rejected' ? value : null;
    } catch (error) {
      return memoryChoice;
    }
  }

  function saveChoice(value) {
    memoryChoice = value;
    try {
      window.localStorage.setItem(KEY, value);
    } catch (error) {
      // Keep the choice for this page session when storage is unavailable.
    }
  }

  function loadAnalytics() {
    if (started) return;
    started = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    window.gtag('set', 'linker', {
      domains: ['santoruidos.github.io', 'santo-ruidos-gaitas.aglowhare1.chatgpt.site']
    });
    window.gtag('js', new Date());
    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    window.gtag('config', MEASUREMENT_ID);
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
    document.head.appendChild(script);
  }

  function installUI() {
    if (document.__srAnalyticsInstalled) return;
    document.__srAnalyticsInstalled = true;
    var style = document.createElement('style');
    style.textContent = '.sr-privacy{position:fixed;right:1rem;bottom:1rem;z-index:9999;font:16px system-ui;color:#fff}.sr-privacy button{font:inherit;padding:.65rem .9rem;border:1px solid #aaa;border-radius:.4rem;background:#171b22;color:inherit;cursor:pointer}.sr-privacy-panel{position:fixed;left:1rem;right:1rem;bottom:4.5rem;max-width:38rem;margin:auto;padding:1rem;background:#171b22;color:#fff;border:1px solid #777;border-radius:.5rem;box-shadow:0 4px 24px #0008}.sr-privacy-panel[hidden]{display:none}.sr-privacy-actions{display:flex;gap:.6rem;flex-wrap:wrap}.sr-privacy-panel a{color:#b7d7ff}@media(max-width:480px){.sr-privacy{right:.5rem;bottom:.5rem}.sr-privacy-panel{left:.5rem;right:.5rem;bottom:4rem}}';
    document.head.appendChild(style);

    var root = document.createElement('div');
    root.className = 'sr-privacy';
    var opener = document.createElement('button');
    opener.type = 'button';
    opener.textContent = 'Privacidad';
    opener.setAttribute('aria-expanded', 'false');
    opener.setAttribute('aria-controls', 'sr-privacy-panel');
    var panel = document.createElement('section');
    panel.className = 'sr-privacy-panel';
    panel.id = 'sr-privacy-panel';
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-live', 'polite');
    panel.setAttribute('aria-label', 'Preferencias de estadísticas');
    panel.hidden = true;
    var copy = document.createElement('p');
    copy.textContent = 'Si aceptas, Google Analytics usará cookies para medir visitas, páginas consultadas y clics en enlaces salientes. Esto no controla otros servicios del sitio ni bloquea la música.';
    var privacy = document.createElement('a');
    privacy.href = 'https://policies.google.com/technologies/partner-sites';
    privacy.target = '_blank';
    privacy.rel = 'noopener';
    privacy.textContent = 'Privacidad de Google';
    var actions = document.createElement('div');
    actions.className = 'sr-privacy-actions';
    var accept = document.createElement('button');
    accept.type = 'button';
    accept.textContent = 'Aceptar estadísticas';
    var reject = document.createElement('button');
    reject.type = 'button';
    reject.textContent = 'Rechazar';
    var withdraw = document.createElement('button');
    withdraw.type = 'button';
    withdraw.textContent = 'Retirar permiso';
    withdraw.hidden = true;

    function showPanel() {
      panel.hidden = false;
      opener.setAttribute('aria-expanded', 'true');
    }
    function hidePanel() {
      panel.hidden = true;
      opener.setAttribute('aria-expanded', 'false');
    }
    opener.addEventListener('click', function () {
      if (panel.hidden) showPanel(); else hidePanel();
    });
    accept.addEventListener('click', function () {
      saveChoice('accepted');
      consent = 'accepted';
      loadAnalytics();
      accept.hidden = true;
      reject.hidden = true;
      withdraw.hidden = false;
      hidePanel();
    });
    reject.addEventListener('click', function () {
      saveChoice('rejected');
      var wasAccepted = consent === 'accepted';
      consent = 'rejected';
      hidePanel();
      if (wasAccepted) window.location.reload();
    });
    withdraw.addEventListener('click', function () {
      saveChoice('rejected');
      consent = 'rejected';
      window.location.reload();
    });
    actions.appendChild(accept);
    actions.appendChild(reject);
    actions.appendChild(withdraw);
    panel.appendChild(copy);
    panel.appendChild(privacy);
    panel.appendChild(actions);
    root.appendChild(opener);
    root.appendChild(panel);
    document.body.appendChild(root);

    if (!musicOutboundHandlerInstalled) {
      musicOutboundHandlerInstalled = true;
      document.addEventListener('click', function (event) {
        if (consent !== 'accepted' || typeof window.gtag !== 'function') return;
        var target = event.target;
        var link = target && typeof target.closest === 'function' ? target.closest('a[href]') : null;
        if (!link || !link.href) return;
        var service = null;
        try {
          var destination = new URL(link.href);
          if (destination.protocol !== 'https:') return;
          if (destination.hostname === 'open.spotify.com') service = 'spotify';
          else if (destination.hostname === 'music.apple.com' || destination.hostname === 'geo.music.apple.com') service = 'apple_music';
          else if (destination.hostname === 'music.youtube.com') service = 'youtube_music';
          else if (destination.hostname === 'music.amazon.com') service = 'amazon_music';
        } catch (error) {
          return;
        }
        if (!service) return;
        window.gtag('event', 'music_outbound_click', { service: service });
      });
    }

    var choice = readChoice();
    if (choice === 'accepted') {
      consent = choice;
      loadAnalytics();
      withdraw.hidden = false;
    } else if (choice === 'rejected') {
      consent = choice;
    } else {
      showPanel();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installUI, { once: true });
  } else {
    installUI();
  }
}());
