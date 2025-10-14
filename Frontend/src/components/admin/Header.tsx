// src/components/admin/Header.tsx
import { Avatar, Badge, Dropdown, Layout, Menu, Spin } from "antd";
import { CiMenuFries } from "react-icons/ci";
import { FaBell, FaSun } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useTheme } from "../../contexts/ThemeContext";
import { useNotifications } from "../../hooks/useNotifications";
import { logoutadmin } from "../../zustand/store/store.provider";
import NotificationsDropdown from "./NotificationsDropdown";

const StyledHeader = styled(Layout.Header)`
  background-color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 80px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .dark & {
    background-color: #001f3f !important;
    color: #f0f0f0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
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

const Header = ({ onMenuToggle }: { onMenuToggle: () => void }) => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const AdminId = sessionStorage.getItem("user_id");

  const { notifications, unreadCount, loading, markAllMessagesAsRead } =
    useNotifications(AdminId);

  const handleAdminLogout = async () => {
    try {
      await logoutadmin();
      sessionStorage.clear();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const profileMenu = (
    <Menu>
      <Menu.Item key="1" onClick={() => navigate("/Admin/MyProfile")}>
        My Profile
      </Menu.Item>
      <Menu.Item key="2">Settings</Menu.Item>
      <Menu.Item key="3">Billing</Menu.Item>
      <Menu.Item key="4">
        <span style={{ color: "red" }} onClick={handleAdminLogout}>
          Logout
        </span>
      </Menu.Item>
    </Menu>
  );

  return (
    <StyledHeader>
      <div className="flex items-center gap-4">
        <MenuButton onClick={onMenuToggle}>
          <CiMenuFries
            className="text-gray-600 dark:text-[#001f3f]"
            size={24}
          />
        </MenuButton>
      </div>

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

        {/* Notifications Dropdown */}
        <Dropdown
          overlay={<NotificationsDropdown notifications={notifications} />}
          trigger={["click"]}
          onVisibleChange={async (visible) => {
            if (visible) {
              await markAllMessagesAsRead(); // mark all messages read permanently
            }
          }}
        >
          <StyledBadge count={unreadCount}>
            <FaBell
              style={{ color: "#888", fontSize: "20px", cursor: "pointer" }}
            />
          </StyledBadge>
        </Dropdown>

        {loading && <Spin size="small" style={{ marginLeft: 10 }} />}

        <Dropdown overlay={profileMenu} trigger={["click"]}>
          <Avatar
            size={40}
            src="https://dreamspos.dreamstechnologies.com/html/template/assets/img/users/user-11.jpg"
            style={{ border: "2px solid #6b46c1", cursor: "pointer" }}
          />
        </Dropdown>
      </StyledRightSection>
    </StyledHeader>
  );
};

export default Header;
