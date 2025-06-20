// A FileSystem is made of File and Folder objects, defined here
export class File {
	constructor(name) {
		this.type          = "file";
		this.name          = name;
		this.contents      = "";
		this.properties    = {};
		this.extension     = '';

		if (name.includes(".")) {
			let extensionStart = name.lastIndexOf(".");
			this.extension     = name.substring(extensionStart + 1);
		}
	}
}
export class Folder {
	constructor(name) {
		this.type       = "folder";
		this.name       = name;
		this.contents   = [];
		this.properties = {};
		this.extension  = undefined;
	}
}

// FileSystem definition
export class FileSystem {
	constructor() {
		this.system = [];
		this.root   = "O.OS/";
		this.fileSystemName = "files-system";
	}
	loadFileSystem() {
		if (localStorage.getItem(this.fileSystemName)) {
			try {
				let system = JSON.parse(localStorage.getItem(this.fileSystemName));
				if (system.contents) {
					this.system = system;
					return true;
				} else {
					return false;
				}
			} catch (e) {
				console.log(e);
				return false;
			}

		}
	}
	addFile(file, path, refresh = true) {
		if (file.type == "file") {
			let path_to_file = this.getDataFromPath(path);
			if (path_to_file.type == 'folder') {
				if (path_to_file.contents.find((item) => item.name == file.name)) {
					// duplicate file
					console.log("O.OS | fileSystemAPI | Error: Cannot add file " + file.name + " because it already exists.");

				} else {
					path_to_file.contents.push(file);

					if (refresh) {
						this.refreshSystem();
					}
				}
			} else {
				console.log("O.OS | fileSystemAPI | Error: trying to add file to file, not folder.");
			}
		} else {
			console.log("O.OS | fileSystemAPI | Error: trying to add file with type that is not 'file'");
		}
		return false;
	}
	addFolder(folder, path, refresh = true) {
		if (folder.type == "folder") {
			let path_to_folder = this.getDataFromPath(path);
			if (path_to_folder.type == 'folder') {
				if (path_to_folder.contents.find((item) => item.name == folder.name)) {
					// duplicate file
					console.log("O.OS | fileSystemAPI | Error: Cannot add folder " + folder.name + " because it already exists.");

				} else {
					path_to_folder.contents.push(folder);

					if (refresh) {
						this.refreshSystem();
					}
				}
			} else {
				console.log("O.OS | fileSystemAPI | Error: trying to add file to file, not folder.");
			}
		} else {
			console.log("O.OS | fileSystemAPI | Error: trying to add file with type that is not 'file'");
		}
		return false;
	}
	editFile(file, path, contents, refresh = true) {
		let formatted_path = this.formatPath(path);
		if (formatted_path) {
			let actual_file = this.getDataFromPath(formatted_path + file);
			if (actual_file.type == "file") {
				let path_to_file = this.getDataFromPath(path);
				if (path_to_file.type == 'folder') {
					if (path_to_file.contents.find((item) => item.name == actual_file.name)) {
						// free to edit
						let file_editable = path_to_file.contents.find((item) => item.name == actual_file.name);
						file_editable.contents = contents;

						if (refresh) {
							this.refreshSystem();
						}

						return true;

					} else {
						//file does not exist
						console.log("O.OS | fileSystemAPI | Error: Cannot edit file " + file.name + " because it does not exist.");
					}
				} else {
					console.log("O.OS | fileSystemAPI | Error: trying to edit file in a file, not a folder.");
				}
			} else {
				console.log("O.OS | fileSystemAPI | Error: trying to edit file with type that is not 'file'");
			}
		} else {
			console.log("O.OS | fileSystemAPI | Error: could not find path specified");
		}
		return false;
	}
	removeItem(item, path, refresh = true) {
		let formatted_path = this.formatPath(path);
		if (formatted_path) {
			let actual_item = this.getDataFromPath(formatted_path + item);
			if (actual_item.type == "file" || actual_item.type == "folder") {
				let path_to_file = this.getDataFromPath(path);
				if (path_to_file.type == 'folder') {
					if (path_to_file.contents.find((test_item) => test_item.name == actual_item.name)) {
						// duplicate file
						let item_to_delete_index = path_to_file.contents.indexOf(path_to_file.contents.find((test_item) => test_item.name == actual_item.name));
						if (item_to_delete_index != -1) {
							console.log(item_to_delete_index)
							path_to_file.contents.splice(item_to_delete_index,1);
						} else {
							console.log("O.OS | fileSystemAPI | Error: could not find path specified.");
						}

						if (refresh) {
							this.refreshSystem();
						}

					} else {
						//file does not exist
						console.log("O.OS | fileSystemAPI | Error: Cannot remove file or folder " + item.name + " because it does not exist.");
					}
				} else {
					console.log("O.OS | fileSystemAPI | Error: trying to remove file from a location not of type 'folder'.");
				}
			} else {
				console.log("O.OS | fileSystemAPI | Error: trying to remove an item that is not a 'file' or a 'folder'.");
			}
		} else {
			console.log("O.OS | fileSystemAPI | Error: could not find path specied.");
		}
		return false;
	}
	renameItem(item, path, newName, refresh = true) {
		let formatted_path = this.formatPath(path);
		if (formatted_path) {
			let actual_item = this.getDataFromPath(formatted_path + item);
			if (actual_item.type == "file" || actual_item.type == "folder") {
				if (actual_item.type == "file" && /^[a-zA-z0-9\_\$\#\!\-]+\.[a-zA-z0-9\_\$\#\!\-]+$/gi.test(newName) || actual_item.type == "folder" && /^[a-zA-z0-9\_\$\#\!\-]+$/gi.test(newName)) {
					let path_to_file = this.getDataFromPath(path);
					if (path_to_file.type == 'folder') {
						if (path_to_file.contents.find((test_item) => test_item.name == actual_item.name)) {
							// duplicate file
							let item_to_rename_index = path_to_file.contents.indexOf(path_to_file.contents.find((test_item) => test_item.name == actual_item.name));
							if (item_to_rename_index != -1) {
								path_to_file.contents[item_to_rename_index].name = newName;
							} else {
								console.log("O.OS | fileSystemAPI | Error: could not find path specified.");
							}

							if (refresh) {
								this.refreshSystem();
							}

						} else {
							//file does not exist
							console.log("O.OS | fileSystemAPI | Error: Cannot rename file or folder " + item.name + " because it does not exist.");
						}
					} else {
						console.log("O.OS | fileSystemAPI | Error: trying to rename file from a location not of type 'folder'.");
					}
				} else {
					console.log("O.OS | fileSystemAPI | Error: trying to rename file or folder with an invalid name.")
				}
				
			} else {
				console.log("O.OS | fileSystemAPI | Error: trying to rename an item that is not a 'file' or a 'folder'.");
			}
		} else {
			console.log("O.OS | fileSystemAPI | Error: could not find path specied.");
		}
		return false;
	}
	refreshSystem() {
		localStorage.setItem("files-system",JSON.stringify(this.system));
	}
	getParentPath(path) {
		if (path.substring(0,5) == "O.OS/") {
			// valid path
			let usablePath = path;
			if (path[path.length - 1] == "/") {
				usablePath = path.substring(0,path.length - 1);
			}

			if (usablePath != "O.OS") {
				let lastInstance = usablePath.lastIndexOf("/");
				return usablePath.substring(0,lastInstance + 1);
			} else {
				return "O.OS/";
			}
		} else {
			console.log("O.OS | fileSystemAPI | getParentPath | Error: invalid path " + path + "\nPath must begin with 'O.OS/'")
			return path;
		}
	}
	formatPath(path) {
		// could take things like... O.OS/
		// could take things like... O.OS
		// could take things like... O.OS/src/index.html

		//step one, figure out if this... *thing* is a file or a folder

		let finalPath = "O.OS/";

		if (path.substring(0,5) == "O.OS/") {
			let prefixlessPath = path.substring(5);
			let traverser_path = prefixlessPath.split("/");

			if (traverser_path[traverser_path.length - 1] == '') {
				traverser_path.pop();
			}

			// start at the zoomed-out-est view, at the root
			let current_view = this.system;
			let error = false;
			for (const pathItem of traverser_path) {
				if (current_view.type != 'file') {
					if (current_view.contents.find((item) => item.name == pathItem)) {
						current_view = current_view.contents.find((item) => item.name == pathItem);
						if (current_view.type == 'folder') {
							finalPath += current_view.name + "/";
						} else {
							finalPath += current_view.name;
						}
					} else {
						console.log("O.OS | fileSystemAPI | Error: Could not find path specified.");
						error = true;
						break;
					}
				} else {
					console.log("O.OS | fileSystemAPI | Error: Could not find path specified, tried to use file as folder.");
					error = true;
					break;
				}
			}

			if (!error) {
				return finalPath;
			} else {
				console.log("O.OS | fileSystemAPI | Exited with error.")
				return undefined;
			}
		} else {
			console.log("O.OS | fileSystemAPI | Error: Invalid path " + path + "\nPath must include O.OS/");
			return undefined;
		}
	}
	getDataFromPath(path) {
		if (path.substring(0,5) == "O.OS/") {
			let prefixlessPath = path.substring(5);
			let traverser_path = prefixlessPath.split("/");

			if (traverser_path[traverser_path.length - 1] == '') {
				traverser_path.pop();
			}

			// start at the zoomed-out-est view, at the root
			let current_view = this.system;
			let error = false;
			for (const pathItem of traverser_path) {
				if (current_view.type != 'file') {
					if (current_view.contents.find((item) => item.name == pathItem)) {
						current_view = current_view.contents.find((item) => item.name == pathItem);
					} else {
						console.log("O.OS | fileSystemAPI | Error: Could not find path specified.");
						error = true;
						break;
					}
				} else {
					console.log("O.OS | fileSystemAPI | Error: Could not find path specified, tried to use file as folder.");
					error = true;
					break;
				}
			}

			if (!error) {
				return current_view;
			} else {
				console.log("O.OS | fileSystemAPI | Exited with error.")
				return undefined;
			}
		} else {
			console.log("O.OS | fileSystemAPI | Error: Invalid path " + path + "\nPath must include O.OS/");
			return undefined;
		}
	}
}

// Documentation
/*

Example paths:

	O.OS/index.html              <--- file
	O.OS/html/index.html         <--- file in folder
	O.OS/projects/               <--- folder
	O.OS/projects                <--- folder

*/