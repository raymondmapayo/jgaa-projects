/* eslint-disable @typescript-eslint/no-explicit-any */
import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  notification,
  Popconfirm,
  Row,
  Table,
  Upload,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";

interface AddCategoriesFormProps {
  isAddModalVisible: boolean;
  onClose: () => void;
  onAddCategory: (values: any) => void;
}

const AddCategories: React.FC<AddCategoriesFormProps> = ({
  isAddModalVisible,
  onClose,
  onAddCategory,
}) => {
  const [form] = Form.useForm();
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [existingCategories, setExistingCategories] = useState<any[]>([]);
  const apiUrl = import.meta.env.VITE_API_URL;
  // Fetch existing categories when modal opens
  useEffect(() => {
    if (isAddModalVisible) {
      fetchCategories();
    }
  }, [isAddModalVisible]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${apiUrl}/get_categories`);
      setExistingCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      notification.error({
        message: "Error",
        description: "Failed to fetch categories.",
      });
    }
  };
  // Reset everything when closing
  const handleCancel = () => {
    form.resetFields();
    setCategoryList([]);
    onClose();
  };

  // Add one to list (not inserted yet)
  const handleAddToTable = async () => {
    try {
      const values = await form.validateFields();

      if (!values.categories_img?.fileList?.[0]) {
        notification.error({
          message: "Error",
          description: "Category image is required.",
        });
        return;
      }

      // ✅ Check duplicate (DB + queue)
      const isDuplicate =
        existingCategories.some(
          (cat: any) =>
            cat.categories_name.toLowerCase().trim() ===
            values.categories_name.toLowerCase().trim()
        ) ||
        categoryList.some(
          (cat) =>
            cat.categories_name.toLowerCase().trim() ===
            values.categories_name.toLowerCase().trim()
        );

      if (isDuplicate) {
        notification.error({
          message: "Duplicate Category",
          description: `This "${values.categories_name}" category already exists in the database or in your queue.`,
        });
        return;
      }

      const newCategory = {
        categories_name: values.categories_name,
        description: values.description,
        categories_img: values.categories_img.fileList[0],
      };
      setCategoryList((prev) => [...prev, newCategory]);
      form.resetFields();
    } catch (err) {
      console.log("Validation failed:", err);
    }
  };

  // Insert only one immediately
  const handleInsertSingle = async () => {
    try {
      const values = await form.validateFields();
      if (!values.categories_img?.fileList?.[0]) {
        notification.error({
          message: "Error",
          description: "Category image is required.",
        });
        return;
      }

      const formData = new FormData();
      formData.append("categories_name", values.categories_name);
      formData.append("description", values.description || "");
      formData.append(
        "categories_img",
        values.categories_img.fileList[0].originFileObj
      );

      const response = await axios.post(`${apiUrl}/add_categories`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onAddCategory(response.data);

      notification.success({
        message: "Category Added",
        description: "The category has been added successfully!",
      });

      form.resetFields();
      handleCancel(); // close modal after single insert
    } catch (error) {
      console.error("Error adding category:", error);
      notification.error({
        message: "Error",
        description: "Failed to add category. Please try again later.",
      });
    }
  };

  // Delete row from list
  const handleDeleteRow = (index: number) => {
    setCategoryList((prev) => prev.filter((_, i) => i !== index));
  };

  // Insert all from list
  const handleInsertAll = async () => {
    if (categoryList.length === 0) {
      notification.error({
        message: "Error",
        description: "No categories to insert.",
      });
      return;
    }

    try {
      for (const cat of categoryList) {
        const formData = new FormData();
        formData.append("categories_name", cat.categories_name);
        formData.append("description", cat.description || "");
        formData.append("categories_img", cat.categories_img.originFileObj);

        const response = await axios.post(
          `${apiUrl}/add_categories`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        onAddCategory(response.data);
      }

      notification.success({
        message: "Categories Added",
        description: "All categories have been added successfully!",
      });

      setCategoryList([]);
      form.resetFields();
      onClose();
    } catch (error) {
      console.error("Error adding categories:", error);
      notification.error({
        message: "Error",
        description: "Failed to add categories. Please try again later.",
      });
    }
  };

  const columns = [
    {
      title: "Category Name",
      dataIndex: "categories_name",
      key: "categories_name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Image",
      dataIndex: "categories_img",
      key: "categories_img",
      render: (file: any) => (
        <img
          src={URL.createObjectURL(file.originFileObj)}
          alt="preview"
          width={60}
          height={40}
        />
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, __: any, index: number) => (
        <Popconfirm
          title="Are you sure to remove this category?"
          onConfirm={() => handleDeleteRow(index)}
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Modal
      title="Add New Category"
      open={isAddModalVisible}
      onCancel={handleCancel}
      footer={null}
      width={500}
    >
      <Form layout="vertical" form={form}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Category Name"
              name="categories_name"
              rules={[{ required: true, message: "Category name is required" }]}
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
            <Form.Item
              label="Category Image"
              name="categories_img"
              rules={[
                { required: true, message: "Category image is required" },
              ]}
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
              >
                <Button icon={<UploadOutlined />}>Upload Category Image</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>

        {/* Buttons side by side */}
        <Row justify="end" gutter={16}>
          <Col>
            <Button onClick={handleAddToTable} type="dashed">
              Add to List
            </Button>
          </Col>
          <Col>
            <Button type="primary" onClick={handleInsertSingle}>
              Insert Now
            </Button>
          </Col>
        </Row>
      </Form>

      {/* Show list if many are added */}
      {categoryList.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <Table
            dataSource={categoryList.map((item, index) => ({
              ...item,
              key: index,
            }))}
            columns={columns}
            pagination={false}
            scroll={{ x: 800 }} // 👈 enable horizontal & vertical scroll
            bordered
          />

          <Row justify="end" gutter={16} style={{ marginTop: 20 }}>
            <Col>
              <Button onClick={handleCancel}>Cancel</Button>
            </Col>
            <Col>
              <Button type="primary" onClick={handleInsertAll}>
                Insert All
              </Button>
            </Col>
          </Row>
        </div>
      )}
    </Modal>
  );
};

export default AddCategories;
