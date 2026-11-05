(function () {
  'use strict';
  if (!/^\/canciones\/?$/.test(location.pathname)) return;
  var main = document.querySelector('main');
  var lists = Array.prototype.slice.call(document.querySelectorAll('main .tracks'));
  if (!main || !lists.length || document.getElementById('song-finder')) return;
  var items = [];
  lists.forEach(function (list, index) {
    list.id = list.id || 'catalog-tracks-' + index;
    Array.prototype.forEach.call(list.children, function (item) {
      items.push({ node: item, text: normalized(item.textContent) });
    });
  });
  function normalized(value) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }
  function phrase(value) {
    return normalized(value).replace(/[^a-z0-9]+/g, ' ').trim();
  }
  function readLyricIndex() {
    try {
      var script = document.getElementById('catalog-lyrics');
      if (!script || script.getAttribute('type') !== 'application/json' || script.textContent.length > 65536) return null;
      var data = JSON.parse(script.textContent);
      if (!Array.isArray(data) || data.length !== items.length) return null;
      var bySlug = Object.create(null);
      data.forEach(function (row) {
        if (!row || typeof row.slug !== 'string' || !/^[a-z0-9-]+$/.test(row.slug) ||
            typeof row.text !== 'string' || !row.text || phrase(row.text) !== row.text || bySlug[row.slug]) throw new Error('Invalid lyric index');
        bySlug[row.slug] = row.text;
      });
      var seen = Object.create(null);
      var texts = items.map(function (item) {
        var link = item.node.querySelector('a[href]');
        var match = link && /(?:^|\/)canciones\/([a-z0-9-]+)\/?$/.exec(link.getAttribute('href'));
        if (!match || seen[match[1]] || !bySlug[match[1]]) throw new Error('Catalog index mismatch');
        seen[match[1]] = true;
        return bySlug[match[1]];
      });
      return texts;
    } catch (_) { return null; }
  }
  var lyricTexts = readLyricIndex();
  var form = document.createElement('form');
  form.id = 'song-finder';
  form.className = 'song-finder';
  form.setAttribute('role', 'search');
  form.setAttribute('aria-label', 'Buscar una canción del catálogo');
  var label = document.createElement('label');
  label.htmlFor = 'song-search';
  label.textContent = lyricTexts ? 'Busca una gaita por título o una frase de la letra' : '¿Buscas una gaita? Encuéntrala por su título';
  var row = document.createElement('div');
  row.className = 'song-finder-row';
  var input = document.createElement('input');
  input.id = 'song-search';
  input.type = 'search';
  input.placeholder = lyricTexts ? 'Por ejemplo: pan con mortadela' : 'Por ejemplo: Pasaporte Vencido';
  input.setAttribute('aria-controls', lists.map(function (list) { return list.id; }).join(' '));
  var clear = document.createElement('button');
  clear.type = 'reset';
  clear.textContent = 'Ver todas';
  var status = document.createElement('p');
  status.className = 'song-finder-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  function filterTerms(terms) {
    var matches = 0;
    items.forEach(function (item) {
      item.node.hidden = !terms.every(function (term) { return item.text.indexOf(term) !== -1; });
      if (!item.node.hidden) matches += 1;
    });
    return matches;
  }
  function update(value) {
    var terms = normalized(value).trim().split(/\s+/).filter(Boolean);
    var matches = filterTerms(terms);
    var recovered = false;
    var lyricMatch = false;
    var needsTitle = false;
    if (!matches && terms.length) {
      var titleTerms = terms.slice();
      var purpose = /^(letra|lyrics|gaita)$/;
      while (titleTerms.length && purpose.test(titleTerms[0])) titleTerms.shift();
      while (titleTerms.length && purpose.test(titleTerms[titleTerms.length - 1])) titleTerms.pop();
      if (titleTerms.length < terms.length) {
        needsTitle = !titleTerms.length;
        if (!needsTitle) {
          matches = filterTerms(titleTerms);
          recovered = matches > 0;
        }
      }
    }
    if (!matches && terms.length && lyricTexts && !needsTitle) {
      var phraseTerms = terms.slice();
      while (phraseTerms.length && /^(letra|lyrics|gaita)$/.test(phraseTerms[0])) phraseTerms.shift();
      while (phraseTerms.length && /^(letra|lyrics|gaita)$/.test(phraseTerms[phraseTerms.length - 1])) phraseTerms.pop();
      var query = phrase(phraseTerms.join(' '));
      if (query) {
        items.forEach(function (item, index) {
          item.node.hidden = (' ' + lyricTexts[index] + ' ').indexOf(' ' + query + ' ') === -1;
          if (!item.node.hidden) matches += 1;
        });
        lyricMatch = matches > 0;
      }
    }
    lists.forEach(function (list) {
      var album = list.closest('.album');
      if (album) album.hidden = !Array.prototype.some.call(list.children, function (item) { return !item.hidden; });
    });
    var message = matches ? matches + (matches === 1 ? ' canción disponible.' : ' canciones disponibles.') :
      (lyricTexts ? 'No encontramos ese título ni esa frase. Prueba otras palabras o pulsa «Ver todas».' : 'No encontramos ese título. Prueba otra palabra o pulsa «Ver todas».');
    status.textContent = needsTitle ? (lyricTexts ? 'Escribe una palabra del título o una frase de la letra, o pulsa «Ver todas».' : 'Escribe una palabra del título o pulsa «Ver todas».') :
      (lyricMatch ? 'Por una frase de la letra: ' : (recovered ? 'Por palabras del título: ' : '')) + message;
  }
  input.addEventListener('input', function () { update(input.value); });
  form.addEventListener('submit', function (event) { event.preventDefault(); });
  form.addEventListener('reset', function (event) {
    event.preventDefault();
    input.value = '';
    update('');
    input.focus();
  });
  row.appendChild(input);
  row.appendChild(clear);
  form.appendChild(label);
  form.appendChild(row);
  if (lyricTexts) {
    var hint = document.createElement('p');
    hint.textContent = 'Busca entre las ' + items.length + ' canciones publicadas. Primero comprobamos el título; si no coincide, buscamos tus palabras seguidas en la letra.';
    form.appendChild(hint);
  }
  form.appendChild(status);
  var heading = main.querySelector('h1');
  if (heading) heading.insertAdjacentElement('afterend', form);
  else main.prepend(form);
  update('');
}());
