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

  <!-- Transparent overlay for triple tap -->
  <div id="tapOverlay" style="
    position: fixed;
    top: 0; left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    background: transparent;
  "></div>

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

  const tapOverlay = app.querySelector("#tapOverlay");
  let tapCount = 0;
  let lastTapTime = 0;

  tapOverlay.addEventListener("click", (e) => {
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

    // Let clicks pass through the overlay so iframe works
    e.stopPropagation();
  });

  // Make the overlay ignore pointer events for normal iframe use
  tapOverlay.style.pointerEvents = "none";

  // But re-enable pointer events only to detect taps
  // So we re-enable pointer-events briefly on touchstart
  window.addEventListener("touchstart", () => {
    tapOverlay.style.pointerEvents = "auto";
    setTimeout(() => {
      tapOverlay.style.pointerEvents = "none";
    }, 200);
  });
}
