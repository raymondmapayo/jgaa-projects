import { DefaultEventsMap } from "@socket.io/component-emitter";
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

  const socket = useRef<Socket<DefaultEventsMap, DefaultEventsMap> | null>(
    null
  );
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const workerId = sessionStorage.getItem("user_id");
  const workerIdNum = workerId ? parseInt(workerId) : null;
  const apiUrl = import.meta.env.VITE_API_URL;
  // Connect socket
  useEffect(() => {
    socket.current = io(`${apiUrl}`);
    return () => {
      socket.current?.disconnect();
    };
  }, []);

  // Fetch admins + clients
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

  // 🔹 Automatically select first user after admins and clients are loaded
  useEffect(() => {
    if (!selectedUser && (admins.length > 0 || clients.length > 0)) {
      setSelectedUser(admins.length > 0 ? admins[0] : clients[0]);
    }
  }, [admins, clients, selectedUser]);

  // Fetch messages
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

        // 🔹 Scroll to latest message on load
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 1000);
    return () => clearInterval(interval);
  }, [selectedUser, workerIdNum]);

  // Fetch worker profile
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

      // Scroll to the bottom after sending
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (t: string) =>
    new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex w-full bg-gray-50 p-4 gap-4">
      <Sidebar
        admins={admins}
        clients={clients}
        selectedUser={selectedUser}
        onSelectUser={(user: User) => setSelectedUser(user)}
      />

      <ChatWindow
        messages={messages}
        newMessage={newMessage}
        selectedUser={selectedUser}
        selectedWorker={selectedWorker}
        chatEndRef={chatEndRef}
        onSendMessage={handleSendMessage}
        onMessageChange={setNewMessage}
        formatTime={formatTime}
        toggleAnnouncements={() => setShowAnnouncements((prev) => !prev)}
      />

      {/* Announcements panel */}
      {showAnnouncements && (
        <div className="w-1/3 bg-white shadow-md p-4 rounded-lg transition-all duration-300">
          <WorkerAnnouncementView />
        </div>
      )}
    </div>
  );
};

export default WorkerChat;
