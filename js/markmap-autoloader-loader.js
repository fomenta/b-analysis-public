(function () {
  window.markmap = window.markmap || {};
  window.markmap.autoLoader = Object.assign(
    {
      provider: "jsdelivr",
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
    "https://cdn.jsdelivr.net/npm/markmap-autoloader@0.18.12/dist/index.js",
    "https://unpkg.com/markmap-autoloader@0.18.12/dist/index.js",
  ];

  var loaded = false;

  function tryNext(index) {
    if (loaded || index >= candidates.length) {
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
