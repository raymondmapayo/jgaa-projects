import { UploadOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Form,
  Image,
  Input,
  Modal,
  notification,
  Row,
  Spin,
  Upload,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";

interface MenuItem {
  key: string;
  menu_id: number; // Add menu_id to identify the item uniquely
  item_name: string;
  category: string;
  price: string;
  description: string; // Added description field

  menu_img: string;
  availability: string;
}

interface MenuEditModalProps {
  isVisible: boolean;
  selectedItem: MenuItem | null;
  onClose: () => void;
  onSave: (values: MenuItem) => void; // onSave expects the updated menu item
}

const MenuEditModal: React.FC<MenuEditModalProps> = ({
  isVisible,
  selectedItem,
  onClose,
  onSave,
}) => {
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm(); // Declare form instance

  // Re-fetch category data when selectedItem changes
  useEffect(() => {
    if (selectedItem) {
      form.setFieldsValue({
        item_name: selectedItem.item_name,
        description: selectedItem.description,
        menu_img: selectedItem.menu_img,
        price: selectedItem.price,

        availability: selectedItem.availability,
      });
    }
  }, [selectedItem, form]);

  const handleFinish = async (values: any) => {
    console.log("Form Submitted:", values);

    const formData = new FormData();
    formData.append("item_name", values.item_name || selectedItem?.item_name);
    formData.append("price", values.price || selectedItem?.price);

    formData.append("availability", selectedItem?.availability || "Available");
    formData.append(
      "description",
      values.description || selectedItem?.description
    );

    // Check if a new image is uploaded
    if (values.menu_img?.fileList?.[0]?.originFileObj) {
      formData.append("menu_img", values.menu_img.fileList[0].originFileObj);
    } else {
      formData.append("menu_img", selectedItem?.menu_img || "");
    }

    try {
      const response = await axios.put(
        `http://localhost:8081/update_menu/${selectedItem?.menu_id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data === "Menu item updated successfully") {
        notification.success({
          message: "Success",
          description: "Menu item has been updated successfully!",
        });

        // Directly call the handler to update the table without a refresh
        onSave({
          ...selectedItem,
          ...values, // Merge updated values
          menu_img:
            values.menu_img?.fileList?.[0]?.originFileObj?.name ||
            selectedItem?.menu_img,
        });

        form.resetFields();
        onClose();
      } else {
        notification.error({
          message: "Error",
          description: "Failed to update menu item. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error updating menu:", error);
      notification.error({
        message: "Error",
        description: "An error occurred while updating the menu item.",
      });
    }
  };

  const handleUploadChange = (info: any) => {
    if (info.file.status === "uploading") {
      setUploading(true);
    } else if (info.file.status === "done" || info.file.status === "error") {
      setUploading(false);
    }
  };

  return (
    <Modal
      title="Edit Food Info"
      visible={isVisible}
      onCancel={onClose}
      footer={null}
    >
      {selectedItem && (
        <Form
          form={form} // Pass the form instance to the Form
          initialValues={selectedItem} // Ensure `initialValues` is correctly set from the selected item
          onFinish={handleFinish}
          layout="vertical"
        >
          {/* Existing Image - Positioned at the top and centered */}
          {selectedItem.menu_img && (
            <Row justify="center">
              <Col
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "20px",
                  position: "relative",
                  width: "150px",
                  height: "150px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "2px solid #ccc",
                  margin: "0 auto",
                }}
              >
                <Image
                  width="100%"
                  height="100%"
                  src={`http://localhost:8081/uploads/images/${selectedItem.menu_img}`}
                  alt="Existing Menu Image"
                  style={{ objectFit: "cover" }}
                />
              </Col>
              <Col
                span={24}
                style={{ textAlign: "center", marginBottom: "10px" }}
              >
                <strong>Existing Image</strong>
              </Col>
            </Row>
          )}

          {/* Food Name, Price, and Quantity Inputs */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Food Name"
                name="item_name"
                rules={[{ required: true, message: "Food name is required" }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Price"
                name="price"
                rules={[{ required: true, message: "Price is required" }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          {/* Menu Image Upload */}
          <Row justify="center" style={{ marginBottom: 20 }}>
            <Col>
              <Form.Item
                label="Menu Image"
                name="menu_img"
                extra="Upload a new image"
                style={{ textAlign: "center" }} // optional, aligns label center
              >
                <Upload
                  beforeUpload={(file) => {
                    const isValidType =
                      file.type === "image/png" ||
                      file.type === "image/jpeg" ||
                      file.type === "image/jpg";
                    if (!isValidType) {
                      notification.error({
                        message: "Invalid File Type",
                        description:
                          "Only .png, .jpg, and .jpeg pictures are allowed.",
                      });
                      return Upload.LIST_IGNORE;
                    }
                    return false;
                  }}
                  maxCount={1}
                  listType="picture"
                  onChange={handleUploadChange}
                >
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <Button icon={<UploadOutlined />}>
                      Upload New Menu Image
                    </Button>
                  </div>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          {/* Description Input */}

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>

          {uploading && (
            <Row justify="center">
              <Col>
                <Spin /> Uploading...
              </Col>
            </Row>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Save Changes
            </Button>
          </div>
        </Form>
      )}
    </Modal>
  );
};

export default MenuEditModal;
