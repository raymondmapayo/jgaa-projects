import { FilterOutlined, SearchOutlined } from "@ant-design/icons";
import {
  Button,
  Dropdown,
  Input,
  Menu,
  notification,
  Progress,
  Table,
  Tooltip,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import styled from "styled-components";

// Styled Components
const StyledContainer = styled.div`
  background-color: #fff;
  border-radius: 8px;
`;

const StyledTable = styled(Table)`
  .ant-table-thead > tr > th {
    background: #f5f5f5;
    font-weight: bold;
  }
`;

interface Activity {
  activityID: string;
  user: string;
  date: string;
  type: string;
  details: string;
  status: string; // We will use `order_status` for the progress bar
}

// Columns definition
const columns = [
  {
    title: "Activity ID",
    dataIndex: "activityID",
    key: "activityID",
  },
  {
    title: "User",
    dataIndex: "user",
    key: "user",
  },
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
  },
  {
    title: "Type",
    dataIndex: "type",
    key: "type",
  },
  {
    title: "Details",
    dataIndex: "details",
    key: "details",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: string) => {
      const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1); // Capitalize first letter

      // Set progress percentage based on order_status
      const progressPercentage: Record<string, number> = {
        Pending: 25,
        Processing: 50,
        Completed: 100,
        Cancelled: 0,
      };

      // Set color based on the status
      const orderStatusColors: Record<string, string> = {
        Pending: "text-red-500", // Red for Pending
        Processing: "text-blue-500", // Blue for Processing
        Completed: "text-green-500", // Green for Completed
        Cancelled: "text-red-500", // Red for Cancelled
      };

      // If status is "Processing", show the progress bar
      if (formattedStatus === "Processing") {
        return (
          <Tooltip title={`${progressPercentage[formattedStatus]}%`}>
            <Progress
              percent={progressPercentage[formattedStatus]} // Set the progress percentage
              status="active"
              showInfo={false}
            />
          </Tooltip>
        );
      }

      // For other statuses, just display the status text with corresponding color
      return (
        <span
          className={`${
            orderStatusColors[formattedStatus] || "text-gray-500"
          } font-bold`}
        >
          {formattedStatus}
        </span>
      );
    },
  },
];

const ActivityLog = () => {
  const [activityData, setActivityData] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL;
  // Function to format the date to "yyyy-MM-dd"
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA"); // This gives the format yyyy-MM-dd
  };

  // Function to fetch activity and reservation data
  const fetchActivityAndReservationData = async () => {
    const userId = sessionStorage.getItem("user_id");

    if (!userId) {
      console.error("User ID not found in session storage");
      notification.error({
        message: "Error Fetching Data",
        description: "User ID is missing, please log in again.",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Fetching Activity Data
      const activityResponse = await axios.get(
        `${apiUrl}/fetch_activity_user/${userId}`
      );
      console.log("Fetched Activity Data:", activityResponse.data);

      // Add "ACT" prefix to activity IDs and format the date
      const activityData = activityResponse.data.map((activity: any) => ({
        activityID: `ACT${activity.order_id}`, // Add "ACT" prefix
        user: `${activity.fname} ${activity.lname}`,
        date: formatDate(activity.activity_date), // Format date
        type: activity.order_type,
        details: activity.item_name,
        status: activity.order_status, // This is where we use order_status
      }));

      // Fetching Reservation Activity Data
      const reservationResponse = await axios.get(
        `${apiUrl}/fetch_reservation_activity/${userId}`
      );
      console.log("Fetched Reservation Data:", reservationResponse.data);

      // Add "ACT" prefix to reservation IDs and format the date
      const reservationData = reservationResponse.data.map((activity: any) => ({
        activityID: `ACT${activity.reservation_id}`, // Add "ACT" prefix
        user: activity.full_name,
        date: formatDate(activity.activity_date), // Format date
        type: activity.reservation_type,
        details: `Reserve Table ${activity.table_id}`,
        status: activity.status, // Same field for status
      }));

      setActivityData([...activityData, ...reservationData]);
    } catch (error) {
      console.error("Error fetching data:", error);
      notification.error({
        message: "Error Fetching Data",
        description: "An error occurred while fetching the data.",
      });
    } finally {
      setIsLoading(false); // Set loading to false after data is fetched
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchActivityAndReservationData();
  }, []);

  return (
    <StyledContainer>
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold">User Activity Log</h2>
          <p className="text-gray-500">Track user activities</p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Search"
          prefix={<SearchOutlined />}
          className="w-1/4 bg-gray-100"
        />
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="1">Sort by Date</Menu.Item>
              <Menu.Item key="2">Sort by Type</Menu.Item>
            </Menu>
          }
          trigger={["click"]}
        >
          <Button icon={<FilterOutlined />} className="flex items-center">
            Filter Logs
          </Button>
        </Dropdown>
      </div>

      {/* Activity Log Table */}
      <StyledTable
        dataSource={activityData}
        columns={columns}
        pagination={{ pageSize: 3, showSizeChanger: false }}
        loading={isLoading} // Show loading indicator when data is being fetched
      />
    </StyledContainer>
  );
};

export default ActivityLog;
