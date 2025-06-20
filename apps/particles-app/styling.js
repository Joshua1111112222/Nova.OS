export const styling = html`
	<style>
		particle-container {
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
			box-sizing:border-box;
		}
		canvas {
			width:100vw;
			height:100vh;
			background-color:rgb(20,20,20);
		}
		:host {
			background-color:black;
		}
		action-button {
			width:25vw;
			height:25vw;
			position:absolute;
			bottom:10px;
			right:10px;
			border-radius:4vw;
			background-color:rgb(50,50,50);
		}
	</style>
`