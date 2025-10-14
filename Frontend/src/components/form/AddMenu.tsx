/* eslint-disable @typescript-eslint/no-explicit-any */
import { UploadOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  Radio,
  Row,
  Select,
  Table,
  Upload,
  notification,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import axios from "axios";
import React, { useEffect, useState } from "react";

interface AddMenuFormProps {
  isAddModalVisible: boolean;
  onClose: () => void;
  onAddMenu: (values: any) => void;
}

const AddMenuForm: React.FC<AddMenuFormProps> = ({
  isAddModalVisible,
  onClose,
  onAddMenu,
}) => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Temporary queue (list of menu items)
  const [menuList, setMenuList] = useState<any[]>([]);
  const [existingMenus, setExistingMenus] = useState<any[]>([]); // ✅ DB menus
  const apiUrl = import.meta.env.VITE_API_URL;
  // Fetch Categories and Existing Menus from Backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, menuRes] = await Promise.all([
          axios.get(`${apiUrl}/categories`),
          axios.get(`${apiUrl}/menu_items`),
        ]);
        setCategories(catRes.data);
        setExistingMenus(menuRes.data);
      } catch (error: unknown) {
        console.error("Error fetching data:", error);
        notification.error({
          message: "Error",
          description: "Failed to fetch categories or menus. Please try again.",
        });
      }
    };
    if (isAddModalVisible) fetchData();
  }, [isAddModalVisible]);

  // Add to queue instead of submitting directly
  const handleAddToList = (values: any) => {
    const file = values.menu_img?.fileList?.[0]?.originFileObj;
    if (!file) {
      notification.error({
        message: "Error",
        description: "Menu image is required.",
      });
      return;
    }

    // ✅ Duplicate check (DB + queue)
    const normalize = (name: string) => name.toLowerCase().trim();
    const isDuplicate =
      existingMenus.some(
        (menu) => normalize(menu.item_name) === normalize(values.item_name)
      ) ||
      menuList.some(
        (menu) => normalize(menu.item_name) === normalize(values.item_name)
      );

    if (isDuplicate) {
      notification.error({
        message: "Duplicate Food Name",
        description: `This "${values.item_name}" already exists in the database or in your queue.`,
      });
      return;
    }

    const newItem = {
      ...values,
      menu_img: file,
      categoryName:
        categories.find((c) => c.categories_id === values.categories_id)
          ?.categories_name || "",
    };

    setMenuList([...menuList, newItem]);
    form.resetFields();
    setSelectedCategory(null);
  };

  // Remove from queue
  const handleRemoveFromList = (index: number) => {
    const updated = [...menuList];
    updated.splice(index, 1);
    setMenuList(updated);
  };

  // Submit one item immediately
  const handleSubmitOne = async (values: any) => {
    const file = values.menu_img?.fileList?.[0]?.originFileObj;
    if (!file) {
      notification.error({
        message: "Error",
        description: "Menu image is required.",
      });
      return;
    }

    // ✅ Duplicate check (DB only)
    const normalize = (name: string) => name.toLowerCase().trim();
    const isDuplicate = existingMenus.some(
      (menu) => normalize(menu.item_name) === normalize(values.item_name)
    );
    if (isDuplicate) {
      notification.error({
        message: "Duplicate Food Name",
        description: `"${values.item_name}" already exists in the database.`,
      });
      return;
    }

    const formData = new FormData();
    formData.append("item_name", values.item_name);
    formData.append("price", values.price);
    formData.append("description", values.description || "");
    formData.append("categories_id", values.categories_id);
    formData.append("quantity", values.quantity);
    formData.append("menu_img", file);

    try {
      const response = await axios.post(`${apiUrl}/add_menu`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      notification.success({
        message: "Menu Added",
        description: "Menu item has been added successfully!",
      });

      form.resetFields();
      setSelectedCategory(null);
      onAddMenu(response.data);
    } catch (error) {
      console.error("Error adding menu:", error);
      notification.error({
        message: "Error",
        description: "Failed to add menu. Please try again.",
      });
    }
  };

  // Submit all queued items
  const handleSubmitAll = async () => {
    for (const item of menuList) {
      const formData = new FormData();
      formData.append("item_name", item.item_name);
      formData.append("price", item.price);
      formData.append("description", item.description || "");
      formData.append("categories_id", item.categories_id);

      formData.append("menu_img", item.menu_img);

      try {
        const response = await axios.post(`${apiUrl}/add_menu`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        onAddMenu(response.data);
      } catch (error) {
        console.error("Error adding menu:", error);
      }
    }

    notification.success({
      message: "Menus Added",
      description: "All queued menu items have been added successfully!",
    });

    setMenuList([]);
    onClose();
  };

  const columns: ColumnsType<any> = [
    { title: "Food Name", dataIndex: "item_name" },
    { title: "Category", dataIndex: "categoryName" },
    {
      title: "Menu Image",
      dataIndex: "menu_img",
      render: (file: File) => {
        if (!file) return null;
        const url = URL.createObjectURL(file);
        return (
          <img
            src={url}
            alt="menu"
            style={{ width: 50, height: 50, objectFit: "cover" }}
          />
        );
      },
    },
    { title: "Price", dataIndex: "price" },

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
      title="Add New Menu"
      open={isAddModalVisible}
      onCancel={onClose}
      footer={null}
      width={500}
    >
      <Form layout="vertical" form={form}>
        {/* First Row: Food Name & Category */}
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
              label="Category"
              name="categories_id"
              rules={[{ required: true, message: "Category is required" }]}
            >
              <Select
                placeholder="Select a category"
                optionLabelProp="label"
                value={selectedCategory}
                onChange={(val) => {
                  setSelectedCategory(val);
                  form.setFieldsValue({ categories_id: val });
                }}
              >
                {categories.map((category: any) => (
                  <Select.Option
                    key={category.categories_id}
                    value={category.categories_id}
                    label={category.categories_name}
                  >
                    <Radio
                      checked={selectedCategory === category.categories_id}
                      style={{ pointerEvents: "none", marginRight: 8 }}
                    />
                    {category.categories_name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Second Row: Price */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Price"
              name="price"
              rules={[{ required: true, message: "Price is required" }]}
            >
              <Input type="number" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Menu Image"
              name="menu_img"
              rules={[{ required: true, message: "Menu image is required" }]}
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
                <Button icon={<UploadOutlined />}>Upload Image</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>

        {/* Third Row: Description */}
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Description" name="description">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Col>
        </Row>

        {/* Buttons under form */}
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
      {menuList.length > 0 && (
        <>
          <Table
            dataSource={menuList}
            columns={columns}
            rowKey={(_, index) => index!.toString()}
            pagination={false}
            scroll={{ x: 800 }} // 👈 enable horizontal scroll
            size="small"
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

export default AddMenuForm;
