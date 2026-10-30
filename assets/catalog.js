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
  var form = document.createElement('form');
  form.id = 'song-finder';
  form.className = 'song-finder';
  form.setAttribute('role', 'search');
  form.setAttribute('aria-label', 'Buscar una canción del catálogo');
  var label = document.createElement('label');
  label.htmlFor = 'song-search';
  label.textContent = '¿Buscas una gaita? Encuéntrala por su título';
  var row = document.createElement('div');
  row.className = 'song-finder-row';
  var input = document.createElement('input');
  input.id = 'song-search';
  input.type = 'search';
  input.placeholder = 'Por ejemplo: Pasaporte Vencido';
  input.setAttribute('aria-controls', lists.map(function (list) { return list.id; }).join(' '));
  var clear = document.createElement('button');
  clear.type = 'reset';
  clear.textContent = 'Ver todas';
  var status = document.createElement('p');
  status.className = 'song-finder-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  function update(value) {
    var terms = normalized(value).trim().split(/\s+/).filter(Boolean);
    var matches = 0;
    items.forEach(function (item) {
      item.node.hidden = !terms.every(function (term) { return item.text.indexOf(term) !== -1; });
      if (!item.node.hidden) matches += 1;
    });
    lists.forEach(function (list) {
      var album = list.closest('.album');
      if (album) album.hidden = !Array.prototype.some.call(list.children, function (item) { return !item.hidden; });
    });
    status.textContent = matches ? matches + (matches === 1 ? ' canción disponible.' : ' canciones disponibles.') : 'No encontramos ese título. Prueba otra palabra o pulsa «Ver todas».';
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
  form.appendChild(status);
  var heading = main.querySelector('h1');
  if (heading) heading.insertAdjacentElement('afterend', form);
  else main.prepend(form);
  update('');
}());
