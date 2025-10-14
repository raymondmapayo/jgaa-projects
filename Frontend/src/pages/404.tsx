import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      {/* Illustration */}
      <div className="mb-8">
        <img src="/error.gif" alt="404 Not Found" className="max-w-lg h-auto" />
      </div>

      {/* Message */}
      <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-4">
        SORRY, PAGE NOT FOUND{" "}
        <span role="img" aria-label="crying face">
          😭
        </span>
      </h1>
      <p className="text-gray-600 text-center mb-6">
        The page you are looking for is not available!
      </p>

      {/* Back to Home Button */}
      <button
        onClick={() => navigate("/")}
        className="px-6 py-3 bg-teal-500 text-white font-medium rounded-full hover:bg-teal-600 transition"
      >
        &larr; Back to Home
      </button>
    </div>
  );
};

export default NotFound;
