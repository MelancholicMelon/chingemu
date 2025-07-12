import { useEffect, useState } from "react";

export default async function Utils() {
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
  let greennessMap;
  let policySpecification;

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

  const greennessAndLocationMapRes = await fetch(`${baseUrl}/continentJson?filePath=${continentMapPath}`, { headers });
  if (!greennessAndLocationMapRes.ok) {
    throw new Error("Resource loading failed.");
  }

  console.log(greennessAndLocationMapRes);

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

  return {
    kernelSize: n_k,
    numContinents: n_c,
    numFacilityTypes: n_f,
    colorSpecification: colorSpecification,
    facilitySpecification: facilitySpecification,
    continentLocation: continentLocation,
    greennessMap: greennessMap,
    policySpecification: policySpecification,
    objectTypes: objectTypes,
    continents: continents,
    facilityTypes: facilityTypes,
    pdfTypes: pdfTypes,
    policyTypes: policyTypes,
    modifiableParams: params,
  };
}
