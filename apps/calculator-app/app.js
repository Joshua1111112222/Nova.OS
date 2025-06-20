import { styling } from "./styling.js"
import { customElements } from "./custom.js"

export const app = _component("calculator-app",html`
	<main-container>
		<info-graph></info-graph>
		<button-container>
			<option-item>AC</option-item>
			<option-item>(</option-item>
			<option-item>)</option-item>
			<operation-button-item>+</operation-button-item>
			<button-item>1</button-item>
			<button-item>2</button-item>
			<button-item>3</button-item>
			<operation-button-item>-</operation-button-item>
			<button-item>4</button-item>
			<button-item>5</button-item>
			<button-item>6</button-item>
			<operation-button-item>*</operation-button-item>
			<button-item>7</button-item>
			<button-item>8</button-item>
			<button-item>9</button-item>
			<operation-button-item>/</operation-button-item>
			<button-item>.</button-item>
			<button-item>0</button-item>
			<button-item>%</button-item>
			<generate-math>=</generate-math>
		</button-container>
	</main-container>
	${styling}
`,boot_up_app)
export const app_name = "calculator-app";

function boot_up_app(app) {
	["button-item","option-item","operation-button-item"].forEach(selector => {
		app.querySelectorAll(selector).forEach(elem => {
			elem.addEventListener("pointerup",() => {
				app.querySelector("info-graph").innerHTML += `<span ${selector == "button-item" ? "style='color:rgb(216, 161, 65)'" : ""}'>${elem.textContent}</span>`;
				if (elem.textContent == "AC") {
					app.querySelector("info-graph").innerHTML = "";
				}
			})
		})
	})
	app.querySelector("generate-math").addEventListener("pointerup",() => {
		app.querySelector("info-graph").innerHTML = `<span style='color:rgb(216, 161, 65)'>${Math.round(eval(app.querySelector("info-graph").textContent)*100000)/100000}</span>`;
	})

}