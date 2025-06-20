import { styling } from "./styling.js"
import { blocks } from "./blocks.js"
import { Terminal } from "./terminal_api.js"
import { Popup } from "./popup_api.js"
import { customElements } from "./custom.js"

export const app_name = "terminal-app";
export const app = _component("terminal-app",html`
	<main-container>
		<top-bar>
			<p></p>
			<p>WORLD'S FIRST MOBILE</p>
			Terminal
		</top-bar>
		<terminal-section><span style="color:rgb(150,150,150)">[user]: </span></terminal-section>
		<keyboard-section>
			<nav-buttons>
				<run-code>RUN</run-code>
				<back-space>DEL</back-space>
			</nav-buttons>
			<block-area>

			</block-area>
		</keyboard-section>
	</main-container>
	${styling}
`, terminal_bootup)

let terminal = new Terminal();

function terminal_bootup(t_app) {
	let block_area = t_app.querySelector("block-area");

	blocks.forEach(block => {
		let newBlock = document.createElement("code-block");
		newBlock.textContent = block.name;
		newBlock.style.backgroundColor = block.name != "text" ? block.color : "black";
		newBlock.style.fontWeight = block.fontWeight;
		newBlock.style.color = block.name != "text" ? block.textColor : "white";
		newBlock.style.border = block.name != "text" ? block.border : "1px solid white";

		if (block.name != "text") {
			newBlock.addEventListener("pointerup",() => {
				terminal.addToCommand(block.name);
				terminal.updateTerminalView();
			})
		} else {
			newBlock.addEventListener("pointerup",() => {
				let popup = new Popup("Enter Code:",true,(txt) => {
					terminal.addToCommand(txt);
					terminal.updateTerminalView();
				})
				popup.attachDoc(t_app);
				popup.launch();
			})
			
		}

		block_area.appendChild(newBlock);
	})

	terminal.attachTerminalViewPort(t_app.querySelector("terminal-section"));
	terminal.attachRun(t_app.querySelector("run-code"))
	terminal.attachDel(t_app.querySelector("back-space"))
}