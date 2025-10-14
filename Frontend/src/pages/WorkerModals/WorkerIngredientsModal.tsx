import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, message, Modal, Row, Select } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";

interface WorkerIngredientsModalProps {
  visible: boolean;
  onClose: () => void;
  onIngredientAdded?: (newIngredients: any[], category: string) => void;
}

interface MenuItem {
  menu_id: number;
  item_name: string;
}
const apiUrl = import.meta.env.VITE_API_URL;
const WorkerIngredientsModal: React.FC<WorkerIngredientsModalProps> = ({
  visible,
  onClose,
  onIngredientAdded, // <-- destructure here
}) => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState<MenuItem[]>([]);

  const unitOptions = ["kg", "g", "ml", "liters"];

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${apiUrl}/menu_items`);
      setCategories(res.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    if (visible) fetchCategories();
  }, [visible]);

  const handleAddIngredient = async (values: any) => {
    try {
      const addedIngredients = [];
      for (const ing of values.ingredients) {
        const res = await axios.post(`${apiUrl}/add_ingredients`, {
          ingredients_name: ing.name,
          measurement: ing.measurement,
          unit: ing.unit,
          category: values.category,
        });
        addedIngredients.push(res.data.ingredient); // <-- push inserted ingredient
      }

      message.success("Ingredients added successfully!");
      form.resetFields();

      if (onIngredientAdded)
        onIngredientAdded(addedIngredients, values.category);

      onClose();
    } catch (error) {
      console.error("Error adding ingredients:", error);
      message.error("Failed to add ingredients");
    }
  };

  return (
    <Modal
      title="Add Ingredient"
      visible={visible}
      onCancel={onClose}
      footer={null}
      width="90%" // responsive width
      style={{ maxWidth: 650 }} // max width for large screens
    >
      <Form form={form} onFinish={handleAddIngredient} layout="vertical">
        {/* Food Name / Category */}
        <Form.Item
          label="Food Name"
          name="category"
          rules={[{ required: true, message: "Please select a category" }]}
        >
          <Select placeholder="Select Food Name" style={{ width: "100%" }}>
            {categories.map((cat) => (
              <Select.Option key={cat.menu_id} value={cat.item_name}>
                {cat.item_name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Dynamic Ingredient List */}
        <Form.List
          name="ingredients"
          initialValue={[{ name: "", measurement: "", unit: "" }]}
        >
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }, index) => (
                <Row
                  key={key}
                  gutter={[16, 8]}
                  align="middle"
                  style={{ marginBottom: 8 }}
                >
                  <Col xs={24} sm={24} md={8}>
                    <Form.Item
                      {...restField}
                      label={index === 0 ? "Ingredient Name" : ""}
                      name={[name, "name"]}
                      rules={[
                        { required: true, message: "Enter ingredient name" },
                      ]}
                      style={{ marginBottom: 0 }}
                    >
                      <Input
                        placeholder="e.g., Tomato"
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={7}>
                    <Form.Item
                      {...restField}
                      label={index === 0 ? "Measurement" : ""}
                      name={[name, "measurement"]}
                      rules={[{ required: true, message: "Enter measurement" }]}
                      style={{ marginBottom: 0 }}
                    >
                      <Input
                        placeholder="e.g., 1, 1/2, 1/4, pinch"
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={7}>
                    <Form.Item
                      {...restField}
                      label={index === 0 ? "Unit" : ""}
                      name={[name, "unit"]}
                      rules={[{ required: true, message: "Select unit" }]}
                      style={{ marginBottom: 0 }}
                    >
                      <Select
                        placeholder="Select Unit"
                        style={{ width: "100%" }}
                      >
                        {unitOptions.map((unit) => (
                          <Select.Option key={unit} value={unit}>
                            {unit}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col
                    xs={24}
                    sm={24}
                    md={2}
                    className="flex justify-center mt-2 md:mt-0"
                  >
                    {fields.length > 1 && (
                      <MinusCircleOutlined
                        className="text-red-500 text-lg"
                        onClick={() => remove(name)}
                      />
                    )}
                  </Col>
                </Row>
              ))}

              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add More Ingredient
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item className="flex justify-end">
          <Button
            type="primary"
            htmlType="submit"
            className="bg-orange-500 hover:!bg-orange-600"
          >
            Add Ingredient(s)
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default WorkerIngredientsModal;
