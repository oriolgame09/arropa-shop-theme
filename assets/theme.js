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

  /* ---------- Fecha estimada de entrega (días laborables) ---------- */
  function addBusinessDays(date, n) {
    var d = new Date(date.getTime());
    while (n > 0) {
      d.setDate(d.getDate() + 1);
      var day = d.getDay();
      if (day !== 0 && day !== 6) n--;
    }
    return d;
  }
  function initDelivery(root) {
    var out = root.querySelector('[data-delivery-range]');
    var min = parseInt(root.dataset.minDays, 10), max = parseInt(root.dataset.maxDays, 10);
    if (!out || !min || !max) return;
    try {
      var fmt = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long' });
      out.textContent = 'entre el ' + fmt.format(addBusinessDays(new Date(), min)) + ' y el ' + fmt.format(addBusinessDays(new Date(), max));
    } catch (e) { /* se queda el texto de días laborables */ }
  }

  /* ---------- Selector de variantes, stock real y barra de compra ---------- */
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
      var stockEl = root.querySelector('[data-stock]');
      var lowStock = parseInt(root.dataset.lowStock, 10) || 0;
      var buybar = document.querySelector('[data-buybar]');
      var mirror = buybar ? buybar.querySelector('[data-price-mirror]') : null;
      var addBtns = document.querySelectorAll('[data-add]');

      function setAdd(label, disabled) {
        addBtns.forEach(function (btn) {
          var span = btn.querySelector('span');
          var short = btn.closest('[data-buybar]') !== null;
          if (span) span.textContent = (short && label === 'Añadir a la cesta') ? 'Añadir' : label;
          btn.disabled = disabled;
        });
      }

      function selected() {
        var vals = [];
        root.querySelectorAll('[data-option]').forEach(function (fs) {
          var checked = fs.querySelector('input:checked');
          vals.push(checked ? checked.value : null);
        });
        return vals;
      }

      function markAvailability() {
        var vals = selected();
        root.querySelectorAll('[data-option]').forEach(function (fs, idx) {
          fs.querySelectorAll('input').forEach(function (input) {
            var ok = variants.some(function (v) {
              return v.available && v.options[idx] === input.value &&
                v.options.every(function (o, i) { return i === idx || vals[i] === null || o === vals[i]; });
            });
            if (ok) input.removeAttribute('data-unavailable'); else input.setAttribute('data-unavailable', '');
          });
        });
      }

      function showStock(v) {
        if (!stockEl) return;
        var n = v && v.available ? v.stock : 0;
        if (lowStock > 0 && n > 0 && n <= lowStock) {
          stockEl.querySelector('span').textContent = n === 1 ? 'Queda 1 unidad' : 'Quedan ' + n + ' unidades';
          stockEl.hidden = false;
        } else {
          stockEl.hidden = true;
        }
      }

      function update() {
        var vals = selected();
        var match = variants.find(function (v) {
          return v.options.every(function (o, i) { return o === vals[i]; });
        });
        if (!match) { setAdd('No disponible', true); showStock(null); return; }
        if (idInput) idInput.value = match.id;
        if (priceEl) priceEl.textContent = match.price;
        if (mirror) mirror.textContent = match.price;
        if (compareEl) { compareEl.textContent = match.compare; compareEl.hidden = !match.onsale; }
        setAdd(match.available ? 'Añadir a la cesta' : 'Agotado', !match.available);
        showStock(match);
        markAvailability();
        var url = new URL(window.location.href);
        url.searchParams.set('variant', match.id);
        window.history.replaceState({}, '', url);
      }

      root.querySelectorAll('[data-option] input').forEach(function (i) {
        i.addEventListener('change', update);
      });

      /* estado inicial */
      var current = idInput ? variants.find(function (v) { return String(v.id) === String(idInput.value); }) : null;
      showStock(current || null);
      markAvailability();
      initDelivery(root);

      /* barra de compra: aparece al salir del botón principal de la pantalla */
      var mainBtn = root.querySelector('[data-add]');
      if (buybar && mainBtn && 'IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          var out = !entries[0].isIntersecting && entries[0].boundingClientRect.top < 0;
          buybar.classList.toggle('is-visible', out);
          buybar.setAttribute('aria-hidden', out ? 'false' : 'true');
          buybar.querySelector('[data-add]').tabIndex = out ? 0 : -1;
        }).observe(mainBtn);
      }
    });
  }

  /* ---------- Guía de tallas (panel nativo) ---------- */
  function initGuide() {
    document.addEventListener('click', function (e) {
      var open = e.target.closest('[data-guide-open]');
      if (open) {
        var d = document.getElementById(open.getAttribute('data-guide-open'));
        if (d && d.showModal) d.showModal();
        return;
      }
      var close = e.target.closest('[data-guide-close]');
      if (close) { var dlg = close.closest('dialog'); if (dlg) dlg.close(); return; }
      if (e.target.tagName === 'DIALOG' && e.target.classList.contains('guide')) e.target.close();
    });
  }

  /* ---------- Modo claro / oscuro ---------- */
  function initTheme() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-theme-toggle]');
      if (!btn) return;
      var root = document.documentElement;
      var current = root.getAttribute('data-theme');
      if (!current) current = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      var next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (err) {}
    });
  }

  /* ---------- Luz que sigue al cursor en las tarjetas ---------- */
  function initGlow() {
    if (!window.matchMedia('(hover: hover)').matches) return;
    document.addEventListener('pointermove', function (e) {
      var card = e.target.closest && e.target.closest('.card');
      if (!card) return;
      var media = card.querySelector('.card__media') || card;
      var r = media.getBoundingClientRect();
      card.style.setProperty('--x', (e.clientX - r.left) + 'px');
      card.style.setProperty('--y', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  function init(scope) {
    initReveal(scope);
    initQty(scope);
    initProduct(scope);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initDrawer(document);
    initTheme();
    initGlow();
    initGuide();
    init(document);
  });

  /* Editor de temas de Shopify: recargar sección */
  document.addEventListener('shopify:section:load', function (e) {
    initDrawer(e.target);
    init(e.target);
    e.target.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
  });
})();
