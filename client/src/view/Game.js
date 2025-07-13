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

  const [hoveredFacility, setHoveredFacility] = useState(null);
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
  //Update every tick
  const facilityCoordinateRef = useRef(facilityCoordinate);
  useEffect(() => {
    facilityCoordinateRef.current = facilityCoordinate;
  }, [facilityCoordinate]);

  const tickRef = useRef(null);
  const canvasRef = useRef(null);
  const [cellSize, setCellSize] = useState({ width: 0, height: 0 });
  const [canvasHeight, setCanvasHeight] = useState(500);

  const policyActivationRef = useRef(policyActivation);

  useEffect(() => {
    if (specifications.policySpecification) {
      setPolicyActivation(
        specifications.policySpecification.reduce((acc, policy) => {
          // Initialize with active, timeToLive, and the new charged flag
          acc[policy.id] = { active: false, timeToLive: 0, charged: false };
          return acc;
        }, {})
      );
    }
  }, [specifications.policySpecification]);

  // In Game.js

  function formatNumber(num) {
    if (num >= 1_000_000_000)
      return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
    if (num >= 1_000_000)
      return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
  }

  const onClickPolicy = (e) => {
    const { name, checked } = e.target;
    const policy = specifications.policySpecification.find(
      (p) => p.id === name
    );
    if (!policy) return;

    const currentPolicyState = policyActivation[name];

    if (checked) {
      // Only deduct cost if it hasn't been charged for this cycle yet
      if (!currentPolicyState.charged) {
        if (budget < policy.cost) {
          alert("Not enough budget to activate this policy.");
          e.target.checked = false;
          return;
        }
        // Deduct cost from budget
        setBudget((prev) => prev - policy.cost);
      }

      // Activate the policy and mark it as charged
      setPolicyActivation((prev) => ({
        ...prev,
        [name]: {
          ...prev[name],
          active: true,
          timeToLive: policy.timeToLive,
          charged: true,
        },
      }));
    } else {
      // If unchecking a policy that was charged AND the game is paused, issue a refund
      if (currentPolicyState.charged && !gameState) {
        setBudget((prev) => prev + policy.cost);
      }

      // Deactivate the policy and reset its charged status so it can be re-purchased
      setPolicyActivation((prev) => ({
        ...prev,
        [name]: { ...prev[name], active: false, charged: false },
      }));
    }
  };

  const onClickFacility = (facilityId) => {
    console.log("Selected:", facilityId);
    setSelectedFacility(facilityId);
  };

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
      })
      .catch((error) => {
        console.error("Failed to fetch utils data:", error);
      });
  }, []);

  useEffect(() => {
    const updateCanvasHeight = () => {
      const navbarHeight = document.getElementById("navbar")?.offsetHeight || 0;
      const viewportHeight = window.innerHeight;
      const padding = 20;

      const height = viewportHeight - navbarHeight - padding;
      setCanvasHeight(height);
    };

    updateCanvasHeight();
    window.addEventListener("resize", updateCanvasHeight);
    // fix map wrapper height and width
    // const mapWrapper = document.getElementsByClassName('map-wrapper')[0];
    // if (mapWrapper && canvasRef.current) {
    //   // Get the width and height of the mapWrapper element
    //   console.log("my balls")
    //   const width = mapWrapper.clientWidth;
    //   const height = mapWrapper.clientHeight;

    //   // Set the canvas size accordingly
    //   canvasRef.current.width = width;
    //   canvasRef.current.height = height;
    // }
    return () => window.removeEventListener("resize", updateCanvasHeight);
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      const canvasWidth = canvasRef.current.width;
      const canvasHeight = canvasRef.current.height;

      const mapWrapper = document.getElementsByClassName("map-wrapper")[0];
      if (mapWrapper) {
        mapWrapper.style.width = `${canvasWidth}px`;
        mapWrapper.style.height = `${canvasHeight}px`;
      }
    }
  }, [canvasRef.current]);

  const handleFacilityHover = (facility, position) => {
    if (facility) {
      // Find the full facility details from specifications
      const facilityDetails = specifications.facilitySpecification.find(
        (spec) => spec.id === facility.id
      );
      setHoveredFacility({ facility: facilityDetails, position: position });
    } else {
      setHoveredFacility(null);
    }
  };
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
      if (yearRef.current > 2125 - 1.1) {
        setScore((prev) =>
          simulation.calculateScore(budget, profit, greennessMapRef.current)
        );
        simulation.endSimulation(score, budget, greennessMapRef.current);
        navigate("/leaderboard", { replace: true });
        return;
      }
      // 1. Calculate the next state for policies
      setPolicyActivation((prevPolicies) => {
        const nextPolicies = { ...prevPolicies };
        for (const key in nextPolicies) {
          if (nextPolicies[key].active && nextPolicies[key].timeToLive > 0) {
            nextPolicies[key].timeToLive -= 1;
            if (nextPolicies[key].timeToLive <= 0) {
              nextPolicies[key].active = false;
              nextPolicies[key].charged = false;
            }
          }
        }
        policyActivationRef.current = nextPolicies; // Store the result for step 3
        return nextPolicies;
      });

      // 2. Calculate the next state for facilities
      const updatedFacilities = facilityCoordinateRef.current
    .map((fc) => ({ ...fc, timeToLive: fc.timeToLive - 1 }))
    .filter((fc) => fc.timeToLive > 0);

      // 3. Run the simulation with the NEWLY calculated states
      simulation.progress(
        greennessMapRef.current,
        updatedFacilities,
        policyActivationRef.current, // Use the variable that holds the new state
        specifications,
        setGreennessMap
      );

      // 4. Set the new state for facilities
      setFacilityCoordinate(updatedFacilities);

      // 5. Update budget, year, etc.
      setBudget((prev) => prev + profit);
      setYear((prevYear) => prevYear + 1);
      setScore((prev) =>
        simulation.calculateScore(budget, profit, greennessMapRef.current)
      );
      tickCounter++;

      if (tickCounter >= tickPerRun) {
        setGameState(false);
      }
    };

    tickRef.current = setInterval(runSimulationTick, TICK_INTERVAL);
    return () => clearInterval(tickRef.current);
  }, [gameState]);

  return (
    <div>
      {hoveredFacility && (
        <div
          className="facility-popup"
          style={{
            position: "fixed", // Use 'fixed' to position relative to the viewport
            left: `${hoveredFacility.position.x + 15}px`, // Offset from cursor
            top: `${hoveredFacility.position.y + 15}px`,
          }}>
          <h4>{hoveredFacility.facility.id}</h4>
          <p>Cost: {hoveredFacility.facility.cost.toLocaleString()}</p>
          <p>Profit: {hoveredFacility.facility.profit.toLocaleString()}</p>
        </div>
      )}
      <div className="game-container">
        <div className="canvas-container">
          <div className="map-header">
            <h2 className="map-title">Japan Map</h2>
          </div>
          {greennessMap ? (
            <div className="map-wrapper">
              <MapRender
                canvasRef={canvasRef}
                map={greennessMap}
                facilityCoordinate={facilityCoordinate}
                onFacilityHover={handleFacilityHover}
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
            <p>Money: {formatNumber(budget)}</p>
            <p>Yearly Profit: {formatNumber(profit)}</p>
            <p>Score: {formatNumber(score)}</p>
          </div>
          {/*Facilities list*/}
          <div className="section-header">Facilities</div>
          <div className="facilities-container">
            {specifications.facilitySpecification &&
              specifications.facilitySpecification.map((facility, key) => {
                return (
                  <div key={key}>
                    <Facilities
                      img={facility.img}
                      cost={facility.cost}
                      name={facility.id}
                      timeToLive={facility.timeToLive}
                      profit={facility.profit}
                      size={facility.size}
                      active={selectedFacility === facility.id}
                      onClick={onClickFacility}
                      formatNumber={formatNumber}
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
                    // The 'checked' status is now based on the 'active' property
                    bool={
                      policyActivation
                        ? policyActivation[policy.id]?.active
                        : false
                    }
                    onChange={onClickPolicy}
                    // Add cost and timeToLive to the component if you want to display them
                    cost={policy.cost}
                    timeToLive={policy.timeToLive}
                    // Optional: disable the policy checkbox if it's already active
                    disabled={
                      policyActivation
                        ? policyActivation[policy.id]?.active
                        : false
                    }
                  />
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
