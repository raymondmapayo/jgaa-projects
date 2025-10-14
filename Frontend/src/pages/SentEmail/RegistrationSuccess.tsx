import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useNavigate } from "react-router-dom";

const RegistrationSuccess = () => {
  const navigate = useNavigate();

  const handleProceed = () => {
    // Redirect to the login page
    navigate("/login");
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Left Side: Branding/Image */}
      <div className="hidden md:flex w-full md:w-1/2 bg-gradient-to-r from-sky-500 to-sky-700 text-white flex-col justify-center items-center p-12 rounded-r-3xl shadow-lg">
        <h2 className="text-5xl font-extrabold text-center leading-snug drop-shadow-lg">
          JGAA Thai Restaurant
        </h2>
        <p className="mt-4 text-xl text-center opacity-90 max-w-lg tracking-wide leading-relaxed">
          Preceed to login to access your account and manage JGAA Thai
          Restaurant efficiently.
        </p>

        {/* Monitor with Stand */}
        <div className="mt-8 flex flex-col items-center">
          {/* Monitor Frame */}
          <div className="bg-gray-900 rounded-xl shadow-2xl p-4 w-[28rem] h-64 relative border-4 border-gray-800">
            {/* Screen with Image */}
            <div className="w-full h-full bg-white rounded-md overflow-hidden flex justify-center items-center">
              <DotLottieReact
                src="https://lottie.host/3308c25c-0da9-47a6-9fc9-7a996f04a7a7/IC85QA7Dh5.lottie"
                speed={1}
                style={{ width: "300px", height: "300px" }}
                loop
                autoplay
                className="w-48 max-h-96 mb-4"
              />
            </div>
          </div>
          {/* Monitor Stand */}
          <div className="w-40 h-3 bg-gray-700 rounded-lg mt-2"></div>
          <div className="w-64 h-1 bg-gray-600 rounded-lg mt-1"></div>
        </div>
      </div>

      {/* Right Side: Registration Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8">
        <div className="w-full md:w-[80%] bg-white p-10 rounded-2xl shadow-xl">
          <h1 className="text-2xl font-semibold text-green-600 mb-4 text-center">
            Success!
          </h1>
          <p className="text-lg text-gray-700 mb-6 text-justify">
            You have successfully registered. 📩 We've sent a verification link
            to your Gmail. Please check your inbox (or spam folder, just in
            case) and click the link to activate your account.
          </p>

          <button
            onClick={handleProceed}
            className="w-full py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Proceed to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
