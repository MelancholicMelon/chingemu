import React, { useEffect, useRef, useState } from "react";
import Utils from "../utils/Utils";
import MapRender from "./subView/MapRender";
import Simulation from "../utils/Simulation";

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
  const [year, setYear] = useState(0);
  const yearRef = useRef(year);
  const [selectedFacility, setSelectedFacility] = useState('Wild Life Reserve');
  const [facilityCoordinate, setFacilityCoordinate] = useState([]);
  const [policyActivation, setPolicyActivation] = useState(null);
  const [gameState, setGameState] = useState(false);
  const [greennessMap, setGreennessMap] = useState(null);

  const [facilityContinent, setFacilityContinet] = useState({});

  const tickRef = useRef(null); 
  const canvasRef = useRef(null);
  const [cellSize, setCellSize] = useState({ width: 0, height: 0 });
  const [canvasHeight, setCanvasHeight] = useState(500);
  const baseUrl = process.env.REACT_APP_API_URL;

  const simulation = new Simulation()
  const TICK_INTERVAL = 500

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
    if(gameState){
      return
    }
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
    yearRef.current = year;
  }, [year]);

  useEffect(() => {
    if (!gameState) return;

    let tickCounter = 0;

    const Tick = () => {
      console.log("Simulation tick", new Date().toLocaleTimeString());

      simulation.progress(
        greennessMap,
        facilityCoordinate,
        policyActivation,
        specifications,
        setGreennessMap
      );

      setYear(prevYear => prevYear + 1);
      tickCounter++;

      if (tickCounter >= 10) {
        setGameState(false);
      }
    };

    tickRef.current = setInterval(Tick, TICK_INTERVAL);

    return () => clearInterval(tickRef.current);
  }, [gameState]);


  console.log(greennessMap)
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
        <button onClick={() => setGameState(true)} disabled={gameState}> Resume </button>
        <pre className="debug-panel">Year: {year+2025}</pre>
        {/* Add more controls here */}
      </div>
    </div>
  );
}
