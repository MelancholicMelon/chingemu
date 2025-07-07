import React, { useEffect, useRef, useState } from "react";
import Simulation from "./SimulatonAlias";

const sim = new Simulation();

let CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 700;
const TICK_INTERVAL = 1000;

export default function Game() {
  const [tickCount, setTickCount] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const [scores, setScores] = useState([]);
  const [resources, setResources] = useState({
    map: null,
    facilities: [],
    policies: [],
  });
  const [placedObjects, setPlacedObjects] = useState([]);
  const [cellSize, setCellSize] = useState({ width: 0, height: 0 });
  const baseUrl = process.env.REACT_APP_API_URL;

  const addScore = async (score) => {
    const token = localStorage.getItem("token");
    fetch(`${baseUrl}/scores/add`, {
      headers: {
        Authorization: "Bearer " + token,
        score: score,
      },
    })
      .then((res) => res.json())
      .then((data) => setScores(data));
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${baseUrl}/scores`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => res.json())
      .then((data) => setScores(data));
  }, []);

  useEffect(() => {
    const fetchResources = async () => {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: "Bearer " + token,
        id: 1,
      };

      try {
        const mapRes = await fetch(`${baseUrl}/kernel/maps`, { headers });
        const facilitiesRes = await fetch(`${baseUrl}/kernel/facilities`, { headers });
        const policiesRes = await fetch(`${baseUrl}/kernel/policies`, { headers });

        if (!mapRes.ok || !facilitiesRes.ok || !policiesRes.ok) {
          throw new Error("Resource loading failed.");
        }

        const kernel = await mapRes.json();
        const facilities = await facilitiesRes.json();
        const policies = await policiesRes.json();

        sim.initializeSimulation(kernel[0].kernel, facilities, policies);

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

  useEffect(() => {
    if (!resources.map || !isRunning) return;

    const runTick = () => {
      sim.progress();
      setTickCount((prev) => prev + 1);
    };

    intervalRef.current = setInterval(runTick, TICK_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [resources, isRunning]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !resources.map) return;

    const handleClick = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const col = Math.floor(x / cellSize.width);
      const row = Math.floor(y / cellSize.height);

      console.log(`Clicked cell: (${col}, ${row})`);

      const success = sim.validateInput({ x: col, y: row }, "object");
      if (success) {
        setPlacedObjects((prev) => [...prev, { x: col, y: row, type: "object" }]);
      }
    };

    canvas.addEventListener("click", handleClick);
    return () => canvas.removeEventListener("click", handleClick);
  }, [cellSize, resources.map]);

  useEffect(() => {
    if (!resources.map || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    const kernels = sim.getGreennessMap();
    const rows = kernels.length;
    const cols = kernels[0].length;

    const cellHeight = Math.floor(CANVAS_HEIGHT / rows);
    const cellWidth = cellHeight;
    CANVAS_WIDTH = cellWidth * cols;

    canvasRef.current.width = CANVAS_WIDTH;
    canvasRef.current.height = CANVAS_HEIGHT;

    setCellSize({ width: cellWidth, height: cellHeight });

    ctx.fillStyle = `rgb(31, 189, 237)`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const value = kernels[y][x];
        if (value !== 0) {
          ctx.fillStyle = `rgb(${(value - 205) * -1}, 255, ${(value - 255) * -1})`;
          ctx.fillRect(
            Math.floor(x * cellWidth),
            Math.floor(y * cellHeight),
            Math.ceil(cellWidth),
            Math.ceil(cellHeight)
          );
        }
      }
    }

    for (const obj of placedObjects) {
      ctx.fillStyle = "red";
      ctx.fillRect(
        obj.x * cellWidth,
        obj.y * cellHeight,
        Math.ceil(cellWidth),
        Math.ceil(cellHeight)
      );
    }
  }, [resources.map, placedObjects, tickCount]);

  return (
    <div>
      <p>Tick: {tickCount}</p>
      <button onClick={() => setIsRunning((prev) => !prev)}>
        {isRunning ? "Pause" : "Resume"}
      </button>

      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{ display: "block", marginTop: "1rem", cursor: "pointer" }}
      />

      <pre style={{ fontSize: "0.75rem", maxHeight: "300px", overflow: "auto" }}>
        {JSON.stringify(resources.facilities, null, 2)}
      </pre>
    </div>
  );
}
