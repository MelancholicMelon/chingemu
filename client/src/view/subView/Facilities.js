import React from "react";

export default function Facilities(props) {
  return (
    <>
      <style>{`
        .facility-container {
          border: 2px solid transparent;
          border-radius: 8px;
          padding: 5px;
          margin: 5px;
          transition: border 0.2s ease, background-color 0.2s ease;
        }

        .facility-container.active {
          border: 2px solid #4CAF50;
          background-color: rgba(76, 175, 80, 0.1);
        }

        .image-button {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
        }

        .facility-image {
          width: 60px;
          height: 60px;
        }

        .facility-text {
          text-align: center;
          font-size: 12px;
        }
      `}</style>

      <div
        className={`facility-container ${props.active ? "active" : ""}`}
        onClick={() => props.onClick(props.name)}>
        <div className="facility-text">
          <p>{props.name}</p>
          <p>Cost : {props.formatNumber(props.cost)}</p>
          <p>Profit: {props.formatNumber(props.profit)} Per Year</p>
          <p>Active for: {props.timeToLive > 100 ? "Forever" : `${props.timeToLive} Years`}</p>
          <p>Placement size: {props.size} Block</p>
        </div>
      </div>
    </>
  );
}
