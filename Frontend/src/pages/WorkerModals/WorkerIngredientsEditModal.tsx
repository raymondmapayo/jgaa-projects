// src/WorkerModals/WorkerIngredientsEditModal.tsx
import { MinusCircleOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, message, Modal, Row, Select } from "antd";
import axios from "axios";
import React, { useEffect } from "react";

interface Ingredient {
  ingredients_id: number; // ✅ make it required
  ingredients_name: string;
  measurement: string;
  unit: string;
}

interface EditIngredientData {
  menu_id: number;
  item_name: string;
  ingredients: Ingredient[];
}

interface WorkerIngredientsEditModalProps {
  visible: boolean;
  onClose: () => void;
  ingredientData: EditIngredientData;
  onIngredientsUpdated?: (
    updatedIngredients: Ingredient[],
    menu_id: number
  ) => void;
}
const apiUrl = import.meta.env.VITE_API_URL;
const WorkerIngredientsEditModal: React.FC<WorkerIngredientsEditModalProps> = ({
  visible,
  onClose,
  ingredientData,
  onIngredientsUpdated, // <-- add this line
}) => {
  const [form] = Form.useForm();
  const unitOptions = ["kg", "g", "ml", "liters"];

  useEffect(() => {
    if (visible && ingredientData) {
      form.setFieldsValue({
        ingredients: ingredientData.ingredients.map((ing) => ({
          ingredients_id: ing.ingredients_id,
          ingredients_name: ing.ingredients_name,
          measurement: ing.measurement,
          unit: ing.unit,
        })),
      });
    }
  }, [visible, ingredientData, form]);

  const handleUpdateIngredients = async (values: {
    ingredients: Ingredient[];
  }) => {
    try {
      const updatedIngredients: Ingredient[] = [];
      const created_by = sessionStorage.getItem("user_id"); // ✅ get worker ID

      for (const ing of values.ingredients) {
        if (ing.ingredients_id) {
          await axios.put(`${apiUrl}/update_ingredient/${ing.ingredients_id}`, {
            ingredients_name: ing.ingredients_name,
            measurement: ing.measurement,
            unit: ing.unit,
            created_by, // ✅ include user ID
          });
          updatedIngredients.push(ing);
        }
      }

      message.success("Ingredients updated successfully!");

      if (onIngredientsUpdated) {
        onIngredientsUpdated(updatedIngredients, ingredientData.menu_id);
      }

      onClose();
    } catch (error) {
      console.error("Error updating ingredients:", error);
      message.error("Failed to update ingredients");
    }
  };

  return (
    <Modal
      title={`Edit Ingredients - ${ingredientData.item_name}`}
      visible={visible}
      onCancel={onClose}
      footer={null}
      width="90%"
      style={{ maxWidth: 650 }}
    >
      <Form form={form} onFinish={handleUpdateIngredients} layout="vertical">
        <Form.List name="ingredients">
          {(fields) => (
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
                      name={[name, "ingredients_name"]}
                      rules={[
                        { required: true, message: "Enter ingredient name" },
                      ]}
                      label={index === 0 ? "Ingredient Name" : ""}
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
                      name={[name, "measurement"]}
                      rules={[{ required: true, message: "Enter measurement" }]}
                      label={index === 0 ? "Measurement" : ""}
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
                      name={[name, "unit"]}
                      rules={[{ required: true, message: "Select unit" }]}
                      label={index === 0 ? "Unit" : ""}
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
                        onClick={() =>
                          form.setFieldsValue({
                            ingredients: form
                              .getFieldValue("ingredients")
                              .filter((_: any, i: number) => i !== name),
                          })
                        }
                      />
                    )}
                  </Col>
                </Row>
              ))}
            </>
          )}
        </Form.List>

        {/* Move button lower with margin */}
        <div className="mt-6 flex justify-end">
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-orange-500 hover:!bg-orange-600"
            >
              Update Ingredient(s)
            </Button>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default WorkerIngredientsEditModal;
