export default class Simulation {
  get2DGreennessMap(mapDict) {
    let greennessMap = [];
    for (let i = 0; i < mapDict.length; i++) {
      greennessMap.push(mapDict[i]["kernel"]);
    }
    return greennessMap;
  }

  validateInput(
    coordinate,
    selectedFacility,
    facilityCordinate,
    facilitySpecification,
    mapDict,
    setFacilityCoordinate
  ) {
    const greennessMap = this.get2DGreennessMap(mapDict);
    let availible = false;
    for (let i = 0; i < greennessMap.length; i++) {
      let continent = greennessMap[i];
      if (continent[coordinate.y][coordinate.x] > -1) {
        availible = true;
      }
    }
    for (const facility of facilityCordinate) {
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
        },
      ];
      setFacilityCoordinate(updated);
    }
  }

  calculateScore(budget, profit, setScore) {}

  progress(mapDict, facilityCoordinate, policyActivation, specifications, setGreennessMap) {
    const map = mapDict.map(continent => ({
      ...continent,
      kernel: continent.kernel.map(row => [...row]),
    }));
    const mapSize = [mapDict[0]['kernel'].length, mapDict[0]['kernel'][0].length]
    const PDFKernel = this.generatePDFKernel(facilityCoordinate, policyActivation, specifications.facilitySpecification, specifications.policySpecification);
    let greennessMap = this.get2DGreennessMap(mapDict);
    for(let i = 0;i<mapDict.length;i++){
      for(let x =0;x<mapSize[0];x++){
        for(let y=0;y< mapSize[1];y++){
          if(mapDict[i]['kernel'][x][y] !== -1){
            map[i]['kernel'][x][y] = greennessMap[i][x][y] * (Math.random() * (1.5 - 0.9) + 0.9) * PDFKernel[x][y]
          }
        }
      }
    }
    setGreennessMap(map);
  }

  gaussian3D(x, y, pX, pY, sd) {
    const exponent = -(
      (x - pX) ** 2 / (2 * sd ** 2) +
      (y - pY) ** 2 / (2 * sd ** 2)
    );
    return Math.exp(exponent);
  }

  generatePDFKernel(
    facilityCoordinate,
    policyActivation,
    facilitySpecification,
    policySpecification,
    mapSize
  ) {
    let pdfKernel = [];

    const activatePolicy = policyActivation
      .filter((p) => p.activate === true)
      .map((p) => p.id);

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
          const fs = facilitySpecification[fc.id];
          const sd = fs.stddtv;

          if (fs.pdf === "normal") {
            const muX = fc.coordinate[0];
            const muY = fc.coordinate[1];
            let exponent = -(
              (x - muX) ** 2 / (2 * (policyMultiplier.sd * sd) ** 2) +
              (y - muY) ** 2 / (2 * (policyMultiplier.sd * sd) ** 2)
            );
            val =
              policyMultiplier.maxImpact * fs.maxImpact * Math.exp(exponent);
          } else {
            throw new Error("wrong PDF specified");
          }

          overlay.append(val);
        }
        const overlayTotal = overlay.reduce((sum, element) => sum + element, 0);
        row.append(overlayTotal);
      }

      pdfKernel.append(row);
    }
  }

  endSimulation() {}
}
