(function () {
  var scriptBase = (function () {
    if (document.currentScript && document.currentScript.src) {
      return new URL("./", document.currentScript.src).toString();
    }

    var scripts = document.getElementsByTagName("script");
    var lastScript = scripts[scripts.length - 1];
    if (lastScript && lastScript.src) {
      return new URL("./", lastScript.src).toString();
    }

    return window.location.origin + "/";
  })();

  var localAssets = {
    "d3@7.9.0": "vendor/d3-7.9.0.min.js",
    "markmap-lib@0.18.12": "vendor/markmap-lib-0.18.12.min.js",
    "markmap-view@0.18.12": "vendor/markmap-view-0.18.12.min.js",
    "markmap-toolbar@0.18.12": "vendor/markmap-toolbar-0.18.12.min.js",
    "markmap-toolbar@0.18.12/dist/style.css": "vendor/markmap-toolbar-0.18.12.css",
  };

  function provider(path) {
    if (localAssets[path]) {
      return new URL(localAssets[path], scriptBase).toString();
    }

    return "https://cdn.jsdelivr.net/npm/" + path;
  }

  window.markmap = window.markmap || {};
  window.markmap.autoLoader = Object.assign(
    {
      provider: provider,
      toolbar: false,
    },
    window.markmap.autoLoader || {}
  );

  function injectScript(src) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = src;
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  var candidates = [
    new URL("vendor/markmap-autoloader-0.18.12.min.js", scriptBase).toString(),
    "https://cdn.jsdelivr.net/npm/markmap-autoloader@0.18.12/dist/index.js",
    "https://unpkg.com/markmap-autoloader@0.18.12/dist/index.js",
  ];

  var loaded = false;

  function showFallback() {
    function applyFallback() {
      document.querySelectorAll(".markmap").forEach(function (container) {
        if (container.querySelector("svg")) {
          return;
        }

        if (!container.querySelector(".markmap-fallback-msg")) {
          var message = document.createElement("div");
          message.className = "markmap-fallback-msg";
          message.textContent = "No se pudo cargar el mapa mental. Recarga la pagina.";
          container.appendChild(message);
        }

        container.classList.add("mm-ready");
      });
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", applyFallback, { once: true });
      return;
    }

    applyFallback();
  }

  function tryNext(index) {
    if (loaded) {
      return;
    }

    if (index >= candidates.length) {
      showFallback();
      return;
    }

    injectScript(candidates[index])
      .then(function () {
        loaded = true;
      })
      .catch(function () {
        tryNext(index + 1);
      });
  }

  tryNext(0);
})();
