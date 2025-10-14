import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { Input, notification } from "antd";
import axios from "axios";
import { useState } from "react";

const SecuritySettings = ({ user_id }: { user_id: string | null }) => {
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false); // State for saving process
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] =
    useState<boolean>(false);
  const apiUrl = import.meta.env.VITE_API_URL;
  const handlePasswordChange = async () => {
    if (!password || !confirmPassword) {
      notification.error({
        message: "Error",
        description: "Both password fields must be filled out.",
      });
      return;
    }

    if (password !== confirmPassword) {
      notification.error({
        message: "Error",
        description: "Passwords do not match.",
      });
      return;
    }

    setIsSaving(true); // Set isSaving to true when the password update starts

    try {
      const response = await axios.put(`${apiUrl}/update_password/${user_id}`, {
        password,
      });

      // Check response or status to ensure successful update
      if (response.status === 200) {
        notification.success({
          message: "Password Updated Successfully",
          description: "Your password has been updated.",
        });
      } else {
        notification.error({
          message: "Error Updating Password",
          description: "There was an issue updating your password.",
        });
      }
    } catch (error) {
      console.error("Error updating password:", error);
      notification.error({
        message: "Error Updating Password",
        description: "An error occurred while updating the password.",
      });
    } finally {
      setIsSaving(false); // Reset isSaving once the request is complete
    }
  };

  return (
    <div className="bg-white p-6">
      <form className="grid grid-cols-1 gap-6">
        {/* New Password Field */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            New Password
          </label>
          <Input
            type={passwordVisible ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            addonAfter={
              passwordVisible ? (
                <EyeInvisibleOutlined
                  onClick={() => setPasswordVisible(false)}
                />
              ) : (
                <EyeOutlined onClick={() => setPasswordVisible(true)} />
              )
            }
          />
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Confirm Password
          </label>
          <Input
            type={confirmPasswordVisible ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            addonAfter={
              confirmPasswordVisible ? (
                <EyeInvisibleOutlined
                  onClick={() => setConfirmPasswordVisible(false)}
                />
              ) : (
                <EyeOutlined onClick={() => setConfirmPasswordVisible(true)} />
              )
            }
          />
        </div>
      </form>

      <div className="mt-8 flex justify-end gap-4">
        <button
          onClick={handlePasswordChange}
          disabled={isSaving}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
        >
          {isSaving ? "Saving..." : "Update Password"}
        </button>
      </div>
    </div>
  );
};

export default SecuritySettings;
