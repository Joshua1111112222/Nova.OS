export function boot_up_app(app) {
  const closeButton = app.querySelector("#closeButton");
  closeButton.addEventListener("click", () => app.remove());

  let tapTimes = [];

  function handleTap() {
    const now = Date.now();

    // Remove taps older than 600ms
    tapTimes = tapTimes.filter(time => now - time < 600);

    tapTimes.push(now);

    if (tapTimes.length === 3) {
      // Triple tap detected within 600ms window
      app.remove();
      tapTimes = [];
    }
  }

  // Listen for taps on the whole app container AND document (for reliability)
  app.addEventListener("touchend", handleTap);
  app.addEventListener("click", handleTap);

  // ALSO listen globally, in case taps happen outside iframe or tricky input zones
  document.addEventListener("touchend", handleTap);
  document.addEventListener("click", handleTap);
}
