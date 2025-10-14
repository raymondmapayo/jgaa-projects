import axios from "axios";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useEffect, useState } from "react";

dayjs.extend(utc);
dayjs.extend(timezone);

export interface Notification {
  id: number;
  type: "message" | "menu_update";
  title: string;
  description?: string;
  price?: number;
  created_by?: {
    profile_pic?: string;
    fname?: string;
    lname?: string;
  };
  created_at: string;
  read?: boolean;
}

export const useNotifications = (AdminId: string | null) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL;
  const fetchNotifications = async (showLoading = false) => {
    if (!AdminId) return;

    try {
      if (showLoading) setLoading(true);

      const [messagesRes, menuRes] = await Promise.all([
        axios.get(`${apiUrl}/get_notifications_for_admin/${AdminId}`),
        axios.get(`${apiUrl}/get_menu_update_notifications/${AdminId}`),
      ]);

      const messages: Notification[] = messagesRes.data.map((msg: any) => ({
        id: msg.id,
        type: "message",
        title: "Message",
        description: msg.description,
        created_by: {
          profile_pic: msg.profile_pic
            ? `${apiUrl}/uploads/images/${msg.profile_pic}`
            : "/avatar.jpg",
          fname: msg.fname,
          lname: msg.lname,
        },
        created_at: dayjs(msg.time).tz("Asia/Manila").format(),
        read: Number(msg.is_read) === Number(AdminId),
      }));

      const menuUpdates: Notification[] = menuRes.data.map((menu: any) => {
        const updatedFields = menu.updatedFields || {};
        const descriptionLines: string[] = [];

        // Loop through all updated fields
        for (const key in updatedFields) {
          if (key === "item_name")
            descriptionLines.push(`Menu item: ${updatedFields[key]}`);
          if (key === "price")
            descriptionLines.push(`Price: ${updatedFields[key]}`);
          // Add more fields here if needed
        }

        return {
          id: menu.id,
          type: "menu_update",
          title: "Updated Menu",
          description: descriptionLines.length
            ? descriptionLines.join("\n")
            : "Menu updated",
          created_by: {
            profile_pic: menu.workerInfo?.profile_pic
              ? `${apiUrl}/uploads/images/${menu.workerInfo.profile_pic}`
              : "/avatar.jpg",
            fname: menu.workerInfo?.fname,
            lname: menu.workerInfo?.lname,
          },
          created_at: menu.updated_at,
          read: false,
        };
      });

      const allNotifications = [...messages, ...menuUpdates];

      // Sort by newest first
      allNotifications.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setNotifications(allNotifications);

      // Unread count for messages only
      setUnreadCount(
        allNotifications.filter((n) => n.type === "message" && !n.read).length
      );
    } catch (error) {
      console.error("Fetch notifications error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!AdminId) return;
    fetchNotifications(true);

    const interval = setInterval(() => fetchNotifications(false), 5000);
    return () => clearInterval(interval);
  }, [AdminId]);

  const markAllMessagesAsRead = async () => {
    if (!AdminId) return;

    try {
      const unreadMessages = notifications.filter(
        (n) => n.type === "message" && !n.read
      );

      await Promise.all(
        unreadMessages.map((msg) =>
          axios.post(`${apiUrl}/admin_mark_message_read/${msg.id}`, {
            user_id: AdminId,
          })
        )
      );

      setNotifications((prev) =>
        prev.map((n) => (n.type === "message" ? { ...n, read: true } : n))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking messages read:", err);
    }
  };

  return { notifications, unreadCount, loading, markAllMessagesAsRead };
};
