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
  const yearRef = useRef(year);
  const [selectedFacility, setSelectedFacility] = useState('Wild Life Reserve');
  const [facilityCoordinate, setFacilityCoordinate] = useState([]);
  const [policyActivation, setPolicyActivation] = useState(null);
  const [gameState, setGameState] = useState(false);
  const [greennessMap, setGreennessMap] = useState(null);
  const greennessMapRef = useRef(greennessMap);

  const [facilityContinent, setFacilityContinet] = useState({});

  // temporary state for selected facilities
  const [selFacility, setSelFacility] = useState("");

  // temporary useeffect for debugging
  useEffect(() => {
    console.log(`${selFacility} is selected`)
  }, [selFacility])

  const onClickFacility = (val) => {
    const selectedFacility = val.currentTarget.value;
    setSelFacility(selectedFacility);
  }

  // temporary facilities json for testing
  const facilities = {
    "tree": { img: "/img/pngegg.png", cost: 50, name: "tree" },
    "factory": { img: "/img/pngegg.png", cost: 100, name: "factory" },
    "big factory": { img: "/img/pngegg.png", cost: 150, name: "big factory" },
    "tree2": { img: "/img/pngegg.png", cost: 50, name: "tree" },
    "factory2": { img: "/img/pngegg.png", cost: 100, name: "factory" },
    "big factory2": { img: "/img/pngegg.png", cost: 150, name: "big factory" },
    "tree3": { img: "/img/pngegg.png", cost: 50, name: "tree" },
    "factory3": { img: "/img/pngegg.png", cost: 100, name: "factory" },
    "big factory3": { img: "/img/pngegg.png", cost: 150, name: "big factory" },
    "tree4": { img: "/img/pngegg.png", cost: 50, name: "tree" },
    "factory4": { img: "/img/pngegg.png", cost: 100, name: "factory" },
    "big factory4": { img: "/img/pngegg.png", cost: 150, name: "big factory" },
    "tree5": { img: "/img/pngegg.png", cost: 50, name: "tree" },
    "factory5": { img: "/img/pngegg.png", cost: 100, name: "factory" },
    "big factory5": { img: "/img/pngegg.png", cost: 150, name: "big factory" }
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
      { x: col, y: row },
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
    greennessMapRef.current = greennessMap;
  }, [greennessMap]);


  useEffect(() => {
    if (!gameState) return;

    let tickCounter = 0;

    const runSimulationTick = () => {
      // Update game state here
      console.log('Simulation tick', new Date().toLocaleTimeString());

      simulation.progress(
        greennessMapRef.current,
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

    tickRef.current = setInterval(runSimulationTick, TICK_INTERVAL);

    // Cleanup when component unmounts or paused
    return () => clearInterval(tickRef.current);
  }, [, gameState]);

  return (
    <div>
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
          {/*Facilities list*/}
          <div className="facilities-container">
            {Object.values(facilities).map((facility, key) => (
              <div key={key}>
                <Facilities
                  img={facility.img}
                  cost={facility.cost}
                  name={facility.name}
                  onClick={onClickFacility}
                />
              </div>
            ))}
          </div>
          {/*Policies list*/}
          <div className="policies-container">
          </div>
        </div>
      </div>
      <button onClick={() => setGameState(true)} disabled={gameState}>
        Resume
      </button>
    </div>
  );
}

// Dylan's TODO
// Add components that can be placed on the map
// Add policies to toggle
// Add a timeline slider on the top
// Add buttons to control the game like pause, continue, reset, etc. 
// Add current money and cost per facility