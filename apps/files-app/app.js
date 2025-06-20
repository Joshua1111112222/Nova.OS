import { FileSystem, File, Folder } from "../../src/fileSystemAPI.js";
import { Files } from "./files.js";
import { Modal } from "./modal.js";
export const app_name = "files-app";

export const app = _component("files-app",html`
	<link rel='stylesheet' type='text/css' href='./apps/files-app/styles.css'>

	<main-area>
		<header-title>Files</header-title>
		<file-area>
			<menu-button>
				<span class='material-symbols-rounded'>page_info</span>
			</menu-button>
			<header-area>Files</header-area>
			<files-container></files-container>

		</file-area>
		<nav-bar>
			<nav-button id='parent-folder'><span class='material-symbols-rounded'>folder_open</span></nav-button>
			<nav-button id='home-folder'><span class='material-symbols-rounded'>home</span></nav-button>
			<nav-button id='new-file'><span class='material-symbols-rounded'>note_add</span></nav-button>
		</nav-bar>
	</main-area>

`,boot_up_app)

function boot_up_app(app) {

	let files      = new Files("O.OS/");
	let fileSystem = new FileSystem();
	
	fileSystem.loadFileSystem();

	files.attachAppAndFileSystem(app, fileSystem);

	app.querySelector("#parent-folder").addEventListener("pointerup",() => {
		files.moveToParentDirectory();
		files.refreshFileView();
	})

	app.querySelector("#home-folder").addEventListener("pointerup",() => {
		files.path = "O.OS/";
		files.refreshFileView();
	})

	app.querySelector("#new-file").addEventListener("pointerup",() => {

		let modal = new Modal("Create Item")
			.withBody("new.txt", "text", "true")
			.addButton("Create File", try_add_file)
			.addButton("Create Folder", try_add_folder)
			.addButton("Cancel", cancel)
			.openIn(app);

		function try_add_file() {

			//validate input
			if (/^[a-zA-z0-9\_\$\#\!\-]+\.[a-zA-z0-9\_\$\#\!\-]+$/gi.test(modal.getBody())) {
				fileSystem.loadFileSystem();
				fileSystem.addFile(new File(modal.getBody()), files.path);

				files.fileSystem.loadFileSystem();
				files.refreshFileView();

				fileSystem.loadFileSystem();

				modal.close();
			} else {
				modal.updateTitle("Invalid File Name");
			}
		}

		function try_add_folder() {
			if (/^[a-zA-z0-9\_\$\#\!\-]+$/gi.test(modal.getBody())) {
				fileSystem.loadFileSystem();
				fileSystem.addFolder(new Folder(modal.getBody()), files.path);

				files.fileSystem.loadFileSystem();
				files.refreshFileView();

				fileSystem.loadFileSystem();

				modal.close();
			} else {
				modal.updateTitle("Invalid Folder Name");
			}
		}

		function cancel() {
			modal.close();
		}

	})

	app.querySelector("menu-button").addEventListener("pointerup",() => {
		if (files.selectedFiles.length > 0) {
			let modal = new Modal("")
				.addButton(`Delete ${files.selectedFiles.length} item${files.selectedFiles.length == 1 ? '' : 's'}`, delete_selected_files)
				.addButton(`Rename ${files.selectedFiles.length} file${files.selectedFiles.length == 1 ? '' : 's'}`, rename_selected_files)
				.addButton("Cancel", () => modal.close())
				.openIn(app);

			function delete_selected_files() {
				files.selectedFiles.forEach((file) => {
					fileSystem.removeItem(file.name, file.path);
				})
				files.selectedFiles = [];
				fileSystem.loadFileSystem();
				files.fileSystem.loadFileSystem();
				files.refreshFileView();
				modal.close();
			}

			function rename_selected_files() {
				modal.close();

				modal = new Modal("Rename Items")
					.withBody(files.selectedFiles[0]?.name || "rename.txt", "text", "true")
					.addButton("Rename", rename_files)
					.addButton("Cancel", cancel_modal)
					.openIn(app);

				function rename_files() {
					modal.close();
					let last_location_of_dot = modal.getBody().lastIndexOf(".") != -1 ? modal.getBody().lastIndexOf(".") : modal.getBody().length;
					function* get_new_name() {
						let i = 0;
						while (i >= 0) {
							yield modal.getBody().substring(0,last_location_of_dot) + (i == 0 ? "" : i) + modal.getBody().substring(last_location_of_dot);
							i++;
						}
					}
					let generator = get_new_name();
					files.selectedFiles.forEach((file) => {
						fileSystem.loadFileSystem();
						fileSystem.renameItem(file.name, file.path, generator.next().value);
					})
					files.selectedFiles = [];
					fileSystem.loadFileSystem();
					files.fileSystem.loadFileSystem();
					files.refreshFileView();
				}
				function cancel_modal() {
					modal.close();
				}
			}
		} else {
			let modal = new Modal("Oops!");
			modal
				.withBody("Select some files first to access edit actions.", "text", "false")
				.addButton("OK",() => modal.close())
				.openIn(app);
		}
		
	})

	files.refreshFileView();
}