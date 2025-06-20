import { blocks } from "./blocks.js"
import { appStore } from "../../src/app_store.js"

export class Terminal {
	constructor() {
		this.command = "";
		this.terminalViewport = null;
		this.fullCommandArea = "";
		this.commandRegex = null;

		let temporary_regex = ""
		blocks.forEach(block => {
			temporary_regex += `(${block.name})|`;
		})
		temporary_regex = temporary_regex.substring(0,temporary_regex.length - 1);

		this.commandRegex = new RegExp(temporary_regex, "gi");
	}
	attachTerminalViewPort(vp) {
		this.terminalViewport = vp;
	}
	attachRun(r) {
		this.runButton = r;

		function cancelDefaultActions(e) {
			e.preventDefault();
			return false;
		}

		["pointerdown","touchstart","touchend"].forEach((event_item) => {
			this.runButton.addEventListener(event_item, cancelDefaultActions);
		})

		this.runButton.addEventListener("pointerup",(e) => {
			e.preventDefault();
			this.runCode();
			return false;
		})
	}
	attachDel(d) {
		this.delButton = d;
		
		function cancelDefaultActions(e) {
			e.preventDefault();
			e.stopPropagation();
			return false;
		}

		["pointerdown","touchstart","touchend"].forEach((event_item) => {
			this.delButton.addEventListener(event_item, cancelDefaultActions);
		})

		this.delButton.addEventListener("pointerup",(e) => {
			e.preventDefault();
			this.command = this.command.substring(0,this.command.length - 1)
			this.updateTerminalView();
			return false;
		})
	}
	addToCommand(c) {
		this.command += c + " ";
	}
	formatCommand(cmd) {
		let command_formatted = this.command.replace(this.commandRegex, (val) => {
			let block = blocks.find(bl => bl.name == val);
			return `<span style="color:${block.color};font-weight:${block.fontWeight}">${block.name}</span>`;
		})
		return command_formatted;
	}
	updateTerminalView() {
		let command_formatted = this.formatCommand(this.command);
		this.terminalViewport.innerHTML = this.fullCommandArea + "<span style='color:rgb(150,150,150)'>[user]: </span>" + command_formatted + "&#9608;";
	}
	runCode() {
		this.fullCommandArea += "<span style='color:rgb(150,150,150)'>[user]: </span>" + this.formatCommand(this.command) + "<br>";
		this.parseCode();
		this.command = "";
		this.updateTerminalView();
	}
	parseCode() {
		//sudo apt install
		if (this.command.substring(0,16) == "sudo apt install") {
			let app = this.command.substring(16).trim();

			if (appStore.includes(app)) {
				this.fullCommandArea += "<span style='color:rgb(0,255,0); font-weight:bolder'>Installing</span> <em style='color:rgb(100,100,100);'>" + app + "</em>...<br>";
				let currentDownloadedApps = JSON.parse(localStorage.getItem("downloaded-apps"));
				currentDownloadedApps.push(app);
				localStorage.setItem("downloaded-apps",JSON.stringify(currentDownloadedApps));
				this.fullCommandArea += "<span style='color:rgb(100,150,255)'>Successfully installed </span> <em style='color:rgb(100,100,100);'>" + app + "</em>. Reboot OS to apply changes.<br><br>";
			} else {
				this.fullCommandArea += "<span style='color:rgb(255, 0, 0); font-weight:bolder'>Could not locate </span> <em style='color:rgb(100,100,100);'>" + app + "</em><br>";
			}
		} else if (this.command.toLowerCase().trim() == "restart") {
			this.fullCommandArea += "<em style='color:rgb(100,100,100);'>Restarting...</em><br>"
			this.updateTerminalView();
			self.location = self.location;
		}
	}
}