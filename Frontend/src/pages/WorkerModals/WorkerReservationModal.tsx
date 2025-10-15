import { Button, Card, Col, Form, Input, Modal, Row, Tabs } from "antd";
import axios from "axios";
import { useState } from "react";
import Swal from "sweetalert2";

const WorkerReservationModal = ({
  visible,
  reservation,
  client,
  apiUrl,
  onClose,
}: any) => {
  const [emailContent, setEmailContent] = useState({ body: "" });

  const formatDate = (date: string) =>
    new Date(date).toISOString().split("T")[0];

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const d = new Date();
    d.setHours(hours);
    d.setMinutes(minutes);
    return d.toLocaleTimeString("en-PH", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const formatDateTime = (date: string, time: string) =>
    `${formatDate(date)} ${formatTime(time)}`;

  const handleSendEmail = () => {
    if (!reservation) return;
    const emailData = {
      user_id: reservation.user_id,
      email: reservation.email,
      full_name: reservation.full_name,
      body: emailContent.body,
    };
    axios
      .post(`${apiUrl}/send_reservation_email`, emailData)
      .then(() => {
        Swal.fire("Sent!", "Email sent successfully.", "success");
        setEmailContent({ body: "" });
      })
      .catch(() => Swal.fire("Error", "Failed to send email.", "error"));
  };

  const tabItems = [
    {
      key: "1",
      label: "Customer Details",
      children: reservation && (
        <div style={{ padding: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Card title="Name" bordered={false}>
                {reservation.full_name}
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Contact" bordered={false}>
                {reservation.pnum}
              </Card>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Card title="Email" bordered={false}>
                {reservation.email}
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Address" bordered={false}>
                {client?.address || "N/A"}
              </Card>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Card title="Reservation Time" bordered={false}>
                {formatDateTime(
                  reservation.reservation_date,
                  reservation.reservation_time
                )}
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Special Requests" bordered={false}>
                {reservation.special_request || "None"}
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: "2",
      label: "Compose Email",
      children: reservation && (
        <Form layout="vertical" style={{ padding: 16 }}>
          <Form.Item label="Email">
            <Input value={reservation.email} disabled />
          </Form.Item>
          <Form.Item label="Message">
            <Input.TextArea
              rows={4}
              value={emailContent.body}
              onChange={(e) =>
                setEmailContent({ ...emailContent, body: e.target.value })
              }
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              onClick={handleSendEmail}
              disabled={!emailContent.body.trim()}
            >
              Send Email
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <Modal
      title="Reservation Details"
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      width={700}
    >
      {reservation && <Tabs defaultActiveKey="1" items={tabItems} />}
    </Modal>
  );
};

export default WorkerReservationModal;
