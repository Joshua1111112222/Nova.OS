class Particle {
	constructor(x,y,vx = 1, vy = 1, color = "rgb(100,150,255)") {
		this.x = x;
		this.y = y;
		this.vx = vx;
		this.vy = vy;
		this.color = color;
	}
	update(settings) {
		this.x += this.vx;
		this.y += this.vy;

		if (settings.wrap) {
			if (this.x > window.innerWidth)  this.x = 0;
			if (this.x < 0)                  this.x = window.innerWidth;
			if (this.y > window.innerHeight) this.y = 0;
			if (this.y < 0)                  this.y = window.innerHeight;
		} else {
			if (this.x > window.innerWidth)  (this.x = window.innerWidth,  this.vx*=-1);
			if (this.x < 0)                  (this.x = 0,                  this.vx*=-1);
			if (this.y > window.innerHeight) (this.y = window.innerHeight, this.vy*=-1);
			if (this.y < 0)                  (this.y = 0,                  this.vy*=-1);
		}

		if (settings.terminal_velocity != undefined) {
			if (Math.abs(this.vx) > settings.terminal_velocity) this.vx = settings.terminal_velocity * (this.vx / settings.terminal_velocity);
			if (Math.abs(this.vy) > settings.terminal_velocity) this.vy = settings.terminal_velocity * (this.vy / settings.terminal_velocity);
		}
		
		this.vx += Math.random()*settings.degree_of_randomness*2 - settings.degree_of_randomness;
		this.vy += Math.random()*settings.degree_of_randomness*2 - settings.degree_of_randomness;
	}
}
export class ParticleAppManager {
	constructor() {
		this.particleList = [];
		this.settings = {
			gravity: false,
			wrap: false,
			terminal_velocity: undefined,
			degree_of_randomness:0,
		}
	}
	attachCanvas(canv) {
		this.drw = canv.getContext('2d');
		this.canv = canv;
	}
	update() {
		this.clearScreen(0.5);
		this.particleList.forEach(particle => {
			particle.update(this.settings);
			this.drawParticle(particle);
		})
	}
	clearScreen(opacity) {
		this.drw.globalAlpha = opacity;
		this.drw.fillStyle = "rgb(20,20,20)";
		this.drw.fillRect(0,0,window.innerWidth, window.innerHeight);
		this.drw.globalAlpha = 1;
	}
	drawParticle(particle) {
		this.drw.beginPath();
		this.drw.fillStyle = particle.color;
		this.drw.arc(particle.x, particle.y, 3, 0, Math.PI*2);
		this.drw.fill();
	}
	addParticle(x,y,vx = 1, vy = 1, color = "rgb(100,150,255)") {
		let particle = new Particle(x, y, vx, vy, color);
		this.particleList.push(particle);
	}
	generateRandomParticle(x,y, color = "random") {
		let randomAngle = this.random(0,Math.PI*2);
		let particle = new Particle(x, y, Math.cos(randomAngle), Math.sin(randomAngle), color != "random" ? color : `hsl(${Math.random()*360},100%,100%)`);
		this.particleList.push(particle);
	}
	random(lower,upper,floor = false) {
		if (floor) {
			return Math.floor(Math.random()*(upper-lower) + lower);
		}
		return Math.random()*(upper-lower) + lower;
	}
	dtor(degrees) {
		return degrees/180*Math.PI;
	}
}