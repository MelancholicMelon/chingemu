export default class Simulation {
  get2DGreennessMap(mapDict) {
    console.log(mapDict)
    let greennessMap = [];
    for(let i = 0;i<mapDict.length;i++){
      greennessMap.push(mapDict[i]['kernel'])
    }
    console.log(greennessMap)
    return greennessMap
  }

  validateInput(facilityCordinate, facilityId, setFacilityCoordinate) {
    
  }

  calculateScore(budget, profit, setScore) {

  }

  progress(specifications, year) {
    let facilities = specifications.facilityCordinate
    for(let i = 0;i<facilities.length;i++){

    }
  }

  generatePDFKernel(facility) {

  }

  endSimulation() {

  }
}
