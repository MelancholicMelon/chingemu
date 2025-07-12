import React, { useEffect } from "react";

export default function MapRender({
  canvasRef,
  map,
  facilityCoordinate,
  specifications,
  cellSize,
  setCellSize,
  onCellClick,
  canvasHeight,
}) {
  useEffect(() => {
    if (!canvasRef.current || !map) return;

    const ctx = canvasRef.current.getContext("2d");
    const rows = map[0].kernel.length;
    const cols = map[0].kernel[0].length;

    const cellHeight = Math.floor(canvasHeight / rows);
    const cellWidth = cellHeight;
    canvasHeight = cellHeight * rows;
    const canvasWidth = cellWidth * cols;

    canvasRef.current.width = canvasWidth;
    canvasRef.current.height = canvasHeight;

    setCellSize({ width: cellWidth, height: cellHeight });

    ctx.fillStyle = `rgb(31, 189, 237)`;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    let kernel;
    for (let i = 0; i < map.length; i++) {
      kernel = map[i].kernel;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const value = kernel[y][x];
          if (value !== -1) {
            ctx.fillStyle = `rgb(${(value - 205) * -1}, 255, ${
              (value - 255) * -1
            })`;
            ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
          }
        }
      }
    }

    for (const obj of facilityCoordinate) {
      const color = specifications.colorSpecification.find(item => item.id === obj.id).color;
      ctx.fillStyle = `rgb(${color.r} ${color.g} ${color.b})`
      ctx.fillRect(
        obj.coordinate[0] * cellWidth,
        obj.coordinate[1] * cellHeight,
        Math.ceil(cellWidth),
        Math.ceil(cellHeight)
      );
    }
  }, [map, facilityCoordinate, canvasRef]);

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
    />
  );
}
