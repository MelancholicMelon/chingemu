import React, { useEffect, useRef, useState } from "react";

const TICK_INTERVAL = 1000; // 1 second per tick

export default function Simulation() {
  const [resources, setResources] = useState({
    map: null,
    facilities: [],
    policies: [],
  });

  const [tickCount, setTickCount] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  const intervalRef = useRef(null);

  // Fetch simulation data (maps, facilities, policies)
  useEffect(() => {
    const fetchResources = async () => {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: "Bearer " + token,
      };

      try {
        const mapId = 0; // Replace with dynamic ID if needed

        const mapRes = await fetch("http://localhost:3001/kernel/maps", {
          headers: {
            ...headers,
            id: mapId,
          },
        });
        const facilitiesRes = await fetch("http://localhost:3001/kernel/facilities", {
          headers,
        });
        const policiesRes = await fetch("http://localhost:3001/kernel/policies", {
          headers,
        });

        if (!mapRes.ok || !facilitiesRes.ok || !policiesRes.ok) {
          throw new Error("One or more resource requests failed");
        }

        const map = await mapRes.json();
        const facilities = await facilitiesRes.json();
        const policies = await policiesRes.json();

        setResources({
          map,
          facilities,
          policies,
        });

        console.log("Resources loaded");
      } catch (error) {
        console.error("Failed to load simulation resources:", error);
      }
    };

    fetchResources();
  }, []);

  // Main simulation loop
  useEffect(() => {
    if (!resources.map || !isRunning) return;

    const runTick = () => {
      setTickCount((prev) => prev + 1);

      // Insert simulation update logic here
      console.log("Tick", tickCount + 1);

      // Example: you can mutate state or trigger calculations here
    };

    intervalRef.current = setInterval(runTick, TICK_INTERVAL);

    return () => clearInterval(intervalRef.current);
  }, [resources, isRunning]);

  return (
    <div>
      <h3>Simulation</h3>
      <p>Tick: {tickCount}</p>
      <button onClick={() => setIsRunning(!isRunning)}>
        {isRunning ? "Pause" : "Resume"}
      </button>

      <pre style={{ fontSize: "0.75rem", maxHeight: "300px", overflow: "auto" }}>
        {JSON.stringify(resources, null, 2)}
      </pre>
    </div>
  );
}
