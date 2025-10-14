import { notification } from "antd"; // Ant Design notification import
import axios from "axios";
import { useEffect, useState } from "react";

// Define the shape of billing data
interface BillingData {
  fname: string;
  lname: string;
  email: string;
  pnum: string;
  city: string;
  country: string;
  notes: string;
}

const BillingDetails = () => {
  const [billingData, setBillingData] = useState<BillingData>({
    fname: "",
    lname: "",
    email: "",
    pnum: "",
    city: "",
    country: "",
    notes: "",
  });

  const [errors, setErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // Track saving state

  const userId = sessionStorage.getItem("user_id");
  const apiUrl = import.meta.env.VITE_API_URL;
  // If user_id is not found in sessionStorage, handle this error
  if (!userId) {
    console.error("User ID not found in session storage.");
    return <div>No user found. Please login again.</div>;
  }

  // Fetch user data on component mount
  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${apiUrl}/user_details/${userId}`);
      console.log("Fetched Data:", response.data);

      const userData = response.data.data;
      if (userData) {
        const { fname, lname, email, pnum, city, country, notes } = userData;
        setBillingData((prevData) => ({
          ...prevData,
          fname,
          lname,
          email,
          pnum,
          city,
          country,
          notes,
        }));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const handleChange = (field: keyof BillingData, value: string) => {
    setBillingData({ ...billingData, [field]: value });
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!billingData.city) newErrors.city = "City is required";
    if (!billingData.country) newErrors.country = "Country is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    setBillingData({
      ...billingData,
      city: "",
      country: "",
      notes: "",
    });
    setErrors({});
  };

  // Handle save for city, country, and notes
  const handleSave = async () => {
    if (validateForm()) {
      setIsSaving(true);

      try {
        // Send the data to the backend as JSON
        const response = await axios.put(
          `${apiUrl}/update_save_billing_details/${userId}`,
          {
            city: billingData.city,
            country: billingData.country,
            // Send notes as null if it is empty
            notes:
              billingData.notes.trim() !== "" ? billingData.notes : undefined, // Use undefined for empty notes
          }
        );

        console.log("Billing details updated:", response.data);

        if (response.data.success) {
          // Fetch the updated user details to ensure the changes are reflected
          fetchUserData();

          notification.success({
            message: "Changes Saved Successfully",
            description: "Your changes have been saved successfully.",
          });
        }
      } catch (error) {
        // Log the error to the console
        console.error("Error updating billing details:", error);

        // Show error notification using Ant Design
        notification.error({
          message: "Error Saving Changes",
          description:
            "An error occurred while saving changes: " +
            (error instanceof Error ? error.message : String(error)),
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (isLoading) {
    return <div className="text-lg font-medium">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">
        Billing Details
      </h1>
      <div className="bg-white">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: "First Name", key: "fname" },
            { label: "Last Name", key: "lname" },
            { label: "Email Address", key: "email", type: "email" },
            { label: "Phone No", key: "pnum" },
          ].map(({ label, key, type = "text" }) => (
            <div key={key}>
              <label className="block text-gray-700 font-medium mb-2">
                {label}
              </label>
              <input
                type={type}
                placeholder={label}
                value={billingData[key as keyof BillingData]}
                readOnly
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          ))}
          {[
            { label: "Town/City", key: "city" },
            { label: "Country", key: "country" },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-gray-700 font-medium mb-2">
                {label}
              </label>
              <input
                type="text"
                placeholder={billingData[key as keyof BillingData] || label}
                value={billingData[key as keyof BillingData]}
                onChange={(e) =>
                  handleChange(key as keyof BillingData, e.target.value)
                }
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {errors[key] && (
                <p className="text-red-500 text-xs mt-1">{errors[key]}</p>
              )}
            </div>
          ))}
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-medium mb-2">
              Order Notes (Optional)
            </label>
            <textarea
              value={billingData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={4}
              placeholder="Order Notes (Optional)"
            />
          </div>
        </form>
        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className={`${
              Object.keys(errors).length > 0
                ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                : "bg-orange-500 text-white hover:bg-orange-600"
            } px-6 py-2 rounded-lg`}
            disabled={Object.keys(errors).length > 0}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillingDetails;
