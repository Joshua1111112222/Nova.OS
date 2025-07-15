import { settings } from "./src/loadSettings.js" 
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
`)

const app_handler = new AppHandler();
let bar_amount = 0;
let each_app_percent = 1/(app_handler.defaultApps.length + app_handler.downloadedApps.length + 1);

app_handler.attachSwipe(select("swipe-up"))
app_handler.attachOverlay(select("transparent-overlay"))
app_handler.attachMovers(select("move-right"),select("move-left"))
app_handler.attachAppNumber(select("select-app-number"))

//--------------------------LOADING APPS--------------------------

for (let i = 0; i < app_handler.defaultApps.length; i++) {
	app_handler.loadApp(app_handler.defaultApps[i],"home",() => {
		bar_amount += each_app_percent;
		loading_bar.setPercent(bar_amount);
		if (app_handler.system.installedApps.length == app_handler.defaultApps.length + app_handler.downloadedApps.length) {
			loadHome();
		}

	})
}
for (let i = 0; i < app_handler.downloadedApps.length; i++) {
	app_handler.loadApp(app_handler.downloadedApps[i],"main",() => {
		if (app_handler.system.installedApps.length == app_handler.defaultApps.length + app_handler.downloadedApps.length) {
			bar_amount += each_app_percent;
			loadHome();
		}
	})
}

//-------------------------LOADING HOMEPAGE-------------------------
function loadHome() {
	app_handler.system.homeBarApps.forEach(app => {
		app_handler.addAppToHomeBar(select("app-bar"),app.app_name);
	})
	app_handler.system.mainAreaApps.forEach(app => {
		app_handler.addAppToMainArea(select("app-main"),app.app_name);
	})
	app_handler.attachBodyHandle(document.body);

	bar_amount = 1;
	loading_bar.setPercent(bar_amount);
	setTimeout(() => {
		style("loading-bar").display = "none";
	},1000);
}