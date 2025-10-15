import { FaSearch } from "react-icons/fa";

type SidebarProps = {
  admins: any[];
  clients: any[];
  selectedUser: any;
  onSelectUser: (user: any) => void;
};
const apiUrl = import.meta.env.VITE_API_URL;

const Sidebar = ({
  admins,
  clients,
  selectedUser,
  onSelectUser,
}: SidebarProps) => {
  return (
    <div className="flex flex-col h-full w-full bg-white border-r shadow-md md:rounded-lg">
      {/* Header */}
      <div className="bg-white z-10 p-4 border-b md:rounded-t-lg">
        <h2 className="text-lg font-bold mb-4">Workers</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-3 py-2 rounded-lg border bg-gray-100 focus:outline-none"
          />
          <FaSearch className="absolute right-3 top-3 text-gray-400" />
        </div>
      </div>

      {/* Worker list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {[...admins, ...clients].map((user) => (
          <div
            key={user.user_id}
            className={`flex items-center p-3 cursor-pointer rounded-lg hover:bg-gray-200 ${
              selectedUser?.user_id === user.user_id
                ? "bg-gray-300"
                : "bg-white"
            }`}
            onClick={() => onSelectUser(user)}
          >
            <div className="relative w-10 h-10 mr-3 flex-shrink-0">
              <img
                src={
                  user.profile_pic && user.profile_pic !== ""
                    ? `${apiUrl}/uploads/images/${user.profile_pic}`
                    : "/avatar.jpg"
                }
                alt={`${user.fname} ${user.lname}`}
                className="w-full h-full rounded-full object-cover"
              />
              {user.status === "active" && (
                <div className="absolute w-3 h-3 bg-green-500 rounded-full bottom-0 right-0 border-2 border-white"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">
                {user.fname} {user.lname}
              </h3>
            </div>
            <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
              Last seen: 2 hours ago
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
