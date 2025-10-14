import {
  Button,
  Checkbox,
  Col,
  Input,
  List,
  notification,
  Row,
  Spin,
} from "antd";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import axios from "axios";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

type Worker = {
  id: string;
  name: string;
  profile_pic: string;
};

type AnnouncementFormData = {
  title: string;
  message: string;
  audience: string;
};

const AdminAnnouncement: React.FC = () => {
  // Fetch adminUserId internally from sessionStorage
  const adminUserId = Number(sessionStorage.getItem("user_id"));

  const [workersData, setWorkersData] = useState<Worker[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>([]);
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: "",
    message: "",
    audience: "all",
  });
  const [workerAnnouncements, setWorkerAnnouncements] = useState<{
    [workerId: string]: {
      announcement_id: number;
      title: string;
      status: string;
    }[];
  }>({});
  const [loading, setLoading] = useState<boolean>(false);

  const socket = useRef<Socket>(io("http://localhost:8081"));

  useEffect(() => {
    if (!adminUserId) return; // Stop if adminUserId not available

    const s = socket.current;

    // Join admin room
    s.emit("joinAdminRoom", adminUserId);

    s.on("announcement_status", (msg) => {
      setWorkerAnnouncements((prevState) => {
        const updatedState = { ...prevState };
        const { workerId, announcementId, status } = msg;

        if (updatedState[workerId]) {
          updatedState[workerId] = updatedState[workerId].map((announcement) =>
            announcement.announcement_id === announcementId
              ? { ...announcement, status }
              : announcement
          );
        } else {
          updatedState[workerId] = [
            { announcement_id: announcementId, title: msg.title, status },
          ];
        }

        return updatedState;
      });

      notification.success({
        message: "Announcement Status Updated",
        description: msg,
      });
    });

    s.on("error", (errMsg) => {
      console.error("Server error:", errMsg);
      notification.error({
        message: "Server Error",
        description: errMsg,
      });
    });

    return () => {
      s.off("announcement_status");
      s.off("error");
      s.disconnect();
    };
  }, [adminUserId]);

  // Fetch worker announcements
  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:8081/get_workers_read_and_unread")
      .then((res) => setWorkerAnnouncements(res.data))
      .catch((err) =>
        notification.error({
          message: "Failed to load announcements status",
          description: err.message,
        })
      )
      .finally(() => setLoading(false));

    const interval = setInterval(() => {
      axios
        .get("http://localhost:8081/get_workers_read_and_unread")
        .then((res) => setWorkerAnnouncements(res.data))
        .catch((err) => console.error(err));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Fetch workers
  useEffect(() => {
    fetch("http://localhost:8081/get_client")
      .then((res) => res.json())
      .then((data) => {
        const workers: Worker[] = data.map((user: any) => ({
          id: user.user_id.toString(),
          name: `${user.fname} ${user.lname}`,
          profile_pic: user.profile_pic,
        }));
        setWorkersData(workers);
      })
      .catch((err) => {
        console.error("Failed to fetch workers:", err);
        notification.error({
          message: "Failed to load workers",
          description: "Could not fetch workers from server.",
        });
      });
  }, []);

  const filteredWorkers = useMemo(
    () =>
      workersData.filter((worker) =>
        worker.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [searchTerm, workersData]
  );

  const allSelected =
    filteredWorkers.length > 0 &&
    filteredWorkers.every((worker) => selectedWorkerIds.includes(worker.id));
  const someSelected =
    filteredWorkers.some((worker) => selectedWorkerIds.includes(worker.id)) &&
    !allSelected;

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchTerm(e.target.value);

  const onWorkerCheckboxChange = (workerId: string, checked: boolean) => {
    if (checked) {
      setSelectedWorkerIds((prev) => [...prev, workerId]);
    } else {
      setSelectedWorkerIds((prev) => prev.filter((id) => id !== workerId));
    }
  };

  const onSelectAllChange = (e: CheckboxChangeEvent) => {
    if (e.target.checked) {
      const newSelected = [
        ...new Set([...selectedWorkerIds, ...filteredWorkers.map((w) => w.id)]),
      ];
      setSelectedWorkerIds(newSelected);
    } else {
      const filteredIds = filteredWorkers.map((w) => w.id);
      setSelectedWorkerIds((prev) =>
        prev.filter((id) => !filteredIds.includes(id))
      );
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminUserId) {
      notification.error({
        message: "Error",
        description: "Admin user is not logged in.",
      });
      return;
    }

    if (selectedWorkerIds.length === 0) {
      notification.warning({
        message: "No workers selected",
        description:
          "Please select at least one worker to send the announcement.",
      });
      return;
    }

    const announcementData = {
      title: formData.title,
      message: formData.message,
      sender_id: adminUserId,
      recipient_ids: selectedWorkerIds.map((id) => parseInt(id, 10)),
    };

    try {
      const response = await axios.post(
        "http://localhost:8081/send_announcement_to_worker",
        announcementData
      );

      socket.current.emit("send_announcement", announcementData);

      notification.open({
        message: "Announcement submitted!",
        description: response.data.message,
        duration: 3,
        showProgress: true,
        pauseOnHover: false,
      });

      setTimeout(() => {
        setFormData({ title: "", message: "", audience: "all" });
        setSelectedWorkerIds([]);
      }, 3000);
    } catch (error: any) {
      notification.error({
        message: "Error",
        description:
          error.response?.data?.error ||
          error.message ||
          "Failed to send announcement.",
      });
    }
  };

  return (
    <Row
      gutter={24}
      className="p-6 bg-white dark:bg-[#001f3f] rounded shadow-md"
      style={{ minHeight: "500px" }}
    >
      {/* Left: Worker selection */}
      <Col xs={24} sm={10} md={8} lg={6} className="border-r pr-4">
        <h2 className="text-xl font-semibold mb-4">Select Workers</h2>
        <Input.Search
          placeholder="Search workers"
          value={searchTerm}
          onChange={onSearchChange}
          allowClear
          style={{ marginBottom: 16 }}
        />

        <Checkbox
          indeterminate={someSelected}
          checked={allSelected}
          onChange={onSelectAllChange}
          style={{ marginBottom: 8 }}
          className="mb-2 dark:text-white"
        >
          Select All
        </Checkbox>

        <div
          style={{
            maxHeight: "400px",
            overflowY: "auto",
            border: "1px solid #d9d9d9",
            borderRadius: 4,
            padding: 8,
          }}
        >
          <List
            dataSource={filteredWorkers}
            renderItem={(worker) => (
              <List.Item key={worker.id} className="px-2">
                <Checkbox
                  checked={selectedWorkerIds.includes(worker.id)}
                  onChange={(e) =>
                    onWorkerCheckboxChange(worker.id, e.target.checked)
                  }
                >
                  <div className="flex items-center mb-2 dark:text-white">
                    <img
                      src={`http://localhost:8081/uploads/images/${worker.profile_pic}`}
                      alt={worker.name}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    {worker.name}
                  </div>
                </Checkbox>
              </List.Item>
            )}
            locale={{ emptyText: "No workers found" }}
          />
        </div>
      </Col>

      {/* Right: Announcement form */}
      <Col xs={24} sm={14} md={16} lg={11} className="pl-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          Create Announcement
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-white mb-1"
            >
              Title
            </label>
            <input
              type="text"
              name="title"
              id="title"
              placeholder="Announcement title"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.title}
              onChange={handleFormChange}
              required
            />
          </div>
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 dark:text-white mb-1"
            >
              Message
            </label>
            <textarea
              name="message"
              id="message"
              placeholder="Write your announcement here..."
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.message}
              onChange={handleFormChange}
              required
            />
          </div>
          <div>
            <Button type="primary" htmlType="submit" block>
              Post Announcement
            </Button>
          </div>
        </form>
      </Col>

      {/* Right: Announcement status */}
      <Col xs={24} sm={7} md={8} lg={7} className="pl-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          Announcements Status
        </h2>
        <div
          style={{
            maxHeight: "400px",
            overflowY: "auto",
            border: "1px solid #d9d9d9",
            borderRadius: 4,
            padding: 8,
          }}
        >
          {loading ? (
            <Spin size="large" />
          ) : Object.keys(workerAnnouncements || {}).length === 0 ? (
            <p className="text-gray-500">
              No announcement status data available.
            </p>
          ) : (
            <List
              dataSource={Object.entries(workerAnnouncements || {})}
              renderItem={([workerId, announcements]) => {
                const worker = workersData.find((w) => w.id === workerId);
                return (
                  <List.Item key={workerId} className="px-2">
                    <div className="flex flex-col w-full">
                      <div className="flex items-center mb-2">
                        {worker ? (
                          <>
                            <img
                              src={`http://localhost:8081/uploads/images/${worker.profile_pic}`}
                              alt={worker.name}
                              className="w-8 h-8 rounded-full mr-2 object-cover"
                            />
                            <strong>{worker.name}</strong>
                          </>
                        ) : (
                          <strong>Worker ID: {workerId}</strong>
                        )}
                      </div>
                      {announcements.length === 0 ? (
                        <p className="text-gray-500">No announcements.</p>
                      ) : (
                        <ul className="list-disc list-inside text-sm">
                          {announcements.map(
                            ({ announcement_id, title, status }) => (
                              <li
                                key={announcement_id}
                                className={
                                  status === "read"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                {title} — <em>{status.toUpperCase()}</em>
                              </li>
                            )
                          )}
                        </ul>
                      )}
                    </div>
                  </List.Item>
                );
              }}
              locale={{ emptyText: "No workers found" }}
            />
          )}
        </div>
      </Col>
    </Row>
  );
};

export default AdminAnnouncement;
