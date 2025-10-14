import { UploadOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Upload,
  notification,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";

interface CategoriesEditFormProps {
  isEditModalVisible: boolean;
  onClose: () => void;
  categoryId: string;
  onUpdateCategory: (updatedCategory: any) => void;
}

const CategoriesEdit: React.FC<CategoriesEditFormProps> = ({
  isEditModalVisible,
  onClose,
  categoryId,
  onUpdateCategory,
}) => {
  const [form] = Form.useForm();
  const [categoryData, setCategoryData] = useState<any>(null);
  const apiUrl = import.meta.env.VITE_API_URL;
  // Fetch category details when categoryId is provided
  useEffect(() => {
    if (categoryId) {
      console.log("Fetching category details for ID:", categoryId); // Log categoryId to ensure it's passed
      const fetchCategory = async () => {
        try {
          const response = await axios.get(
            `${apiUrl}/get_category/${categoryId}`
          );
          setCategoryData(response.data);
          form.setFieldsValue({
            categories_name: response.data.categories_name,
            description: response.data.description,
            categories_img: response.data.categories_img, // Initial image
          });
        } catch (error) {
          notification.error({
            message: "Error",
            description: "Failed to fetch category details.",
          });
        }
      };
      fetchCategory();
    }
  }, [categoryId, form]);

  const handleFinish = async (values: any) => {
    // Prepare the form data to only update the changed fields
    const formData = new FormData();

    // If category name or description is changed, append those to formData
    if (values.categories_name !== categoryData?.categories_name) {
      formData.append("categories_name", values.categories_name);
    }

    if (values.description !== categoryData?.description) {
      formData.append("description", values.description);
    }

    // Only append the category image if it's changed
    if (values.categories_img?.fileList?.[0]) {
      formData.append(
        "categories_img",
        values.categories_img.fileList[0].originFileObj
      );
    }

    // Ensure the image is provided if the user chooses to update it
    if (
      (values.categories_img?.fileList?.[0] || categoryData?.categories_img) &&
      !formData.has("categories_img")
    ) {
      notification.error({
        message: "Error",
        description: "Category image is required.",
      });
      return;
    }

    try {
      const response = await axios.put(
        `${apiUrl}/update_categories/${categoryId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      notification.success({
        message: "Category Updated",
        description: "Category has been updated successfully!",
      });

      // Refresh the categories in the parent component
      onUpdateCategory(response.data);

      form.resetFields(); // Reset form fields
      onClose(); // Close the modal
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to update category. Please try again later.",
      });
    }
  };

  return (
    <Modal
      title="Edit Category"
      open={isEditModalVisible}
      onCancel={onClose}
      footer={null}
    >
      {categoryData ? (
        <Form layout="vertical" form={form} onFinish={handleFinish}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Category Name"
                name="categories_name"
                initialValue={categoryData.categories_name}
                rules={[
                  { required: true, message: "Category name is required" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Description" name="description">
                <Input.TextArea rows={3} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Category Image" name="categories_img">
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

                    return false; // Prevent automatic upload
                  }}
                  maxCount={1}
                  listType="picture"
                >
                  <Button icon={<UploadOutlined />}>
                    Upload Category Image
                  </Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Row justify="end" gutter={16}>
            <Col>
              <Button onClick={onClose}>Cancel</Button>
            </Col>
            <Col>
              <Button type="primary" htmlType="submit">
                Update Category
              </Button>
            </Col>
          </Row>
        </Form>
      ) : (
        <div>Loading category details...</div>
      )}
    </Modal>
  );
};

export default CategoriesEdit;
