
export let loading_bar = {
	setPercent(decimal) {
		this.root.querySelector("span").style.width = window.innerWidth * 0.8 * decimal + "px";
	},
	root:null,
	set_root(root) {
		this.root = root;
	},
}
_component("loading-bar",html`
	<h1>&#xd8;.OS</h1>
	<div>
		<span></span>
	</div>
	<style>
		@import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;1,300&display=swap');
		:host {
			width:100vw;
			height:100vh;
			background-color:black;
			position:fixed;
			top:0px;
			left:0px;
			z-index:100;
			display:flex;
			align-items:center;
			justify-content:center;
			flex-direction:column;
		}
		p {
			font-family:monospace;
			font-size:10px;
			font-weight:1;
			text-align:center;
			color:rgb(150,150,150);
		}
		h1 {
			font-family:'Open Sans',sans-serif;
			font-size:40px;
			font-weight:1;
			text-align:center;
			color:rgb(150,150,150);
		}
		div {
			width:80vw;
			height:1px;
			background-color:rgb(100,100,100);
			display:block;
		}
		span {
			width:20vw;
			height:1px;
			display:block;
			background-color:white;
			transition:width 0.5s;
		}
	</style>
`,(root) => loading_bar.set_root(root))