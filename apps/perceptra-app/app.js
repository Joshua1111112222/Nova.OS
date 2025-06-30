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

    /* Minimal close button top right */
    #closeButton {
      position: absolute;
      top: 8px;
      right: 8px;
      background: transparent;
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
    }
    #closeButton:hover {
      color: #ff4444;
    }
  </style>

  <button id="closeButton" title="Close app">×</button>
  <iframe src="https://joshua1111112222.github.io/Perceptra/" allowfullscreen></iframe>
`, boot_up_app);

function boot_up_app(app) {
  // 'app' is shadow root, get host element (the custom element)
  const host = app.host || app.getRootNode().host || app;

  const closeButton = app.querySelector("#closeButton");
  const iframe = app.querySelector("iframe");

  // Close button works by removing the host custom element
  closeButton.addEventListener("click", () => {
    host.remove();
  });

  // Triple tap detection variables
  let taps = [];

  function onTap() {
    const now = Date.now();

    // Remove taps older than 600ms
    taps = taps.filter(t => now - t < 600);
    taps.push(now);

    if (taps.length === 3) {
      host.remove();
      taps = [];
    }
  }

  // Listen for taps and clicks inside the app and document-wide
  app.addEventListener("touchend", onTap);
  app.addEventListener("click", onTap);
  document.addEventListener("touchend", onTap);
  document.addEventListener("click", onTap);

  iframe.addEventListener("load", () => {
    // You can log or do something on iframe load here
    // console.log("Iframe loaded");
  });
}
