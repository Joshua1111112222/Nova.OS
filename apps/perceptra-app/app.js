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


  </style>


  <iframe src="https://joshua1111112222.github.io/Perceptra/" allowfullscreen></iframe>
`, boot_up_app);

function boot_up_app(app) {
  const iframe = app.querySelector("iframe");

  // Triple tap detection to close app
  let taps = [];
  const TAP_WINDOW = 600;

  function handleTripleTap(e) {
    // Prevent the iframe from capturing the event
    e.stopPropagation();
    
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

  // Listen for taps on the whole app with capture to catch events before iframe
  app.addEventListener("click", handleTripleTap, true);
  app.addEventListener("touchend", handleTripleTap, true);

  iframe.addEventListener("load", () => {
    console.log("Perceptra loaded");
  });
}