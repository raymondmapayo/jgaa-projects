// useLoading.ts
import { useEffect, useState } from "react";

const useLoading = (delay: number = 3000) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return loading;
};

export default useLoading;
