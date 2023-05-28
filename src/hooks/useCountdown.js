import { useState, useEffect } from 'react';

export const useCountdown = (interval = 1000) => {
  const [count, setCount] = useState(null);
  const [countdownFinished, setCountdownFinished] = useState(false);

  useEffect(() => {
    if (count === null) {
      return;
    }

    if (count === 0) {
      setCountdownFinished(true);
      return;
    }

    const timer = setInterval(() => {
      setCount((prevCount) => (prevCount > 0 ? prevCount - 1 : 0));
    }, interval);

    return () => clearInterval(timer);
  }, [count, interval]);

  const startCountdown = (initialValue) => {
    setCount(initialValue);
    setCountdownFinished(false);
  };

  const countdownPromise = () => {
    return new Promise((resolve) => {
      if (countdownFinished) {
        resolve();
      }
      const unsubscribe = setInterval(() => {
        if (countdownFinished) {
          resolve();
          clearInterval(unsubscribe);
        }
      }, interval);
    });
  };

  return [count, startCountdown, countdownPromise];
}
