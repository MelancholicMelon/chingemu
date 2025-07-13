export default class SimulationEngine {
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
    this.kernel = null;
  }

  async initialize(baseUrl, token, mapId = 1, budget = 10000) {
    const headers = {
      Authorization: "Bearer " + token,
      id: mapId,
    };

    const mapRes = await fetch(`${baseUrl}/kernel/maps`, { headers });
    const facilitiesRes = await fetch(`${baseUrl}/kernel/facilities`, { headers });
    const policiesRes = await fetch(`${baseUrl}/kernel/policies`, { headers });

    if (!mapRes.ok || !facilitiesRes.ok || !policiesRes.ok) {
      throw new Error("Resource loading failed.");
    }

    const mapData = await mapRes.json();
    const facilitiesData = await facilitiesRes.json();
    const policiesData = await policiesRes.json();

    this.kernel = mapData
    this.facilities = facilitiesData;
    this.policies = policiesData;
    this.budget = budget;
    this.score = 0;
    this.year = 2025;
    this.gameState = true;

    return {
      map: mapData,
      facilities: facilitiesData,
      policies: policiesData,
    };
  }

  getGreennessMap() {
    return this.kernel;
  }

  validateInput(coordinate, objectId) {
    console.log(coordinate, objectId)
    return true;
  }

  calculateScore() {
    this.score = this.budget + this.profit - this.facilities.length * 100;
    return this.score;
  }

  progress() {
    if (!this.kernel) return;
    // this.kernel -> matrix arithmetics
    console.log("progress")
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
