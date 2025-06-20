export const styling = html`
	<style>
		body {
			width:100vw;
			height:100vh;
			overflow:hidden;
		}
		main-home {
			width:100vw;
			height:100vh;
			position:fixed;
			top:0px;
			left:0px;
			background-image: url("./images/${localStorage.getItem('theme-wallpaper')}"); /* wallpaper.png */
			background-size:100% 100%;
			background-color:#10001e;
			overflow:hidden;
		}
		app-main {
			width:100vw;
			height:calc(85vh);
			display:flex;
			box-sizing:border-box;
			padding:20px;
			padding-top:80px;
			flex-direction:row;
			justify-content:flex-start;
			align-items:flex-start;
			gap:10px;
		}
		app-container {
			width:100vw;
			height:100vh;
			display:block;
			position:fixed;
			top:0px;
			left:0px;
			background-color:white;
			border-radius:0px;
			transition:transform 0.5s, border-radius 0.5s;
			z-index:3;
			overflow:hidden;
		}
		app-bar {
			width:90vw;
			height:13vh;
			background-color:${localStorage.getItem("theme-task-bar-color")};
			display:flex;
			position:fixed;
			bottom:5vw;
			left:5vw;
			border-radius:4vh;
			backdrop-filter:blur(3px);
			justify-content:space-evenly;
			align-items:center;
		}
		app-item {
			height:calc(13vh - 40px);
			width:calc(13vh - 40px);
			border-radius:2vh;
			overflow:hidden;
			background-size:70% 70%;
			background-position:50% 50%;
			background-color:${localStorage.getItem("theme-app-background-color")};
			background-repeat:no-repeat;
			display:block;
			box-sizing:border-box;
			pointer-events:auto;
		}
		swipe-up {
			position:fixed;
			top:0px;
			left:0px;
			width:100px;
			height:100px;
			z-index:100;
		}
		transparent-overlay {
			width:100vw;
			height:100vh;
			display:none;
			position:fixed;
			top:0px;
			left:0px;
			background-color:rgb(0,0,0,0.5);
			backdrop-filter:blur(2px);
			z-index:2;
			transition:opacity 0.5s;
		}
		move-right {
			background-color:black;
			color:white;
			font-family:monospace;
			display:flex;
			text-align:center;
			justify-content:center;
			align-items:center;
			height:20vh;
			width:50px;
			position:fixed;
			top:40vh;
			right:-50px;
			border-top-left-radius:20px;
			border-bottom-left-radius:20px;
			z-index:4;
			font-size:20px;
			transition:left 0.5s, right 0.5s;
		}
		move-left {
			background-color:black;
			color:white;
			font-family:monospace;
			display:flex;
			text-align:center;
			justify-content:center;
			align-items:center;
			height:20vh;
			width:50px;
			position:fixed;
			top:40vh;
			left:-50px;
			border-top-right-radius:20px;
			border-bottom-right-radius:20px;
			z-index:4;
			font-size:20px;
			transition:left 0.5s, right 0.5s;
		}
		select-app-number {
			background-color:black;
			color:${localStorage.getItem("theme-app-number-color")};
			font-family:'Open Sans';
			display:flex;
			text-align:center;
			justify-content:center;
			align-items:flex-end;
			height:60px;
			width:47vw;
			position:fixed;
			top:0vh;
			left:26.5vw;
			border-bottom-right-radius:20px;
			border-bottom-left-radius:20px;
			z-index:4;
			font-size:20px;
			transition:top 0.5s;
		}
		install-as-app-overlay {
			width:100vw;
			height:100vh;
			position:fixed;
			z-index:1000;
			top:0px;
			left:0px;
			background-color:green;
		}
		* {
			touch-action:none;
		}
	</style>
`
_(styling)