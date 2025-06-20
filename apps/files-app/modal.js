export class Modal {
	constructor(title) {
		this.title = title;
		this.body_element = null;
		this.body_mode    = "text";
		this.modal_element = document.createElement("modal-area");
		this.fade_background = document.createElement("fade-background");
		this.title_element = document.createElement("span");
		this.title_element.textContent = title;
		this.modal_element.appendChild(this.title_element);
	}
	withBody(text, contentMethod = "text", contentEditable = "false") {
		let body_text = document.createElement("content-area");
		body_text.contentEditable = contentEditable;
		if (contentMethod == "text") {
			body_text.innerText = text;
		} else {
			body_text.innerHTML   = text;
		}
		this.modal_element.appendChild(body_text);
		this.body_element = body_text;
		this.body_mode    = contentMethod;
		return this;
	}
	addButton(text, callback) {
		let new_button = document.createElement("close-button");
		new_button.textContent = text;
		new_button.addEventListener("pointerup",callback);
		this.modal_element.appendChild(new_button);
		return this;
	}
	openIn(app) {
		app.appendChild(this.fade_background);
		app.appendChild(this.modal_element);
		return this;
	}
	getBody() {
		if (this.body_mode == "text") {
			return this.body_element.innerText;
		} else {
			return this.body_element.innerHTML;
		}
	}
	updateTitle(text) {
		this.title_element.textContent = text;
		return this;
	}
	close() {
		this.modal_element.remove();
		this.fade_background.remove();
	}
}