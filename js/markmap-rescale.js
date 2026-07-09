(function () {
  var LEFT_PADDING  = 24;
  var TARGET_SCALE  = 1.25;  // escala absoluta deseada (no multiplicador de fit())
  var V_PADDING     = 28;
  var STABLE_MS    = 300;  // ms sin mutaciones antes de ajustar
  var MAX_WAIT_MS  = 6000; // tiempo máximo de espera

  function preventWheelCapture(container) {
    if (container.dataset.mmWheel) return;
    container.addEventListener('wheel', function (e) {
      e.stopPropagation();
    }, { capture: true, passive: true });
    container.dataset.mmWheel = '1';
  }

  function adjustContainer(container) {
    if (container.dataset.mmAdjusted) return;

    var svg = container.querySelector('svg');
    if (!svg) { container.classList.add('mm-ready'); return; }
    var g = svg.querySelector('g');
    if (!g) { container.classList.add('mm-ready'); return; }

    // Verificar que fit() ya aplicó un transform (sino, markmap aún no terminó)
    var t = g.getAttribute('transform') || '';
    if (!t.match(/translate\([^,]+,\s*[^)]+\)\s*scale\([^)]+\)/)) {
      container.classList.add('mm-ready'); return;
    }

    var bbox;
    try { bbox = g.getBBox(); } catch (e) { container.classList.add('mm-ready'); return; }
    if (!bbox || bbox.height < 10) { container.classList.add('mm-ready'); return; }

    // Escala absoluta: igual para todos los árboles, solo reducida si el árbol
    // es tan ancho que desbordaría el contenedor
    var svgW = svg.getBoundingClientRect().width || 750;
    var maxByWidth = bbox.width > 0 ? (svgW - LEFT_PADDING) / bbox.width : TARGET_SCALE;
    var s = Math.min(TARGET_SCALE, maxByWidth);

    // Marcar como ajustado ANTES de tocar el DOM (evita re-entrada desde MutationObserver)
    container.dataset.mmAdjusted = '1';

    // Posicionar: raíz a la izquierda, tope del árbol en V_PADDING desde arriba
    var newTy = V_PADDING - bbox.y * s;
    g.setAttribute('transform',
      'translate(' + LEFT_PADDING + ',' + newTy + ') scale(' + s + ')'
    );

    // Recortar el espacio vacío inferior sin cambiar height del contenedor
    // (cambiar height dispararía el ResizeObserver de markmap y re-ejecutaría fit())
    var treeHeight = Math.ceil(bbox.height * s) + V_PADDING * 2;
    var containerHeight = container.offsetHeight || 750;
    var excess = containerHeight - treeHeight;

    if (excess > 0) {
      container.style.clipPath = 'inset(0 0 ' + excess + 'px 0)';
      container.style.marginBottom = '-' + excess + 'px';
    }

    container.classList.add('mm-ready');
  }

  function watchContainer(container) {
    preventWheelCapture(container);
    if (container.dataset.mmWatched) return;
    container.dataset.mmWatched = '1';

    var timer = null;
    var start = Date.now();

    function runAndDisconnect() {
      observer.disconnect();
      adjustContainer(container);
    }

    function schedule() {
      clearTimeout(timer);
      timer = setTimeout(runAndDisconnect, STABLE_MS);
    }

    var observer = new MutationObserver(function () {
      if (container.dataset.mmAdjusted) { observer.disconnect(); return; }
      if (Date.now() - start > MAX_WAIT_MS) { runAndDisconnect(); return; }
      schedule();
    });

    observer.observe(container, { childList: true, subtree: true, attributes: true });
    schedule(); // disparo inicial por si markmap ya terminó
  }

  function init() {
    document.querySelectorAll('.markmap').forEach(watchContainer);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('load', init);
})();
