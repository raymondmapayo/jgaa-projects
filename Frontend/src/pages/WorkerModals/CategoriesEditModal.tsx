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

interface CategoryItem {
  key: string;
  categories_name: string;
  categories_img: string;
  description: string;
  status: string;
  categories_id: number;
}

interface CategoriesEditProps {
  isEditModalVisible: boolean;
  setIsEditModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  selectedItem: CategoryItem | null;
  handleSaveEdit: (values: Partial<CategoryItem>) => void;
}

const CategoriesEdit: React.FC<CategoriesEditProps> = ({
  isEditModalVisible,
  setIsEditModalVisible,
  selectedItem,
  handleSaveEdit,
}) => {
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;
  // Prefill form
  useEffect(() => {
    if (selectedItem) {
      form.setFieldsValue({
        categories_name: selectedItem.categories_name,
        description: selectedItem.description,
        categories_img: selectedItem.categories_img,
      });
    }
  }, [selectedItem, form]);

  const handleFinish = async (values: any) => {
    console.log("Form Submitted:", values);

    const formData = new FormData();
    formData.append(
      "categories_name",
      values.categories_name || selectedItem?.categories_name
    );
    formData.append(
      "description",
      values.description || selectedItem?.description
    );
    formData.append("status", selectedItem?.status || "active");

    // ✅ Include created_by from sessionStorage
    const created_by = sessionStorage.getItem("user_id");
    if (created_by) {
      formData.append("created_by", created_by);
    } else {
      console.warn("⚠️ No user_id found in sessionStorage!");
    }

    if (values.categories_img?.fileList?.[0]) {
      formData.append(
        "categories_img",
        values.categories_img.fileList[0].originFileObj
      );
    } else {
      formData.append("categories_img", selectedItem?.categories_img || "");
    }

    try {
      const response = await axios.put(
        `${apiUrl}/update_categories/${selectedItem?.categories_id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.success) {
        notification.success({
          message: "Category Updated",
          description: "Category details have been updated successfully!",
        });

        handleSaveEdit(response.data.updatedCategory);
        form.resetFields();
        setIsEditModalVisible(false);
      } else {
        notification.error({
          message: "Error",
          description: "Failed to update category. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error editing category:", error);
      notification.error({
        message: "Error",
        description: "An error occurred while updating the category.",
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
      title="Edit Category Info"
      open={isEditModalVisible}
      onCancel={() => setIsEditModalVisible(false)}
      footer={null}
    >
      {selectedItem && (
        <Form
          layout="vertical"
          form={form}
          initialValues={selectedItem}
          onFinish={handleFinish}
        >
          {selectedItem.categories_img && (
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
                  src={`${apiUrl}/uploads/images/${selectedItem.categories_img}`}
                  alt="Existing Category Image"
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

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Category Name"
                name="categories_name"
                rules={[
                  { required: true, message: "Category name is required" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Category Image"
                name="categories_img"
                extra="Upload a new image"
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
                  <Button icon={<UploadOutlined />}>
                    Upload New Category Image
                  </Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

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

          <Row justify="end" gutter={16}>
            <Col>
              <Button onClick={() => setIsEditModalVisible(false)}>
                Cancel
              </Button>
            </Col>
            <Col>
              <Button type="primary" htmlType="submit">
                Save Changes
              </Button>
            </Col>
          </Row>
        </Form>
      )}
    </Modal>
  );
};

export default CategoriesEdit;
