import { Button, Form, Input, Modal, notification } from "antd";
import axios from "axios";
import { useEffect } from "react";

interface EditSupplyCategoriesProps {
  isEditModalVisible: boolean;
  setIsEditModalVisible: (visible: boolean) => void;
  selectedItem: any;
}

const EditSupplyCategories: React.FC<EditSupplyCategoriesProps> = ({
  isEditModalVisible,
  setIsEditModalVisible,
  selectedItem,
}) => {
  const [form] = Form.useForm();
  const apiUrl = import.meta.env.VITE_API_URL;
  // ✅ When modal opens, fill form fields with selected item
  useEffect(() => {
    if (selectedItem) {
      form.setFieldsValue({
        supply_cat_name: selectedItem.supply_cat_name,
      });
    }
  }, [selectedItem, form]);

  // ✅ Handle form submit
  const handleFinish = async (values: any) => {
    try {
      const created_by = sessionStorage.getItem("user_id"); // ✅ from session storage

      const response = await axios.put(
        `${apiUrl}/update_supply_category/${selectedItem.cat_supply_id}`,
        {
          supply_cat_name: values.supply_cat_name,
          created_by, // ✅ include the creator ID
        }
      );

      if (response.data) {
        notification.success({
          message: "Success",
          description: "Supply category updated successfully!",
        });
        setIsEditModalVisible(false);
      } else {
        notification.error({
          message: "Error",
          description: "Failed to update supply category. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error updating category:", error);
      notification.error({
        message: "Error",
        description: "An error occurred while updating the supply category.",
      });
    }
  };

  return (
    <Modal
      title="Edit Supply Category"
      open={isEditModalVisible}
      onCancel={() => setIsEditModalVisible(false)}
      footer={null}
      centered
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          supply_cat_name: selectedItem?.supply_cat_name || "",
        }}
      >
        <Form.Item
          label="Category Name"
          name="supply_cat_name"
          rules={[{ required: true, message: "Please enter a category name!" }]}
        >
          <Input placeholder="Enter supply category name" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Update Category
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditSupplyCategories;
