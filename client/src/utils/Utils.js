import { useEffect, useState } from "react";

export default async function Utils() {
  let objectTypes;
  let continents;
  let colorSpecification;
  let facilityTypes;
  let pdfTypes;
  let policyTypes;
  let params;
  let facilitySpecification;
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

  const continentMapPath = s["greennessAndLocationMap"][1]["loc"];

  const greennessAndLocationMapRes = await fetch(
    `${baseUrl}/continentJson?filePath=${continentMapPath}`,
    { headers }
  );
  if (!greennessAndLocationMapRes.ok) {
    throw new Error("Resource loading failed.");
  }

  const greennessAndLocationMapJson = await greennessAndLocationMapRes.json();

  greennessMap = greennessAndLocationMapJson;
  facilitySpecification = s["facilitySpecification"];
  policySpecification = s["policySpecification"];
  colorSpecification = s["colorSpecification"];

  objectTypes = s["obejctTypes"];
  facilityTypes = facilitySpecification.map((facility) => facility.id);
  pdfTypes = [
    ...new Set(facilitySpecification.map((facility) => facility.pdfTypes)),
  ];
  policyTypes = policySpecification.map((policy) => policy.id);
  params = policySpecification.map((policy) => policy.parameter);

  return {
    colorSpecification: colorSpecification,
    facilitySpecification: facilitySpecification,
    greennessMap: greennessMap,
    policySpecification: policySpecification,
    objectTypes: objectTypes,
    facilityTypes: facilityTypes,
    pdfTypes: pdfTypes,
    policyTypes: policyTypes,
    modifiableParams: params,
  };
}
