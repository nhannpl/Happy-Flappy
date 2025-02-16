// Pipes.js

import React from "react";
import config from "../constants.json"
import pipe_top_up from "../res/pipe.png"
import pipe_bottom_up from "../res/pipe_bottom_up.png"
const Pipes = ({ pipePosition }) => {
	return (
		<div>
		<img
			src={pipe_top_up}
			alt="pipe"
			className="pipe"
			style={{
				left: pipePosition.x,
				height: pipePosition.bottom_height,
				bottom:0
			}}
			draggable={true}
		/>

		{/* <img
		src={pipe_bottom_up}
		alt="pipe"
		className="pipe"
		style={{
			left: pipePosition.x,
			height: pipePosition.up_height,
			top:0
		}}
		draggable={true}
	/> */}
	</div>
		
	);
};

export default Pipes;
