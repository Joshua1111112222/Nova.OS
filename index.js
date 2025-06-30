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
  // Get the actual custom element host - try multiple methods for your framework
  const host = app.getRootNode()?.host || app.host || document.querySelector('perceptra-app');
  
  const closeButton = app.querySelector("#closeButton");
  const iframe = app.querySelector("iframe");

  console.log("App booted, host element:", host);
  console.log("Close button found:", closeButton);

  // Close button with framework-aware removal
  closeButton.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Close button clicked!");
    
    try {
      // First try removing from your app handler if it exists
      if (window.app_handler && window.app_handler.removeApp) {
        console.log("Removing via app_handler...");
        window.app_handler.removeApp('perceptra-app');
      }
      
      // Try standard DOM removal methods
      if (host && host.remove) {
        console.log("Removing host element...");
        host.remove();
      } else if (host && host.parentNode) {
        console.log("Removing via parentNode...");
        host.parentNode.removeChild(host);
      }
      
      // Fallback: find and remove all instances
      const allInstances = document.querySelectorAll('perceptra-app');
      allInstances.forEach(instance => {
        console.log("Removing instance:", instance);
        instance.remove();
      });
      
      // Last resort: hide the element
      if (host) {
        host.style.display = 'none';
        host.style.visibility = 'hidden';
      }
      
    } catch (error) {
      console.error("Error removing app:", error);
      // Emergency fallback - hide all perceptra apps
      document.querySelectorAll('perceptra-app').forEach(el => {
        el.style.display = 'none';
      });
    }
  });

  // Ensure button works - make it very clickable
  closeButton.style.pointerEvents = 'auto';
  closeButton.style.zIndex = '99999';
  closeButton.style.position = 'absolute';
  closeButton.style.cursor = 'pointer';
  
  // Add visual feedback
  closeButton.addEventListener("mousedown", () => {
    closeButton.style.transform = 'scale(0.9)';
  });
  
  closeButton.addEventListener("mouseup", () => {
    closeButton.style.transform = 'scale(1)';
  });

  iframe.addEventListener("load", () => {
    console.log("Iframe loaded");
  });
}