import { Checkbox, Empty, notification } from "antd";
import React, { useEffect, useState } from "react";

type Announcement = {
  title: string;
  message: string;
  created_at: string;
  status: string; // 'unread' or 'read'
  recipient_id: string;
  announcement_id: string; // Unique ID for the announcement
};
const apiUrl = import.meta.env.VITE_API_URL;
const WorkerAnnouncementView: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [readAnnouncements, setReadAnnouncements] = useState<Set<string>>(
    new Set()
  );

  const workerId = sessionStorage.getItem("user_id");

  useEffect(() => {
    if (!workerId) {
      console.error("Worker ID not found in session storage");
      return;
    }

    const fetchAnnouncements = () => {
      fetch(`${apiUrl}/get_announcements_for_worker/${workerId}`)
        .then((response) => response.json())
        .then((data) => {
          setAnnouncements(data);
        })
        .catch((error) => {
          console.error("Failed to fetch announcements:", error);
          notification.error({
            message: "Error",
            description: "Failed to load announcements.",
          });
        });
    };

    // Initial fetch
    fetchAnnouncements();

    // Set up interval
    const intervalId = setInterval(fetchAnnouncements, 1000); // 30000 ms = 30 seconds

    // Cleanup on component unmount
    return () => clearInterval(intervalId);
  }, [workerId]);

  const toggleRead = async (announcement_id: string) => {
    if (!workerId) {
      console.error("Worker ID not found in session storage");
      return;
    }

    setReadAnnouncements((prev) => {
      const updated = new Set(prev);
      if (updated.has(announcement_id)) {
        updated.delete(announcement_id);
      } else {
        updated.add(announcement_id);
      }
      return updated;
    });

    try {
      const response = await fetch(`${apiUrl}/update_announcement_status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          announcement_id,
          recipient_id: workerId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        notification.success({
          message: "Announcement marked as read",
          description: "The announcement status was updated successfully.",
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      notification.error({
        message: "Error",
        description: "Failed to update announcement status.",
      });
    }
  };

  const allRead =
    announcements.length > 0 &&
    announcements.every((a) => readAnnouncements.has(a.announcement_id));
  const someRead =
    announcements.some((a) => readAnnouncements.has(a.announcement_id)) &&
    !allRead;

  const onSelectAllChange = async (checked: boolean) => {
    if (checked) {
      setReadAnnouncements(
        new Set(announcements.map((a) => a.announcement_id))
      );

      if (!workerId) {
        console.error("Worker ID not found in session storage");
        return;
      }

      try {
        const response = await fetch(
          `${apiUrl}/update_all_announcements_status`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ worker_id: workerId, status: "read" }),
          }
        );
        const data = await response.json();

        if (data.success) {
          notification.success({
            message: "All announcements marked as read",
            description: "All announcements have been successfully updated.",
          });
        }
      } catch (error) {
        console.error("Error updating all announcements status:", error);
        notification.error({
          message: "Error",
          description: "Failed to update all announcements status.",
        });
      }
    } else {
      setReadAnnouncements(new Set());
    }
  };

  const formatDate = (date: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Manila",
    };

    return new Date(date).toLocaleString("en-GB", options);
  };

  return (
    <div
      className=" bg-gray-50 flex items-start justify-center gap-8 flex-wrap"
      style={{ maxWidth: "2500px", margin: "auto" }}
    >
      {/* Center content */}
      <div className="flex-1 bg-white rounded shadow-md p-1 min-h-[439px] flex flex-col h-32 overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center sticky top-0 bg-white p-4 z-10 shadow-md">
          Announcements 📢
        </h2>

        {announcements.length === 0 ? (
          <Empty description="No announcements available" />
        ) : (
          <>
            <div className="mb-4 flex justify-end">
              <Checkbox
                indeterminate={someRead}
                checked={allRead}
                onChange={(e) => onSelectAllChange(e.target.checked)}
              >
                Mark All as Read
              </Checkbox>
            </div>

            <div className="flex flex-col gap-4">
              {announcements.map(
                ({ announcement_id, title, message, created_at, status }) => {
                  const isRead =
                    readAnnouncements.has(announcement_id) || status === "read";
                  return (
                    <div
                      key={announcement_id}
                      className={`rounded-md p-4 ${
                        isRead ? "bg-lamaYellowLight  " : "bg-lamaPurpleLight "
                      } border border-dashed`}
                    >
                      <div className="flex items-center justify-between">
                        <h3
                          className={`text-lg font-medium ${
                            isRead
                              ? "text-gray-500 line-through"
                              : "text-gray-800"
                          }`}
                        >
                          {title}
                        </h3>
                        <span className="text-xs text-gray-400 bg-white rounded-md px-2 py-1">
                          {created_at ? formatDate(created_at) : "No date"}
                        </span>
                      </div>
                      <p
                        className={`text-sm mt-2 ${
                          isRead ? "text-gray-500" : "text-gray-600"
                        }`}
                      >
                        {message}
                      </p>
                      <div className="mt-3">
                        <Checkbox
                          checked={isRead}
                          onChange={() => toggleRead(announcement_id)}
                        >
                          Mark as Read
                        </Checkbox>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WorkerAnnouncementView;
