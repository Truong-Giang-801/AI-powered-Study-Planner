import React, { useState, useEffect } from 'react';

const Timer = () => {
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval = null;
        if (isActive) {
            interval = setInterval(() => {
                setSeconds(seconds => seconds + 1);
            }, 1000);
        } else if (!isActive && seconds !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, seconds]);

    const reset = () => {
        setSeconds(0);
        setIsActive(false);
    };

    return (
        <div className="timer">
            <h2>Timer</h2>
            <div className="time">
                {Math.floor(seconds / 60)}:{seconds % 60 < 10 ? `0${seconds % 60}` : seconds % 60}
            </div>
            <div className="buttons">
                <button onClick={() => setIsActive(!isActive)}>
                    {isActive ? 'Pause' : 'Start'}
                </button>
                <button onClick={reset}>
                    Reset
                </button>
            </div>
        </div>
    );
};

export default Timer;
