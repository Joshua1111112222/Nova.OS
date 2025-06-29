export const app_name = "perceptra-app";

export const app = _component("perceptra-app", html`
  <div>
    <img src="./apps/perceptra-app/icon.png" alt="Perceptra Icon" style="width:24px; height:24px; vertical-align:middle; margin-right:8px;">
    <span style="font-weight:bold; font-size:14px; vertical-align:middle;">Perceptra</span>
  </div>
  <iframe src="https://joshua1111112222.github.io/Perceptra" style="width:100%; height:calc(100% - 32px); border:none;"></iframe>
`, boot_up_app);

function boot_up_app(app) {
  let tapCount = 0;
  let tapTimeout;

  // Function to handle triple tap
  function handleTripleTap() {
    // Transition to the "in-between screen"
    app.style.display = "none"; // Hide the app
    const inBetweenScreen = document.createElement("div");
    inBetweenScreen.id = "inBetweenScreen";
    inBetweenScreen.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #222;
      color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 18px;
      z-index: 10000;
    `;
    inBetweenScreen.textContent = "App Paused. Tap again to return to Home Screen.";
    document.body.appendChild(inBetweenScreen);

    // Add event listener to transition to the home screen
    inBetweenScreen.addEventListener("click", () => {
      document.body.removeChild(inBetweenScreen); // Remove the "in-between screen"
      app.style.display = "none"; // Ensure the app remains closed
      // Trigger home screen logic (this depends on your OS framework)
      const homeScreenEvent = new CustomEvent("navigateToHomeScreen");
      window.dispatchEvent(homeScreenEvent);
    });
  }

  // Event listener for triple tap detection
  app.addEventListener("click", () => {
    tapCount++;
    clearTimeout(tapTimeout);
    tapTimeout = setTimeout(() => {
      tapCount = 0; // Reset tap count after 500ms
    }, 500);

    if (tapCount === 3) {
      handleTripleTap();
    }
  });
}