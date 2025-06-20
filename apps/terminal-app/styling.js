export const styling = html`
	<style>
		main-container {
			width:100vw;
			height:100vh;
		}
		top-bar {
			width:100vw;
			height:20vh;
			background-color:rgb(47, 47, 47);
			color:white;
			font-family:'Open Sans';
			text-align:center;
			display:flex;
			font-size:40px;
			flex-direction:column;
			justify-content:center;
			align-items:center;
			padding-top:20px;
			box-sizing:border-box;
		}
		terminal-section {
			width:100vw;
			height:40vh;
			background-color:rgb(30, 30, 30);
			color:white;
			font-family:monospace;
			padding:20px;
			box-sizing:border-box;
			display:block;
			font-size:20px;
		}
		keyboard-section {
			width:100vw;
			height:40vh;
			background-color:rgb(40, 40, 40);
			color:white;
			font-family:monospace;
			box-sizing:border-box;
			display:block;
			font-size:20px;
		}
		nav-buttons {
			width:100vw;
			height:7vh;
			background-color:rgb(47, 47, 47);
			color:white;
			font-family:monospace;
			box-sizing:border-box;
			display:flex;
			font-size:20px;
			flex-direction:row;
			align-items:center;
			justify-content:space-evenly;
		}
		back-space, run-code {
			width:45vw;
			height:4vh;
			border-radius:2vh;
			background-color:rgb(100, 100, 100);
			color:white;
			font-family:'Open Sans';
			box-sizing:border-box;
			display:flex;
			align-items:center;
			justify-content:center;
			touch-action:none;
		}
		run-code {
			background-color:rgb(0,255,0);
			color:black;
		}
		block-area {
			width:100vw;
			height:33vh;
			padding:20px;
			display:flex;
			flex-direction:row;
			align-items:flex-start;
			justify-content:space-evenly;
			flex-wrap:wrap;
			align-content:flex-start;
			column-gap:10px;
			row-gap:10px;
			box-sizing:border-box;
			overflow-x:hidden;
			overflow-y:scroll;
			line-height:160%;
			touch-action:auto;
			
		}
		code-block {
			width:fit-content;
			height:5vh;
			color:black;
			font-family:monospace;
			text-align:center;
			padding:5px;
			padding-left:20px;
			padding-right:20px;
			border-radius:2.5vh;
			display:flex;
			justify-content:center;
			align-items:center;
			touch-action:auto;
		}
		popup-element {
			position:absolute;
			top:30vh;
			left:10vw;
			width:80vw;
			height:fit-content;
			box-sizing:border-box;
			background-color:rgb(41, 41, 41);
			border-radius:5vh;
			border:3px solid rgb(100,150,255);
			padding:20px;
			display:flex;
			align-items:center;
			justify-content:center;
			flex-direction:column;
			z-index:5;
		}
		button {
			width:60vw;
			height:7vh;
			color:white;
			text-align:center;
			outline:none;
			background-image:linear-gradient(to right, rgb(100,150,255), rgb(196, 47, 246));
			font-family:'Open Sans';
			margin-top:20px;
			border-radius:3.5vh;
			border:none;
			font-size:20px;
		}
		input {
			width:60vw;
			height:7vh;
			color:white;
			text-align:center;
			outline:none;
			background-color:rgb(32, 32, 32);
			font-family:monospace;
			font-size:3vh;
			margin-top:20px;
			border:none;
			border-radius:3.5vh;
		}
		p {
			font-size:20px;
			color:rgb(150,150,150);
			margin-bottom:10px;
		}
		shade-element {
			width:100vw;
			height:100vh;
			position:absolute;
			top:0px;
			left:0px;
			background-color:rgba(0,0,0,0.6);
			backdrop-filter:blur(5px);
			z-index:4;
		}
		* {
			touch-action:none;
		}
		:host {
			background-color:black;
			display:block;
			position:fixed;
			top:0px;
			left:0px;
			width:100vw;
			height:100vh;
		}
	</style>
`