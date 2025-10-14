import { CommentOutlined } from "@ant-design/icons";
import { Button, Form, Input, notification } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";

const CommentUs = () => {
  const [testimonialText, setTestimonialText] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false); // Track submission status
  const apiUrl = import.meta.env.VITE_API_URL;
  // Fetch user_id from sessionStorage or elsewhere
  useEffect(() => {
    const storedUserId = sessionStorage.getItem("user_id");

    if (storedUserId) {
      setUserId(storedUserId); // Store user_id as string
      checkTestimonialStatus(storedUserId); // Check if the user has already submitted
    }
  }, []);

  const checkTestimonialStatus = async (userId: string) => {
    try {
      const response = await axios.get(`${apiUrl}/checkTestimonialStatus`, {
        params: { user_id: userId },
      });

      // Set the state based on whether the user has submitted their testimonial
      setIsSubmitted(response.data.isSubmitted);
    } catch (error) {
      console.error("Error checking testimonial status:", error);
    }
  };

  const handleSubmit = async () => {
    if (!testimonialText || !userId) {
      notification.error({
        message: "Missing Information",
        description:
          "Please fill in the testimonial text and make sure you're logged in.",
      });
      return;
    }

    const data = {
      user_id: userId,
      testimonial_text: testimonialText,
    };

    try {
      const response = await axios.post(`${apiUrl}/insertTestimonial`, data);

      // Show success notification when the testimonial is successfully submitted
      notification.success({
        message: "Testimonial Submitted Successfully",
        description: "Your testimonial has been submitted successfully.",
      });

      // Hide the button and display success message after submission
      setIsSubmitted(true);
      console.log(response.data);
    } catch (error) {
      console.error("Error submitting testimonial:", error);

      // Show error notification when something goes wrong
      notification.error({
        message: "Error Submitting Testimonial",
        description:
          "There was an error submitting your testimonial. Please try again later.",
      });
    }
  };

  return (
    <div
      className="testimonial-form"
      style={{
        maxWidth: "600px",
        margin: "auto",
        padding: "40px",
        background: "linear-gradient(145deg, #f5f7fa, #e1e9f1)",
        borderRadius: "15px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "30px",
          fontSize: "24px",
          fontWeight: "600",
          color: "#333",
        }}
      >
        Share Your Testimonial
      </h2>

      <Form name="testimonialForm" layout="vertical" style={{ width: "100%" }}>
        <Form.Item
          name="testimonial"
          label="Your Testimonial"
          rules={[
            { required: true, message: "Please write your testimonial!" },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Write your testimonial here..."
            style={{
              borderRadius: "10px",
              padding: "12px",
              fontSize: "16px",
              borderColor: "#d3d3d3",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
            }}
            value={testimonialText}
            onChange={(e) => setTestimonialText(e.target.value)}
          />
        </Form.Item>

        {/* Conditionally render the button based on submission status */}
        {!isSubmitted ? (
          <Form.Item>
            <Button
              type="primary"
              block
              style={{
                background: "linear-gradient(90deg, #1890ff, #0c74e5)",
                borderColor: "#1890ff",
                borderRadius: "8px",
                fontSize: "18px",
                fontWeight: "500",
                padding: "12px",
                boxShadow: "0 4px 15px rgba(0, 116, 255, 0.2)",
                transition: "all 0.3s ease",
              }}
              icon={<CommentOutlined />}
              onClick={handleSubmit}
            >
              Submit Testimonial
            </Button>
          </Form.Item>
        ) : (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontWeight: "bold", color: "#4caf50" }}>
              Thank You for Choosing Us!
            </p>
            <p style={{ fontSize: "16px", color: "#333" }}>
              Your testimonial has been submitted successfully!
            </p>
          </div>
        )}
      </Form>
    </div>
  );
};

export default CommentUs;
