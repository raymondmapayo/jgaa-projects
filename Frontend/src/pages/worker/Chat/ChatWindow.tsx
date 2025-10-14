import { Button, Tooltip } from "antd";
import { useEffect } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { IoEllipsisHorizontal } from "react-icons/io5";

type ChatWindowProps = {
  messages: any[];
  newMessage: string;
  selectedUser: any;
  selectedWorker: any;
  chatEndRef: React.RefObject<HTMLDivElement>;
  onSendMessage: () => void;
  onMessageChange: (val: string) => void;
  formatTime: (t: string) => string;
  toggleAnnouncements: () => void; // 🔹 added prop
};
const apiUrl = import.meta.env.VITE_API_URL;
const ChatWindow = ({
  messages,
  newMessage,
  selectedUser,
  selectedWorker,
  chatEndRef,
  onSendMessage,
  onMessageChange,
  formatTime,
  toggleAnnouncements, // 🔹 destructure
}: ChatWindowProps) => {
  // Function to scroll to bottom only if user is near bottom
  const scrollToBottom = () => {
    const container = chatEndRef.current?.parentElement;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      50;

    if (isNearBottom) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Auto-scroll when new messages arrive, only if user is near bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col bg-white border-l shadow-md rounded-lg">
      {/* Header */}
      <div className="bg-white p-4 border-b flex items-center justify-between">
        {selectedUser && (
          <>
            <div className="flex items-center">
              <img
                src={
                  selectedUser.profile_pic && selectedUser.profile_pic !== ""
                    ? `${apiUrl}/uploads/images/${selectedUser.profile_pic}`
                    : "/avatar.jpg"
                }
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <h2 className="text-lg font-bold">
                  {selectedUser.fname} {selectedUser.lname}
                </h2>
                <p className="text-sm text-gray-500">Last seen: 2 hours ago</p>
              </div>
            </div>
            <div className="flex gap-4 text-gray-500 text-xl">
              <Tooltip title="View Announcements" placement="bottom">
                <IoEllipsisHorizontal
                  className="cursor-pointer"
                  onClick={toggleAnnouncements}
                />
              </Tooltip>
            </div>
          </>
        )}
      </div>

      {/* Messages (fills available space & scrolls if needed) */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end mb-4 ${
                msg.sender === "worker" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "worker" && selectedWorker && (
                <img
                  src={
                    selectedWorker.profile_pic
                      ? `${apiUrl}/uploads/images/${selectedWorker.profile_pic}`
                      : "/avatar.jpg"
                  }
                  alt="worker-avatar"
                  className="w-6 h-6 rounded-full mr-2"
                />
              )}
              {msg.sender !== "worker" && selectedUser && (
                <img
                  src={
                    selectedUser.profile_pic
                      ? `${apiUrl}/uploads/images/${selectedUser.profile_pic}`
                      : "/avatar.jpg"
                  }
                  alt="user-avatar"
                  className="w-6 h-6 rounded-full mr-2"
                />
              )}
              <div
                className={`p-3 rounded-lg max-w-xs ${
                  msg.sender === "worker"
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
          <div className="flex items-center justify-center text-gray-400">
            No messages
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input bar stays at bottom */}
      <div className="bg-white p-4 border-t flex items-center">
        <input
          type="text"
          placeholder="Type something here..."
          value={newMessage}
          onChange={(e) => onMessageChange(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none"
        />
        <Button
          type="primary"
          shape="circle"
          onClick={onSendMessage}
          className="ml-3 flex items-center justify-center bg-green-500 hover:bg-green-600 border-none"
          icon={<FaPaperPlane />}
        />
      </div>
    </div>
  );
};

export default ChatWindow;
