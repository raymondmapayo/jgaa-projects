import { notification } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";

interface UsersItem {
  user_id: number;
  fname: string;
  lname: string;
  pnum: string;
  email: string;
  address: string;
  profile_pic: string;
}

const ProfileAdmin = () => {
  const [userData, setUserData] = useState<UsersItem | null>(null);
  const [initialData, setInitialData] = useState<UsersItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newProfilePic, setNewProfilePic] = useState<File | null>(null);

  const user_id = sessionStorage.getItem("user_id");

  const fetchUserData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8081/get_user/${user_id}`
      );
      setUserData(response.data || null);
      setInitialData(response.data || null);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user_id) {
      fetchUserData();
    }
  }, [user_id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewProfilePic(e.target.files[0]);
    }
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

    if (newProfilePic) {
      formData.append("profile_pic", newProfilePic);
    } else {
      formData.append("profile_pic", userData.profile_pic);
    }

    try {
      await axios.put(
        `http://localhost:8081/update_user/${userData.user_id}`,
        formData
      );

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

  if (isLoading) {
    return <div className="text-lg font-medium">Loading...</div>;
  }

  if (!userData) {
    return (
      <div className="text-lg font-medium text-gray-600 dark:text-gray-300">
        No user data available
      </div>
    );
  }

  return (
    <div className="dark:bg-gray-900 dark:text-white p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800 dark:text-white">
        Profile
      </h1>

      <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
        {/* Profile Photo Section */}
        <div className="flex flex-col sm:flex-row items-center mb-8">
          <div className="w-24 h-24 rounded-full overflow-hidden mr-0 sm:mr-6 mb-4 sm:mb-0">
            <img
              src={
                newProfilePic
                  ? URL.createObjectURL(newProfilePic)
                  : userData.profile_pic
                  ? `http://localhost:8081/uploads/images/${userData.profile_pic}`
                  : "/avatar.jpg"
              }
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center sm:text-left">
            <input
              type="file"
              id="profile-upload"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="profile-upload"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-blue-600 font-medium cursor-pointer"
            >
              {newProfilePic ? "Change photo" : "Upload new photo"}
            </label>
            {newProfilePic && (
              <button
                onClick={() => setNewProfilePic(null)}
                className="bg-gray-300 dark:bg-gray-600 dark:text-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 mt-2"
              >
                Cancel
              </button>
            )}
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 font-light">
              Allowed JPG, GIF, or PNG. Max size of 800K
            </p>
          </div>
        </div>

        {/* Form Section */}
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: "First Name", key: "fname" },
            { label: "Last Name", key: "lname" },
            { label: "E-mail", key: "email" },
            { label: "Phone Number", key: "pnum" },
            { label: "Address", key: "address" },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                {field.label}
              </label>
              <input
                type={field.key === "email" ? "email" : "text"}
                value={(userData as any)[field.key]}
                onChange={(e) =>
                  setUserData({ ...userData!, [field.key]: e.target.value })
                }
                className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </form>

        {/* Buttons Section */}
        <div className="mt-8 flex flex-col sm:flex-row justify-end gap-4">
          <button
            onClick={handleCancelChanges}
            className="bg-gray-300 dark:bg-gray-600 dark:text-white text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
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

export default ProfileAdmin;
