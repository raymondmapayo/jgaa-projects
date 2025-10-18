// GCashButton.tsx
import { UploadOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Row,
  TimePicker,
  Upload,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import React, { useState } from "react";

interface GCashButtonProps {
  amount: number;
  menuImg: string;
  orderQuantity: number;
  onPaymentSuccess: () => void;
  onPaymentError: (error: any) => void;
}

const GCashButton: React.FC<GCashButtonProps> = ({
  amount,
  menuImg,
  orderQuantity,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const [step, setStep] = useState<"qr" | "form">("qr");
  const [submitting, setSubmitting] = useState(false); // prevent double submit
  const userId = sessionStorage.getItem("user_id");
  const [form] = Form.useForm();
  const apiUrl = import.meta.env.VITE_API_URL;
  const handleSubmit = async (values: any) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("amount", String(amount));
      formData.append("description", "Payment for Order");
      formData.append("remarks", "Payment for order");
      formData.append("checkout_url", "GCash Manual Payment");
      formData.append("payment_method", "GCash");
      formData.append("status", "pending");
      formData.append("created_at", dayjs().format("YYYY-MM-DD HH:mm:ss"));
      formData.append("user_id", String(userId));
      formData.append("order_quantity", String(orderQuantity));
      formData.append("menu_img", menuImg);
      formData.append("reference_code", values.reference || "");
      formData.append("gcash_number", values.gcash || "");
      formData.append("payment_date", dayjs(values.date).format("YYYY-MM-DD"));
      formData.append("payment_time", dayjs(values.time).format("HH:mm:ss"));

      // ✅ Append the actual proof image file if provided
      const proofFile = values.photo?.[0]?.originFileObj;
      if (proofFile) {
        formData.append("proof_image", proofFile);
      }

      // Save GCash transaction (manual payment, no transaction_id)
      await axios.post(`${apiUrl}/gcash_transaction`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Save GCash payment info (manual)
      await axios.post(`${apiUrl}/gcash_payment`, {
        user_id: userId,
        amount_paid: amount,
        payment_method: "GCash",
        payment_status: "pending",
      });

      message.success("GCash payment submitted! Waiting for verification.");
      onPaymentSuccess();
    } catch (error) {
      console.error(error);
      message.error("GCash payment failed, please try again.");
      onPaymentError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-5 flex flex-col items-center space-y-4 w-full">
      {step === "qr" && (
        <>
          <p className="text-sm text-gray-600 mb-2 text-center font-medium">
            Note: Screenshot the Receipt payment
          </p>
          <img src="/qr.jpg" alt="GCash QR Code" className="w-60 h-60 mb-4" />
          <Button type="primary" onClick={() => setStep("form")}>
            Next
          </Button>
        </>
      )}

      {step === "form" && (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="w-full"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Amount">
                <Input
                  type="number"
                  prefix="₱"
                  value={amount}
                  disabled
                  className="w-full"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="reference"
                label="Reference Code"
                rules={[
                  { required: true, message: "Please enter reference code" },
                ]}
              >
                <Input placeholder="GCash Ref No." className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="date"
                label="Date"
                rules={[{ required: true, message: "Please select date" }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="time"
                label="Time"
                rules={[{ required: true, message: "Please select time" }]}
              >
                <TimePicker className="w-full" format="HH:mm" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="gcash"
                label="GCash Number"
                rules={[
                  { required: true, message: "Please enter GCash number" },
                ]}
              >
                <Input placeholder="09xxxxxxxxx" className="w-full" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="photo"
                label="Upload Proof"
                valuePropName="fileList"
                getValueFromEvent={(e) =>
                  Array.isArray(e) ? e : e && e.fileList
                }
                rules={[
                  { required: true, message: "Please upload proof of payment" },
                ]}
              >
                <Upload
                  beforeUpload={() => false}
                  maxCount={1}
                  accept="image/*"
                  className="w-full"
                >
                  <Button icon={<UploadOutlined />} className="w-full">
                    Upload Screenshot
                  </Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label=" ">
                <Button block onClick={() => setStep("qr")}>
                  Back
                </Button>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label=" ">
                <Button type="primary" htmlType="submit" block>
                  Submit Payment
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )}
    </div>
  );
};

export default GCashButton;
