/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Modal, Form, Input, Button } from "antd";

interface AddProductsProps {
  isVisible: boolean;
  onClose: () => void;
  onFinish: (values: any) => void;
}

const AddProducts: React.FC<AddProductsProps> = ({
  isVisible,
  onClose,
  onFinish,
}) => {
  return (
    <Modal
      title="Add New Food"
      open={isVisible}
      onCancel={onClose}
      footer={null}
    >
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Food Name"
          name="foodName"
          rules={[{ required: true, message: "Please enter the food name" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Category"
          name="category"
          rules={[{ required: true, message: "Please enter the category" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Please enter the description" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Stock"
          name="stock"
          rules={[{ required: true, message: "Please enter the stock quantity" }]}
        >
          <Input type="number" />
        </Form.Item>
        <Form.Item
          label="Price"
          name="price"
          rules={[{ required: true, message: "Please enter the price" }]}
        >
          <Input type="number" />
        </Form.Item>
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            Add Food
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddProducts;
