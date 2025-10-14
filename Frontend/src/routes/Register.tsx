import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { Button, Col, Form, Input, Row, message } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { T_RegisterPayload } from "../types";

const Register = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const onFinish = async (values: T_RegisterPayload) => {
    try {
      // Send registration details to the backend
      const response = await axios.post(`${apiUrl}/register`, values);

      if (response.data.success) {
        message.success("Registration successful");
        // Redirect to login after success message
        setTimeout(() => navigate("/success"), 2000);
      } else {
        message.error(response.data.message || "Registration failed");
        console.error("Backend error message:", response.data.message);
      }
    } catch (error) {
      message.error("Registration failed. Check API response.");
      console.error("API request error:", error);
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

        {/* Monitor with Stand */}
        <div className="mt-8 flex flex-col items-center">
          {/* Monitor Frame */}
          <div className="bg-gray-900 rounded-xl shadow-2xl p-4 w-[28rem] h-64 relative border-4 border-gray-800">
            {/* Screen with Image */}
            <div className="w-full h-full bg-black rounded-md overflow-hidden flex justify-center items-center">
              <img
                src="/LoginLogo.png"
                alt="Restaurant Dashboard"
                className="w-full h-full object-cover"
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
          <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
            Create an Account
          </h1>

          <Form layout="vertical" onFinish={onFinish}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="First Name"
                  name="fname"
                  rules={[
                    { required: true, message: "Please enter your first name" },
                  ]}
                >
                  <Input placeholder="Enter First Name" size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Last Name"
                  name="lname"
                  rules={[
                    { required: true, message: "Please enter your last name" },
                  ]}
                >
                  <Input placeholder="Enter Last Name" size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Phone Number">
                  <Input.Group compact>
                    <Input
                      style={{ width: "20%", textAlign: "center" }}
                      disabled
                      value="+63"
                      addonBefore={
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/9/99/Flag_of_the_Philippines.svg"
                          alt="Philippine Flag"
                          style={{ width: 30, height: 38, marginRight: 40 }}
                        />
                      }
                    />

                    <Form.Item
                      name="pnum"
                      noStyle
                      rules={[
                        {
                          required: true,
                          message: "Please enter your phone number",
                        },
                        {
                          pattern: /^9\d{9}$/,
                          message:
                            "Please enter a valid 10-digit phone number starting with 9",
                        },
                      ]}
                    >
                      <Input
                        placeholder="9XXXXXXXXX"
                        size="large"
                        style={{ width: "80%" }}
                        maxLength={10}
                      />
                    </Form.Item>
                  </Input.Group>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Please enter your email" },
                    { type: "email", message: "Please enter a valid email" },
                    {
                      async validator(_, value) {
                        if (!value) return Promise.resolve();

                        try {
                          const response = await axios.post(
                            `${apiUrl}/check-email`,
                            { email: value }
                          );

                          if (!response.data.available) {
                            return Promise.reject(
                              "This email is already in use."
                            );
                          }

                          // If email is available, resolve the validation (valid email)
                          return Promise.resolve();
                        } catch (error) {
                          // If there’s an error with the API request, reject with error message
                          console.error("Error checking email:", error); // Log for debugging
                          return Promise.reject("Error checking email.");
                        }
                      },
                    },
                  ]}
                >
                  <Input placeholder="Enter Email" size="large" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Password"
                  name="password"
                  rules={[
                    { required: true, message: "Please enter your password" },
                  ]}
                >
                  <Input.Password
                    placeholder="Enter Password"
                    size="large"
                    iconRender={(visible) =>
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Address"
                  name="address"
                  rules={[
                    { required: true, message: "Please enter your address" },
                  ]}
                >
                  <Input placeholder="Enter Address" size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Button type="primary" block size="large" htmlType="submit">
                Register
              </Button>
            </Form.Item>
          </Form>

          <div className="flex  space-x-4 justify-center">
            <p className="text-lg">
              Already have an account?{" "}
              <a href="/Login" className="text-blue-500 hover:underline">
                Sign in
              </a>
            </p>
          </div>

          <p className="text-center mt-6 text-lg text-gray-500">
            © 2024 Active, All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
