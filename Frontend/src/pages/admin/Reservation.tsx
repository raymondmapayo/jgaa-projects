import {
  Badge,
  Button,
  Calendar,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Tabs,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import styled from "styled-components";
import Swal from "sweetalert2";

interface Reservation {
  reservation_id: number;
  user_id: number;
  email: string;
  full_name: string;
  reservation_time: string;
  reservation_date: string;
  table_ids: string;
  pnum: string;
  num_of_people: number;
  status: string;
  payment_status: string;
  table_status: string;
  special_request: string;
  address: string;
}

interface Client {
  user_id: number;
  fname: string;
  lname: string;
  address: string;
}

const StyledContainer = styled.div`
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;

  .dark & {
    background-color: #001f3f;
    color: white;
  }

  /* Fix for date number box */
  .dark .ant-picker-calendar-date {
    background-color: #002244 !important;
    color: white !important;
    border-color: #003366;
  }

  /* Fix for today’s border */
  .dark .ant-picker-cell-today .ant-picker-calendar-date {
    border-color: #ffa940;
  }

  /* Fix for hover on date */
  .dark .ant-picker-calendar-date:hover {
    background-color: #003366;
  }

  /* Fix for selected cell */
  .dark .ant-picker-cell-selected .ant-picker-calendar-date {
    background-color: #1890ff;
    color: white;
  }

  /* Optional: adjust cell padding */
  .dark .ant-picker-cell {
    padding: 4px;
  }
`;

const StyledModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  .info-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f0f0f0;
    padding: 8px 0;
    &:last-child {
      border-bottom: none;
    }
  }
  .info-label {
    font-weight: bold;
    color: #555;
  }
  .info-value {
    color: #333;
  }
`;

const AdminReservation = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedReservations, setSelectedReservations] = useState<
    Reservation[]
  >([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [emailContent, setEmailContent] = useState({ body: "" });

  useEffect(() => {
    axios
      .get("http://localhost:8081/get_reservation")
      .then((res) => setReservations(res.data))
      .catch((err) => console.error("Error fetching reservations:", err));

    axios
      .get("http://localhost:8081/get_clients")
      .then((res) => setClients(res.data))
      .catch((err) => console.error("Error fetching clients:", err));
  }, []);

  const formatDate = (date: string) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return date.toLocaleTimeString("en-PH", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const formatDateTime = (date: string, time: string) => {
    return `${formatDate(date)} ${formatTime(time)}`;
  };

  // Delete reservation handler
  const handleDeleteReservation = (reservation_id: number) => {
    const reservation = reservations.find(
      (r) => r.reservation_id === reservation_id
    );
    if (!reservation) {
      console.error("Reservation not found.");
      return;
    }
    axios
      .delete(
        `http://localhost:8081/delete_reservation/${reservation.user_id}/${reservation_id}`
      )
      .then(() => {
        setReservations((prev) =>
          prev.filter(
            (reservation) => reservation.reservation_id !== reservation_id
          )
        );
        // Also remove from selectedReservations if shown in modal
        setSelectedReservations((prev) =>
          prev.filter(
            (reservation) => reservation.reservation_id !== reservation_id
          )
        );
        // Adjust currentIndex if needed
        if (
          currentIndex >= selectedReservations.length - 1 &&
          currentIndex > 0
        ) {
          setCurrentIndex(currentIndex - 1);
        }
        Swal.fire("Deleted!", "The reservation has been deleted.", "success");
      })
      .catch((error) => {
        console.error("Error deleting reservation:", error);
        Swal.fire("Error", "Failed to delete reservation.", "error");
      });
  };

  // Confirm delete dialog
  const confirmDelete = (reservation_id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action is permanent and cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        handleDeleteReservation(reservation_id);
      }
    });
  };

  // Replaced dateCellRender with new cellRender:
  const cellRender = (current: any, info: { type: string }) => {
    if (info.type !== "date") return null; // only render for date cells

    const nativeDate = current.toDate();
    const dateStr = formatDate(nativeDate.toISOString());

    const reservationsForDate = reservations.filter(
      (r) => formatDate(r.reservation_date) === dateStr
    );

    if (reservationsForDate.length === 0) return null;

    return (
      <div
        style={{
          fontSize: 10,
          marginTop: 4,
          maxHeight: 90,
          overflowY: "auto",
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
        }}
      >
        {reservationsForDate.map((res, i) => (
          <div
            key={res.reservation_id}
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#fa8c16", // Changed to orange
              color: "#fff",
              borderRadius: 20,
              padding: "2px 8px",
              fontSize: 10,
              height: 22,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              gap: 4,
            }}
          >
            <Button
              type="link"
              style={{
                padding: 0,
                color: "#fff",
                height: 18,
                lineHeight: "18px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedDate(dateStr);
                setSelectedReservations(reservationsForDate);
                setCurrentIndex(i);
                setEmailContent({ body: "" });
                setModalVisible(true);
              }}
            >
              {res.full_name}
            </Button>
            <Button
              type="text"
              danger
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                confirmDelete(res.reservation_id);
              }}
              style={{ color: "#fff", padding: 0, marginLeft: 4 }}
            >
              ×
            </Button>
          </div>
        ))}
      </div>
    );
  };

  const onSelectDate = (value: any) => {
    const nativeDate = value.toDate();
    const dateStr = formatDate(nativeDate.toISOString());
    setSelectedDate(dateStr);
    const reservationsOnDate = reservations.filter(
      (r) => formatDate(r.reservation_date) === dateStr
    );
    if (reservationsOnDate.length === 0) {
      setModalVisible(false);
      setSelectedReservations([]);
      return;
    }
    setSelectedReservations(reservationsOnDate);
    setCurrentIndex(0);
    setEmailContent({ body: "" });
    setModalVisible(true);
  };

  const currentReservation = selectedReservations[currentIndex];
  const currentClient =
    clients.find((c) => c.user_id === currentReservation?.user_id) || null;

  const closeModal = () => {
    setModalVisible(false);
    setSelectedReservations([]);
    setSelectedDate(null);
    setCurrentIndex(0);
    setEmailContent({ body: "" });
  };

  const nextReservation = () => {
    if (currentIndex < selectedReservations.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setEmailContent({ body: "" });
    }
  };

  const prevReservation = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setEmailContent({ body: "" });
    }
  };

  const handleSendEmail = () => {
    if (!currentReservation) return;

    const emailData = {
      user_id: currentReservation.user_id,
      email: currentReservation.email,
      full_name: currentReservation.full_name,
      body: emailContent.body,
    };

    axios
      .post("http://localhost:8081/send_reservation_email", emailData)
      .then(() => {
        Swal.fire("Sent!", "Email sent successfully.", "success");
        setEmailContent({ body: "" });
      })
      .catch(() => {
        Swal.fire("Error", "Failed to send email.", "error");
      });
  };

  // Tabs items for modal
  const tabItems = [
    {
      key: "1",
      label: "Customer Details",
      children: currentReservation && (
        <StyledModalContent>
          <Row gutter={16}>
            <Col span={12}>
              <Card title="Name" bordered={false}>
                <span>{currentReservation.full_name}</span>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Contact" bordered={false}>
                <span>{currentReservation.pnum}</span>
              </Card>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Card title="Email" bordered={false}>
                <span>{currentReservation.email}</span>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Address" bordered={false}>
                <span>{currentClient?.address || "N/A"}</span>
              </Card>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Card title="Reservation Time" bordered={false}>
                <span>
                  {formatDateTime(
                    currentReservation.reservation_date,
                    currentReservation.reservation_time
                  )}
                </span>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Special Requests" bordered={false}>
                <span>{currentReservation.special_request || "None"}</span>
              </Card>
            </Col>
          </Row>
        </StyledModalContent>
      ),
    },
    {
      key: "2",
      label: "Compose Email",
      children: currentReservation && (
        <Form layout="vertical">
          <Form.Item label="Email">
            <Input value={currentReservation?.email} disabled />
          </Form.Item>

          <Form.Item label="Message">
            <Input.TextArea
              rows={4}
              value={emailContent.body}
              onChange={(e) =>
                setEmailContent({
                  ...emailContent,
                  body: e.target.value,
                })
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
    <StyledContainer>
      <h2>Reservation Calendar</h2>
      <Calendar cellRender={cellRender} onSelect={onSelectDate} />

      <Modal
        title={`Reservations for ${selectedDate}`}
        visible={modalVisible}
        onCancel={closeModal}
        footer={[
          <Button
            key="prev"
            onClick={prevReservation}
            disabled={currentIndex === 0}
          >
            Previous
          </Button>,
          <Button
            key="next"
            onClick={nextReservation}
            disabled={currentIndex === selectedReservations.length - 1}
          >
            Next
          </Button>,
          <Button key="close" onClick={closeModal}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {currentReservation && (
          <>
            {/* Reservation Summary Box */}
            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 16,
                marginBottom: 24,
                backgroundColor: "#fafafa",
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <strong>Table Number Reserved:</strong> TABLE{" "}
                  {currentReservation.table_ids}
                </Col>
                <Col span={12}>
                  <strong>Status:</strong>{" "}
                  <Badge
                    status={
                      currentReservation.table_status === "Reserved"
                        ? "error"
                        : "success"
                    }
                    text={currentReservation.table_status}
                  />
                </Col>
                <Col span={12}>
                  <strong>Date Reserved:</strong>{" "}
                  {formatDate(currentReservation.reservation_date)}
                </Col>
                <Col span={12}>
                  <strong>No. of People:</strong>{" "}
                  {currentReservation.num_of_people}
                </Col>
                <Col span={12}>
                  <strong>Payment Status:</strong>{" "}
                  {currentReservation.payment_status}
                </Col>
                <Col span={12}>
                  <strong>Date of Arrival:</strong>{" "}
                  {formatDateTime(
                    currentReservation.reservation_date,
                    currentReservation.reservation_time
                  )}
                </Col>
              </Row>
            </div>

            {/* Tabs with items */}
            <Tabs defaultActiveKey="1" items={tabItems} />
          </>
        )}
      </Modal>
    </StyledContainer>
  );
};

export default AdminReservation;
