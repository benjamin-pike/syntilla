import { useState, useEffect } from 'react';

export function useDelayedState<T>(initialState: T, delay: number): [T, React.Dispatch<React.SetStateAction<T>>, T] {
  const [state, setState] = useState<T>(initialState);
  const [delayedState, setDelayedState] = useState<T>(initialState);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDelayedState(state);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [state, delay]);

  return [state, setState, delayedState];
}
