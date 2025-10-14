import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { RiMessage3Line } from "react-icons/ri";
import Swal from "sweetalert2";
import socket from "../../types/socket";

type Message = {
  id: number;
  message: string;
  sender: string; // "client" or "worker"
  timestamp: string;
};

const MessageClient = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState("");
  const [sentGreeting, setSentGreeting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const storedUserRole = sessionStorage.getItem("userRole");
    const storedUserId = sessionStorage.getItem("user_id");
    if (!storedUserRole || !storedUserId) return;

    setUserRole(storedUserRole);
    setUserId(storedUserId);

    // Join Socket.IO room only once
    if (storedUserRole === "client") {
      socket.emit("joinClientRoom", storedUserId);
    } else if (storedUserRole === "worker") {
      socket.emit("joinWorkerRoom", storedUserId);
    }

    // Listen once for incoming messages
    const handleNewMessage = (data: any) => {
      if (data.receiver_id === storedUserId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.id)) return prev;
          const updated = [...prev, data];
          sessionStorage.setItem("messages", JSON.stringify(updated));
          return updated;
        });
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    };

    socket.on("newMessage", handleNewMessage);

    // Fetch initial messages
    const fetchMessages = async () => {
      try {
        const res =
          storedUserRole === "client"
            ? await axios.get(`${apiUrl}/getClientMessages/${storedUserId}`)
            : await axios.get(`${apiUrl}/getWorkerMessages/${storedUserId}`);
        setMessages(res.data.reverse());
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, []); // ✅ Empty array — run once only

  // Greeting
  useEffect(() => {
    if (isOpen && !sentGreeting) {
      const greetingMessage: Message = {
        id: Date.now(),
        sender: "worker",
        message: "Hello! How can I assist you today?",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [greetingMessage, ...prev]);
      setSentGreeting(true);
    }
  }, [isOpen, sentGreeting]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageData = {
      message: newMessage,
      sender_role: userRole,
      sender_id: userId,
    };

    try {
      const res = await axios.post(
        `${apiUrl}/sendMessageToAllWorkers`,
        messageData
      );
      const newMessageObj: Message = {
        id: res.data.message_id,
        message: newMessage,
        sender: "client",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newMessageObj]);
      setNewMessage("");

      socket.emit("newMessageToWorker", {
        ...newMessageObj,
        receiver_role: "worker",
      });

      Swal.fire({
        icon: "success",
        showConfirmButton: false,
        title: "Message Sent!",
        timer: 2000,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const toggleMessenger = () => setIsOpen(!isOpen);

  return (
    <div className="fixed z-50">
      <div
        onClick={toggleMessenger}
        className="fixed flex items-center justify-center bg-sky-600 text-white rounded-full h-16 w-16 shadow-lg border-4 right-4 bottom-4 cursor-pointer z-50 hover:bg-sky-700 transition-all"
      >
        <RiMessage3Line size={35} />
      </div>

      {isOpen && (
        <div className="fixed right-2 bottom-20 w-[90vw] sm:w-80 h-[70vh] sm:h-[400px] bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
          <div className="bg-sky-600 text-white p-4 font-semibold flex justify-between items-center">
            <span>Messenger</span>
            <button onClick={toggleMessenger} className="text-white">
              ✖
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-100">
            {messages.length > 0 ? (
              messages.map((msg) => (
                <div
                  key={`${msg.id}-${msg.timestamp}`}
                  className={`flex ${
                    msg.sender === "worker" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg max-w-[70%] ${
                      msg.sender === "client"
                        ? "bg-green-500 text-white"
                        : "bg-gray-300 text-black"
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500">No messages</div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 bg-white border-t flex items-center gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none"
            />
            <button
              onClick={handleSendMessage}
              className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageClient;
