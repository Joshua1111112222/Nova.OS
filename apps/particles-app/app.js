import { styling } from "./styling.js"
import { ParticleAppManager } from "./particles.js"
import { customElements } from "./custom.js"

export const app = _component("particles-app",html`
	<particle-container>
		<canvas></canvas>
	</particle-container>
	<action-button></action-button>
	${styling}
`,boot_up_app)

export const app_name = "particles-app";

let particles = new ParticleAppManager();
let angle = particles.random(0,Math.PI*2);
let action_button = {
	last_time:0,
	action_potential:false,
}
let current_settings = {
	x:window.innerWidth/2,
	y:window.innerHeight/2,
	vx:Math.cos(angle),
	vy:Math.sin(angle),
	color:"rgb(100,150,255)"
}

function boot_up_app(app) {
	let canvas = app.querySelector("canvas");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;


	app.querySelector("action-button").addEventListener("pointerdown",(e) => {
		e.preventDefault();
		action_button.action_potential = true;
		action_button.last_time = Date.now();
	})
	app.querySelector("action-button").addEventListener("pointerup", (e) => {
		if (action_button.action_potential == true && Date.now() - action_button.last_time > 1000) {
			alert("popup")
		} else {
			particles.addParticle(current_settings.x, current_settings.y, current_settings.vx, current_settings.vy, current_settings.color)
		}
	})

	
	particles.attachCanvas(canvas);
	for (let i = 0; i < 300; i++) {
		particles.generateRandomParticle(window.innerWidth/2, window.innerHeight/2, "rgb(100,150,255)");
	}

	particles.settings.degree_of_randomness = 0.1;
	particles.settings.terminal_velocity = 3;
	particles.update();
	update();

}

function update() {
	particles.update();
	requestAnimationFrame(update);
}