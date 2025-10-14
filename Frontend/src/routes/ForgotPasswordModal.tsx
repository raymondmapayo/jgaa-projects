import { Button, Input, message, Modal } from "antd";
import axios from "axios";
import React, { useState } from "react";

interface ForgotPasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  visible,
  onClose,
}) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;
  const handleSendReset = async () => {
    if (!email) {
      message.error("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${apiUrl}/forgot_password`, { email });
      if (res.data.success) {
        message.success("Reset email sent!");
        setEmail("");
        onClose();
      } else {
        message.error(res.data.message || "Error sending reset link");
      }
    } catch (err: any) {
      console.error("Forgot password error:", err);
      message.error(
        err.response?.data?.message || "Network error. Check backend URL."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      title="Forgot Password"
      centered
    >
      <div className="space-y-4">
        <Input
          type="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md"
        />
        <Button
          type="primary"
          block
          loading={loading}
          onClick={handleSendReset}
          className="rounded-md"
        >
          Send Reset Link
        </Button>
      </div>
    </Modal>
  );
};

export default ForgotPasswordModal;
