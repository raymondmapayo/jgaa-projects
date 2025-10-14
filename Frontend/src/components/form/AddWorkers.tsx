/* eslint-disable @typescript-eslint/no-explicit-any */
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
import React from "react";

interface AddWorkersFormProps {
  isAddModalVisible: boolean;
  onClose: () => void;
  onAddWorker: (values: any) => void;
}
const apiUrl = import.meta.env.VITE_API_URL;
const AddWorkers: React.FC<AddWorkersFormProps> = ({
  isAddModalVisible,
  onClose,
  onAddWorker,
}) => {
  const [form] = Form.useForm();

  const handleFinish = async (values: any) => {
    console.log("Form Submitted:", values);

    // Ensure files are selected
    if (!values.profile_pic?.fileList?.[0] || !values.id_pic?.fileList?.[0]) {
      notification.error({
        message: "Error",
        description: "Profile picture and ID picture are required.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("fname", values.fname);
    formData.append("lname", values.lname);
    formData.append("pnum", values.pnum);
    formData.append("email", values.email);
    formData.append("address", values.address);
    formData.append("password", values.password);
    formData.append(
      "profile_pic",
      values.profile_pic.fileList[0].originFileObj
    );
    formData.append("id_pic", values.id_pic.fileList[0].originFileObj);

    try {
      const response = await axios.post(`${apiUrl}/add_workers`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("API Response:", response.data);

      notification.success({
        message: "Worker Added",
        description: "New worker has been added successfully!",
      });

      form.resetFields();
      onClose();
      onAddWorker(response.data); // Ensure added worker details are passed
    } catch (error) {
      console.error("Error adding worker:", error);
      notification.error({
        message: "Error",
        description: "Failed to add worker. Please try again later.",
      });
    }
  };

  return (
    <Modal
      title="Add New Worker"
      open={isAddModalVisible}
      onCancel={onClose}
      footer={null}
    >
      <Form layout="vertical" form={form} onFinish={handleFinish}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="First Name"
              name="fname"
              rules={[{ required: true, message: "First Name is required" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Last Name"
              name="lname"
              rules={[{ required: true, message: "Last Name is required" }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: "Email is required" }]}
            >
              <Input type="email" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Phone Number"
              name="pnum"
              rules={[{ required: true, message: "Phone Number is required" }]}
            >
              <Input type="number" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: "Password is required" }]}
            >
              <Input.Password />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Confirm Password"
              name="confirm_password"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm your password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match"));
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Profile Picture"
              name="profile_pic"
              rules={[
                { required: true, message: "Profile Picture is required" },
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

                  return false; // Prevent automatic upload
                }}
                maxCount={1}
                listType="picture"
              >
                <Button icon={<UploadOutlined />}>
                  Upload Profile Picture
                </Button>
              </Upload>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="ID Picture"
              name="id_pic"
              rules={[{ required: true, message: "ID Picture is required" }]}
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

                  return false; // Prevent automatic upload
                }}
                maxCount={1}
                listType="picture"
              >
                <Button icon={<UploadOutlined />}>Upload ID Picture</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Address" name="address">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Col>
        </Row>

        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            Add Worker
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddWorkers;
