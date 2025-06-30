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
    #closeButton {
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 10000;
      background: #ff4444;
      border: none;
      color: white;
      padding: 8px 12px;
      font-size: 16px;
      cursor: pointer;
      border-radius: 4px;
      user-select: none;
    }
    iframe {
      flex: 1;
      border: none;
      width: 100%;
      height: 100%;
      display: block;
      margin: 0;
      padding: 0;
      overflow: hidden;
      background: black;
    }
  </style>

  <button id="closeButton" title="Close app">✕ Close</button>
  <iframe src="https://joshua1111112222.github.io/Perceptra/" allowfullscreen></iframe>
`, boot_up_app);

function boot_up_app(app) {
  const closeButton = app.querySelector("#closeButton");
  const iframe = app.querySelector("iframe");

  if (!closeButton) {
    console.error("Close button not found!");
  } else {
    closeButton.addEventListener("click", () => {
      app.remove();
    });
  }

  // Triple tap detection
  let taps = [];

  function onTap() {
    const now = Date.now();
    taps = taps.filter(t => now - t < 600);
    taps.push(now);
    if (taps.length === 3) {
      app.remove();
      taps = [];
    }
  }

  // Listen on app and document to catch taps
  app.addEventListener("touchend", onTap);
  app.addEventListener("click", onTap);
  document.addEventListener("touchend", onTap);
  document.addEventListener("click", onTap);

  // Optional: Focus iframe or do anything on load
  iframe.addEventListener("load", () => {
    // console.log("Perceptra iframe loaded");
  });
}
