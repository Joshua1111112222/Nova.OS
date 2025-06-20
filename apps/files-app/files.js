const items = ["main-area", "header-title", "file-area", "nav-bar", "nav-button"]
_create_containers(items);

class SelectedFile {
	constructor(name, path, filesys) {
		this.name = name;
		filesys.loadFileSystem();
		this.path = filesys.formatPath(path);
		this.full = filesys.formatPath(path) + name;
	}
}

export class Files {
	constructor(path) {
		this.app = undefined;
		this.fileSystem = undefined;
		this.path = path;
		this.selectedFiles = [];
	}
	attachAppAndFileSystem(app, fileSystem) {
		this.app = app;
		this.fileSystem = fileSystem;
	}
	moveToParentDirectory() {
		console.log(this.path)
		this.path = this.fileSystem.getParentPath(this.path);
		console.log(this.path)
	}
	appendParentVisual() {
		//create the file visual
		let fl = document.createElement("sample-file");
		let icon = document.createElement("span");
		icon.className = 'material-symbols-rounded';
		icon.innerHTML = 'folder';
		fl.style.color = 'rgb(90,90,90)';

		//append file
		fl.textContent = "../";
		fl.prepend(icon);
		let fileArea = this.app.querySelector("files-container");
		fileArea.appendChild(fl);

		//add event listeners for selecting files and such.
		fl.addEventListener('pointerup',(e) => {
			e.preventDefault();
			this.moveToParentDirectory();
			this.refreshFileView();
			return false;
		})
	}
	appendFileVisual(file) {
		//create the file visual
		let fl = document.createElement("sample-file");
		let icon = document.createElement("span");
		icon.className = 'material-symbols-rounded';
		icon.innerHTML = 'code';
		icon.style.fontSize = '40px';

		//get the right icon
		if (file.type == 'file') {
			switch (file.ext) {
				case "html" | "js" | "css":
					icon.textContent = "code";
					break;
				case "folder":
					icon.textContent = "folder";
					break;
				default:
					icon.textContent = "description";
					break;
			}
		} else {
			icon.textContent = "folder";
		}
		

		//append file
		fl.textContent = file.name;
		fl.prepend(icon);
		let fileArea = this.app.querySelector("files-container");
		if (file.type == 'folder') {
			fileArea.prepend(fl);
		} else {
			fileArea.appendChild(fl);
		}
		
		const time_to_select = 250;
		let lastTimeHeldDown = 0.00;
		let be_selected = false;
		let selected = false;
		let touch_info = {
			original_x:0,
			original_y:0,
		}

		fl.addEventListener("contextmenu",(e) => {
			e.preventDefault();
			return false;
		})

		//add event listeners for selecting files and such.
		fl.addEventListener("pointerdown",(e) => {
			e.preventDefault();
			touch_info.original_x = e.pageX;
			touch_info.original_y = e.pageY;
			be_selected = true;
			setTimeout(() => {
				if (be_selected == true) {
					if (selected) {
						selected = false;
						fl.style.backgroundColor = "#0000008a";
						let found_file = this.selectedFiles.find((n_file) => n_file.name == file.name);
						if (found_file != -1 && found_file) {
							this.selectedFiles.splice(this.selectedFiles.indexOf(found_file), 1);
						}
					} else {
						selected = true;
						fl.style.backgroundColor = "rgb(100,150,255)";
						this.selectedFiles.push(new SelectedFile(file.name, this.path, this.fileSystem));

					}
				}
			}, time_to_select)
			lastTimeHeldDown = Date.now();
		})
		fl.addEventListener('pointermove', (e) => {
			e.preventDefault();
			let dx = touch_info.original_x - e.pageX;
			let dy = touch_info.original_y - e.pageY;
			let distance = Math.sqrt(dx * dx + dy * dy);
			if (distance >= 20) {
				be_selected = false;
			}
		})
		fl.addEventListener('pointerup',(e) => {
			e.preventDefault();
			if (Date.now() - lastTimeHeldDown <= time_to_select) {
				be_selected = false;
				if (file.type == 'folder') {
					this.path += file.name + "/";
					console.log(this.path)
				} else {
					this.openModal(file);
				}
				this.refreshFileView();
			}
			console.log(selected);
			return false;
		})
	}
	openModal(file) {
		/* <fade-background />
		<modal-area>
			index.html
			<content-area>
				function bob() {<br>do stuff<br>}
			</content-area>
			<close-button>Close</close-button>
		</modal-area>*/

		let fadeBackground = document.createElement("fade-background");
		let contentArea = document.createElement("content-area");
		let modalArea = document.createElement("modal-area");
		let closeButton = document.createElement("close-button");

		if (file.extension == "txt") {
			contentArea.innerHTML = file.contents;
			contentArea.style.fontFamily = "Open Sans";
		} else {
			contentArea.textContent = file.contents;
			contentArea.style.justifyContent = "flex-start";
			contentArea.style.textAlign = "left";
		}
		contentArea.contentEditable = "true";
		closeButton.textContent = "Save & Close";
		modalArea.textContent = file.name;
		modalArea.appendChild(contentArea);
		modalArea.appendChild(closeButton);

		this.app.appendChild(fadeBackground);
		this.app.appendChild(modalArea);
		closeButton.addEventListener("pointerup", () => {
			if (file.extension == "txt") {
				this.fileSystem.editFile(file.name,this.path,contentArea.innerHTML);
			} else {
				this.fileSystem.editFile(file.name,this.path,contentArea.textContent);
			}
			this.fileSystem.loadFileSystem();
			this.refreshFileView();
			fadeBackground.remove();
			modalArea.remove();
		})
	}
	refreshFileView() {
		let path = this.path;
		if (this.fileSystem != undefined) {
			let fileArea = this.app.querySelector("files-container");
			fileArea.innerHTML = "";
			this.app.querySelector("header-area").innerHTML = String(this.path).replaceAll("/"," / ");

			let contents = this.fileSystem.getDataFromPath(path);
			if (contents.type == 'folder') {
				this.fileSystem.getDataFromPath(path).contents.forEach((item) => {
					this.appendFileVisual(item);
				})
			} else {
				console.log("given file, not folder.")
			}
		} else {
			console.log("undefined file system...")
		}
	}
}