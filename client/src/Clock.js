import React, { useState, useEffect } from 'react';
import './App.css';

function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const tick = setInterval(() => {setTime(new Date());}, 1000);
    return () => clearInterval(tick);
    }, []
  );

  return (<div className = "content">{time.toLocaleTimeString()}</div>);
}

export default Clock;