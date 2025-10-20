import { Avatar, Menu, Modal, notification, Popover, Tabs } from "antd";
import Dropdown from "antd/es/dropdown/dropdown";
import TabPane from "antd/es/tabs/TabPane";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  FaBars,
  FaSearch,
  FaShoppingBag,
  FaTimes,
  FaUser,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import useStore from "../../zustand/store/store";
import { logoutClient, selector } from "../../zustand/store/store.provider";
import AccountSetting from "./AccountSetting";
import ActivityLog from "./ActivityLog";
import BillingDetails from "./BillingDetails"; // Adjust path if needed
import ClientNotification from "./ClientNotification";
import CommentUs from "./CommentUs";
export const ClientHeader = () => {
  const client = useStore(selector("client"));
  const [isAccountSettingVisible, setIsAccountSettingVisible] = useState(false);
  const [isLogVisible, setIsLogVisible] = useState(false);
  const [isCommentUsVisible, setIsCommentUsVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const userName = sessionStorage.getItem("fname");
  const userEmail = sessionStorage.getItem("email");
  const apiUrl = import.meta.env.VITE_API_URL;
  // Get the user profile picture from the backend
  useEffect(() => {
    const fetchProfilePic = async () => {
      try {
        const user_id = sessionStorage.getItem("user_id");
        if (user_id) {
          const response = await axios.get(`${apiUrl}/get_user/${user_id}`);
          setProfilePic(response.data.profile_pic); // Set profile picture URL
        }
      } catch (error) {
        console.error("Error fetching profile picture:", error);
      }
    };

    fetchProfilePic();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutClient(); // Ensure the logout completes
      sessionStorage.clear(); // Clear all session storage
      navigate("/", { replace: true }); // Redirect to the landing page
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const navigate = useNavigate();

  // ✅ Popover User Menu
  const userPopoverContent = (
    <div className="w-64">
      <div className="flex items-start sm:items-center gap-4 p-4 border-b">
        <Avatar
          size={48}
          src={
            profilePic
              ? `${apiUrl}/uploads/images/${profilePic}`
              : "/avatar.jpg"
          }
          alt="User Avatar"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold text-base sm:text-lg">{userName}</h3>
          <p className="text-gray-500 text-sm break-all">{userEmail}</p>
        </div>
      </div>

      <div className="py-2">
        <button
          onClick={() => {
            const isAuthenticated =
              sessionStorage.getItem("isAuthenticated") === "true";

            if (!isAuthenticated) {
              notification.info({
                key: "auth-required-modal",
                message: "Authentication Required",
                description: "Please login first to access Account Settings.",
                placement: "topRight",
                duration: 2,
              });
              return; // 🔹 Don't open the modal
            }

            setIsAccountSettingVisible(true); // 🔹 Only open if authenticated
            document.body.click();
          }}
          className="flex items-center p-3 hover:bg-gray-100 text-gray-700 w-full text-left"
        >
          <span className="flex-grow">Account Setting</span>
        </button>

        <button
          onClick={() => {
            const isAuthenticated =
              sessionStorage.getItem("isAuthenticated") === "true";
            if (isAuthenticated) {
              navigate("/MyPurchase");
            } else {
              notification.info({
                message: "Authentication Required",
                description: "Please login first to view your purchases.",
                placement: "topRight",
                duration: 2,
              });
            }
          }}
          className="flex items-center p-3 hover:bg-gray-100 text-gray-700"
        >
          <span className="flex-grow">My Purchase</span>
        </button>

        <button
          onClick={() => {
            const isAuthenticated =
              sessionStorage.getItem("isAuthenticated") === "true";
            if (isAuthenticated) {
              navigate("/MyFavourates");
            } else {
              notification.info({
                message: "Authentication Required",
                description: "Please login first to view your favourites.",
                placement: "topRight",
                duration: 2,
              });
            }
          }}
          className="flex items-center p-3 hover:bg-gray-100 text-gray-700"
        >
          <span className="flex-grow">My Favourites</span>
        </button>

        <button
          onClick={() => {
            const isAuthenticated =
              sessionStorage.getItem("isAuthenticated") === "true";

            if (!isAuthenticated) {
              notification.info({
                message: "Authentication Required",
                description: "Please login first to view your activity log.",
                placement: "topRight",
                duration: 2,
              });
              return; // stop here if not authenticated
            }

            setIsLogVisible(true); // show the modal if authenticated
            document.body.click(); // optional: close dropdowns or other overlays
          }}
          className="flex items-center p-3 hover:bg-gray-100 text-gray-700 w-full text-left"
        >
          <span className="flex-grow">Activity Log</span>
        </button>
        <button
          onClick={() => {
            const isAuthenticated =
              sessionStorage.getItem("isAuthenticated") === "true";

            if (!isAuthenticated) {
              notification.info({
                message: "Authentication Required",
                description: "Please login first to leave a comment.",
                placement: "topRight",
                duration: 2,
              });
              return; // stop here if not authenticated
            }

            setIsCommentUsVisible(true); // show the modal if authenticated
            document.body.click(); // optional: close dropdowns or other overlays
          }}
          className="flex items-center p-3 hover:bg-gray-100 text-gray-700 w-full text-left"
        >
          <span className="flex-grow">Comment Us</span>
        </button>

        <button
          onClick={handleLogout}
          className="flex w-full items-center p-3 hover:bg-gray-100 text-red-500 text-left"
        >
          Sign Out
        </button>
      </div>
    </div>
  );

  const isAuthenticated = client.isAuthenticated;

  const cartItemCount = Array.isArray(client?.cart)
    ? client.cart.reduce(
        (sum: number, item: { quantity: number }) => sum + item.quantity,
        0
      )
    : 0; // Ensure client.cart is an array before calling reduce
  // Dropdown Menu for Products
  const productsMenu = (
    <Menu style={{ width: "200px" }}>
      <Menu.Item style={{ fontSize: "18px" }}>
        <Link to="/Menus">Our Menu</Link>
      </Menu.Item>
      <Menu.Item style={{ fontSize: "18px" }}>
        <Link to="/Bestseller">Our Bestseller</Link>
      </Menu.Item>
    </Menu>
  );

  return (
    <header className="z-50 fixed top-0 w-full bg-white shadow-md">
      <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6">
        {/* Logo Section */}
        <div className="flex items-center">
          <img
            src="/logo.jpg"
            alt="JGAA Thai Restaurant Logo"
            className="h-8 w-8 sm:h-12 sm:w-12 md:h-14 md:w-14 mr-3 sm:mr-4 md:mr-6 rounded-full"
          />
          <h1 className="font-core  text-lg sm:text-xl md:text-2xl font-bold text-orange-600">
            JGAA THAI RESTAURANT
          </h1>
        </div>

        {/* Hamburger Menu for Mobile */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-600 hover:text-gray-800"
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Navigation Links & Icons (Desktop) */}
        <div className="hidden lg:flex items-center gap-8 xl:gap-14">
          {/* Navigation Links */}
          <nav className="flex font-core items-center space-x-4 sm:space-x-6 md:space-x-8 text-gray-600 text-sm sm:text-base md:text-lg">
            <Link to="/" className="hover:text-orange-600 transition-colors">
              Home
            </Link>

            <Dropdown overlay={productsMenu} trigger={["hover"]}>
              <Link
                to="/shop"
                onClick={(e) => e.preventDefault()} // prevent navigation, only open dropdown
                className="hover:text-orange-600 transition-colors"
              >
                Order now
              </Link>
            </Dropdown>

            <Link
              to="/Reservation"
              className="hover:text-orange-600 transition-colors"
            >
              Reservation
            </Link>

            <Link
              to="/Contact-Us"
              className="hover:text-orange-600 transition-colors"
            >
              Contact
            </Link>
          </nav>
          {/* Icons */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            <button className="text-yellow-500 hover:text-yellow-600 transform hover:scale-110 transition">
              <FaSearch size={24} />
            </button>

            {isAuthenticated ? (
              <div className="flex gap-4 sm:gap-6">
                {/* 🔔 Notifications */}
                <ClientNotification />

                {/* 🛒 Cart */}
                <button
                  onClick={() => {
                    const isAuthenticated =
                      sessionStorage.getItem("isAuthenticated") === "true";

                    if (!isAuthenticated) {
                      notification.info({
                        message: "Authentication Required",
                        description: "Please login first to view your cart.",
                        placement: "topRight",
                        duration: 2,
                      });
                      return; // 🔹 stop here if not authenticated
                    }

                    navigate("/My-Cart"); // ✅ only go to cart if authenticated
                  }}
                  className="relative text-blue-500 hover:text-blue-600 transform hover:scale-110 transition"
                >
                  <FaShoppingBag size={28} />
                  {cartItemCount > 0 && (
                    <span
                      className="
        absolute 
        -top-1 -right-2
        text-[11px] sm:text-sm 
        text-white bg-red-500 
        rounded-full 
        w-5 h-5 sm:w-5 sm:h-5 
        flex items-center justify-center
      "
                    >
                      {cartItemCount}
                    </span>
                  )}
                </button>

                {/* 👤 User */}
                <Popover
                  content={userPopoverContent}
                  trigger="click"
                  placement="bottomRight"
                >
                  <button className="text-orange-500 hover:text-orange-600 transform hover:scale-110 transition">
                    <FaUser size={24} /> {/* Bigger user icon */}
                  </button>
                </Popover>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="font-core text-gray-500 hover:text-gray-600 transform hover:scale-110 transition"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <nav className="lg:hidden flex flex-col bg-white shadow-md w-full fixed top-[64px] left-0 z-[9999]">
          <Link
            to="/"
            onClick={() => setIsMenuOpen(false)}
            className="px-6 py-3 hover:bg-gray-100 text-gray-700"
          >
            Home
          </Link>
          {/* 🔽 Mobile dropdown for Shop Now */}
          <Dropdown overlay={productsMenu} trigger={["click"]}>
            <button className="px-6 py-3 text-left hover:bg-gray-100 text-gray-700 w-full">
              Shop Now
            </button>
          </Dropdown>
          <Link
            to="/Menus"
            onClick={() => setIsMenuOpen(false)}
            className="px-6 py-3 hover:bg-gray-100 text-gray-700"
          >
            Menu
          </Link>
          <Link
            to="/Reservation"
            onClick={() => setIsMenuOpen(false)}
            className="px-6 py-3 hover:bg-gray-100 text-gray-700"
          >
            Reservation
          </Link>
          <Link
            to="/Contact-Us"
            onClick={() => setIsMenuOpen(false)}
            className="px-6 py-3 hover:bg-gray-100 text-gray-700"
          >
            Contact
          </Link>
          {isAuthenticated ? (
            <>
              <ClientNotification asTextButton />

              <button
                onClick={() => navigate("/My-Cart")}
                className="px-6 py-3 text-left hover:bg-gray-100 text-gray-700"
              >
                My Cart
              </button>
              <Popover content={userPopoverContent} trigger="click">
                <button className="px-6 py-3 text-left hover:bg-gray-100 text-gray-700">
                  My Profile
                </button>
              </Popover>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="font-core px-6 py-3 text-left hover:bg-gray-100 text-gray-700"
            >
              Login
            </button>
          )}
        </nav>
      )}

      {/* Modals */}
      <Modal
        open={isAccountSettingVisible}
        onCancel={() => setIsAccountSettingVisible(false)}
        footer={null}
        bodyStyle={{ padding: "20px" }}
        width={900}
      >
        <Tabs defaultActiveKey="account" centered>
          <TabPane tab="Account Settings" key="account">
            <AccountSetting />
          </TabPane>
          <TabPane tab="Billing Details" key="billing">
            <BillingDetails />
          </TabPane>
        </Tabs>
      </Modal>

      <Modal
        open={isLogVisible}
        onCancel={() => setIsLogVisible(false)}
        footer={null}
        bodyStyle={{ padding: "20px" }}
        width={800}
      >
        <ActivityLog />
      </Modal>
      <Modal
        open={isCommentUsVisible}
        onCancel={() => setIsCommentUsVisible(false)}
        footer={null}
        bodyStyle={{ padding: "20px" }}
        width={800}
      >
        <CommentUs />
      </Modal>
    </header>
  );
};

export default ClientHeader;
