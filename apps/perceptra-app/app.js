export const app_name = "perceptra-app";

export const app = _component(app_name, html`
  <iframe id="perceptraIframe" src="https://your-pwa-link-here" style="
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

  // Triple tap anywhere
  let tapCount = 0;
  let lastTap = 0;

  window.addEventListener("touchend", () => {
    const now = Date.now();
    if (now - lastTap < 400) {
      tapCount++;
      if (tapCount >= 3) {
        app.remove();
      }
    } else {
      tapCount = 1;
    }
    lastTap = now;
  });
}
