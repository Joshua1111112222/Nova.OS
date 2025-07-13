import { settings } from "./src/loadSettings.js";
import { loading_bar } from "./src/loading_bar.js";
import { AppHandler } from "./src/apps.js";
import { styling } from "./styling.js";
import { items } from "./src/custom.js";

addCSSFont("https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;1,300&display=swap");

OSCRIPT.experimental.autoDefine();

console.log(settings);

_(html`
  <!-- <install-as-app-overlay></install-as-app-overlay> -->
  <loading-bar></loading-bar>
  <main-home>
    <app-main></app-main>
    <app-bar></app-bar>
  </main-home>
  <swipe-up></swipe-up>

  <!-- The following is for the app-select -->
  <transparent-overlay></transparent-overlay>
  <move-right>&rsaquo;</move-right>
  <move-left>&lsaquo;</move-left>
  <select-app-number>3</select-app-number>
`);

const app_handler = new AppHandler();
let bar_amount = 0;
let totalApps = app_handler.defaultApps.length + app_handler.downloadedApps.length + 1;
let each_app_percent = 1 / totalApps;

app_handler.attachSwipe(select("swipe-up"));
app_handler.attachOverlay(select("transparent-overlay"));
app_handler.attachMovers(select("move-right"), select("move-left"));
app_handler.attachAppNumber(select("select-app-number"));

//--------------------------LOADING APPS--------------------------

for (let i = 0; i < app_handler.defaultApps.length; i++) {
  app_handler.loadApp(app_handler.defaultApps[i], "home", () => {
    bar_amount += each_app_percent;
    loading_bar.setPercent(bar_amount);
    checkIfAllAppsLoaded();
  });
}

for (let i = 0; i < app_handler.downloadedApps.length; i++) {
  app_handler.loadApp(app_handler.downloadedApps[i], "main", () => {
    bar_amount += each_app_percent;
    loading_bar.setPercent(bar_amount);
    checkIfAllAppsLoaded();
  });
}

// Also add 1 for the +1 in totalApps (maybe for system or some extra load)
bar_amount += each_app_percent;
loading_bar.setPercent(bar_amount);

function checkIfAllAppsLoaded() {
  if (app_handler.system.installedApps.length === app_handler.defaultApps.length + app_handler.downloadedApps.length) {
    loadHome();
  }
}

//-------------------------LOADING HOMEPAGE-------------------------
function loadHome() {
  app_handler.system.homeBarApps.forEach(app => {
    app_handler.addAppToHomeBar(select("app-bar"), app.app_name);
  });
  app_handler.system.mainAreaApps.forEach(app => {
    app_handler.addAppToMainArea(select("app-main"), app.app_name);
  });

  // Wrap apps in rows after they are added
  wrapAppsInRows("app-main", 5);

  app_handler.attachBodyHandle(document.body);

  bar_amount = 1;
  loading_bar.setPercent(bar_amount);
  setTimeout(() => {
    style("loading-bar").display = "none";
  }, 1000);
}

function wrapAppsInRows(containerSelector, appsPerRow = 5) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  // Get all app elements (children)
  const apps = Array.from(container.children);

  // Clear container
  container.innerHTML = "";

  for (let i = 0; i < apps.length; i += appsPerRow) {
    const row = document.createElement("div");
    row.className = "app-row";
    row.style.display = "flex";
    row.style.gap = "10px";
    row.style.marginBottom = "10px";

    apps.slice(i, i + appsPerRow).forEach(app => {
      // Adjust flex basis to fit 5 apps per row considering gaps
      app.style.flex = `1 1 calc(${100 / appsPerRow}% - ${(10 * (appsPerRow - 1)) / appsPerRow}px)`;
      app.style.boxSizing = "border-box";
      row.appendChild(app);
    });

    container.appendChild(row);
  }
}
