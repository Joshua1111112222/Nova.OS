import { File, Folder, FileSystem } from "./fileSystemAPI.js"

export const settings = false;

// Each app uses it's prefix (ex, settings-, terminal-). 
// Since settings is a special exception and requires boot up privileges, 
// it gets presets for when the OS first loads.
// 
// In addition, there is the theme- prefix, which is also included here.

if (localStorage.getItem("settings-loaded") != "true") {

	// general settings
	localStorage.setItem("settings-loaded","true");
	localStorage.setItem("theme-task-bar-color","rgba(0, 0, 0, 0.78)");
	localStorage.setItem("theme-app-number-color","rgb(0,255,0)");
	localStorage.setItem("theme-app-background-color","rgb(35, 35, 35)");
	localStorage.setItem("downloaded-apps",JSON.stringify([]));
	localStorage.setItem("theme-wallpaper", "pink_swirl.png");
	
	// file system management
	let system = {
		contents: [],
		type: 'folder',
		name: 'root'
	};
	let readme = new File("README.txt");
	let notesfile = new File("notes.txt");
	let index  = new File("index.html");
	notesfile.contents = `Important data in important file for important reasons.`;
	index.contents  = `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Sample HTML File</title>
		</head>
		<body>
			<h1>Hello, World!</h1>
			<p>This is a sample HTML file.</p>
			<ul>
				<li>Item 1</li>
				<li>Item 2</li>
				<li>Item 3</li>
			</ul>
		</body>
		</html>`
	readme.contents = "O.OS. Rights reserved. \n\nWelcome to the O.OS, a new, lightweight, fast, and formidable operating system, running right in your browser! Wield commands quickly in the terminal, download applications from a plethora of resources, and demonstrate your superior control over your superior operating. Your operating system, your rules. \n\nHowever, do note, this is still an experimental OS, and may occasionally error. Use with caution.";
	let source = new Folder("src");
	source.contents.push(index);
	system.contents.push(readme);
	system.contents.push(source);
	system.contents.push(notesfile);
	localStorage.setItem("files-system",JSON.stringify(system));
}