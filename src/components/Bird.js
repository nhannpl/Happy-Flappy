// Bird.js
import React from "react";
import player from "../res/Image.png"
 const Bird = ({ birdPosition }) => {

	return (
		<img
			src={player}
			alt="bird"
			className="bird"
			style={{
				left: birdPosition.x,
				top: birdPosition.y,
				width: birdPosition.width,
				height: birdPosition.height
			}}
			draggable={true}
		/>
	);
};
export default Bird;
