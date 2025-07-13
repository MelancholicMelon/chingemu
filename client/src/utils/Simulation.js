// In Simulation.js
export default class Simulation {
  get2DGreennessMap(mapDict) {
    if (!mapDict) return [];
    return mapDict.map((continent) => continent.kernel);
  }

  validateInput(
    coordinate,
    selectedFacility,
    facilityCordinate,
    facilitySpecification,
    mapDict,
    setFacilityCoordinate,
    setProfit,
    setBudget
  ) {
    const greennessMap = this.get2DGreennessMap(mapDict);
    let availible = false;
    // console.log("FACILITYSPEC START")
    // //console.log(facilitySpecification)
    // console.log(facilityCordinate)
    // console.log("FACILITYSPEC END")
    for (let i = 0; i < greennessMap.length; i++) {
      let continent = greennessMap[i];
      if (continent[coordinate.y][coordinate.x] > -1) {
        availible = true;
      }
    }
    for (const facility of facilityCordinate) {
      // console.log("HELLO?!")
      // console.log("Looking for spec with id (selectedFacility):", selectedFacility);
      // console.log("Looking for spec with id (nearby facility):", facility.id);
      const x_diff = coordinate.x - facility.coordinate[0];
      const y_diff = coordinate.y - facility.coordinate[1];
      const distance = Math.sqrt(x_diff * x_diff + y_diff * y_diff);
      const limit =
        (facilitySpecification.find((item) => item.id === selectedFacility)
          .size +
          facilitySpecification.find((item) => item.id === facility.id).size) /
        2;
      if (distance < limit - 1) {
        availible = false;
      }
    }
    if (availible) {
      const updated = [
        ...facilityCordinate,
        {
          id: selectedFacility,
          coordinate: [coordinate.x, coordinate.y],
          timeToLive: facilitySpecification.find(
            (item) => item.id === selectedFacility
          ).timeToLive,
        },
      ];
      setFacilityCoordinate(updated);

      let totalProfit = 0;
      for (const fc of updated) {
        const profit =
          facilitySpecification.find((item) => item.id === fc.id)?.profit || 0;
        totalProfit += profit;
      }
      setProfit(totalProfit);
      setBudget(
        (prev) =>
          prev -
          facilitySpecification.find((item) => item.id == selectedFacility).cost
      );
      return true;
    } else {
      return false;
    }
  }

  calculateScore(budget, profit, mapDict) {
    let score = 0;
    const a_b = 1;
    const a_p = 1;
    let a_g = 1;
    for (let i = 0; i < mapDict.length; i++) {
      const greennessContinent = mapDict[i].kernel;
      let avg = 0;
      for (let i = 0; i < greennessContinent.length; i++) {
        for (let j = 0; j < greennessContinent[i].length; j++) {
          avg += greennessContinent[i][j];
        }
      }
      avg =
        (avg + greennessContinent.length * greennessContinent[0].length) /
        mapDict[i].size /
        255;
      if (avg < a_g) {
        a_g = avg;
      }
    }
    score = Math.ceil((budget * a_b + profit * a_p) * a_g);
    return score;
  }

  progress(
    mapDict,
    facilityCoordinate,
    policyActivation,
    specifications,
    setGreennessMap
  ) {
    const map = mapDict.map((continent) => ({
      ...continent,
      kernel: continent.kernel.map((row) => [...row]),
    }));

    const mapSize = [
      mapDict[0]["kernel"].length,
      mapDict[0]["kernel"][0].length,
    ];

    const PDFKernel = this.generatePDFKernel(
      facilityCoordinate,
      policyActivation,
      specifications.facilitySpecification,
      specifications.policySpecification,
      mapSize
    );

    let greennessMap = this.get2DGreennessMap(mapDict);
    for (let i = 0; i < mapDict.length; i++) {
      for (let x = 0; x < mapSize[0]; x++) {
        for (let y = 0; y < mapSize[1]; y++) {
          if (mapDict[i]["kernel"][x][y] !== -1) {
            map[i]["kernel"][x][y] =
              greennessMap[i][x][y] *
              (Math.random() * (1.01 - 0.98) + 0.98 + PDFKernel[x][y]);
            if (map[i]["kernel"][x][y] > 255) {
              map[i]["kernel"][x][y] = 255;
            } else if (map[i]["kernel"][x][y] < 1) {
              map[i]["kernel"][x][y] = 1;
            }
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
          const sd = fs.stddev;

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
