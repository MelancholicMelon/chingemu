// In Simulation.js
export default class Simulation {
  get2DGreennessMap(mapDict) {
    if (!mapDict) return [];
    return mapDict.map((continent) => continent.kernel);
  }

  validateInput(
    coordinate,
    selectedFacility,
    facilityCoordinate,
    facilitySpecification,
    mapDict,
    setFacilityCoordinate,
    setProfit,
    setBudget
  ) {
    const greennessMap = this.get2DGreennessMap(mapDict);
    if (!greennessMap.length || !greennessMap[0][coordinate.y]) return false;

    let isLand = greennessMap.some(
      (continent) => continent[coordinate.y][coordinate.x] > -1
    );
    if (!isLand) return false;

    for (const facility of facilityCoordinate) {
      const x_diff = coordinate.x - facility.coordinate[0];
      const y_diff = coordinate.y - facility.coordinate[1];
      const distance = Math.sqrt(x_diff * x_diff + y_diff * y_diff);
      const newFacilitySpec = facilitySpecification.find(
        (item) => item.id === selectedFacility
      );
      const existingFacilitySpec = facilitySpecification.find(
        (item) => item.id === facility.id
      );
      const limit = (newFacilitySpec.size + existingFacilitySpec.size) / 2;

      if (distance < limit) return false;
    }

    const newFacilityDetails = facilitySpecification.find(
      (item) => item.id === selectedFacility
    );
    if (newFacilityDetails.cost > setBudget((prev) => prev)) return false; // Check budget before setting state

    const updated = [
      ...facilityCoordinate,
      {
        id: selectedFacility,
        coordinate: [coordinate.x, coordinate.y],
        timeToLive: newFacilityDetails.timeToLive,
      },
    ];
    setFacilityCoordinate(updated);

    const totalProfit = updated.reduce((sum, fc) => {
      const spec = facilitySpecification.find((item) => item.id === fc.id);
      return sum + (spec?.profit || 0);
    }, 0);
    setProfit(totalProfit);

    setBudget((prev) => prev - newFacilityDetails.cost);
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
      const avg = landCellCount > 0 ? greennessSum / landCellCount / 255 : 0;
      if (avg < lowestAvgGreenness) lowestAvgGreenness = avg;
    }
    return Math.ceil((budget + profit) * lowestAvgGreenness);
  }

  progress(
    mapDict,
    facilityCoordinate,
    policyActivation,
    specifications,
    setGreennessMap
  ) {
    if (
      !mapDict ||
      !specifications.facilitySpecification ||
      !specifications.policySpecification
    )
      return;

    const map = mapDict.map((continent) => ({
      ...continent,
      kernel: continent.kernel.map((row) => [...row]),
    }));

    const PDFKernel = this.generatePDFKernel(
      facilityCoordinate,
      policyActivation,
      specifications.facilitySpecification,
      specifications.policySpecification
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

  generatePDFKernel(
    facilityCoordinate,
    policyActivation,
    facilitySpecification,
    policySpecification,
    mapSize
  ) {
    let pdfKernel = [];

    const activatePolicy = Object.keys(policyActivation).filter(
      (key) => policyActivation[key].active === true
    );

    const prms = policySpecification.map((f) => f.parameter);

    const policyMultiplier = Object.fromEntries(prms.map((key) => [key, 1]));
    for (var i = 0; i < activatePolicy.length; i++) {
      let prm = activatePolicy[i].params;
      policyMultiplier[prm] += activatePolicy[i].multiplier;
    }

    for (var x = 0; x < mapSize[0]; x++) {
      const row = [];

      for (var y = 0; y < mapSize[1]; y++) {
        const overlay = [];

        for (var i = 0; i < facilityCoordinate.length; i++) {
          let val = null;

          const fc = facilityCoordinate[i];
          const fs = facilitySpecification.find((item) => item.id === fc.id);
          const sd = fs.stddtv;

          if (fs.pdf === "normal") {
            const muX = fc.coordinate[1];
            const muY = fc.coordinate[0];
            let exponent = -(
              (x - muX) ** 2 / (2 * (policyMultiplier.sd * sd) ** 2) +
              (y - muY) ** 2 / (2 * (policyMultiplier.sd * sd) ** 2)
            );
            val =
              policyMultiplier.maxImpact * fs.maxImpact * Math.exp(exponent);
          } else {
            throw new Error("wrong PDF specified");
          }

          overlay.push(val);
        }
        const overlayTotal = overlay.reduce((sum, element) => sum + element, 0);
        row.push(overlayTotal);
      }

      pdfKernel.push(row);
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
    const finalAvgGreenness =
      totalLandCells > 0 ? totalGreennessSum / totalLandCells / 255 : 0;

    fetch("http://localhost:3001/scores/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        score: score,
        finalBudget: budget,
        finalAvgGreenness: finalAvgGreenness.toFixed(4),
      }),
    }).catch((error) => console.error("Failed to submit score:", error));
  }
}
