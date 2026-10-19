'use strict';
(async () => {
  const input = document.querySelector('#buscar');
  const status = document.querySelector('#estado');
  const grid = document.querySelector('#catalogo');
  const form = document.querySelector('form');
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  form.addEventListener('submit', event => event.preventDefault());
  try {
    const response = await fetch('/', {cache: 'no-cache'});
    if (!response.ok) throw new Error('No se pudo cargar el catálogo');
    const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
    const products = Array.from(doc.querySelectorAll('#productos .producto'), card => document.importNode(card, true));
    if (!products.length) throw new Error('Catálogo vacío');
    grid.replaceChildren(...products);
    const filter = () => {
      const words = normalize(input.value).trim().split(/\s+/).filter(Boolean);
      let count = 0;
      for (const card of products) {
        const text = normalize(card.textContent);
        card.hidden = !words.every(word => text.includes(word));
        if (!card.hidden) count++;
      }
      status.textContent = count ? `${count} producto${count === 1 ? '' : 's'} encontrado${count === 1 ? '' : 's'}.` : 'No encontramos productos. Prueba otra palabra o limpia la búsqueda.';
    };
    input.addEventListener('input', filter);
    form.addEventListener('reset', () => {input.value = ''; filter(); input.focus();});
    filter();
  } catch (error) {
    status.textContent = 'No pudimos cargar el catálogo. Visita el catálogo de inicio o vuelve a intentarlo.';
    const link = document.createElement('a');
    link.href = '/#productos';
    link.textContent = 'Ver catálogo de inicio';
    grid.replaceChildren(link);
  }
})();
