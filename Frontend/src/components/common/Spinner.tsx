// components/Spinner.tsx
import React from "react";
import useSpinner from "../../hooks/useSpinner";
import Loader from "/loader.gif"; // Loader image

const Spinner: React.FC = () => {
  const show = useSpinner(10000);

  return (
    <>
      {show && (
        <div
          id="spinner"
          className="fixed inset-0 flex items-center justify-center bg-white z-50"
        >
          <img src={Loader} alt="Loading..." />
        </div>
      )}
    </>
  );
};

export default Spinner;
