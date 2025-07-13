import React, { useEffect } from "react";

export default function MapRender({
  canvasRef,
  map,
  facilityCoordinate,
  specifications,
  cellSize,
  setCellSize,
  onCellClick,
  onFacilityHover,
  canvasHeight,
}) {

  // Moved event handlers outside of useEffect
  const handleMouseMove = (e) => {
    if (!canvasRef.current || !onFacilityHover) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let facilityFound = null;

    // Loop backwards so we hit the top-most facility first
    for (let i = facilityCoordinate.length - 1; i >= 0; i--) {
      const facility = facilityCoordinate[i];
      const facilitySpec = specifications.facilitySpecification.find(item => item.id === facility.id);
      const size = facilitySpec.size;
      const [col, row] = facility.coordinate;
      
      // ✅ Correct Hitbox Calculation based on size
      const facilityX = (col - Math.floor((size-1)/2)) * cellSize.width;
      const facilityY = (row - Math.floor((size-1)/2)) * cellSize.height;
      const facilityWidth = size * cellSize.width;
      const facilityHeight = size * cellSize.height;

      if (x >= facilityX && x <= facilityX + facilityWidth &&
          y >= facilityY && y <= facilityY + facilityHeight) {
        facilityFound = facility;
        break;
      }
    }

    if (facilityFound) {
      onFacilityHover(facilityFound, { x: e.clientX, y: e.clientY });
    } else {
      onFacilityHover(null);
    }
  };

  const handleMouseLeave = () => {
    if (onFacilityHover) {
      onFacilityHover(null);
    }
  };

  useEffect(() => {
    if (!canvasRef.current || !map) return;
    // ... drawing logic is mostly the same
    const ctx = canvasRef.current.getContext("2d");
    const rows = map[0].kernel.length;
    const cols = map[0].kernel[0].length;

    const cellHeight = Math.floor(canvasHeight / rows);
    const cellWidth = cellHeight;
    canvasRef.current.height = cellHeight * rows;
    const canvasWidth = cellWidth * cols;

    canvasRef.current.width = canvasWidth;

    setCellSize({ width: cellWidth, height: cellHeight });

    // Continents drawing...
    for (let i = 0; i < map.length; i++) {
      const kernel = map[i].kernel;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const value = kernel[y][x];
          if (value !== -1) {
            ctx.fillStyle = `rgb(${(value - 205) * -1}, 255, ${(value - 255) * -1})`;
            ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
          }
        }
      }
    }

    // Facilities drawing...
    for (const obj of facilityCoordinate) {
        const facilitySpec = specifications.facilitySpecification.find(item => item.id === obj.id);
        const color = specifications.colorSpecification.find(item => item.id === obj.id).color;
        const size = facilitySpec.size;
        const [col, row] = obj.coordinate;

        ctx.fillStyle = `rgb(${color.r} ${color.g} ${color.b})`;
        ctx.fillRect(
          (col - Math.floor((size-1)/2)) * cellWidth,
          (row - Math.floor((size-1)/2)) * cellHeight,
          size * cellWidth,
          size * cellHeight
        );
    }

    // Ocean drawing...
    const oceanColor = specifications.colorSpecification.find(item => item.id === "ocean").color;
    ctx.fillStyle = `rgb(${oceanColor.r} ${oceanColor.g} ${oceanColor.b})`;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let isLand = map.some(continent => continent.kernel[y][x] !== -1);
        if (!isLand) {
          ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
        }
      }
    }
  }, [map, facilityCoordinate, canvasHeight, specifications, setCellSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !map) return;
    const handleClick = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const col = Math.floor(x / cellSize.width);
      const row = Math.floor(y / cellSize.height);
      onCellClick(col, row);
    };
    canvas.addEventListener("click", handleClick);
    return () => canvas.removeEventListener("click", handleClick);
  }, [canvasRef, cellSize, map, onCellClick]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", marginTop: "1rem", cursor: "pointer" }}
      // ✅ Attach event handlers here
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    />
  );
}