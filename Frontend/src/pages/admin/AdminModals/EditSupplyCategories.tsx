import { Button, Col, Form, Input, Modal, notification, Row, Spin } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";

interface SupplyCategoryItem {
  cat_supply_id: number;
  supply_cat_name: string;
}

interface EditSupplyCategoriesProps {
  isEditModalVisible: boolean;
  setIsEditModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  selectedItem: SupplyCategoryItem | null;
}

const EditSupplyCategories: React.FC<EditSupplyCategoriesProps> = ({
  isEditModalVisible,
  setIsEditModalVisible,
  selectedItem,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedItem) {
      form.setFieldsValue({
        supply_cat_name: selectedItem.supply_cat_name,
      });
    }
  }, [selectedItem, form]);

  const handleFinish = async (values: any) => {
    if (!selectedItem) return;
    setLoading(true);

    try {
      await axios.put(
        `http://localhost:8081/update_supply_category/${selectedItem.cat_supply_id}`,
        values
      );

      notification.success({
        message: "Supply Category Updated",
        description: "Supply category updated successfully!",
      });

      form.resetFields();
      setIsEditModalVisible(false); // ✅ just close modal
    } catch (error) {
      console.error("Error updating supply category:", error);
      notification.error({
        message: "Error",
        description: "Failed to update supply category. Try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Edit Supply Category"
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
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Supply Category Name"
                name="supply_cat_name"
                rules={[
                  {
                    required: true,
                    message: "Supply category name is required",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          {loading && (
            <Row justify="center" style={{ marginBottom: "15px" }}>
              <Col>
                <Spin /> Saving changes...
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
              <Button type="primary" htmlType="submit" loading={loading}>
                Save Changes
              </Button>
            </Col>
          </Row>
        </Form>
      )}
    </Modal>
  );
};

export default EditSupplyCategories;
