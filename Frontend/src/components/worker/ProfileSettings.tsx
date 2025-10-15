import { notification } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";

// Define the structure of the user data
interface UsersItem {
  user_id: number;
  fname: string;
  lname: string;
  pnum: string;
  email: string;
  address: string;
  profile_pic: string;
}

// Define the props for ProfileSettings, accepting user_id
interface ProfileSettingsProps {
  user_id: string | null;
}

const ProfileSettings = ({ user_id }: ProfileSettingsProps) => {
  const [userData, setUserData] = useState<UsersItem | null>(null);
  const [initialData, setInitialData] = useState<UsersItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newProfilePic, setNewProfilePic] = useState<File | null>(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${apiUrl}/get_user/${user_id}`);
      setUserData(response.data || null);
      setInitialData(response.data || null);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user_id) fetchUserData();
  }, [user_id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0])
      setNewProfilePic(e.target.files[0]);
  };

  const handleCancelChanges = () => {
    setUserData(initialData);
    setNewProfilePic(null);
  };

  const handleSaveChanges = async () => {
    if (!userData) return;

    setIsSaving(true);
    const formData = new FormData();
    formData.append("user_id", userData.user_id.toString());
    formData.append("fname", userData.fname);
    formData.append("lname", userData.lname);
    formData.append("email", userData.email);
    formData.append("pnum", userData.pnum);
    formData.append("address", userData.address);

    if (newProfilePic) formData.append("profile_pic", newProfilePic);
    else formData.append("profile_pic", userData.profile_pic);

    try {
      // No need to assign to a variable if you don't use it
      await axios.put(`${apiUrl}/update_user/${userData.user_id}`, formData);

      notification.success({
        message: "Changes Saved Successfully",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      console.error("Error updating user:", error);
      notification.error({
        message: "Error Saving Changes",
        description:
          "An error occurred while saving changes. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="text-lg font-medium">Loading...</div>;
  if (!userData)
    return (
      <div className="text-lg font-medium text-gray-600 dark:text-gray-300">
        No user data available
      </div>
    );

  return (
    <div className="bg-white dark:bg-[#0f172a] w-full min-h-screen p-6">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800 dark:text-white">
        Profile
      </h1>

      {/* Inner content container stretching full width */}
      <div className="w-full max-w-[100%]">
        {/* Photo + Upload Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center mb-8 gap-6">
          <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0">
            <img
              src={
                newProfilePic
                  ? URL.createObjectURL(newProfilePic)
                  : userData.profile_pic
                  ? `${apiUrl}/uploads/images/${userData.profile_pic}`
                  : "/avatar.jpg"
              }
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-2">
            <input
              type="file"
              id="profile-upload"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="profile-upload"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 font-medium cursor-pointer"
            >
              {newProfilePic ? "Change photo" : "Upload new photo"}
            </label>
            {newProfilePic && (
              <button
                onClick={() => setNewProfilePic(null)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            )}
            <p className="text-gray-500 text-sm font-light">
              Allowed JPG, GIF, or PNG. Max size of 800K
            </p>
          </div>
        </div>

        {/* Form Section */}
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <div>
            <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
              First Name
            </label>
            <input
              type="text"
              value={userData.fname}
              onChange={(e) =>
                setUserData({ ...userData, fname: e.target.value })
              }
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#0f172a] dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={userData.lname}
              onChange={(e) =>
                setUserData({ ...userData, lname: e.target.value })
              }
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#0f172a] dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
              E-mail
            </label>
            <input
              type="email"
              value={userData.email}
              onChange={(e) =>
                setUserData({ ...userData, email: e.target.value })
              }
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#0f172a] dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
              Phone Number
            </label>
            <input
              type="text"
              value={userData.pnum}
              onChange={(e) =>
                setUserData({ ...userData, pnum: e.target.value })
              }
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#0f172a] dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
              Address
            </label>
            <input
              type="text"
              value={userData.address}
              onChange={(e) =>
                setUserData({ ...userData, address: e.target.value })
              }
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#0f172a] dark:border-gray-600 dark:text-white"
            />
          </div>
        </form>

        {/* Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row justify-end gap-4 w-full">
          <button
            onClick={handleCancelChanges}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
