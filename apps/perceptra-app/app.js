export const app_name = "perceptra-app";

export const app = _component("perceptra-app", html`
  <style>
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
      margin: 0;
      padding: 0;
      background: black;
      overflow: hidden;
      position: relative;
      font-family: Arial, sans-serif;
    }

    iframe {
      flex: 1;
      border: none;
      width: 100%;
      height: 100%;
      display: block;
      margin: 0;
      padding: 0;
      background: black;
      overflow: hidden;
    }

    /* Close button top left with red background */
    #closeButton {
      position: absolute;
      top: 8px;
      left: 8px;
      background: #ff0000;
      border: none;
      color: white;
      font-size: 24px;
      font-weight: bold;
      cursor: pointer;
      user-select: none;
      z-index: 1000;
      width: 32px;
      height: 32px;
      line-height: 24px;
      text-align: center;
      padding: 0;
      border-radius: 4px;
    }
    #closeButton:hover {
      background: #cc0000;
    }
  </style>

  <button id="closeButton" title="Close app">×</button>
  <iframe src="https://joshua1111112222.github.io/Perceptra/" allowfullscreen></iframe>
`, boot_up_app);

function boot_up_app(app) {
  const closeButton = app.querySelector("#closeButton");
  const iframe = app.querySelector("iframe");

  // X button restarts the whole system using Terminal's restart logic
  closeButton.addEventListener("click", () => {
    console.log("Restarting OS...");
    self.location = self.location;
  });

  // Triple tap detection for alternative close method
  let taps = [];
  const TAP_WINDOW = 600;

  function handleTripleTap(e) {
    const now = Date.now();
    taps = taps.filter(t => now - t < TAP_WINDOW);
    taps.push(now);

    if (taps.length >= 3) {
      const host = app.getRootNode().host;
      if (host) {
        host.remove();
      }
      taps = [];
    }
  }

  // Listen for taps on the whole app
  app.addEventListener("click", handleTripleTap);
  app.addEventListener("touchend", handleTripleTap);

  iframe.addEventListener("load", () => {
    console.log("Perceptra loaded");
  });
}