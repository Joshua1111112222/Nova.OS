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

  // Triple tap detection - GLOBAL approach
  let taps = [];
  const TAP_WINDOW = 800; // Longer window for easier triple tap
  
  // Store reference for cleanup
  let globalTapHandler, globalTouchHandler;

  function checkTripleTap() {
    const now = Date.now();
    
    // Clean old taps
    taps = taps.filter(t => now - t < TAP_WINDOW);
    taps.push(now);
    
    console.log(`Global tap detected: ${taps.length} taps in ${TAP_WINDOW}ms window`);
    
    if (taps.length >= 3) {
      console.log("🔥 TRIPLE TAP! Closing app...");
      
      // Clean up global listeners
      window.removeEventListener("click", globalTapHandler, true);
      window.removeEventListener("touchend", globalTouchHandler, true);
      
      host.remove();
      return true;
    }
    return false;
  }

  // AGGRESSIVE global event capture - use capture phase to intercept before iframe
  globalTapHandler = function(e) {
    // Only count if the app is visible and event is within app bounds
    const rect = host.getBoundingClientRect();
    const x = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX);
    const y = e.clientY || (e.touches && e.touches[0] && e.touches[0].clientY);
    
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      checkTripleTap();
    }
  };
  
  globalTouchHandler = function(e) {
    if (e.touches && e.touches.length === 1) { // Single finger only
      const rect = host.getBoundingClientRect();
      const touch = e.touches[0];
      
      if (touch.clientX >= rect.left && touch.clientX <= rect.right && 
          touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        checkTripleTap();
      }
    }
  };

  // Use capture phase (true) to intercept events before they reach iframe
  window.addEventListener("click", globalTapHandler, true);
  window.addEventListener("touchend", globalTouchHandler, true);

  // Fallback: Also listen on document for mobile
  document.addEventListener("touchend", globalTouchHandler, true);
  
  // Visual feedback overlay that activates on rapid tapping
  let overlayActive = false;
  
  function activateOverlay() {
    if (!overlayActive) {
      overlayActive = true;
      tapOverlay.style.pointerEvents = "auto";
      tapOverlay.style.background = "rgba(255,255,255,0.05)"; // Subtle flash
      
      setTimeout(() => {
        overlayActive = false;
        tapOverlay.style.pointerEvents = "none";
        tapOverlay.style.background = "transparent";
      }, 1000);
    }
  }

  // Activate overlay on any rapid interaction
  let rapidTapTimer;
  window.addEventListener("touchstart", () => {
    clearTimeout(rapidTapTimer);
    activateOverlay();
    rapidTapTimer = setTimeout(() => {
      taps = []; // Clear taps after period of inactivity
    }, TAP_WINDOW);
  }, true);

  // Cleanup function for when component is removed
  host.addEventListener("disconnected", () => {
    window.removeEventListener("click", globalTapHandler, true);
    window.removeEventListener("touchend", globalTouchHandler, true);
    document.removeEventListener("touchend", globalTouchHandler, true);
  });

  iframe.addEventListener("load", () => {
    console.log("Iframe loaded - triple tap anywhere on the app to close");
  });
}