export const app_name = "passwords-app";

export const app = _component("passwords-app", html`
  <link rel="stylesheet" href="./apps/passwords-app/styles.css">

  <main-area>
    <header-title>
      Password Manager
    </header-title>

    <passcode-content>
      <section>
        <h3>Current Passcode</h3>
        <input id="currentPasscode" type="password" readonly value="" />
      </section>

      <section>
        <h3>Set New Passcode</h3>
        <input id="newPasscode" type="password" placeholder="Enter new passcode" />
        <button id="savePasscodeBtn">Save New Passcode</button>
      </section>

      <section>
        <h3>Reset Passcode</h3>
        <p>If you forget your passcode, it will fallback to:</p>
        <code>Cedar Point Ahh</code>
      </section>
    </passcode-content>
  </main-area>
`, boot_up_app);

function boot_up_app(app) {
  const currentPasscodeInput = app.querySelector("#currentPasscode");
  const newPasscodeInput = app.querySelector("#newPasscode");
  const savePasscodeBtn = app.querySelector("#savePasscodeBtn");

  // Load current passcode from localStorage or show fallback
  function loadPasscode() {
    const savedPasscode = localStorage.getItem("novaos_passcode") || "Cedar Point Ahh";
    currentPasscodeInput.value = savedPasscode;
  }

  // Save new passcode to localStorage
  function saveNewPasscode() {
    const newPass = newPasscodeInput.value.trim();
    if (!newPass) {
      alert("Please enter a new passcode.");
      return;
    }
    localStorage.setItem("novaos_passcode", newPass);
    newPasscodeInput.value = "";
    loadPasscode();
    alert("✅ Passcode updated!");
  }

  savePasscodeBtn.addEventListener("click", saveNewPasscode);

  // Init
  loadPasscode();
}
