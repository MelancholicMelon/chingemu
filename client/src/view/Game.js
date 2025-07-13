import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Utils from "../utils/Utils";
import MapRender from "./subView/MapRender";
import Simulation from "../utils/Simulation";
import "../css/game.css";
import Facilities from "./subView/Facilities";
import Policy from "./subView/Policy";
import Timeline from "./subView/Timeline";

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

  const [budget, setBudget] = useState(1000000000);
  const [profit, setProfit] = useState(0);
  const [score, setScore] = useState(0);
  const [year, setYear] = useState(2025);
  const yearRef = useRef(year);
  const [selectedFacility, setSelectedFacility] = useState("Factory");
  const [facilityCoordinate, setFacilityCoordinate] = useState([]);
  const [policyActivation, setPolicyActivation] = useState(null);
  const [gameState, setGameState] = useState(false);
  const [greennessMap, setGreennessMap] = useState(null);
  const greennessMapRef = useRef(greennessMap);
  const navigate = useNavigate();

  // // Policy state handling
  // const policySpecification = [
  //   {
  //     "id": "Free Diddy",
  //     "parameter": "maxImpact",
  //     "multiplier": -100
  //   },
  //   {
  //     "id": "Resurrect the Lorax",
  //     "parameter": "sd",
  //     "multiplier": 3
  //   },
  //   {
  //     "id": "Imprison Taylor Swift",
  //     "parameter": "timeToLive",
  //     "multiplier": 1.5
  //   },
  //   {
  //     "id": "Temporary",
  //     "parameter": "timeToLive",
  //     "multiplier": 1.5
  //   }
  // ]

  // const [form, setForm] = useState(
  //   policySpecification.reduce((acc, policy) => {
  //     acc[policy.id] = false;
  //     return acc;
  //   }, {})
  // );

  useEffect(() => {
    if (specifications.policySpecification) {
      setPolicyActivation(
        specifications.policySpecification.reduce((acc, policy) => {
          acc[policy.id] = false;
          return acc;
        }, {})
      );
    }
  }, [specifications.policySpecification]);

  const onClickPolicy = (e) => {
    console.log("DEBUG: Policy Clicked");
    const { name, checked } = e.target;
    setPolicyActivation((prev) => ({ ...prev, [name]: checked }));
  };

  // // Policy state debugging
  // useEffect(() => {
  //   console.log(policyActivation);
  // }, [policyActivation])

  // // temporary useeffect for debugging
  // useEffect(() => {
  //   console.log(`${selectedFacility} is selected`)
  // }, [selectedFacility])

  const onClickFacility = (facilityId) => {
    console.log("Selected:", facilityId);
    setSelectedFacility(facilityId);
  };

  const tickRef = useRef(null);
  const canvasRef = useRef(null);
  const [cellSize, setCellSize] = useState({ width: 0, height: 0 });
  const [canvasHeight, setCanvasHeight] = useState(500);

  const simulation = new Simulation();
  const TICK_INTERVAL = 100;
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
          data.policySpecification.reduce((acc, policy) => {
            // console.log("Set policy activation triggered") // Debug
            acc[policy.id] = false;
            return acc;
          }, {})
        );
      })
      .catch((error) => {
        // Handle the error here
        console.error("Failed to fetch utils data:", error);
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
    if (gameState) return;

    if (!selectedFacility) {
      alert("Please select a facility before placing it.");
      return;
    }

    const success = simulation.validateInput(
      { x: col, y: row },
      selectedFacility,
      facilityCoordinate,
      specifications.facilitySpecification,
      greennessMap,
      setFacilityCoordinate,
      setProfit,
      setBudget
    );

    if (!success) {
      alert("Placement not allowed at this position.");
    }
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
    let tickPerRun = 10;

    const runSimulationTick = () => {
      // console.log("Simulation tick", new Date().toLocaleTimeString());
      if (year > 2125) {
        setScore((prev) => simulation.calculateScore(budget, profit, greennessMapRef.current));
        simulation.endSimulation(score, budget, greennessMapRef.current);
        //alert("The simulation has ended, you score is ", score, ". Your remaining budget is ", budget, ".")
        navigate("/leaderboard", { replace: true });
        return;
      }

      setFacilityCoordinate((prev) => {
        const updated = prev
          .map((fc) => ({ ...fc, timeToLive: fc.timeToLive - 1 }))
          .filter((fc) => fc.timeToLive > 0);

        simulation.progress(
          greennessMapRef.current,
          updated,
          policyActivation,
          specifications,
          setGreennessMap
        );

        return updated;
      });

      setBudget((prev) => prev + profit);
      setYear((prevYear) => prevYear + 1);
      setScore((prev) => simulation.calculateScore(budget, profit, greennessMapRef.current));
      tickCounter++;

      if (tickCounter >= tickPerRun) {
        setGameState(false);
      }
    };

    tickRef.current = setInterval(runSimulationTick, TICK_INTERVAL);
    return () => clearInterval(tickRef.current);
  }, [gameState]);

  const resetGame = () => {};

  return (
    <div>
      <div className="game-container">
        <div className="canvas-container">
          <div className="map-header">
            <h2 className="map-title">Japan Map</h2>
          </div>
          <div>
            {greennessMap ? (
              <div>
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
            ) : (
              <div className="map-loading">
                <div className="map-loading-spinner"></div>
                <p className="map-loading-text">Loading World Map...</p>
              </div>
            )}
          </div>
          <div className="map-instructions">
            <p>
              {gameState
                ? "Simulation is running! Watch the changes unfold."
                : `Click on the map to place your selected facility: ${selectedFacility}`}
            </p>
          </div>
        </div>

        <div className="controls-container">
          <button
            className="resume"
            onClick={() => setGameState(true)}
            disabled={gameState}>
            Resume
          </button>
          <Timeline currentYear={year} startYear={2025} endYear={2125} />
          {/* Budget */}
          <div className="metrics-container">
            <p>Money: {budget}</p>
            <p>Profit: {profit}</p>
            <p>Score: {score}</p>
          </div>
          {/*Facilities list*/}
          <div className="section-header">Facilities</div>
          <div className="facilities-container">
            {specifications.facilitySpecification &&
              specifications.facilitySpecification.map((facility, key) => {
                //console.log(`Rendering facility: ${facility.id}, img: ${facility.img}`); // debuggusy
                return (
                  <div key={key}>
                    <Facilities
                      img={facility.img}
                      cost={facility.cost}
                      name={facility.id}
                      maxImpact={facility.maxImpact}
                      timeToLive={facility.timeToLive}
                      profit={facility.profit}
                      size={facility.size}
                      active={selectedFacility === facility.id}
                      onClick={onClickFacility}
                    />
                  </div>
                );
              })}
          </div>
          {/*Policies list*/}
          <div className="section-header">Policies</div>
          <div className="policies-container">
            {specifications.policySpecification &&
              specifications.policySpecification.map((policy, key) => (
                <div key={key}>
                  <Policy
                    id={policy.id}
                    bool={
                      policyActivation ? policyActivation[policy.id] : false
                    }
                    onChange={onClickPolicy}
                  />
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Dylan's TODO
// Add buttons to control the game like pause, continue, reset, etc.
// Add a timeline slider on the top
