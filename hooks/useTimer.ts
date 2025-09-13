import { useState, useEffect, useRef } from 'react';

export const useTimer = (initialTime: number, onTimeout: () => void) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  // The comment below is correct, but the implementation was not forcing the browser API.
  // Fix: The return type of `setInterval` in a browser environment is `number`, not `NodeJS.Timeout`.
  const intervalRef = useRef<number | null>(null);

  // Fix: The error "Type 'Timeout' is not assignable to type 'number'" is caused by TypeScript
  // using Node.js types. Using `window.setInterval` and `window.clearInterval` explicitly
  // invokes the browser's DOM APIs, which correctly use the `number` type for timer IDs,
  // resolving the type conflict.
  useEffect(() => {
    if (timeLeft <= 0) {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
      onTimeout();
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, onTimeout]);

  const formattedTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return { timeLeft, formattedTime: formattedTime() };
};
