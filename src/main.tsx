// If we are running this file on load, then we've receive the initial
// `index.html` response from the server, because we specifically don't include
// the entry <script> for this file when serving from the service worker.
// So, if we get this, it means we _didn't_ hit the service worker so we can
// register it and bootstrap the UI with an initial manual request to the
// service worker.  Then, subsequent navigations should respond with "documents"
// from the service worker without a <script> tag for this file.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").then(init);
}

async function init() {
  let el = document.querySelector("#app");
  if (!el) throw new Error("No #app element found");
  let res = await fetch("/");
  let html = await res.text();
  let fragment = document.createRange().createContextualFragment(html);
  let fragmentEl = fragment.querySelector("#app");
  if (!fragmentEl) throw new Error("No #app element found in fragment");
  el.innerHTML = fragmentEl.innerHTML;
}
