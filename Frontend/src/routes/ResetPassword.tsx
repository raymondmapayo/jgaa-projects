import { Button, Form, Input, message, Spin } from "antd";
import axios from "axios";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;
  const handleSubmit = async () => {
    if (!password || !confirm) {
      message.error("Please fill all fields");
      return;
    }

    if (password !== confirm) {
      message.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${apiUrl}/reset-password/${token}`, {
        password,
      });
      message.success(res.data.message || "Password reset successful!");
      navigate("/login");
    } catch (err: any) {
      console.error("Reset password error:", err);
      message.error(
        err.response?.data?.message || "Network error. Check backend URL."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Left Side Branding/Image */}
      <div className="hidden md:flex w-full md:w-1/2 bg-gradient-to-r from-sky-500 to-sky-700 text-white flex-col justify-center items-center p-12 rounded-r-3xl shadow-lg">
        <h2 className="text-5xl font-extrabold text-center leading-snug drop-shadow-lg">
          JGAA Thai Restaurant
        </h2>
        <p className="mt-4 text-xl text-center opacity-90 max-w-lg tracking-wide leading-relaxed">
          Reset your password to access your account and manage JGAA Thai
          Restaurant efficiently.
        </p>
        <div className="mt-8 flex flex-col items-center">
          <div className="bg-gray-900 rounded-xl shadow-2xl p-4 w-[28rem] h-64 relative border-4 border-gray-800">
            <div className="w-full h-full bg-black rounded-md overflow-hidden flex justify-center items-center">
              <img
                src="/LoginLogo.png"
                alt="Restaurant Dashboard"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="w-40 h-3 bg-gray-700 rounded-lg mt-2"></div>
          <div className="w-64 h-1 bg-gray-600 rounded-lg mt-1"></div>
        </div>
      </div>

      {/* Right Side Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8">
        <div className="w-full md:w-[80%] bg-white p-10 rounded-2xl shadow-xl">
          <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
            Reset Your Password
          </h1>

          <Form layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label={
                <span className="text-lg font-semibold text-gray-700">
                  New Password
                </span>
              }
              required
            >
              <Input.Password
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                size="large"
                className="rounded-lg p-4 text-lg border-gray-300 shadow-sm"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-lg font-semibold text-gray-700">
                  Confirm Password
                </span>
              }
              required
            >
              <Input.Password
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                size="large"
                className="rounded-lg p-4 text-lg border-gray-300 shadow-sm"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                disabled={loading}
                className="text-xl h-14 rounded-lg shadow-md"
              >
                {loading ? <Spin /> : "Reset Password"}
              </Button>
            </Form.Item>
          </Form>

          <p className="text-center mt-6 text-lg text-gray-500">
            © 2025 Active, All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
