import React from "react";
import useLoading from "../../hooks/useLoading";

const Shimmer: React.FC = () => {
  const loading = useLoading(3000); // Adjust delay as needed

  return loading ? (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="w-20 h-20 rounded-md bg-gray-200 animate-pulse"></div>
    </div>
  ) : null;
};

export default Shimmer;
