if ("serviceWorker" in navigator) {
  console.log("registering service worker");
  await navigator.serviceWorker.register("/sw.js");
  console.log("done registering service worker");
  await new Promise((r) => setTimeout(r, 1000));
  let el = document.querySelector("#app");
  if (el?.innerHTML.trim() === "") {
    // window.location.reload();
    let res = await fetch("/");
    let html = await res.text();
    let fragment = document.createRange().createContextualFragment(html);
    let fragmentEl = fragment.querySelector("#app");
    console.log("fragmentEl:", fragmentEl);
    if (fragmentEl) {
      el.innerHTML = fragmentEl.innerHTML;
    }
  }
}
