export const app_name = "perceptra-app";

export const app = _component("perceptra-app", html`
  <header-title>
    Perceptra
    <button id="closeAppBtn" title="Close App" style="float:right;">✕</button>
  </header-title>

  <iframe id="perceptraIframe" src="https://your-pwa-link.example.com" style="width:100%; height:calc(100% - 40px); border:none;"></iframe>
`, boot_up_app);

function boot_up_app(app) {
  const iframe = app.querySelector("#perceptraIframe");
  const closeBtn = app.querySelector("#closeAppBtn");

  // Close app handler
  closeBtn.addEventListener("click", () => {
    app.style.display = "none";
  });

  // Triple tap detection variables
  let tapCount = 0;
  let lastTapTime = 0;
  const TAP_DELAY = 600; // ms max between taps

  function resetTap() {
    tapCount = 0;
    lastTapTime = 0;
  }

  // Detect triple tap anywhere on the app to close it
  app.addEventListener("touchend", (e) => {
    const currentTime = Date.now();
    if (currentTime - lastTapTime < TAP_DELAY) {
      tapCount++;
    } else {
      tapCount = 1;
    }
    lastTapTime = currentTime;

    if (tapCount === 3) {
      resetTap();
      app.style.display = "none";
    }
  });

  // Optional: expose a way to open the app again from outside
  app.open = () => {
    app.style.display = "block";
  };

  // Initially hide app if needed or leave visible
  // app.style.display = "none"; // uncomment if you want to start hidden
}
