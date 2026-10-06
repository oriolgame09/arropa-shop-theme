(function () {
  'use strict';

  /* ---------- Menú móvil ---------- */
  function initDrawer(root) {
    var drawer = root.querySelector('[data-drawer]');
    var openBtn = root.querySelector('[data-drawer-open]');
    if (!drawer || !openBtn) return;
    var closeBtn = drawer.querySelector('[data-drawer-close]');

    function toggle(open) {
      drawer.classList.toggle('is-open', open);
      openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
      if (open && closeBtn) closeBtn.focus();
      if (!open) openBtn.focus();
    }
    openBtn.addEventListener('click', function () { toggle(true); });
    if (closeBtn) closeBtn.addEventListener('click', function () { toggle(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) toggle(false);
    });
  }

  /* ---------- Aparición suave al hacer scroll ---------- */
  var observer = null;
  function initReveal(scope) {
    var items = (scope || document).querySelectorAll('.reveal:not(.is-visible)');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    if (!observer) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    }
    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Cantidad (+/-) ---------- */
  function initQty(scope) {
    (scope || document).querySelectorAll('[data-qty]').forEach(function (box) {
      if (box.dataset.ready) return;
      box.dataset.ready = '1';
      var input = box.querySelector('input');
      box.querySelectorAll('button').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var step = btn.dataset.step === 'down' ? -1 : 1;
          var min = parseInt(input.min || '0', 10);
          input.value = Math.max(min, (parseInt(input.value, 10) || 0) + step);
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
      });
    });
  }

  /* ---------- Selector de variantes ---------- */
  function initProduct(scope) {
    (scope || document).querySelectorAll('[data-product]').forEach(function (root) {
      if (root.dataset.ready) return;
      root.dataset.ready = '1';

      var dataEl = root.querySelector('[data-variants]');
      if (!dataEl) return;
      var variants = JSON.parse(dataEl.textContent);
      var idInput = root.querySelector('[data-variant-id]');
      var priceEl = root.querySelector('[data-price]');
      var compareEl = root.querySelector('[data-compare]');
      var addBtn = root.querySelector('[data-add]');
      var addLabel = addBtn ? addBtn.querySelector('span') : null;

      function selected() {
        var vals = [];
        root.querySelectorAll('[data-option]').forEach(function (fs) {
          var checked = fs.querySelector('input:checked');
          vals.push(checked ? checked.value : null);
        });
        return vals;
      }

      function update() {
        var vals = selected();
        var match = variants.find(function (v) {
          return v.options.every(function (o, i) { return o === vals[i]; });
        });
        if (!match) {
          if (addBtn) { addBtn.disabled = true; if (addLabel) addLabel.textContent = 'No disponible'; }
          return;
        }
        if (idInput) idInput.value = match.id;
        if (priceEl) priceEl.textContent = match.price;
        if (compareEl) {
          compareEl.textContent = match.compare;
          compareEl.hidden = !match.onsale;
        }
        if (addBtn) {
          addBtn.disabled = !match.available;
          if (addLabel) addLabel.textContent = match.available ? 'Añadir a la cesta' : 'Agotado';
        }
        var url = new URL(window.location.href);
        url.searchParams.set('variant', match.id);
        window.history.replaceState({}, '', url);
      }

      root.querySelectorAll('[data-option] input').forEach(function (i) {
        i.addEventListener('change', update);
      });
    });
  }

  function init(scope) {
    initReveal(scope);
    initQty(scope);
    initProduct(scope);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initDrawer(document);
    init(document);
  });

  /* Editor de temas de Shopify: recargar sección */
  document.addEventListener('shopify:section:load', function (e) {
    initDrawer(e.target);
    init(e.target);
    e.target.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
  });
})();
