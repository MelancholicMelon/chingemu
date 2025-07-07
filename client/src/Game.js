import React, { useEffect, useRef, useState } from "react";
import Simulation from "./Simulation";
import Render from "./Render";

const sim = new Simulation();
const TICK_INTERVAL = 1000;

export default function Game() {
  const [tickCount, setTickCount] = useState(2025);
  const [isRunning, setIsRunning] = useState(true);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const [scores, setScores] = useState([]);
  const [selectObject, setSelectObject] = useState('')
  const [resources, setResources] = useState({
    map: null,
    facilities: [],
    policies: [],
  });
  const [placedObjects, setPlacedObjects] = useState([]);
  const [cellSize, setCellSize] = useState({ width: 0, height: 0 });
  const [canvasHeight, setCanvasHeight] = useState(500);
  const baseUrl = process.env.REACT_APP_API_URL;

  // Fetch scores and resources omitted for brevity; same as before

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const init = async () => {
      try {
        const { map, facilities, policies } = await sim.initialize(baseUrl, token);
        setResources({ map, facilities, policies });
      } catch (err) {
        console.error("Failed to initialize simulation:", err);
      }
    };

    init();
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

  // Adjust canvas height dynamically to fill remaining viewport below navbar
  useEffect(() => {
    const updateCanvasHeight = () => {
      const navbarHeight = document.getElementById("navbar")?.offsetHeight || 0;
      const viewportHeight = window.innerHeight;
      const padding = 20; // some bottom margin

      const height = viewportHeight - navbarHeight - padding;
      setCanvasHeight(height);
    };

    updateCanvasHeight();
    window.addEventListener("resize", updateCanvasHeight);
    return () => window.removeEventListener("resize", updateCanvasHeight);
  }, []);

  const handleCellClick = (col, row) => {
    const success = sim.validateInput({ x: col, y: row }, selectObject);
    if (success) {
      setPlacedObjects((prev) => [...prev, { x: col, y: row, type: selectObject }]);
    }
  };

  return (
    <div style={{ display: "flex", height: `calc(100vh - var(--navbar-height, 50px))`, padding: 10 }}>
      {/* Left: Canvas */}
      <div style={{ flex: 1, marginRight: 15, marginLeft: 15 }}>
        <Render
          canvasRef={canvasRef}
          map={sim.getGreennessMap()}
          placedObjects={placedObjects}
          cellSize={cellSize}
          setCellSize={setCellSize}
          onCellClick={handleCellClick}
          canvasHeight={canvasHeight} // pass this prop
        />
      </div>

      {/* Right: Controls */}
      <div
        style={{
          width: 300,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          overflowY: "auto",
        }}
      >
        <p>Year: {tickCount}</p>
        <button onClick={() => setIsRunning((prev) => !prev)}>
          {isRunning ? "Pause" : "Resume"}
        </button>

        <pre
          style={{
            fontSize: "0.75rem",
            maxHeight: "300px",
            overflow: "auto",
            backgroundColor: "#f9f9f9",
            padding: 10,
            borderRadius: 4,
            border: "1px solid #ccc",
          }}
        >
          {JSON.stringify(resources.facilities, null, 2)}
        </pre>

        {/* Add more controls here */}
      </div>
    </div>
  );
}
