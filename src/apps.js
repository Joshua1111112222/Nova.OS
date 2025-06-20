let classic_app_example = {
	name:"settings-app",
}
export class AppHandler {
	constructor() {

		//set up variables
		this.downloadedApps = [];
		this.defaultApps    = ["chrome-app","messages-app","settings-app","terminal-app"];
		this.openApps       = [];
		this.display = {
			mode: "home",
			data: null,
		}

		this.movers = {
			right:null,
			left:null,
		}
		this.appNumberFeedback = null;
		this.swipeElement   = null;
		this.swipeInfo = {
			initialY:0,
		}
		this.clearAppSwipe = {
			initialY:0,
			clearingApp:false,
		}
		this.overlay = null;

		this.system = {
			installedApps: [],
			homeBarApps:   [],
			mainAreaApps:  [],
			openApps:      [],
		}

		//check if the user has any extra installed apps
		let temp_downloaded_apps = localStorage.getItem("downloaded-apps");
		if (temp_downloaded_apps != null && temp_downloaded_apps != "" && temp_downloaded_apps != "[]") {
			this.downloadedApps = JSON.parse(temp_downloaded_apps);
		}
	}
	loadApp(app_name,location,on_finished = null) {
		import(`../apps/${app_name}/app.js`)
			.then((app) => {
				this.system.installedApps.push(app);
				if (location == "home") {
					this.system.homeBarApps.push(app);
				} else {
					this.system.mainAreaApps.push(app);
				}
				if (on_finished != null) {
					on_finished();
				}
			})
	}
	addAppToMainArea(main_area,app_name) {
		let app = document.createElement("app-item");
		app.style.backgroundImage = `url("./apps/${app_name}/icon.png")`;

		const handleClick = (e) => {
			e.preventDefault();
			this.openApp(app_name);
		}
		app.addEventListener("pointerup",handleClick,{passive:false})
		
		main_area.appendChild(app);
	}
	addAppToHomeBar(bar,app_name) {
		let app = document.createElement("app-item");
		app.style.backgroundImage = `url("./apps/${app_name}/icon.png")`;

		const handleClick = (e) => {
			e.preventDefault();
			this.openApp(app_name);
		}

		app.addEventListener("pointerup",handleClick,{passive:false})

		bar.appendChild(app);
	}
	getAppByName(name) {
		let foundApp = "No App Found";
		this.system.installedApps.forEach((app) => {
			if (app.app_name == name) {
				foundApp = app;
			}
		})
		return foundApp;
	}
	openApp(app_name) {
		
		//determine if the app is already open. No, go to @105. Yes, go to @199.
		let already_open = false;
		let already_open_app = null;
		this.openApps.forEach((app) => {
			if (app.app_name == app_name) {
				already_open = true;
				already_open_app = app;
			}
		})

		// if the app is NOT already open, set it up, attach event listeners
		if (!already_open) {

			//create app elements, append
			let opened_app  = document.createElement("app-container");
			let app_content = document.createElement(app_name);
			opened_app.appendChild(app_content);
			document.body.appendChild(opened_app);

			//this allows for swiping up to clear open apps, keeps track of the initial position.
			opened_app.addEventListener("touchstart",(e) => {
				if (this.display.mode == "select") {
					this.clearAppSwipe.initialY = e.touches[0].pageY;
				}
			})

			//while swiping up to clear an app...
			opened_app.addEventListener("touchmove",(e) => {
				if (this.display.mode == "select") {
					if (this.clearAppSwipe.initialY - e.touches[0].pageY >= 20) {

						//get the element of the now already-open app, and visibly move the element proportionally to touchmove
						let current_open_app = this.openApps.find(val => val.app_name == this.display.data.app_name);
						current_open_app.app_element.style.top = (-1 * (this.clearAppSwipe.initialY - e.touches[0].pageY)) + "px";
						current_open_app.app_element.style.opacity = (500 - (this.clearAppSwipe.initialY - e.touches[0].pageY))/500;

						//if swipe has gone beyond threshold, set the clearingApp flag to true, which is used in touchend
						if (this.clearAppSwipe.initialY - e.touches[0].pageY >= 200) {
							this.clearAppSwipe.clearingApp = true;
						} else {
							this.clearAppSwipe.clearingApp = false;
						}
					} else {
						this.clearAppSwipe.clearingApp = false;
					}
				}
			})

			//this is for when the swiping-away-an-app ends --- should we delete or enter?
			opened_app.addEventListener("touchend",(e) => {
				if (this.display.mode == "select") {
					if (this.clearAppSwipe.clearingApp) {

						this.clearAppSwipe.clearingApp = false;

						console.log("CLEARING APP");

						//delete the app from openApps
						this.openApps.find(val => val.app_name == this.display.data.app_name).app_element.remove();
						this.openApps.splice(this.openApps.indexOf(this.openApps.find(val => val.app_name == this.display.data.app_name)),1);
						
						//if there are other apps to display, just display the next one in the minified frame
						if (this.openApps.length > 0) {
							this.openApps[0].app_element.style.display = "block";
							this.display.data = this.getAppByName(this.openApps[0].app_name);

							//updates the little green number at the top.
							this.updateAppNumber();
						} else {

							//if there's no apps, go back to the home screen.
							this.attemptSelectHome();
						}
						
					} else {

						//in this case, the swipe was never completed, so undo the visible-swipe-effects
						let current_open_app = this.openApps.find(val => val.app_name == this.display.data.app_name);
						current_open_app.app_element.style.top = "0px";
						current_open_app.app_element.style.opacity = "1";

						//the following code re-opens the app
						this.openApp(app_name);
						style("transparent-overlay").opacity = "0";

						//housekeeping
						this.display.mode == "app";
						this.movers.right.style.right = "-50px";
						this.movers.left.style.left = "-50px";
						this.appNumberFeedback.style.top = "-60px";
	
						this.openApps.forEach(app => {
							app.app_element.style.borderRadius = "0px";
						})
						
					}
				}
			})

			//add the newly created and event-listenered (?) app to the queue
			this.openApps.push({
				app_name:app_name,
				app:this.getAppByName(app_name),
				app_element:opened_app,
			})

			//open the app housekeeping
			this.display.mode = "app";
			this.display.data = this.getAppByName(app_name);
		} else {

			//if there's already an instance of the app open, just select and show that instance
			already_open_app.app_element.style.display = "block";
			setTimeout(() => already_open_app.app_element.style.transform = "scale(1.0)",1)
			this.display.mode = "app";
			this.display.data = this.getAppByName(app_name);
		}
	}
	attachSwipe(swipe_element) {
		this.swipeElement = swipe_element;
		swipe_element.addEventListener("touchstart", (e) => {
			e.preventDefault();
			this.swipeInfo.initialY = e.touches[0].pageY;
			return false;
		},{passive:false});
		swipe_element.addEventListener("touchmove", (e) => {
			e.preventDefault();
			let distance = this.swipeInfo.initialY - e.touches[0].pageY;
			if (distance > 30) {
				this.manageOpenApps();
			}
			return false;
		});
	}
	attachBodyHandle(body_element) {
		let tapped_count = 0;
		let lastTime = 0;
		let waiting = false;
		let prev_loc = {
			x:0,
			y:0,
		}
		body_element.addEventListener("touchend", (e) => {
			//e.preventDefault();
			let c_loc = {
				x: e.changedTouches[0].pageX,
				y: e.changedTouches[0].pageY
			}
			if (tapped_count == 0) {
				prev_loc = c_loc;
			}
			let dif = {
				x: prev_loc.x - c_loc.x,
				y: prev_loc.y - c_loc.y
			}
			if (Date.now() - lastTime >= 500 || Math.sqrt(dif.x * dif.x + dif.y * dif.y) >= 50) {
				waiting = false;
				tapped_count = 0;
			}
			if (waiting == true) {
				if (Date.now() - lastTime <= 300) {
					tapped_count++;
					if (tapped_count >= 2) {
						waiting = false;
						lastTime = 0;
						tapped_count = 0;
						this.manageOpenApps();
					}
					lastTime = Date.now();
				} else {
					waiting = false;
				}
			} else {
				waiting = true;
				lastTime = Date.now();
			}
		})
	}
	attachOverlay(overlay_element) {
		this.overlay = overlay_element;
		overlay_element.addEventListener("pointerup", (e) => {
			e.preventDefault();
			this.attemptSelectHome();
		},{passive:false});
	}
	attachMovers(right, left) {
		this.movers.left = left;
		this.movers.right = right;
		this.movers.left.addEventListener("pointerup",(e) => {e.preventDefault(); this.requestMoveLeft()},{passive:false});
		this.movers.right.addEventListener("pointerup",(e) => {e.preventDefault(); this.requestMoveRight()},{passive:false});
	}
	requestMoveLeft() {
		let current_app_index = this.openApps.indexOf(this.openApps.find(val => val.app_name == this.display.data.app_name));
		if (current_app_index > 0 && this.display.mode == "select") {
			this.openApps[current_app_index - 1].app_element.style.display = "block";
			this.openApps[current_app_index].app_element.style.display = "none";
			this.display.data = this.getAppByName(this.openApps[current_app_index - 1].app_name);
			this.updateAppNumber();
		}
	}
	requestMoveRight() {
		let current_app_index = this.openApps.indexOf(this.openApps.find(val => val.app_name == this.display.data.app_name));
		if (current_app_index < this.openApps.length - 1 && this.display.mode == "select") {
			this.openApps[current_app_index + 1].app_element.style.display = "block";
			this.openApps[current_app_index].app_element.style.display = "none";
			this.display.data = this.getAppByName(this.openApps[current_app_index + 1].app_name);
			this.updateAppNumber();
		}
	}
	attemptSelectHome() {
		this.openApps.forEach(app => {
			app.app_element.style.display = "none";
			app.app_element.style.borderRadius = "0px";
		})
		this.updateAppNumber();

		//styling
		style("transparent-overlay").opacity = "0";
		style("transparent-overlay").pointerevents = "none";
		this.display.mode = "home";
		this.movers.right.style.right = "-50px";
		this.movers.left.style.left = "-50px";
		this.appNumberFeedback.style.top = "-60px";

		//this timeout just takes away the transparent-overlay after 500 ms +- 100 ms
		setTimeout(() => {
			style("transparent-overlay").display = "none";
		},600);
	}
	manageOpenApps() {
		//check for safety purposes
		if (this.display.mode == "app") {
			let app_element = null;
			this.openApps.forEach(app => {
				if (app.app_name == this.display.data.app_name) {
					app_element = app.app_element;
				}
				
				app.app_element.style.transform = "scale(0.7)";
				app.app_element.style.borderRadius = "20px";
			})
			this.overlay.style.display = "block";
			this.display.mode = "select";
			this.movers.right.style.right = "0px";
			this.movers.left.style.left = "0px";
			this.appNumberFeedback.style.top = "0px";
			this.updateAppNumber();
			style("transparent-overlay").opacity = "1";
			style("transparent-overlay").pointerevents = "initial";

		} else if (this.display.mode == "home") {
			if (this.openApps.length > 0) {

				//display app
				this.openApps[0].app_element.style.display = "block";
				setTimeout(() => this.openApps[0].app_element.style.transform = "scale(0.7)",1)
				this.display.data = this.getAppByName(this.openApps[0].app_name);

				let app_element = null;
				this.display.data = this.getAppByName(this.openApps[0].app_name);
				this.display
				this.openApps.forEach(app => {
					if (app.app_name == this.display.data.app_name) {
						app_element = app.app_element;
					}
					
					app.app_element.style.transform = "scale(0.7)";
					app.app_element.style.borderRadius = "20px";
				})
				this.overlay.style.display = "block";
				this.display.mode = "select";
				this.movers.right.style.right = "0px";
				this.movers.left.style.left = "0px";
				this.appNumberFeedback.style.top = "0px";
				this.updateAppNumber();
				style("transparent-overlay").opacity = "1";
				style("transparent-overlay").pointerevents = "initial";
			}
		}
	}
	attachAppNumber(app_number) {
		this.appNumberFeedback = app_number;
		this.appNumberFeedback.style.top = "-60px";
	}
	updateAppNumber() {
		this.appNumberFeedback.textContent = this.openApps.indexOf(this.openApps.find(val => val.app_name == this.display.data.app_name));
	}
}




//   /<[a-z\-^> ]+\/>/gi