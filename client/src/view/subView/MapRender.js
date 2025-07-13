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
  const handleMouseMove = (e) => {
    // Guard clause for missing data
    if (!canvasRef.current || !onFacilityHover || !specifications.facilitySpecification) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    let facilityFound = null;

    for (let i = facilityCoordinate.length - 1; i >= 0; i--) {
      const facility = facilityCoordinate[i];
      const facilitySpec = specifications.facilitySpecification.find(item => item.id === facility.id);
      
      // Guard clause in case a spec is not found
      if (!facilitySpec) continue;

      const size = facilitySpec.size;
      const [col, row] = facility.coordinate;
      const facilityX = (col - Math.floor((size - 1) / 2)) * cellSize.width;
      const facilityY = (row - Math.floor((size - 1) / 2)) * cellSize.height;
      const facilityWidth = size * cellSize.width;
      const facilityHeight = size * cellSize.height;

      if (
        x >= facilityX && x <= facilityX + facilityWidth &&
        y >= facilityY && y <= facilityY + facilityHeight
      ) {
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
    if (!canvasRef.current || !map || !specifications.facilitySpecification || !specifications.colorSpecification) return;
    
    const ctx = canvasRef.current.getContext("2d");
    const rows = map[0].kernel.length;
    const cols = map[0].kernel[0].length;
    const cellHeight = Math.floor(canvasHeight / rows);
    const cellWidth = cellHeight;
    canvasRef.current.height = cellHeight * rows;
    canvasRef.current.width = cellWidth * cols;
    setCellSize({ width: cellWidth, height: cellHeight });

    // Continents
    for (let i = 0; i < map.length; i++) {
      const kernel = map[i].kernel;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const value = kernel[y][x];
          if (value !== -1) {
            const lerp = (a, b, t) => a + (b - a) * t;
            const t = value / 255; // normalize to 0–1
            const r = Math.round(lerp(82, 50, t));
            const g = Math.round(lerp(54, 255, t));
            const b = Math.round(lerp(16, 0, t));

            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
          }
        }
      }
    }

    // Facility
    for (const obj of facilityCoordinate) {
      const color = specifications.colorSpecification.find(item => item.id === obj.id).color;
      const size = specifications.facilitySpecification.find(item => item.id === obj.id).size;
      ctx.fillStyle = `rgb(${color.r} ${color.g} ${color.b})`
      for(let i = 0;i<(size+1)/2;i++){
        ctx.fillRect(
          cellWidth  * (obj.coordinate[0] + i - (size-1)/2),
          cellHeight * (obj.coordinate[1] - i),
          cellWidth  * (size-i*2),
          cellHeight * (i*2+1)
        );
      }
      ctx.fillRect(
        obj.coordinate[0] * cellWidth,
        obj.coordinate[1] * cellHeight,
        cellWidth,
        cellHeight
      );
    }

    // Ocean 
    const oceanColor = specifications.colorSpecification.find(item => item.id === "ocean").color;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const salt = Math.random() * 10 - 5;
        ctx.fillStyle = `rgb(${oceanColor.r + salt} ${oceanColor.g + salt} ${oceanColor.b + salt})`;

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
      if(!cellSize.width) return; // Prevent click if cell size not set
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
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    />
  );
}