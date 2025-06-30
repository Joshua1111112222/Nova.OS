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
      pointer-events: auto;
    }

    /* Invisible overlay for capturing taps */
    #tapOverlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 999;
      pointer-events: none;
      background: transparent;
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

  <div id="tapOverlay"></div>
  <button id="closeButton" title="Close app">×</button>
  <iframe src="https://joshua1111112222.github.io/Perceptra/" allowfullscreen></iframe>
`, boot_up_app);

function boot_up_app(app) {
  // 'app' is shadow root, get host element (the custom element)
  const host = app.host || app.getRootNode().host || app;
  
  const closeButton = app.querySelector("#closeButton");
  const iframe = app.querySelector("iframe");
  const tapOverlay = app.querySelector("#tapOverlay");

  // Close button works by removing the host custom element
  closeButton.addEventListener("click", () => {
    host.remove();
  });

  // Triple tap detection variables
  let taps = [];
  let tapTimeout;

  function onTap(e) {
    // Prevent default to avoid issues
    e.preventDefault();
    
    const now = Date.now();
    
    // Clear any existing timeout
    if (tapTimeout) {
      clearTimeout(tapTimeout);
    }
    
    // Remove taps older than 600ms
    taps = taps.filter(t => now - t < 600);
    taps.push(now);
    
    console.log(`Tap detected: ${taps.length} taps`); // Debug log
    
    if (taps.length >= 3) {
      console.log("Triple tap detected! Closing app..."); // Debug log
      host.remove();
      taps = [];
      return;
    }
    
    // Reset taps after 600ms if no more taps
    tapTimeout = setTimeout(() => {
      taps = [];
    }, 600);
  }

  // Use a unified approach - detect both touch and mouse events
  // but prevent double-firing
  let lastEventTime = 0;
  
  function handleTapEvent(e) {
    const now = Date.now();
    // Prevent double-firing within 50ms
    if (now - lastEventTime < 50) {
      return;
    }
    lastEventTime = now;
    onTap(e);
  }

  // Listen on the host element itself to catch all events
  host.addEventListener("touchend", handleTapEvent, { passive: false });
  host.addEventListener("click", handleTapEvent);
  
  // Also listen on the tap overlay when it's active
  tapOverlay.addEventListener("touchend", handleTapEvent, { passive: false });
  tapOverlay.addEventListener("click", handleTapEvent);

  // Temporarily enable pointer events on overlay during rapid tapping
  let rapidTapMode = false;
  
  function enableRapidTapMode() {
    if (!rapidTapMode) {
      rapidTapMode = true;
      tapOverlay.style.pointerEvents = "auto";
      console.log("Rapid tap mode enabled"); // Debug log
      
      // Disable after 1 second of no activity
      setTimeout(() => {
        rapidTapMode = false;
        tapOverlay.style.pointerEvents = "none";
        console.log("Rapid tap mode disabled"); // Debug log
      }, 1000);
    }
  }
  
  // Enable rapid tap mode on first tap
  host.addEventListener("touchstart", enableRapidTapMode);
  host.addEventListener("mousedown", enableRapidTapMode);

  iframe.addEventListener("load", () => {
    console.log("Iframe loaded");
  });
}