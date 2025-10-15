import { DefaultEventsMap } from "@socket.io/component-emitter";
import { Modal } from "antd"; // <-- import Modal
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import ChatWindow from "./Chat/ChatWindow";
import Sidebar from "./Chat/Sidebar";
import WorkerAnnouncementView from "./WorkerAnnouncement";

export type Message = {
  id: number;
  message: string;
  sender: string;
  timestamp: string;
};

export type Admin = {
  user_id: number;
  fname: string;
  lname: string;
  profile_pic: string;
  status: string;
  lastActive: string;
};

export type Client = {
  user_id: number;
  fname: string;
  lname: string;
  profile_pic: string;
  status: string;
};

export type Worker = {
  profile_pic: string;
};

export type User = Admin | Client;

const WorkerChat = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showChat, setShowChat] = useState(false); // toggle chat on mobile
  const [modalVisible, setModalVisible] = useState(false); // modal for mobile

  const socket = useRef<Socket<DefaultEventsMap, DefaultEventsMap> | null>(
    null
  );
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const workerId = sessionStorage.getItem("user_id");
  const workerIdNum = workerId ? parseInt(workerId) : null;
  const apiUrl = import.meta.env.VITE_API_URL;

  // detect mobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    socket.current = io(`${apiUrl}`);
    return () => {
      socket.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aRes, cRes] = await Promise.all([
          axios.get(`${apiUrl}/get_admin_info`),
          axios.get(`${apiUrl}/get_clients_info`),
        ]);
        setAdmins(aRes.data);
        setClients(cRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedUser && (admins.length > 0 || clients.length > 0)) {
      setSelectedUser(admins.length > 0 ? admins[0] : clients[0]);
    }
  }, [admins, clients, selectedUser]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!workerIdNum || !selectedUser) return;
      try {
        const res = await axios.get(
          `${apiUrl}/getMessagesWorker/${workerIdNum}/${selectedUser.user_id}`
        );
        const msgs: Message[] = res.data
          .map((m: any) => ({
            id: m.id,
            message: m.message,
            sender: m.sender_id === workerIdNum ? "worker" : "admin",
            timestamp: m.timestamp,
          }))
          .reverse();
        setMessages(msgs);
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 1000);
    return () => clearInterval(interval);
  }, [selectedUser, workerIdNum]);

  useEffect(() => {
    if (workerIdNum) {
      axios
        .get(`${apiUrl}/get_worker_profile_pic/${workerIdNum}`)
        .then((res) => setSelectedWorker({ profile_pic: res.data.profile_pic }))
        .catch((err) => console.error(err));
    }
  }, [workerIdNum]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !workerIdNum) return;
    try {
      const endpoint =
        "lastActive" in selectedUser
          ? `${apiUrl}/sendMessageToAdmin`
          : `${apiUrl}/sendMessageToClients`;

      const res = await axios.post(endpoint, {
        message: newMessage,
        sender_id: workerIdNum,
        recipient_id: selectedUser.user_id,
      });

      const newMsg: Message = {
        id: res.data.message_id,
        message: newMessage,
        sender: "worker",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newMsg]);
      setNewMessage("");

      socket.current?.emit("send_message", newMsg);

      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (t: string) =>
    new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    if (isMobile) setShowChat(true);
  };

  const handleBackToSidebar = () => {
    setShowChat(false);
  };

  const handleToggleAnnouncements = () => {
    if (isMobile) {
      setModalVisible(true); // open modal only on mobile
    } else {
      setShowAnnouncements((prev) => !prev); // toggle normal sidebar on desktop
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[559px] w-full bg-gray-50 gap-0 md:gap-4">
      {/* Sidebar */}
      {(!isMobile || (isMobile && !showChat)) && (
        <div className="h-full flex-shrink-0 w-full md:w-auto">
          <Sidebar
            admins={admins}
            clients={clients}
            selectedUser={selectedUser}
            onSelectUser={handleSelectUser}
          />
        </div>
      )}

      {/* Chat Window */}
      {(!isMobile || (isMobile && showChat)) && (
        <div className="flex-1 h-full w-full md:w-auto">
          <ChatWindow
            messages={messages || []}
            newMessage={newMessage}
            selectedUser={selectedUser}
            selectedWorker={selectedWorker}
            chatEndRef={chatEndRef}
            onSendMessage={handleSendMessage}
            onMessageChange={setNewMessage}
            formatTime={formatTime}
            toggleAnnouncements={handleToggleAnnouncements} // <-- updated
            isMobile={isMobile}
            onBack={handleBackToSidebar}
          />
        </div>
      )}

      {/* Announcements Panel for desktop */}
      {showAnnouncements && !isMobile && (
        <div className="w-full md:w-1/3 h-full flex-shrink-0 bg-white shadow-md p-4 rounded-lg transition-all duration-300">
          <WorkerAnnouncementView />
        </div>
      )}

      {/* Modal for mobile */}
      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width="90%"
        bodyStyle={{ padding: 0 }}
      >
        <WorkerAnnouncementView />
      </Modal>
    </div>
  );
};

export default WorkerChat;
