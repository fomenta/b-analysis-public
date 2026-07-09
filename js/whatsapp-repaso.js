/**
 * Repaso rápido (WhatsApp): feedback al copiar bloques ```whatsapp
 */
(function () {
  function showToast(message) {
    var existing = document.querySelector(".whatsapp-repaso-toast");
    if (existing) existing.remove();

    var toast = document.createElement("div");
    toast.className = "whatsapp-repaso-toast";
    toast.setAttribute("role", "status");
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(function () {
      toast.classList.add("whatsapp-repaso-toast--visible");
    });

    window.setTimeout(function () {
      toast.classList.remove("whatsapp-repaso-toast--visible");
      window.setTimeout(function () {
        toast.remove();
      }, 300);
    }, 2800);
  }

  function isWhatsAppBlock(button) {
    var pre = button && button.closest("pre");
    return pre && pre.classList.contains("whatsapp-repaso");
  }

  document.addEventListener(
    "click",
    function (event) {
      var target = event.target;
      if (!target || !target.closest) return;
      var copyBtn = target.closest(".md-clipboard");
      if (!copyBtn || !isWhatsAppBlock(copyBtn)) return;

      window.setTimeout(function () {
        showToast("Copiado — pégalo en WhatsApp");
      }, 120);
    },
    true
  );
})();
