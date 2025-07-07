export default class Simulation {
  constructor() {
    this.n_k = 0;
    this.n_c = 0;
    this.n_f = 0;

    this.budget = 0;
    this.profit = 0;
    this.score = 0;
    this.year = 2025;

    this.gameState = false;

    this.facilities = [];
    this.policies = [];
    this.kernel = null; // The base greenness map matrix
  }

  initializeSimulation(kernel, facilities, policies, budget = 10000) {
    this.kernel = kernel;
    this.facilities = facilities;
    this.policies = policies;
    this.budget = budget;
    this.score = 0;
    this.year = 2025;
    this.gameState = true;
  }

  getGreennessMap() {
    return this.kernel;
  }

  validateInput(coordinate, objectId) {
    const { x, y } = coordinate;

    const occupied = this.facilities.some(f => f.x === x && f.y === y);
    if (occupied) {
      console.log("Cell is already occupied.");
      return false;
    }

    this.facilities.push({ x, y, id: objectId });
    return true;
  }

  calculateScore() {
    this.score = this.budget + this.profit - this.facilities.length * 100;
    return this.score;
  }

  progress() {
    if (!this.kernel) return;

    this.kernel = this.kernel.map(row =>
      row.map(val => Math.min(255, val + Math.floor(Math.random() * 3)))
    );

    this.year++;
    this.calculateScore();
  }

  endSimulation() {
    this.gameState = false;
    this.calculateScore();
    return {
      finalMap: this.kernel,
      finalScore: this.score,
    };
  }
}
