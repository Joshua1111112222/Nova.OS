export class Popup {
	constructor(prompt, textarea = false, buttonClick, buttonText = "OK") {
		this.prompt = prompt;
		this.textarea = textarea;
		this.buttonClick = buttonClick;
		this.buttonText = buttonText;
	}
	attachDoc(doc) {
		this.doc = doc;
	}
	setButtonText(txt) {
		this.buttonText = txt;
	}
	launch() {
		let container = document.createElement("popup-element");
		let shade = document.createElement("shade-element");
		let text = document.createElement("p");
		let textarea = document.createElement("input");
		let go = document.createElement("button");

		text.textContent = this.prompt;
		text.style.fontSize = "30px";
		text.style.fontFamily = "Open Sans";
		text.style.color = "white";
		go.textContent   = this.buttonText;
		textarea.type = "text";
		textarea.addEventListener("touchend",(e) => {
			e.stopPropagation();
			textarea.focus();
		})

		go.addEventListener("pointerup",() => {
			this.resolve();
		})

		container.appendChild(text);
		container.appendChild(textarea);
		container.appendChild(go);

		this.doc.appendChild(container);
		this.doc.appendChild(shade);
		this.container = container;
		this.text_content = textarea;
		this.shade = shade;
	}
	resolve() {
		this.buttonClick(this.text_content.value);
		this.container.remove();
		this.shade.remove();
	}
}