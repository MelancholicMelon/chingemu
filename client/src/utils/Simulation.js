export default class Simulation {
  getGreennessMap(mapDict) {
    let greennessMap = [];
    for (let i = 0; i < mapDict.length; i++) {
      greennessMap.push(mapDict[i]["kernel"]);
    }
  }

  validateInput(facilityCordinate, facilityId) {}

  calculateScore(budget, profit) {}

  progress(specifications, year) {
    let facilities = specifications.facilityCordinate;
    for (let i = 0; i < facilities.length; i++) {}
  }

  generatePDFKernel(facility) {}

  endSimulation() {}
}
