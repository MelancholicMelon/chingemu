import React from "react"
export default function Facilities(props) {
    return (
      <div className={`facility-container ${props.active ? "active" : ""}`}>
        <button
          className="image-button"
          onClick={props.onClick}
          value={props.name} 
        >
          <img
            className="facility-image"
            src={props.img}
            alt={props.name}
          />
        </button>
        <div className="facility-text">
          <p>{props.name}</p>
          <p>{props.cost}</p>
        </div>
      </div>
    );
  }
  