import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  Layout,
  List,
  Menu,
  Spin,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { CiMenuFries } from "react-icons/ci";
import { FaBell, FaSun } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useTheme } from "../../contexts/ThemeContext";
import { logoutworker } from "../../zustand/store/store.provider";
// Define the Notification type
interface Notification {
  id: number; // For both message_id or announcement_id
  title?: string; // Title for announcements
  description: string; // Description of the message or announcement
  time: string; // Timestamp for the notification
  sender_id: number; // The sender of the message or announcement
  recipient_id: number; // The recipient of the message or announcement
  created_at?: string; // For announcements (created_at)
  timestamp?: string; // For messages (timestamp)
  status: string; // For both message and announcement (e.g., 'unread', 'active')
  is_read?: boolean; // For messages only (indicates whether the message is read or unread)
  role?: string; // For messages (indicates the role of the sender, e.g., 'admin', 'worker')
  profile_pic: string; // Include profile_pic here
}

// Styled components

const StyledHeader = styled(Layout.Header)`
  background-color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 80px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  /* dark mode */
  .dark & {
    background-color: #001f3f !important;
    color: #f0f0f0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);

    /* example logo if any inside header */
    .logo {
      background: #001f3f;
      color: #f0f0f0;
      border-bottom: 1px solid #334155;
    }

    /* Ant Design menu styling if menus exist in header */
    .ant-menu-light {
      background: transparent !important;
    }

    .ant-menu-light .ant-menu-item {
      color: #e0e0e0;
      transition: color 0.3s ease;
    }

    .ant-menu-light .ant-menu-item:hover {
      background-color: rgb(0, 51, 102) !important;
      color: #fff !important;

      svg {
        color: #fff !important;
      }
    }

    .ant-menu-light .ant-menu-item-selected {
      background-color: #004080 !important;
      color: #fff !important;

      svg {
        color: #fff !important;
      }
    }

    /* Tooltip styles */
    .ant-tooltip-inner {
      background-color: #004080 !important;
      color: #fff !important;
    }

    .ant-tooltip-arrow::before {
      background-color: #004080 !important;
    }
  }
`;

const StyledRightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
`;

const StyledBadge = styled(Badge)`
  .ant-badge-count {
    background: #6b46c1;
    font-size: 12px;
    box-shadow: 0 0 0 2px white;
  }
`;

const ProfileDropdown = styled(Dropdown)`
  .ant-dropdown-menu {
    border-radius: 8px;
  }
`;

const MenuButton = styled.button`
  background-color: #f5f5f5;
  border: none;
  border-radius: 8px;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background-color: #e5e5e5;
  }
`;

const WorkerHeader = ({ onMenuToggle }: { onMenuToggle: () => void }) => {
  const navigate = useNavigate();
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]); // Use the Notification type here
  const [unreadCount, setUnreadCount] = useState(0);
  const workerId = sessionStorage.getItem("user_id"); // Assuming worker's ID is stored in sessionStorage
  const { isDarkMode, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  // Fetch notifications when the component mounts
  const apiUrl = import.meta.env.VITE_API_URL;
  useEffect(() => {
    setLoading(true); // Optional: if you're tracking loading state

    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/get_notifications_for_worker/${workerId}`
        );
        const data = response.data;
        setNotifications(data);
        setUnreadCount(
          data.filter(
            (notification: Notification) => notification.status === "unread"
          ).length
        );
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false); // Optional
      }
    };

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 1000);

    return () => clearInterval(interval);
  }, [workerId]);

  const handleWorkerLogout = async () => {
    try {
      console.log("Logging out worker..."); // Log logout attempt
      await logoutworker(); // Ensure the logout completes
      sessionStorage.clear(); // Clear all session storage
      navigate("/", { replace: true }); // Redirect to the landing page
    } catch (error) {
      console.error("Logout Error:", error); // Log any errors during logout
    }
  };

  // Profile dropdown menu
  const profileMenu = (
    <Menu>
      <Menu.Item key="1" onClick={() => navigate("/Worker/Manage/MyProfile")}>
        My Profile
      </Menu.Item>
      <Menu.Item key="2">Settings</Menu.Item>
      <Menu.Item key="3">Billing</Menu.Item>
      <Menu.Item key="4">
        <span style={{ color: "red" }} onClick={() => handleWorkerLogout()}>
          Logout
        </span>
      </Menu.Item>
    </Menu>
  );
  const notificationMenu = (
    <List
      dataSource={notifications}
      renderItem={(item) => (
        <List.Item>
          <List.Item.Meta
            avatar={
              <Avatar
                src={
                  item.profile_pic
                    ? `${apiUrl}/uploads/images/${item.profile_pic}`
                    : "/avatar.jpg"
                }
              />
            }
            title={
              <div className="flex items-center gap-2">
                <span className="text-black dark:text-blue-100 font-medium">
                  {item.title || "Message"}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {dayjs(item.time).format("YYYY-MM-DD h:mm A")}
                </span>
              </div>
            }
            description={
              <p className="text-gray-600 dark:text-gray-300">
                {item.description}
              </p>
            }
          />
        </List.Item>
      )}
      footer={
        <div className="flex justify-center">
          <Button type="link" className="text-black dark:text-blue-100">
            View all notifications
          </Button>
        </div>
      }
      style={{
        maxHeight: 430,
        overflowY: "auto",
      }}
      className="w-72 sm:w-80 md:w-96 shadow-lg bg-white dark:bg-[#0f172a] dark:text-white"
    />
  );
  return (
    <StyledHeader>
      {/* Menu Button for toggling Sidebar */}
      <div className="flex items-center gap-4">
        <MenuButton onClick={onMenuToggle}>
          <CiMenuFries
            className="text-gray-600 dark:text-[#001f3f]"
            size={24}
          />
        </MenuButton>
      </div>

      {/* Right Section */}
      <StyledRightSection>
        {isDarkMode ? (
          <FaSun
            onClick={toggleTheme}
            style={{ color: "#fbbf24", fontSize: "20px", cursor: "pointer" }}
            title="Switch to light mode"
          />
        ) : (
          <FaSun
            onClick={toggleTheme}
            style={{ color: "#888", fontSize: "20px", cursor: "pointer" }}
            title="Switch to dark mode"
          />
        )}

        <Dropdown
          menu={{ items: [] }} // placeholder; we are using overlay-like content below
          dropdownRender={() => notificationMenu} // replace overlay
          trigger={["click"]}
          open={isNotificationVisible} // replace visible
          onOpenChange={setIsNotificationVisible} // replace onVisibleChange
        >
          <StyledBadge count={unreadCount}>
            <FaBell
              style={{ color: "#888", fontSize: "20px", cursor: "pointer" }}
            />
          </StyledBadge>
        </Dropdown>

        {loading && <Spin size="small" style={{ marginLeft: 10 }} />}

        <ProfileDropdown overlay={profileMenu} trigger={["click"]}>
          <Avatar
            size={40}
            src="https://dreamspos.dreamstechnologies.com/html/template/assets/img/users/user-11.jpg"
            style={{ border: "2px solid #6b46c1", cursor: "pointer" }}
          />
        </ProfileDropdown>
      </StyledRightSection>
    </StyledHeader>
  );
};

export default WorkerHeader;
