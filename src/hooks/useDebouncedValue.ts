import { useEffect, useState } from "react";
export function useDebouncedValue<T>(value: T, delay = 150) {
  const [current, setCurrent] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setCurrent(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return current;
}
