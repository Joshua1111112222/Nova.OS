export const styling = html`
	<style>
		h1 {
			color:white;
			font-family:'Open Sans';
			font-size:30px;
			text-align:center;
			margin-top:50px;
		}
		p {
			color:white;
			font-family:'Open Sans';
			font-size:10px;
			text-align:center;
		}
		main-container {
			position:absolute;
			top:0px;
			left:0px;
			background-color:rgb(20,20,20);
			width:100vw;
			height:100vh;
			display:flex;
			justify-content:center;
			flex-wrap:wrap;
			flex-direction:column;
			align-items:center;
			padding:20px;
			box-sizing:border-box;
			padding-top:80px;
		}
		info-graph {
			width:90vw;
			height:20vh;
			background-color:rgb(30,30,30);
			border-radius:30px;
			text-align:right;
			color:rgb(200,200,200);
			font-family:'Open Sans';
			font-size:50px;
			display:flex;
			justify-content:flex-end;
			align-items:center;
			padding:20px;
			box-sizing:border-box;
			overflow:hidden;
		}
		button-container {
			width:90vw;
			height:fit-content;
			display:flex;
			justify-content:center;
			align-items:flex-start;
			flex-wrap:wrap;
			flex-direction:row;
			gap:10px;
			margin-top:20px;
		}
		button-item, operation-button-item, option-item,generate-math {
			width:calc((90vw - 40px)/4);
			height:calc((90vw - 40px)/4);
			background-color:rgb(100,150,255);
			color:white;
			display:flex;
			font-family:monospace;
			border-radius:20px;
			justify-content:center;
			align-items:center;
			font-size:30px;
			font-weight:bolder;

		}
		operation-button-item, generate-math {
			background-color:rgb(216, 161, 65);
		}
		option-item {
			background-color:rgb(76, 76, 76);
		}
		input {
			width:30vw;
			margin-left:35vw;
			box-sizing:border-box;
			height:50px;
			background-color:rgb(150,150,150);
			border-radius:25px;
			border:none;
			outline:none;
		}
		:host {
			background-color:black;
		}
	</style>
`