import React, { useState, useEffect } from "react";
import "./timelip.css";

const TopSection = ({ formattedDate }) => {
  const [time, setTime] = useState({
    hours: new Date().getHours(),
    minutes: new Date().getMinutes(),
    seconds: new Date().getSeconds(),
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime({
        hours: now.getHours(),
        minutes: now.getMinutes(),
        seconds: now.getSeconds(),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (num) => (num < 10 ? `0${num}` : num);

  return (
    <div>
      <div className="flip-clock-container">
        <h5>{formattedDate}</h5>
        <div className="flip-clock">
          <div className="flip-digit">
            <span>{formatTime(time.hours)}</span>
          </div>
          :
          <div className="flip-digit">
            <span>{formatTime(time.minutes)}</span>
          </div>
          :
          <div className="flip-digit">
            <span>{formatTime(time.seconds)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopSection;
