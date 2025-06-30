export const app_name = "perceptra-app";

export const app = _component(app_name, html`
  <iframe id="perceptraIframe" src="https://joshua1111112222.github.io/Perceptra/" style="
    position: fixed;
    top: 0; left: 0;
    width: 100%;
    height: 100%;
    border: none;
    z-index: 1;
  "></iframe>

  <button id="closeButton" style="
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 9999;
    background: rgba(0,0,0,0.8);
    color: white;
    border: none;
    padding: 10px 14px;
    border-radius: 5px;
    font-size: 14px;
    cursor: pointer;
  ">✕</button>
`);

export function boot_up_app(app) {
  const closeButton = app.querySelector("#closeButton");
  closeButton.addEventListener("click", () => app.remove());

  // Triple tap detection on document
  let tapCount = 0;
  let lastTapTime = 0;

  function onTap() {
    const now = Date.now();
    if (now - lastTapTime < 400) {
      tapCount++;
      if (tapCount >= 3) {
        app.remove();
        tapCount = 0;
      }
    } else {
      tapCount = 1;
    }
    lastTapTime = now;
  }

  document.addEventListener("touchend", onTap);
  document.addEventListener("click", onTap);
}
