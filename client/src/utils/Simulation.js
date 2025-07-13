// In Simulation.js
export default class Simulation {
  get2DGreennessMap(mapDict) {
    if (!mapDict) return [];
    return mapDict.map(continent => continent.kernel);
  }

  validateInput(coordinate, selectedFacility, facilityCoordinate, facilitySpecification, mapDict, setFacilityCoordinate, setProfit, setBudget) {
    const greennessMap = this.get2DGreennessMap(mapDict);
    if (!greennessMap.length || !greennessMap[0][coordinate.y]) return false;

    let isLand = greennessMap.some(continent => continent[coordinate.y][coordinate.x] > -1);
    if (!isLand) return false;

    for (const facility of facilityCoordinate) {
      const x_diff = coordinate.x - facility.coordinate[0];
      const y_diff = coordinate.y - facility.coordinate[1];
      const distance = Math.sqrt(x_diff * x_diff + y_diff * y_diff);
      const newFacilitySpec = facilitySpecification.find(item => item.id === selectedFacility);
      const existingFacilitySpec = facilitySpecification.find(item => item.id === facility.id);
      const limit = (newFacilitySpec.size + existingFacilitySpec.size) / 2;

      if (distance < limit) return false;
    }

    const newFacilityDetails = facilitySpecification.find(item => item.id === selectedFacility);
    if (newFacilityDetails.cost > setBudget(prev => prev)) return false; // Check budget before setting state

    const updated = [...facilityCoordinate, {
      id: selectedFacility,
      coordinate: [coordinate.x, coordinate.y],
      timeToLive: newFacilityDetails.timeToLive,
    }];
    setFacilityCoordinate(updated);

    const totalProfit = updated.reduce((sum, fc) => {
      const spec = facilitySpecification.find(item => item.id === fc.id);
      return sum + (spec?.profit || 0);
    }, 0);
    setProfit(totalProfit);

    setBudget(prev => prev - newFacilityDetails.cost);
    return true;
  }

  calculateScore(budget, profit, mapDict) {
    if (!mapDict) return 0;
    let lowestAvgGreenness = 1.0;

    for (const continent of mapDict) {
      const greennessKernel = continent.kernel;
      let landCellCount = 0;
      let greennessSum = 0;
      for (const row of greennessKernel) {
        for (const value of row) {
          if (value !== -1) {
            greennessSum += value;
            landCellCount++;
          }
        }
      }
      const avg = landCellCount > 0 ? (greennessSum / landCellCount) / 255 : 0;
      if (avg < lowestAvgGreenness) lowestAvgGreenness = avg;
    }
    return Math.ceil((budget + profit) * lowestAvgGreenness);
  }

  progress(mapDict, facilityCoordinate, policyActivation, specifications, setGreennessMap) {
    if (!mapDict || !specifications.facilitySpecification || !specifications.policySpecification) return;

    const map = mapDict.map((continent) => ({
      ...continent,
      kernel: continent.kernel.map((row) => [...row]),
    }));

    const PDFKernel = this.generatePDFKernel(
      facilityCoordinate,
      policyActivation,
      specifications.facilitySpecification,
      specifications.policySpecification,
    );

    let greennessMap = this.get2DGreennessMap(mapDict);
    for (let i = 0; i < mapDict.length; i++) {
        for (let r = 0; r < mapDict[i].kernel.length; r++) {
            for (let c = 0; c < mapDict[i].kernel[r].length; c++) {
                if (mapDict[i].kernel[r][c] !== -1) {
                    let newValue = greennessMap[i][r][c] * (0.995 + PDFKernel[r][c]);
                    if (newValue > 255) newValue = 255;
                    if (newValue < 1) newValue = 1;
                    map[i].kernel[r][c] = newValue;
                }
            }
        }
    }
    setGreennessMap(map);
  }

  generatePDFKernel(facilityCoordinate, policyActivation, facilitySpecification, policySpecification) {
    const mapSize = { rows: facilitySpecification[0] ? 256 : 0, cols: facilitySpecification[0] ? 256 : 0 }; // Assuming a fixed size or derive it
    let pdfKernel = Array.from({ length: mapSize.rows }, () => Array(mapSize.cols).fill(0));
    if (!policyActivation) return pdfKernel;

    const activePolicyIds = Object.keys(policyActivation).filter(key => policyActivation[key]?.active);
    const prms = [...new Set(policySpecification.map(p => p.parameter))];
    const policyMultiplier = Object.fromEntries(prms.map(key => [key, 1]));

    for (const policyId of activePolicyIds) {
      const policy = policySpecification.find(p => p.id === policyId);
      if (policy && policy.parameter && policyMultiplier.hasOwnProperty(policy.parameter)) {
        policyMultiplier[policy.parameter] *= policy.multiplier;
      }
    }

    for (const fc of facilityCoordinate) {
      const fs = facilitySpecification.find(item => item.id === fc.id);
      if (!fs || !fs.stddev) continue; // Use stddev, not stddtv

      const sd = fs.stddev;
      const [muY, muX] = fc.coordinate; // [col, row]

      for (let r = 0; r < mapSize.rows; r++) {
        for (let c = 0; c < mapSize.cols; c++) {
          if (fs.pdf === "normal") {
            const exponent = -(((c - muY) ** 2) / (2 * (policyMultiplier.sd * sd) ** 2) + ((r - muX) ** 2) / (2 * (policyMultiplier.sd * sd) ** 2));
            pdfKernel[r][c] += policyMultiplier.maxImpact * fs.maxImpact * Math.exp(exponent);
          }
        }
      }
    }
    return pdfKernel;
  }
  
  endSimulation(score, budget, mapDict) {
    const token = localStorage.getItem("token");
    let totalLandCells = 0;
    let totalGreennessSum = 0;
    if (mapDict) {
      for (const continent of mapDict) {
        for (const row of continent.kernel) {
          for (const value of row) {
            if (value !== -1) {
              totalGreennessSum += value;
              totalLandCells++;
            }
          }
        }
      }
    }
    const finalAvgGreenness = totalLandCells > 0 ? (totalGreennessSum / totalLandCells) / 255 : 0;
    
    fetch("http://localhost:3001/scores/add", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        score: score,
        finalBudget: budget,
        finalAvgGreenness: finalAvgGreenness.toFixed(4),
      })
    }).catch(error => console.error("Failed to submit score:", error));
  }
}