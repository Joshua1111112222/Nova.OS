export const app_name = "perceptra-app";

export const app = _component("perceptra-app", html`
  <div>
    <img src="./apps/perceptra-app/icon.png" alt="Perceptra Icon" style="width:24px; height:24px; vertical-align:middle; margin-right:8px;">
    <span style="font-weight:bold; font-size:14px; vertical-align:middle;">Perceptra</span>
    <button id="closeButton" style="position:absolute; top:8px; left:8px; width:24px; height:24px; background:#f44336; color:white; border:none; border-radius:50%; cursor:pointer; font-size:16px; line-height:24px; text-align:center;">×</button>
  </div>
  <iframe src="https://joshua1111112222.github.io/Perceptra" style="width:100%; height:calc(100% - 32px); border:none;"></iframe>
`, boot_up_app);

function boot_up_app(app) {
  const closeButton = app.querySelector("#closeButton");

  // Close button functionality
  closeButton.addEventListener("click", () => {
    app.style.display = "none"; // Hide the app
    // Trigger home screen logic (this depends on your OS framework)
    const homeScreenEvent = new CustomEvent("navigateToHomeScreen");
    window.dispatchEvent(homeScreenEvent);
  });
}