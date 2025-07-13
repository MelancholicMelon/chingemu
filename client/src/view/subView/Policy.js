import React from "react"
export default function Policy(props) {
    return (
        <div className="policy-item">
            <label>
                <input
                    type="checkbox"
                    name={props.id}
                    checked={props.bool}
                    onChange={props.onChange}
                />
                {props.id}
            </label>
        </div>
    );
}
