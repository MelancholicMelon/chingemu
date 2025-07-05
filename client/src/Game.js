import React, { useEffect, useRef, useState } from "react";

let CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 500;
const TICK_INTERVAL = 1000;

export default function Simulation() {
  const [tickCount, setTickCount] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const [scores, setScores] = useState([]);
  const [score, setScore] = useState('');
  const [resources, setResources] = useState({
    map: null,
    facilities: [],
    policies: [],
  });
    
  const addScore = async (score) => {
      const token = localStorage.getItem("token");
      fetch("http://localhost:3001/scores/add", {
          headers: {
              Authorization: "Bearer " + token,
              score: score
          }
      })
      .then(res => res.json())
      .then(data => setScores(data));

      console.log(scores)
  };

  useEffect(() => {
      const token = localStorage.getItem("token");
      fetch("http://localhost:3001/scores", {
          headers: {
              Authorization: "Bearer " + token
          }
      })
      .then(res => res.json())
      .then(data => setScores(data));
  }, []);

  // Fetch resources (maps, facilities, policies)
  useEffect(() => {
    const fetchResources = async () => {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: "Bearer " + token,
        id: 1, // Assuming map ID 0
      };

      try {
        const mapRes = await fetch("http://localhost:3001/kernel/maps", { headers });
        const facilitiesRes = await fetch("http://localhost:3001/kernel/facilities", { headers });
        const policiesRes = await fetch("http://localhost:3001/kernel/policies", { headers });

        if (!mapRes.ok || !facilitiesRes.ok || !policiesRes.ok) {
          throw new Error("Resource loading failed.");
        }

        const kernel = await mapRes.json();
        const facilities = await facilitiesRes.json();
        const policies = await policiesRes.json();

        setResources({
          map: kernel,
          facilities,
          policies,
        });
      } catch (err) {
        console.error("Failed to fetch resources:", err);
      }
    };

    fetchResources();
  }, []);

  // Simulation tick logic
  useEffect(() => {
    if (!resources.map || !isRunning) return;

    const runTick = () => {
      setTickCount((prev) => prev + 1);
      console.log("Tick", tickCount + 1);
    };

    intervalRef.current = setInterval(runTick, TICK_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [resources, isRunning]);

  // Draw kernel map on canvas
  useEffect(() => {
    if (!resources.map || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    const kernels = resources.map;
    const rows = kernels[0].kernel.length;
    const cols = kernels[0].kernel[0].length;


    const cellHeight = CANVAS_HEIGHT / rows;
    const cellWidth = cellHeight 
    CANVAS_WIDTH = cellWidth * cols;

    ctx.fillStyle = `rgb(31, 189, 237)`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    for(let i = 0;i<kernels.length;i++){
        const kernel = kernels[i].kernel
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const value = kernel[y][x]
                if(value !== 0){
                    ctx.fillStyle = `rgb(${(value-205)*-1}, ${255}, ${(value-255)*-1})`;
                    ctx.fillRect(
                      Math.floor(x * cellWidth),
                      Math.floor(y * cellHeight),
                      Math.ceil(cellWidth),
                      Math.ceil(cellHeight)
                    );
                }
            }
        }
    }
  }, [resources.map]);

  return (
    <div>
      <h3>Simulation</h3>
      <p>Tick: {tickCount}</p>
      <button onClick={() => setIsRunning((prev) => !prev)}>
        {isRunning ? "Pause" : "Resume"}
      </button>

      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{ border: "0px solid black", marginTop: "1rem" }}
      />

      <pre style={{ fontSize: "0.75rem", maxHeight: "300px", overflow: "auto" }}>
        {JSON.stringify(resources.facilities, null, 2)}
      </pre>
    </div>
  );
}
