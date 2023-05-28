import { useState, useEffect } from 'react';

export const useCountdown = (interval = 1000) => {
  const [count, setCount] = useState(null);
  const [countdownPromise, setCountdownPromise] = useState(null);

  useEffect(() => {
    if (count === null) {
      return;
    }

    if (count === 0) {
      countdownPromise?.resolve();
      return;
    }

    const timer = setInterval(() => {
      setCount((prevCount) => (prevCount > 0 ? prevCount - 1 : 0));
    }, interval);

    return () => clearInterval(timer);
  }, [count, interval, countdownPromise]);

  const startCountdown = (initialValue) => {
    setCount(initialValue);
    setCountdownPromise(() => {
      let resolve;
      const promise = new Promise((res) => resolve = res);
      promise.resolve = resolve;
      return promise;
    });
  };

  return [count, startCountdown, countdownPromise];
}
