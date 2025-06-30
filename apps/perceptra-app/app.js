export const app_name = "perceptra-app";

export const app = _component("perceptra-app", html`
  <div id="perceptraContainer" style="position: relative; width: 100%; height: 100%; background: #000;">
    <!-- Invisible tap overlay for triple tap -->
    <div id="tapOverlay"
      style="
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        z-index: 10; background: transparent;">
    </div>

    <!-- Embedded iframe filling 100% -->
    <iframe 
      id="perceptraIframe"
      src="https://joshua1111112222.github.io/Perceptra/"
      style="width: 100%; height: 100%; border: none; display: block; background: #000;">
    </iframe>
  </div>
`, boot_up_app);

function boot_up_app(app) {
  const tapOverlay = app.querySelector("#tapOverlay");

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

  tapOverlay.addEventListener("touchend", registerTap);
  tapOverlay.addEventListener("click", registerTap);

  // Optional: expose open for AppHandler
  app.open = () => {
    console.log("[Perceptra] Opening app");
    app.style.display = "block";
  };
}