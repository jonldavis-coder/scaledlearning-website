/* ScaledLearning GA4.
   The page_view is queued immediately. The ~179 KB gtag.js library is not
   downloaded until the visitor interacts, or 15 seconds after load if they
   never do, so it stays off the first-paint path and the hit is still sent. */
(function () {
  var ID = "G-X9B9EXHXNJ";
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", ID);

  var loaded = false;
  function load() {
    if (loaded) return;
    loaded = true;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + ID;
    document.head.appendChild(s);
  }

  ["pointerdown", "keydown", "scroll", "touchstart"].forEach(function (evt) {
    window.addEventListener(evt, load, { once: true, passive: true });
  });

  function later() {
    setTimeout(load, 15000);
  }
  if (document.readyState === "complete") later();
  else window.addEventListener("load", later);
})();
