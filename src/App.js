import React, { useEffect, useState, useRef } from "react";
import * as faceapi from "face-api.js";
import Bird from './components/Bird';
import Pipes from './components/Pipes';
import './App.css';
import config from "./constants.json"

export default function App() {

  const PLAYER_WIDTH= config.PLAYER.WIDTH;
  const PLAYER_HEIGHT = config.PLAYER.HEIGHT;
  const GRAVITY = config.PLAYER.GRAVITY;
  const JUMP = config.PLAYER.JUMP;

  const PIPE_SPEED= config.PIPE.SPEED;
  const PIPE_WIDTH = config.PIPE.WIDTH;
  const PIPE_MAX_HEIGHT = config.PIPE.MAX_HEIGHT;
  const POS_Y_OFFSET= 20;



  const videoRef = useRef(null);
  const faceCanvasRef = useRef(null);
  const mainCanvas = useRef(null);

  const [isModelsLoaded, setModelsLoaded] = useState(false);

  const [birdPosition, setBirdPosition] = useState({ x: window.innerWidth / 2, y:window.innerHeight/2+POS_Y_OFFSET, width: PLAYER_WIDTH, height: PLAYER_HEIGHT });

  const [pipes, setPipes] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isHappy, setIsHappy] = useState(false)
  const [pipesPassed, setPipesPassed] = useState(0)

  // Load Face API models
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
          faceapi.nets.faceExpressionNet.loadFromUri("/models"),
        ]);
        console.log("models loaded");
        setModelsLoaded(true);
      } catch (error) {
        console.error("Error loading models:", error);
      }
    };
    loadModels();
  }, []);

  // Start video feed
  useEffect(() => {
    const startVideo = async () => {
      if (videoRef) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      }
    };
    startVideo();
  }, []);

  useEffect(()=>{

    const interval = setInterval(async () => {
    if(isHappy== true)
    {
      console.log("detect happy ", isHappy)
    jump();
    }
  }, 100);
  return () =>clearInterval(interval)

  }, [isHappy, gameStarted])

  const jump = () => {

    if (gameOver ==false && gameStarted== true)
       {
      console.log("jump")
      setBirdPosition((prevPosition) => ({
        ...prevPosition,
        y: prevPosition.y -JUMP // Update position based on velocity
      }));

    }
    else{
      console.log("Game needs to be started first., gameOver?"+ gameOver+" , gameStarted? "+gameStarted)
    }

  };

  const startGame=()=>{
    console.log("restart the game");
    setBirdPosition((pre) => ({...pre, x: window.innerWidth / 2, y: window.innerHeight/2+POS_Y_OFFSET }));
    
    setPipes([]);
    setScore(0);
    setPipesPassed(0);
    setGameOver(false);
    setGameStarted(true);
    console.log("game start is "+ gameStarted);
  }

  // Face detection
  useEffect(() => {
    if (!isModelsLoaded || videoRef.current === null) return;

    const face_canvas = faceCanvasRef.current;
    const video = videoRef.current;
    const displaySize = { width: video.offsetWidth, height: video.offsetHeight };
    const context = face_canvas.getContext("2d");

    face_canvas.width = displaySize.width;
    face_canvas.height = displaySize.height;

    const interval = setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();
        if(detections.length==0)
        {
          setIsHappy(false)
        }
        else{
        for (const detection of detections) {
          if (detection.expressions.happy>=0.5)
          {
            console.log("HAPPY");
            setIsHappy(true)
           break;
          }
          else{
            setIsHappy(false)
            
          }
        }
      }
    
      const resizedDetections = faceapi.resizeResults(detections, displaySize);

      context.clearRect(0, 0, face_canvas.width, face_canvas.height);
      //faceapi.draw.drawDetections(face_canvas, resizedDetections);
      //faceapi.draw.drawFaceLandmarks(face_canvas, resizedDetections);
      faceapi.draw.drawFaceExpressions(face_canvas, resizedDetections);
    }, 100);



    return () => clearInterval(interval);
  }, [isModelsLoaded]);


  useEffect(()  => {
  //  console.log("bird pos when checking colision ("+birdPosition.x+"; "+birdPosition.y)
    const birdTop = birdPosition.y;
    const birdBottom = birdPosition.y+PLAYER_HEIGHT ;
    const birdLeft = birdPosition.x;
    const birdRight = birdPosition.x + PLAYER_WIDTH
    // Check if bird is out of the screen vertically
    if (birdBottom >= window.innerHeight || birdTop < 0) 
      {
      console.log("bird is out of screen, birdBottom "+ birdBottom+" , birdTop "+ birdTop+ ", bird height "+ PLAYER_HEIGHT)
      setGameOver(true);
      setGameStarted(false);
      console.log("game is over so game started is ", gameStarted)
      return;
    }

    // pipes.forEach((pipe) => {
      for(let i =0 ;i< pipes.length;i++)
      {
       let pipe= pipes[i];
     
      const pipeTop = pipe.bottom_height;
      const pipeBottom = 0;
      const pipeLeft = pipe.x;
      const pipeRight = pipe.x + PIPE_WIDTH;

      const isColliding =
       (( birdRight > pipeLeft &&
        birdRight < pipeRight 
       )
        ||
        (
          pipeLeft< birdLeft 
          && birdLeft < pipeRight
          
        ))
        &&   birdBottom >=window.innerHeight+ POS_Y_OFFSET- pipeTop;


        
      if (isColliding== false)
         {
          setScore((prevScore) => prevScore + 1);

        } else 
        {
          // Bird has hit the pipe, end the game
          console.log("COLLIDE COLLIDE COLLIDE, end game. Bird pos: ("+ birdLeft+";" +birdBottom +")  left "+ pipeLeft+"; pipe right "+ pipeRight+"pipTop: "+(window.innerHeight+ POS_Y_OFFSET-pipeTop))
          setGameOver(true);
          setGameStarted(false);
          console.log("collide so game started is ", gameStarted)

         return;
        }
        
      
    //});
      }


  }, [birdPosition]);

  // Apply gravity and update bird position
  useEffect(() => {
  //  console.log("apply gravity and update bird position");

    const gravityInterval = setInterval(() => {
      if (gameOver== false && gameStarted== true && isHappy==false) {

      console.log("bird is FALLING, gamestarted ?",gameStarted)
      setBirdPosition((prevPosition) => {
        const newPosition = {
          ...prevPosition,
          y: prevPosition.y + GRAVITY,
        };
        return newPosition;
      });

   
      }
    }, 100);

    const pipeGenerator = setInterval(() => {
      //console.log("goig to genertate more pipe, gameOver? "+ gameOver+ " game started? "+gameStarted)
      if (gameOver==false && gameStarted==true) {
        //console.log("generating pips")
        setPipes((prev) => {
          const bottom_height = Math.floor(Math.random() * PIPE_MAX_HEIGHT);
          const up_height = window.innerHeight - bottom_height -(config.PIPE.MIN_MIDDLE_SPACE+ Math.random() * config.PIPE.MIDDLE_SPACE);
          const x_pos =             window.innerWidth;// - Math.random() * config.PIPE.HORIZONTAL_SPACE
          //   prev.length > 0
          //     ? prev[prev.length - 1].x + config.PIPE.MIN_HORIZONTAL_SPACE
          //     : window.innerWidth
          // );
          console.log("new pipe at ", x_pos)
          
          return [
            ...prev,
            {
              x: x_pos,
              bottom_height: bottom_height,
              up_height: up_height,
            },
          ];
        });
      }
    }, 4000);



    return () => {
      clearInterval(gravityInterval);
      clearInterval(pipeGenerator);
  
    };
  }, [gameOver, gameStarted]);

  useEffect(()=>{
    const pipeMove = setInterval(() => {
      if (!gameOver && gameStarted) {
        setPipes((prev) =>
          prev.map((pipe) => ({ ...pipe, x: pipe.x -(PIPE_SPEED )})) // Move pipes
        );
    
        let i=0;
        let n= pipes.length;
        let count=0;
        while (i<n)
        {
          if (pipes[i].x< birdPosition.x)
          {
            count++;
           
          }
          else{
           // break;
          }
          i++;
          
        }
        setPipesPassed(count);
      }
    }, 30);
    return ()=>
    clearInterval(  pipeMove);
    
  }, [pipes]
  );
  return (
    <div className="App" ref={mainCanvas}>
      <video className="video" ref={videoRef} autoPlay muted style={{ position: "absolute", top: 0, left: 0, width: "15%" }}></video>
      <canvas ref={faceCanvasRef} style={{ position: "absolute", top: 0, left: 0 }}></canvas>
      
      <div className="Game" onClick={jump}>
        {gameStarted === false && (
          <center>
            <button onClick={startGame}>Start</button>
          </center>
        )}

        <Bird birdPosition={birdPosition} />

        <h1 style={{position:"absolute", left:`${birdPosition.x}px`, top:`${birdPosition.y}px`}}>.,,</h1>

        <h2> Your scores: {score}</h2>
        <h2> Number of pipes passed: {pipesPassed}</h2>

        {pipes.map((pipe, index) => (
          <Pipes key={index} pipePosition={pipe} />
        ))}

        {gameOver && (
          <center>
            <div className="game-over-message">Game Over!</div>
            <br />
            <button style={{ backgroundColor: 'grey', padding: "2px 6px", borderRadius: '5px' }} onClick={startGame}>
              Start Over
              </button>
          </center>
        )}
      </div>
    </div>
  );
}
