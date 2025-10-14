/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";

interface EditSupplyModalProps {
  visible: boolean;
  selectedItem: any | null;
  onClose: () => void;
  onFinish: (values: any) => void;
}

const EditSupplyModal: React.FC<EditSupplyModalProps> = ({
  visible,
  selectedItem,
  onClose,
  onFinish,
}) => {
  const [form] = Form.useForm();
  const [remainingStock, setRemainingStock] = useState<number>(0);

  useEffect(() => {
    if (selectedItem) {
      form.setFieldsValue({
        product_name: selectedItem.product_name,
        category: selectedItem.category,
        stock_in: selectedItem.stock_in,
        unit: selectedItem.unit,
        price: selectedItem.price,
      });

      setRemainingStock(selectedItem.stock_in);
    }
  }, [selectedItem, form]);

  // ✅ Only update remaining stock from stock_in
  const handleValuesChange = (_: any, allValues: any) => {
    setRemainingStock(allValues.stock_in || 0);
  };
  const apiUrl = import.meta.env.VITE_API_URL;
  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      const response = await axios.put(
        `${apiUrl}/update_supply/${selectedItem.supply_id}`,
        {
          product_name: values.product_name,
          category: values.category,
          stock_in: values.stock_in,
          unit: values.unit,
          price: values.price,
        }
      );

      if (response.data.success) {
        message.success(response.data.message, 1);
        onFinish(values);
        onClose();
      } else {
        message.error(response.data.message || "Failed to update supply.");
      }
    } catch (error: any) {
      console.error("❌ Error updating supply:", error);
      message.error("Failed to update supply. Please try again.");
    }
  };

  return (
    <Modal
      title="Edit Supply"
      open={visible}
      onOk={handleOk}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
          Save Changes
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" onValuesChange={handleValuesChange}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Product Name"
              name="product_name"
              rules={[{ required: true, message: "Please enter product name" }]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Category"
              name="category"
              rules={[{ required: true, message: "Please enter category" }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Stock In"
              name="stock_in"
              rules={[{ required: true, message: "Please enter stock in" }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Price"
              name="price"
              rules={[{ required: true, message: "Please enter price" }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label={<strong>Remaining Stock:</strong>}>
              <strong>{remainingStock}</strong>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Unit"
              name="unit"
              rules={[{ required: true, message: "Please enter unit" }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default EditSupplyModal;
