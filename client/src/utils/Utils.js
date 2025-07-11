import { useEffect, useState } from "react";

let n_k;
let n_c;
let n_f;
let objectTypes;
let continents;
let colorSpecification;
let facilityTypes;
let pdfTypes;
let policyTypes;
let params;
let facilitySpecification;
let continentLocation;
let objectLocation;
let greennessMap;
let policySpecification;

const Utils = async () => {
  const token = localStorage.getItem("token");
  const baseUrl = process.env.REACT_APP_API_URL;

  const headers = {
    Authorization: "Bearer " + token,
  };

  const allSpecification = await fetch(`${baseUrl}/specification`, { headers });

  if (!allSpecification.ok) {
    throw new Error("Resource loading failed.");
  }

  const s = await allSpecification.json();
  const continentMapPath = s["greennessAndLocationMap"][0]["loc"];

  const greennessAndLocationMapRes = await fetch(
    `${baseUrl}/continentJson?filePath=${continentMapPath}`,
    { headers }
  );
  if (!greennessAndLocationMapRes.ok) {
    throw new Error("Resource loading failed.");
  }

  const greennessAndLocationMapJson = await greennessAndLocationMapRes.json();

  greennessMap = greennessAndLocationMapJson[0]["kernel"];
  facilitySpecification = s["facilitySpecification"];
  policySpecification = s["policySpecification"];

  n_k = greennessAndLocationMapJson[0]["size"];
  n_c = greennessMap.length;
  n_f = facilitySpecification.length;

  objectTypes = ["continent", "facility", "ocean"];
  continents = ["c1", "c2", "c3"];
  facilityTypes = ["f1", "f2", "f3"];
  pdfTypes = ["normal"];
  policyTypes = ["p1", "p2", "p3"];
  params = ["sd", "maxImpact"];
};

// Getters for variables
export function getKernelSize() {
  return n_k;
}
export function getNumContinents() {
  return n_c;
}
export function getNumFacilityTypes() {
  return n_f;
}

export function getColorSpecification() {
  return colorSpecification;
}
export function getFacilitySpecification() {
  return facilitySpecification;
}
export function getContinentLocation() {
  return continentLocation;
}
export function getObjectLocation() {
  return objectLocation;
}
export function getGreennessMap() {
  return greennessMap;
}
export function getPolicySpecification() {
  return policySpecification;
}

export function getObjectTypes() {
  return objectTypes;
}
export function getContinents() {
  return continents;
}
export function getFacilityTypes() {
  return facilityTypes;
}
export function getPdfTypes() {
  return pdfTypes;
}
export function getPolicyTypes() {
  return policyTypes;
}
export function getModifiableParams() {
  return params;
}

export default Utils;
