import React from "react";

export default function Facilities(props) {

    function checkImageExists(url, callback) {
        const img = new Image();
        img.onload = () => callback(true);  // Image loaded successfully
        img.onerror = () => callback(false); // Image failed to load
        img.src = url;
      }

    checkImageExists(props.img, (exists) => {
        if (exists) {
            console.log('Image exists!');
          } else {
            console.log('Image does NOT exist!');
          }
    })

    return (
        <div>
            <button>
                <img src={props.img} alt="Click Me" width="100" height="100" />
            </button>
            <p>{props.cost}</p>
            <p>{props.name}</p>
        </div>
    )
}