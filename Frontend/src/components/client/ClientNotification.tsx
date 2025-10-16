import { Badge, List, notification, Popover, Spin } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { FaBell } from "react-icons/fa";

interface Notification {
  client_notification_id: number;
  message: string;
  created_at: string;
  status: string; // "unread" or "read"
  sender_id: number;
}

interface ClientNotificationProps {
  asTextButton?: boolean; // 👈 new prop to toggle "bell" vs "Notifications"
}

const ClientNotification: React.FC<ClientNotificationProps> = ({
  asTextButton,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const isAuthenticated = sessionStorage.getItem("isAuthenticated") === "true";

  const userId = Number(sessionStorage.getItem("user_id"));
  const apiUrl = import.meta.env.VITE_API_URL;
  const fetchNotifications = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`${apiUrl}/notifications/${userId}`);
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 1000);
    return () => clearInterval(interval);
  }, [userId]);

  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  const handleNotificationClick = (id: number) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.client_notification_id === id
          ? { ...notif, status: "read" }
          : notif
      )
    );
    axios
      .post(`${apiUrl}/notifications/read/${id}`)
      .catch((err) => console.error(err));
  };

  const handlePopoverVisibleChange = (visible: boolean) => {
    if (!isAuthenticated) {
      notification.info({
        key: "auth-required-notif",
        message: "Authentication Required",
        description: "Please login first to view notifications.",
        placement: "topRight",
        duration: 2,
      });

      // redirect after a short delay
      setTimeout(() => {}, 500);

      return null;
    }

    setPopoverVisible(visible);
    if (visible) {
      notifications
        .filter((n) => n.status === "unread")
        .forEach((notif) =>
          handleNotificationClick(notif.client_notification_id)
        );
    }
  };

  const content = loading ? (
    <Spin />
  ) : notifications.length === 0 ? (
    <div className="p-2 text-center text-gray-500">No notifications</div>
  ) : (
    <List
      size="small"
      dataSource={notifications}
      renderItem={(item) => (
        <List.Item
          className={`flex justify-between items-center cursor-pointer px-2 py-1 ${
            item.status === "read"
              ? "opacity-50"
              : "opacity-100 hover:bg-gray-100"
          }`}
          onClick={() => handleNotificationClick(item.client_notification_id)}
        >
          <span>{item.message}</span>
          <span className="text-xs text-slate-800">
            {dayjs(item.created_at).format("MM/DD/YYYY, hh:mm A")}
          </span>
        </List.Item>
      )}
    />
  );

  return (
    <Popover
      content={content}
      trigger="click"
      placement="bottomRight"
      open={popoverVisible}
      onOpenChange={handlePopoverVisibleChange}
    >
      {asTextButton ? (
        <button className="px-6 py-3 text-left hover:bg-gray-100 text-gray-700">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center text-xs text-white bg-red-500 rounded-full w-5 h-5">
              {unreadCount}
            </span>
          )}
        </button>
      ) : (
        <Badge
          count={unreadCount > 0 ? unreadCount : 0}
          overflowCount={99}
          style={{ backgroundColor: "#52c41a" }}
        >
          <button className="text-red-500 hover:text-red-600 transform hover:scale-110 transition">
            <FaBell size={26} />
          </button>
        </Badge>
      )}
    </Popover>
  );
};

export default ClientNotification;
