import { settings } from "./src/loadSettings.js";
import { loading_bar } from "./src/loading_bar.js";
import { AppHandler } from "./src/apps.js";
import { styling } from "./styling.js";
import { items } from "./src/custom.js";

// === FONTS & INIT ===
addCSSFont("https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;1,300&display=swap");
OSCRIPT.experimental.autoDefine();
console.log(settings);

// === FACE ID FUNCTION ===
async function runFaceID() {
  try {
    const result = await navigator.credentials.get({
      publicKey: {
        challenge: new Uint8Array(32),
        timeout: 60000,
        userVerification: "required",
      }
    });
    unlockHome();
  } catch (err) {
    console.log("Face ID failed:", err);
    showPasscodeInput();
  }
}

// === LOCK SCREEN COMPONENT ===
_component("lock-screen", html`
  <style>
    :host {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      width: 100vw; height: 100vh;
      background: url('./images/lock_screen.png') center center / cover no-repeat;
      color: white; font-family: sans-serif;
      position: fixed; top: 0; left: 0; z-index: 9999;
    }
    .time { font-size: 64px; margin-top: 20vh; }
    .date { font-size: 20px; }
    .face-id { font-size: 64px; cursor: pointer; margin: 40px 0; }
    .passcode { margin-bottom: 60px; display: none; }
    .passcode input {
      padding: 10px; font-size: 24px; text-align: center;
      width: 200px; border: none; border-radius: 10px;
    }
    .passcode button {
      margin-left: 10px; padding: 10px 20px; font-size: 18px;
      border: none; border-radius: 8px;
      background: rgba(255,255,255,0.2); color: white; cursor: pointer;
    }
  </style>
  <div class="time"></div>
  <div class="date"></div>
  <div class="face-id material-icons">face</div>
  <div class="passcode">
    <input type="password" placeholder="Passcode">
    <button>Unlock</button>
  </div>
`, (shadow) => {
  const timeElem = shadow.querySelector('.time');
  const dateElem = shadow.querySelector('.date');
  const faceID = shadow.querySelector('.face-id');
  const passcodeBox = shadow.querySelector('.passcode');
  const passInput = passcodeBox.querySelector('input');
  const unlockBtn = passcodeBox.querySelector('button');

  function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    timeElem.textContent = `${hours}:${minutes} ${ampm}`;
    dateElem.textContent = now.toLocaleDateString(undefined, {
      weekday: 'long', month: 'long', day: 'numeric'
    });
  }
  setInterval(updateClock, 1000);
  updateClock();

  faceID.onclick = () => { runFaceID(); };
  unlockBtn.onclick = () => {
    const savedPIN = localStorage.getItem("novaos_passcode") || "Cedar Point Ahh";
    if (passInput.value === savedPIN) {
      unlockHome();
    } else {
      alert("❌ Incorrect passcode");
    }
  };

  window.showPasscodeInput = () => {
    passcodeBox.style.display = "flex";
  };
  window.unlockHome = () => {
    select("lock-screen").remove();
    startNovaOS();
  };
});

// === START WITH LOCK SCREEN ===
_(html`<lock-screen></lock-screen>`);

// === FULL NOVA.OS BOOT ===
function startNovaOS() {
  _(html`
    <loading-bar></loading-bar>
    <main-home>
      <app-main></app-main>
      <app-bar></app-bar>
    </main-home>
    <swipe-up></swipe-up>
    <transparent-overlay></transparent-overlay>
    <move-right>&rsaquo;</move-right>
    <move-left>&lsaquo;</move-left>
    <select-app-number>3</select-app-number>
  `);

  const app_handler = new AppHandler();
  let bar_amount = 0;
  let each_app_percent = 1 / (app_handler.defaultApps.length + app_handler.downloadedApps.length + 1);

  app_handler.attachSwipe(select("swipe-up"));
  app_handler.attachOverlay(select("transparent-overlay"));
  app_handler.attachMovers(select("move-right"), select("move-left"));
  app_handler.attachAppNumber(select("select-app-number"));

  for (let i = 0; i < app_handler.defaultApps.length; i++) {
    app_handler.loadApp(app_handler.defaultApps[i], "home", () => {
      bar_amount += each_app_percent;
      loading_bar.setPercent(bar_amount);
      if (app_handler.system.installedApps.length == app_handler.defaultApps.length + app_handler.downloadedApps.length) {
        loadHome();
      }
    });
  }

  for (let i = 0; i < app_handler.downloadedApps.length; i++) {
    app_handler.loadApp(app_handler.downloadedApps[i], "main", () => {
      if (app_handler.system.installedApps.length == app_handler.defaultApps.length + app_handler.downloadedApps.length) {
        bar_amount += each_app_percent;
        loadHome();
      }
    });
  }

  function loadHome() {
    app_handler.system.homeBarApps.forEach(app => {
      app_handler.addAppToHomeBar(select("app-bar"), app.app_name);
    });
    app_handler.system.mainAreaApps.forEach(app => {
      app_handler.addAppToMainArea(select("app-main"), app.app_name);
    });
    app_handler.attachBodyHandle(document.body);
    bar_amount = 1;
    loading_bar.setPercent(bar_amount);
    setTimeout(() => {
      style("loading-bar").display = "none";
    }, 1000);
  }
}
