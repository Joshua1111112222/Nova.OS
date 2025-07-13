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
  
	// Wait for DOM to update before wrapping
	setTimeout(() => {
	  wrapAppsInRows("app-main", 5);
	}, 0);
  
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
  
	// Add CSS styles dynamically
	const style = document.createElement('style');
	style.textContent = `
	  app-main {
		width: 100%;
		display: flex;
		flex-direction: column;
		padding: 10px;
		box-sizing: border-box;
	  }
	  .app-row {
		width: 100%;
	  }
	  .app-icon {
		aspect-ratio: 1/1;
		display: flex;
		align-items: center;
		justify-content: center;
	  }
	  .app-spacer {
		visibility: hidden;
	  }
	`;
	document.head.appendChild(style);
  
	// Clear any existing rows while preserving the apps
	const apps = [];
	while (container.firstChild) {
	  if (container.firstChild.classList?.contains('app-icon') || 
		  container.firstChild.hasAttribute?.('app-name')) {
		apps.push(container.firstChild);
	  }
	  container.removeChild(container.firstChild);
	}
  
	// Create rows with exact item counts
	for (let i = 0; i < apps.length; i += appsPerRow) {
	  const row = document.createElement("div");
	  row.className = "app-row";
	  Object.assign(row.style, {
		display: "grid",
		gridTemplateColumns: `repeat(${appsPerRow}, 1fr)`,
		gap: "10px",
		marginBottom: "10px",
		width: "100%"
	  });
  
	  const rowApps = apps.slice(i, i + appsPerRow);
	  rowApps.forEach(app => {
		row.appendChild(app);
	  });
  
	  // Fill remaining slots if needed to maintain grid
	  while (row.children.length < appsPerRow) {
		const spacer = document.createElement("div");
		spacer.className = "app-spacer";
		row.appendChild(spacer);
	  }
  
	  container.appendChild(row);
	}
  }