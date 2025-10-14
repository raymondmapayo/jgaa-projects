import { Menu } from "antd";
import { useEffect } from "react";
import { FaReceipt } from "react-icons/fa6";
import { IoChatboxSharp } from "react-icons/io5";
import {
  MdCategory,
  MdInventory2,
  MdMenuBook,
  MdTableRestaurant,
} from "react-icons/md";
import { RiDashboardFill, RiUserSettingsFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { StyledSider } from "../../styled/worker";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

const WorkerSidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
  const navigate = useNavigate();

  // Load sidebar state from localStorage (default open)
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      setCollapsed(saved === "true");
    } else {
      setCollapsed(false);
    }
  }, [setCollapsed]);

  // Save state when collapsed changes
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  const menuItems = [
    {
      key: "dashboard",
      label: "Manage Dashboard",
      icon: <RiDashboardFill size={25} />,
      link: "/Worker/Dashboard",
    },
    {
      key: "menu",
      label: "Manage Menu",
      icon: <MdMenuBook size={25} />,
      link: "/Worker/Manage/Menu",
    },
    {
      key: "orders",
      label: "Manage Orders",
      icon: <FaReceipt size={25} />,
      link: "/Worker/Manage/Order",
    },
    {
      key: "reservation",
      label: "Manage Reservation",
      icon: <MdTableRestaurant size={25} />,
      link: "/Worker/Manage/Reservation",
    },

    {
      key: "categories",
      label: "Manage Categories",
      icon: <MdCategory size={25} />,
      link: "/Worker/Manage/Categories",
    },
    {
      key: "supply_categories",
      label: "Manage Supply Categories",
      icon: <RiUserSettingsFill size={25} />,
      link: "/Worker/Manage/SupplyCategories",
    },
    {
      key: "inventory",
      label: "Manage Inventory",
      icon: <MdInventory2 size={25} />,
      link: "/Worker/Manage/Inventory",
    },
    {
      key: "supply",
      label: "Manage Supply",
      icon: <RiUserSettingsFill size={25} />,
      link: "/Worker/Manage/Supply",
    },
    {
      key: "chats",
      label: "Manage Chats",
      icon: <IoChatboxSharp size={25} />,
      link: "/Worker/Manage/Chats",
    },
    {
      key: "recipe",
      label: "Manage Ingredients",
      icon: <MdTableRestaurant size={25} />,
      link: "/Worker/Manage/Ingredients",
    },
  ];

  return (
    <StyledSider
      $collapsed={collapsed}
      collapsed={collapsed}
      width={270}
      collapsedWidth={window.innerWidth < 768 ? "0" : "80"}
    >
      {/* Header */}
      <div className="sidebar-header">
        {collapsed ? (
          "JGAA"
        ) : (
          <div className="flex items-center gap-4">
            <img
              src="/logo.jpg"
              className="w-12 rounded-full z-50 border"
              alt="Logo"
            />
            <p className="font-bold text-[#fa8c16]">JGAA Restaurant</p>
          </div>
        )}
      </div>

      {/* Scrollable Menu */}
      <div className="menu-scroll">
        <Menu
          theme="light"
          mode="inline"
          defaultSelectedKeys={[
            menuItems.find((item) => item.link === window.location.pathname)
              ?.key || "dashboard",
          ]}
          onClick={({ key }) => {
            const found = menuItems.find((item) => item.key === key);
            if (found) navigate(found.link);
          }}
          items={menuItems.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
          }))}
        />
      </div>

      {/* Footer */}
      {/* Footer */}
      {!collapsed && (
        <div className="footer-container">
          <div className="p-2 text-gray-700 text-sm flex flex-col items-center">
            <img
              src="/background.png"
              alt="Restaurant Background"
              className="w-full rounded mb-2"
              style={{ objectFit: "cover", maxHeight: 120 }}
            />
          </div>
          <div className="px-2 text-center text-xs text-gray-500">
            <div className="font-semibold">Designed & Built by Capstone</div>
            <div className="text-gray-400">© 2025, All rights reserved.</div>
          </div>
        </div>
      )}
    </StyledSider>
  );
};

export default WorkerSidebar;
