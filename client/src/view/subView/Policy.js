import React from "react";

export default function Policy({
  id,
  bool,
  onChange,
  cost,
  timeToLive,
  disabled,
  formatNumber,
}) {
  return (
    <div className={`policy-item${bool ? " active" : ""}`}>
      <label className="policy-label">
        <input
          type="checkbox"
          name={id}
          checked={bool}
          onChange={onChange}
          disabled={disabled}
        />
        <span className="policy-name">{id}</span>
      </label>
      <div className="policy-details">
        <p>
          Cost: <span>{formatNumber(cost)}</span>
        </p>
        <p>
          Duration:{" "}
          <span>{timeToLive > 100 ? "Forever" : `${timeToLive} Years`}</span>
        </p>
      </div>
    </div>
  );
}
