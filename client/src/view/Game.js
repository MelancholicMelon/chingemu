import React, { useEffect, useRef, useState } from "react";
import Utils from "../utils/Utils";
import MapRender from "./subView/MapRender";
import Simulation from "../utils/Simulation";
import "../css/game.css"
import Facilities from "./Facilities";

export default function Game() {
  const [specifications, setSpecifications] = useState({
    colorSpecification: null,
    facilitySpecification: null,
    policySpecification: null,
    objectTypes: null,
    continents: null,
    facilityTypes: null,
    pdfTypes: null,
    policyTypes: null,
    modifiableParams: null,
  });

  const [budge, setBudget] = useState(10000000);
  const [profit, setProfit] = useState(0);
  const [score, setScore] = useState(0);
  const [year, setYear] = useState(2025);
  const [selectedFacility, setSelectedFacility] = useState('Wild Life Reserve');
  const [facilityCoordinate, setFacilityCoordinate] = useState([]);
  const [policyActivation, setPolicyActivation] = useState(null);
  const [gameState, setGameState] = useState(false);
  const [greennessMap, setGreennessMap] = useState(null);

  const [facilityContinent, setFacilityContinet] = useState({});

  // temporary state for selected facilities
  const [selFacility, setSelFacitlity] = useState("");

  // temporary facilities json for testing
  const facilities = {
    "tree": {img: "../img/png-clipart-fried-egg-fried-egg-thumbnail.png", cost: 50, name: "tree"},
    "factory": {img: "../img/png-clipart-fried-egg-fried-egg-thumbnail.png", cost: 100, name: "factory"},
    "big factory": {img: "../img/png-clipart-fried-egg-fried-egg-thumbnail.png", cost: 150, name: "big factory"}
  }

  const tickRef = useRef(null);
  const canvasRef = useRef(null);
  const [cellSize, setCellSize] = useState({ width: 0, height: 0 });
  const [canvasHeight, setCanvasHeight] = useState(500);
  const baseUrl = process.env.REACT_APP_API_URL;

  const simulation = new Simulation()
  const TICK_INTERVAL = 1000

  useEffect(() => {
    Utils()
      .then((data) => {
        setSpecifications({
          colorSpecification: data.colorSpecification,
          facilitySpecification: data.facilitySpecification,
          policySpecification: data.policySpecification,
          objectTypes: data.objectTypes,
          continents: data.continents,
          facilityTypes: data.facilityTypes,
          pdfTypes: data.pdfTypes,
          policyTypes: data.policyTypes,
          modifiableParams: data.modifiableParams,
        });

        setGreennessMap(data.greennessMap);

        setPolicyActivation(
          data.policyTypes.map((id) => ({
            id: id,
            activate: false,
          }))
        );
      })
      .catch((error) => {
        console.error("Failed to load specifications:", error);
      });
  }, []);

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
    const success = simulation.validateInput(
      {x: col, y:row},
      selectedFacility,
      facilityCoordinate,
      specifications.facilitySpecification,
      greennessMap,
      setFacilityCoordinate
    );
  };

  useEffect(() => {
    if (!gameState) return;

    const runSimulationTick = () => {
      // Update game state here
      console.log('Simulation tick', new Date().toLocaleTimeString());

      // Example: update local resource values here
      // setResources(prev => ({ ...prev, wood: prev.wood + 1 }));
    };

    tickRef.current = setInterval(runSimulationTick, TICK_INTERVAL);

    // Cleanup when component unmounts or paused
    return () => clearInterval(tickRef.current);
  }, [, gameState]);

  return (
    <div className="game-container">
      <div className="canvas-container">
        <MapRender
          canvasRef={canvasRef}
          map={greennessMap}
          facilityCoordinate={facilityCoordinate}
          specifications={specifications}
          cellSize={cellSize}
          setCellSize={setCellSize}
          onCellClick={handleCellClick}
          canvasHeight={canvasHeight}
        />
      </div>

      <div className="controls-container">
        <pre className="debug-panel"></pre>
        {/* Add more controls here */}
        {/*Facilities list*/}
        {Object.values(facilities).map((facility, key) => (
          <div key={key}>
            <Facilities
              img = {facility.img}
              cost = {facility.cost}
              name = {facility.name}
            />
            </div>
        ))}
      </div>
    </div>
  );
}

// Dylan's TODO
// Add components that can be placed on the map
// Add policies to toggle
// Add a timeline slider on the top
// Add buttons to control the game like pause, continue, reset, etc. 
// Add current money and cost per facility