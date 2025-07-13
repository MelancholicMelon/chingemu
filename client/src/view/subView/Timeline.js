import React from 'react';
import "../../css/timeline.css"

const Timeline = ({ currentYear, startYear = 2025, endYear = 2035 }) => {
  const totalYears = endYear - startYear;
  const currentProgress = currentYear - startYear;
  const progressPercentage = Math.min((currentProgress / totalYears) * 100, 100);
  
  // Generate year markers
  const yearMarkers = [];
  for (let year = startYear; year <= endYear; year++) {
    yearMarkers.push(year);
  }
  
  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <span className="timeline-title">Game Progress</span>
        <span className="timeline-current-year">{currentYear}</span>
      </div>
      
      <div className="timeline-track">
        <div 
          className="timeline-progress"
          style={{ width: `${progressPercentage}%` }}
        />
        <div className="timeline-markers">
          {yearMarkers.map((year, index) => {
            const isActive = year <= currentYear;
            const isPassed = year < currentYear;
            const isCurrent = year === currentYear;
            
            return (
              <div
                key={year}
                className={`timeline-marker ${isActive ? 'active' : ''} ${isPassed ? 'passed' : ''} ${isCurrent ? 'current' : ''}`}
                style={{ left: `${(index / (yearMarkers.length - 1)) * 100}%` }}
              >
                <div className="timeline-dot" />
                <div className="timeline-year">{year}</div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="timeline-footer">
        <span>Years Remaining: {Math.max(0, endYear - currentYear)}</span>
      </div>
    </div>
  );
};

export default Timeline;