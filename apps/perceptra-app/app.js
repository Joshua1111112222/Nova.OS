export const app_name = "perceptra-app";

export const app = _component("perceptra-app", html`
  <header-title>
    Perceptra
    <button id="closeAppBtn" title="Close App" style="float:right;">✕</button>
  </header-title>

  <div id="iframeWrapper" style="width:100%; height:calc(100% - 40px); position:relative;">
    <iframe 
      id="perceptraIframe"
      src="https://joshua1111112222.github.io/Perceptra/"
      style="width:100%; height:100%; border:none; display:block;"></iframe>
    <!-- Invisible overlay to capture triple taps -->
    <div id="tapOverlay"
      style="
        position:absolute; top:0; left:0; width:100%; height:100%;
        z-index:10; background:transparent;"></div>
  </div>
`, boot_up_app);

function boot_up_app(app) {
  const closeBtn = app.querySelector("#closeAppBtn");
  const tapOverlay = app.querySelector("#tapOverlay");

  // Manual close button
  closeBtn.addEventListener("click", () => {
    console.log("[Perceptra] Close button clicked");
    app.style.display = "none";
  });

  // Triple tap detection — works for mouse + touch
  let tapCount = 0;
  let lastTapTime = 0;
  const TAP_DELAY = 600; // ms

  function registerTap() {
    const now = Date.now();
    if (now - lastTapTime < TAP_DELAY) {
      tapCount++;
    } else {
      tapCount = 1;
    }
    lastTapTime = now;

    console.log(`[Perceptra] Tap #${tapCount}`);

    if (tapCount >= 3) {
      console.log("[Perceptra] Triple tap detected — closing app");
      app.style.display = "none";
      tapCount = 0;
      lastTapTime = 0;
    }
  }

  // Attach to invisible overlay above iframe
  tapOverlay.addEventListener("touchend", registerTap);
  tapOverlay.addEventListener("click", registerTap);

  // Optional: expose an open() for your AppHandler
  app.open = () => {
    console.log("[Perceptra] Opening app");
    app.style.display = "block";
  };
}
