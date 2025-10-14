/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Table,
  notification,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import axios from "axios";
import React, { useEffect, useState } from "react";

interface AddSupplyCategoriesProps {
  isAddModalVisible: boolean;
  onClose: () => void;
  onAddCategory: (values: any) => void;
}

const AddSupplyCategories: React.FC<AddSupplyCategoriesProps> = ({
  isAddModalVisible,
  onClose,
  onAddCategory,
}) => {
  const [form] = Form.useForm();
  const [categoryList, setCategoryList] = useState<any[]>([]); // queue
  const [existingCategories, setExistingCategories] = useState<any[]>([]); // already in DB

  // Fetch categories when modal opens
  useEffect(() => {
    if (isAddModalVisible) {
      fetchCategories();
    }
  }, [isAddModalVisible]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8081/get_supply_categories"
      );
      setExistingCategories(response.data);
    } catch (error) {
      console.error("Error fetching supply categories:", error);
      notification.error({
        message: "Error",
        description: "Failed to fetch supply categories.",
      });
    }
  };

  // Add category directly to DB
  const handleSubmitOne = async (values: any) => {
    // ✅ Prevent duplicate (check DB categories)
    const isDuplicate = existingCategories.some(
      (cat) =>
        cat.supply_cat_name.toLowerCase().trim() ===
        values.supply_cat_name.toLowerCase().trim()
    );

    if (isDuplicate) {
      notification.error({
        message: "Duplicate Category",
        description: "This category already exists in the database.",
      });
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8081/add_supply_category",
        values
      );

      notification.success({
        message: "Supply Category Added",
        description: "New supply category has been added successfully!",
      });

      form.resetFields();
      fetchCategories();
      onAddCategory(response.data);
    } catch (error) {
      console.error("Error adding supply category:", error);
      notification.error({
        message: "Error",
        description: "Failed to add supply category. Please try again later.",
      });
    }
  };

  // Add category to temporary queue
  const handleAddToList = (values: any) => {
    // ✅ Prevent duplicate (check DB and queue)
    const isDuplicate =
      existingCategories.some(
        (cat) =>
          cat.supply_cat_name.toLowerCase().trim() ===
          values.supply_cat_name.toLowerCase().trim()
      ) ||
      categoryList.some(
        (cat) =>
          cat.supply_cat_name.toLowerCase().trim() ===
          values.supply_cat_name.toLowerCase().trim()
      );

    if (isDuplicate) {
      notification.error({
        message: "Duplicate Category",
        description: `"${values.supply_cat_name}" already exists in the database or in your queue.`,
      });
      return;
    }

    const newItem = { ...values };
    setCategoryList([...categoryList, newItem]);
    form.resetFields();
  };

  // Remove from queue
  const handleRemoveFromList = (index: number) => {
    const updated = [...categoryList];
    updated.splice(index, 1);
    setCategoryList(updated);
  };

  // Insert all queued categories
  const handleSubmitAll = async () => {
    try {
      for (const item of categoryList) {
        await axios.post("http://localhost:8081/add_supply_category", item);
      }
      notification.success({
        message: "Supply Categories Added",
        description: "All queued categories have been added successfully!",
      });
      setCategoryList([]);
      fetchCategories();
    } catch (error) {
      console.error("Error inserting queued categories:", error);
      notification.error({
        message: "Error",
        description: "Failed to insert queued categories. Please try again.",
      });
    }
  };

  // Table for queue
  const columns: ColumnsType<any> = [
    { title: "Category Name", dataIndex: "supply_cat_name" },
    {
      title: "Action",
      render: (_: any, _record: any, index: number) => (
        <Button danger size="small" onClick={() => handleRemoveFromList(index)}>
          Remove
        </Button>
      ),
    },
  ];

  return (
    <Modal
      title="Add New Supply Category"
      open={isAddModalVisible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Form layout="vertical" form={form}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Supply Category Name"
              name="supply_cat_name"
              rules={[
                { required: true, message: "Supply category name is required" },
              ]}
            >
              <Input placeholder="Enter supply category name" />
            </Form.Item>
          </Col>
        </Row>

        <div className="flex justify-end gap-2 mb-4">
          <Button onClick={() => form.resetFields()}>Clear</Button>
          <Button
            onClick={() => {
              form
                .validateFields()
                .then((values) => handleSubmitOne(values))
                .catch(() => {});
            }}
          >
            Add One
          </Button>
          <Button
            type="primary"
            onClick={() => {
              form
                .validateFields()
                .then((values) => handleAddToList(values))
                .catch(() => {});
            }}
          >
            Add to List
          </Button>
        </div>
      </Form>

      {/* Queue Table */}
      {categoryList.length > 0 && (
        <>
          <Table
            dataSource={categoryList}
            columns={columns}
            rowKey={(_, index) => index!.toString()}
            pagination={false}
            size="small"
            scroll={{ x: 500 }} // ✅ scrollable horizontally & vertically
          />
          <div className="flex justify-end mt-3">
            <Button type="primary" onClick={handleSubmitAll}>
              Insert All
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default AddSupplyCategories;
