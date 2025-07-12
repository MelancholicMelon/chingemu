export default class Simulation {
  get2DGreennessMap(mapDict) {
    let greennessMap = [];
    for (let i = 0; i < mapDict.length; i++) {
      greennessMap.push(mapDict[i]["kernel"]);
    }
    return greennessMap;
  }

  validateInput(coordinate, selectedFacility, facilityCordinate, facilitySpecification, mapDict, setFacilityCoordinate) {
    const greennessMap = this.get2DGreennessMap(mapDict)
    let availible = false
    for(let i = 0;i<greennessMap.length;i++){
      let continent = greennessMap[i]
      if(continent[coordinate.y][coordinate.x] > -1){
        availible = true;
      }
    }
    for(const facility of facilityCordinate){
      const x_diff = coordinate.x - facility.coordinate[0]
      const y_diff = coordinate.y - facility.coordinate[1]
      const distance = Math.sqrt(x_diff*x_diff + y_diff*y_diff);
      const limit = (facilitySpecification.find(item => item.id === selectedFacility).size + facilitySpecification.find(item => item.id === facility.id).size) / 2
      if(distance < limit-1){
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
    let map = mapDict
    const mapSize = [mapDict[0]['kernel'].length, mapDict[0]['kernel'][0].length]
    //const PDFKernel = generatePDFKernel(facilityCoordinate, policyActivation, specifications.facilitySpecification, specifications.policySpecification);
    let greennessMap = this.get2DGreennessMap(mapDict);
    for(let i = 0;i<mapDict.length;i++){
      for(let x =0;x<mapSize[0];x++){
        for(let y=0;y< mapSize[1];y++){
          if(mapDict[i]['kernel'][x][y] !== -1){
            map[i]['kernel'][x][y] = greennessMap[i][x][y]// + PDFKernel[x][y]
          }
        }
      }
    }
    setGreennessMap(map)
  }

  generatePDFKernel(facility) {}

  endSimulation() {}
}
