export const app = _component("settings-app",html`
	<link rel='stylesheet' type='text/css' href='./apps/settings-app/styles.css'>
	<div>
		<h1>Settings</h1>
		<p>App Bar Background Color:</p>
		<input type="text" id="app-bar-background-color" class='input'>
		<p>Background Image:</p>
		<select id="wallpaper-image" class='input'>
			<option>glowing_bars.jpg</option>
			<option>pink_swirl.png</option>
			<option>turquoise_swirl.jpg</option>
		</select>
	</div>
`,boot_up_app)

export const app_name = "settings-app";

function boot_up_app(app) {
	let app_bar_background_color = app.querySelector("#app-bar-background-color");
	let wallpaper = app.querySelector("#wallpaper-image");
	wallpaper.value = localStorage.getItem("theme-wallpaper");
	app_bar_background_color.value = localStorage.getItem("theme-task-bar-color");
	app_bar_background_color.addEventListener("change",() => {
		localStorage.setItem("theme-task-bar-color",app_bar_background_color.value);
	})
	wallpaper.addEventListener("change",() => {
		localStorage.setItem("theme-wallpaper",wallpaper.value);
	})
}