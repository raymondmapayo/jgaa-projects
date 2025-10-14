import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { FaPaperPlane, FaSearch } from "react-icons/fa";
import { IoCall, IoEllipsisHorizontal, IoTrash } from "react-icons/io5";
import io from "socket.io-client";

type Worker = {
  user_id: number;
  fname: string;
  lname: string;
  profile_pic: string;
  status: string;
  lastActive: string;
  lastMessage: string;
};

type Message = {
  id: number;
  message: string;
  sender: string;
  timestamp: string;
};

type Admin = {
  profile_pic: string;
};

const AdminChat = () => {
  const [workers, setWorkers] = useState<Worker[]>([]); // List of workers
  const [messages, setMessages] = useState<Message[]>([]); // Messages for the admin
  const [newMessage, setNewMessage] = useState(""); // New message to be sent by admin
  const [selectedUser, setSelectedUser] = useState<Worker | null>(null); // Selected worker
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null); // Admin profile

  const socket = useRef(io("http://localhost:8081")); // Socket connection for real-time communication
  const chatEndRef = useRef<HTMLDivElement | null>(null); // To scroll to the latest message

  const adminId = sessionStorage.getItem("user_id"); // Admin's user ID

  // Fetch the list of workers and admin profile on component mount
  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const workersResponse = await axios.get(
          "http://localhost:8081/get_workers_info"
        );
        setWorkers(workersResponse.data);
      } catch (error) {
        console.error("Error fetching workers:", error);
      }
    };
    fetchWorkers();

    const fetchAdminProfile = async () => {
      if (adminId) {
        try {
          const response = await axios.get(
            `http://localhost:8081/get_admin_profile_pic/${adminId}`
          );
          setSelectedAdmin(response.data); // Set admin profile picture
        } catch (error) {
          console.error("Error fetching admin's profile pic:", error);
        }
      }
    };
    fetchAdminProfile();

    // Get the stored selected worker and messages from localStorage (if any)
    const storedSelectedUser = localStorage.getItem("selectedUser");
    if (storedSelectedUser) {
      setSelectedUser(JSON.parse(storedSelectedUser));
      const storedMessages = localStorage.getItem("messages");
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      }
    }

    return () => {
      socket.current.disconnect(); // Clean up socket connection on component unmount
    };
  }, [adminId]);

  // Fetch messages for the selected worker when selectedUser changes
  useEffect(() => {
    if (selectedUser) {
      const fetchMessages = async () => {
        try {
          const messagesResponse = await axios.get(
            `http://localhost:8081/getMessagesForAdmin/${adminId}/${selectedUser.user_id}`
          );
          // Reverse the array to show latest at the bottom
          setMessages(messagesResponse.data.reverse()); // Reverse the messages

          // Save the messages and selectedUser to localStorage
          localStorage.setItem("selectedUser", JSON.stringify(selectedUser));
          localStorage.setItem(
            "messages",
            JSON.stringify(messagesResponse.data)
          );
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      };
      fetchMessages();
      const interval = setInterval(() => {
        fetchMessages();
      }, 1000); // 10 seconds interval

      // Cleanup the interval when the component unmounts or when selectedUser/adminId changes
      return () => clearInterval(interval);
    }
  }, [selectedUser, adminId]); // Trigger whenever selectedUser changes

  // Handle sending a message from the admin to the worker
  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || !selectedUser) return;

    const messageData = {
      message: newMessage,
      sender_id: adminId,
      recipient_id: selectedUser.user_id, // Send message to the selected worker
    };

    console.log("Message Data:", messageData); // Log the message data

    try {
      const response = await axios.post(
        "http://localhost:8081/sendMessageToWorkers",
        messageData
      );

      const newMessageObj = {
        id: response.data.message_id,
        message: newMessage,
        sender: "admin", // Since admin is the sender
        timestamp: new Date().toISOString(),
      };

      // Add the admin's message to the message list and append it at the bottom
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, newMessageObj];
        localStorage.setItem("messages", JSON.stringify(updatedMessages));
        return updatedMessages;
      });
      setNewMessage(""); // Clear input field

      // Emit the message to the worker via Socket.IO
      socket.current.emit("newMessageFromAdmin", {
        message: newMessage,
        sender_id: adminId,
        receiver_id: selectedUser.user_id,
        timestamp: newMessageObj.timestamp,
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Handle selecting a worker from the sidebar
  const handleSelectWorker = (worker: Worker) => {
    // Only set the selected worker if it's not already selected
    if (selectedUser?.user_id !== worker.user_id) {
      setSelectedUser(worker); // Set the selected worker
    }
  };

  // Scroll to the bottom whenever messages are updated
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex pb-4">
      {/* Sidebar */}
      <div className="w-1/4 bg-white border-r shadow-r-md p-4">
        <h2 className="text-lg font-bold mb-4">Admin</h2>
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-3 py-2 rounded-lg border bg-gray-100 focus:outline-none"
          />
          <FaSearch className="absolute right-3 top-3 text-gray-400" />
        </div>
        <div className="overflow-y-auto h-[calc(100vh-300px)]">
          {workers.map((worker) => (
            <div
              key={worker.user_id}
              className={`flex items-center p-3 cursor-pointer rounded-lg hover:bg-gray-200 ${
                selectedUser?.user_id === worker.user_id
                  ? "bg-gray-300"
                  : "bg-white"
              }`}
              onClick={() => handleSelectWorker(worker)}
            >
              {/* Container for the avatar image with relative positioning */}
              <div className="relative w-10 h-10 mr-3">
                <img
                  src={
                    worker.profile_pic && worker.profile_pic !== ""
                      ? `http://localhost:8081/uploads/images/${worker.profile_pic}`
                      : "/fallback.jpg"
                  }
                  alt="worker-avatar"
                  className="w-full h-full rounded-full"
                />

                {/* Active Status Circle inside the image */}
                {worker.status === "active" && (
                  <div className="absolute w-3 h-3 bg-green-500 rounded-full bottom-0 right-0 border-2 border-white"></div>
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-semibold">
                  {worker.fname} {worker.lname}
                </h3>
                <p className="text-xs text-gray-500 truncate">
                  {worker.lastMessage}
                </p>
              </div>
              <span className="text-xs text-gray-400">{worker.lastActive}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white p-4 border-b flex items-center justify-between">
          {selectedUser && (
            <>
              <div className="flex items-center">
                <img
                  src={
                    selectedUser.profile_pic && selectedUser.profile_pic !== ""
                      ? `http://localhost:8081/uploads/images/${selectedUser.profile_pic}`
                      : "/fallback.jpg"
                  }
                  className="w-10 h-10 rounded-full mr-3"
                />

                <div>
                  <h2 className="text-lg font-bold">
                    {selectedUser.fname} {selectedUser.lname}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Last seen: 2 hours ago
                  </p>
                </div>
              </div>
              <div className="flex gap-4 text-gray-500 text-xl">
                <IoCall />
                <IoTrash />
                <IoEllipsisHorizontal />
              </div>
            </>
          )}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          {messages.length > 0 ? (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end mb-4 ${
                  msg.sender === "admin" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "admin" && selectedAdmin && (
                  <img
                    src={
                      selectedAdmin.profile_pic &&
                      selectedAdmin.profile_pic !== ""
                        ? `http://localhost:8081/uploads/images/${selectedAdmin.profile_pic}`
                        : "/fallback.jpg"
                    }
                    alt="admin-avatar"
                    className="w-6 h-6 rounded-full mr-2"
                  />
                )}
                {msg.sender === "worker" && selectedUser && (
                  <img
                    src={
                      selectedUser.profile_pic &&
                      selectedUser.profile_pic !== ""
                        ? `http://localhost:8081/uploads/images/${selectedUser.profile_pic}`
                        : "/fallback.jpg"
                    }
                    alt="worker-avatar"
                    className="w-6 h-6 rounded-full mr-2"
                  />
                )}
                <div
                  className={`p-3 rounded-lg max-w-xs ${
                    msg.sender === "admin"
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  {msg.message}
                </div>
                <p className="text-xs text-gray-400 ml-2">
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            ))
          ) : (
            <div>No messages</div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div className="bg-white p-4 border-t flex items-center">
          <input
            type="text"
            placeholder="Type something here..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none"
          />
          <button
            onClick={handleSendMessage}
            className="ml-3 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminChat;
