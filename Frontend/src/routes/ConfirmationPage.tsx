import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ConfirmationPage = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No token provided.");
      return;
    }

    fetch(`${apiUrl}/verify-email/${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
          setMessage("Your email has been successfully verified! ✅");
          setTimeout(() => navigate("/login"), 3000); // redirect after 3s
        } else {
          setStatus("error");
          setMessage(data.message || "Invalid or expired token.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong. Please try again later.");
      });
  }, [token, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
      {status === "loading" && <p>Verifying your email...</p>}
      {status === "success" && <h1 className="text-green-600">{message}</h1>}
      {status === "error" && <h1 className="text-red-600">{message}</h1>}
    </div>
  );
};

export default ConfirmationPage;
