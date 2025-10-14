// hooks/useSpinner.ts
import { useEffect, useState } from "react";

// Custom hook to manage spinner visibility
const useSpinner = (delay: number = 2000) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), delay); // Hide spinner after a delay
    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, [delay]);

  return show;
};

export default useSpinner;
