import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, message, Modal } from "antd";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { T_LoginPayload, T_LoginResponse } from "../types";
import {
  saveadminInfo,
  saveClientInfo,
  saveworkerInfo,
} from "../zustand/store/store.provider";
import ForgotPasswordModal from "./ForgotPasswordModal";

const Login = () => {
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false); // New state for terms modal
  const [isChecked, setIsChecked] = useState(false); // Track checkbox state
  const [isForgotPasswordVisible, setIsForgotPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const onFinish = async (values: T_LoginPayload) => {
    // Check if the checkbox is checked
    if (!isChecked) {
      message.error(
        "You must agree to the Terms of Service and Privacy Policy to proceed."
      );
      return; // Prevent form submission
    }
    try {
      const response = await axios.post<T_LoginResponse>(
        `${apiUrl}/login`,
        values
      );

      if (response.data.success) {
        const { user, token } = response.data;

        if (
          !user ||
          !user.fname ||
          !user.lname || // Check for last name
          !user.email ||
          !user.role ||
          !user.user_id ||
          !user.pnum || // Ensure pnum is not null or empty
          user.pnum.trim() === "" || // Additional check to make sure pnum is not empty
          user.lname.trim() === "" // Additional check to make sure lname is not empty
        ) {
          console.error("Missing user data in response:", response.data);
          alert("Login failed: Missing user data.");
          return;
        }

        // ✅ Log user data to console
        console.log("Logged in user:", user);
        console.log("Phone number:", user.pnum); // Log the phone number separately
        console.log("Full name:", user.fname, user.lname); // Log full name
        // Save user data based on role
        if (user.role === "admin") {
          saveadminInfo(user);
        } else if (user.role === "client") {
          saveClientInfo(user);
        } else if (user.role === "worker") {
          saveworkerInfo(user);
        }

        // ✅ Store authentication status, JWT, and user details
        sessionStorage.setItem("isAuthenticated", "true");
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("userRole", user.role);
        sessionStorage.setItem("fname", user.fname);
        sessionStorage.setItem("email", user.email);
        sessionStorage.setItem("phone", user.pnum);
        sessionStorage.setItem("lname", user.lname);
        sessionStorage.setItem("user_id", user.user_id.toString()); // ✅ Save user_id as string

        // ✅ Redirect based on role
        if (user.role === "admin") {
          navigate("/Admin/Dashboard");
        } else if (user.role === "worker") {
          navigate("/Worker/Dashboard");
        } else if (user.role === "client") {
          navigate("/");
        } else {
          alert("Unknown role: " + user.role);
        }
      } else {
        alert(response.data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Check API response.");
    }
  };
  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Left Side: Branding/Image */}
      <div className="hidden md:flex w-full md:w-1/2 bg-gradient-to-r from-sky-500 to-sky-700 text-white flex-col justify-center items-center p-12 rounded-r-3xl shadow-lg">
        <h2 className="text-5xl font-extrabold text-center leading-snug drop-shadow-lg">
          JGAA Thai Restaurant
        </h2>
        <p className="mt-4 text-xl text-center opacity-90 max-w-lg tracking-wide leading-relaxed">
          Enter your credentials to access your account and manage JGAA Thai
          Restaurant efficiently.
        </p>
        <div className="mt-8 flex flex-col items-center">
          <div className="bg-gray-900 rounded-xl shadow-2xl p-4 w-[28rem] h-64 relative border-4 border-gray-800">
            <div className="w-full h-full bg-black rounded-md overflow-hidden flex justify-center items-center">
              <img
                src="/jgaalogo.jpg"
                alt="Restaurant Dashboard"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="w-40 h-3 bg-gray-700 rounded-lg mt-2"></div>
          <div className="w-64 h-1 bg-gray-600 rounded-lg mt-1"></div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8">
        <div className="w-full md:w-[80%] bg-white p-10 rounded-2xl shadow-xl">
          <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
            Get Started Now
          </h1>

          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              label={
                <span className="text-lg font-semibold text-gray-700">
                  Email
                </span>
              }
              name="email"
              rules={[
                { required: true, message: "Please enter your email" },
                {
                  // Custom validation for email verification status
                  validator: async (_, value) => {
                    if (value) {
                      try {
                        const response = await axios.post(
                          `${apiUrl}/check-email-status`,
                          { email: value }
                        );

                        if (response.data.status !== "active") {
                          return Promise.reject(
                            new Error(
                              "Please verify your email account in your email inbox."
                            )
                          );
                        }
                      } catch (error) {
                        // Handle error: 404 (user not found) or other errors
                        if (
                          axios.isAxiosError(error) &&
                          error.response &&
                          error.response.status === 404
                        ) {
                          return Promise.reject(
                            new Error(
                              "Email not found. Please check and try again."
                            )
                          );
                        } else {
                          console.error(
                            "Email verification check failed:",
                            error
                          );
                          return Promise.reject(
                            new Error(
                              "Error verifying email status. Try again later."
                            )
                          );
                        }
                      }
                    }
                  },
                },
              ]}
            >
              <Input
                placeholder="Enter Email"
                size="large"
                className="rounded-lg p-4 text-lg border-gray-300 shadow-sm"
                autoComplete="username" // ✅ Fix here
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-lg font-semibold text-gray-700">
                  Password
                </span>
              }
              name="password"
              rules={[
                { required: true, message: "Please enter your password" },
              ]}
            >
              <Input.Password
                placeholder="Enter Password"
                size="large"
                className="rounded-lg p-4 text-lg border-gray-300 shadow-sm"
                autoComplete="current-password"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <Form.Item>
              <Checkbox
                className="text-lg text-gray-600"
                onChange={(e) => setIsChecked(e.target.checked)} // Update the checkbox state
              >
                By signing in, you agree to our{" "}
                <span
                  onClick={() => setIsTermsModalOpen(true)} // Open the terms modal
                  className="font-semibold text-blue-600 cursor-pointer"
                >
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="font-semibold text-blue-600 cursor-pointer">
                  Privacy Policy
                </span>
                .
              </Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                block
                size="large"
                className="text-xl h-14 rounded-lg shadow-md"
                htmlType="submit"
                disabled={!isChecked} // Disable button if checkbox is not checked
              >
                Sign In
              </Button>
            </Form.Item>
            <div className="flex justify-center space-x-4">
              <span
                className="text-blue-600 cursor-pointer text-sm"
                onClick={() => setIsForgotPasswordVisible(true)}
              >
                Forgot Password?
              </span>
            </div>
          </Form>

          <div className="flex justify-center space-x-4">
            <p className="text-lg">
              Don’t have an account yet?{" "}
              <a href="/Register" className="text-blue-500 hover:underline">
                Sign up
              </a>
            </p>
          </div>

          <p className="text-center mt-6 text-lg text-gray-500">
            © 2025 Active, All Rights Reserved
          </p>
        </div>
      </div>
      <ForgotPasswordModal
        visible={isForgotPasswordVisible}
        onClose={() => setIsForgotPasswordVisible(false)}
      />

      {/* Terms of Service Modal */}
      <Modal
        open={isTermsModalOpen} // Use isTermsModalOpen state here
        onCancel={() => setIsTermsModalOpen(false)}
        footer={null}
        title="Terms of Service"
      >
        <div className="p-4">
          <h2 className="font-bold text-xl mb-4">Terms of Service</h2>
        </div>
      </Modal>
    </div>
  );
};

export default Login;
