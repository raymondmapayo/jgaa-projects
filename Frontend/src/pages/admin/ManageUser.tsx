/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DeleteOutlined,
  EditOutlined,
  FilterOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import { Button, Dropdown, Menu, Table } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import styled from "styled-components";
import Shimmer from "../../components/common/Shimmer";

// Styled Components
const StyledContainer = styled.div`
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.08);
  transition: background-color 0.3s;

  .dark & {
    background-color: #001f3f;
    color: white;
  }
`;

const StyledTable = styled(Table)`
  .ant-table-thead > tr > th {
    background: #f9fafb;
    font-weight: bold;
    color: #4b5563;
  }
  .ant-table {
    border-radius: 8px;
  }
  @media (max-width: 768px) {
    .ant-table {
      font-size: 14px;
    }
  }
`;

const ActionButton = styled(Button)`
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  &:hover {
    transform: scale(1.05);
  }
`;

interface UsersItem {
  user_id: number;

  key: string;
  fname: string;
  lname: string;
  pnum: string;
  id_pic: string;
  email: string;
  password: string;
  confirm_password: string;
  status: string;
  address: string;
  role: string;
  profile_pic: string;
}

const ManageUser = () => {
  const [dataSource, setDataSource] = useState<UsersItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = dataSource.slice(indexOfFirstItem, indexOfLastItem);
  // Fetch menu items from the database
  useEffect(() => {
    const fetchClientsItems = async () => {
      try {
        const response = await axios.get("http://localhost:8081/get_users");
        console.log("Fetched Data:", response.data); // Debugging

        // Ensure user_id exists
        response.data.forEach((user: any) => {
          console.log(`User ID: ${user.user_id}, Type: ${typeof user.user_id}`);
        });

        const clientOnly = response.data.filter(
          (client: UsersItem) => client.role === "client"
        );

        setDataSource(clientOnly);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientsItems();
  }, []);

  // Columns
  const columns = [
    {
      title: "User ID",
      dataIndex: "user_id",
      key: "user_id",
    },
    {
      title: "Name",
      dataIndex: "fname",
      key: "fname",
      render: (text: any, record: any) => (
        <div className="flex items-center gap-3">
          {record.profile_pic ? (
            <img
              src={`http://localhost:8081/uploads/images/${record.profile_pic}`}
              alt={record.fname}
              className="w-10 h-10 rounded"
            />
          ) : (
            <img
              src="/avatar.jpg" // Replace with the actual image URL
              alt="User Avatar"
              className="w-10 h-10 rounded"
            />
          )}
          <span>{text}</span>
        </div>
      ),
    },

    {
      title: "Last Name",
      dataIndex: "lname",
      key: "lname",
    },
    {
      title: "Phone Number",
      dataIndex: "pnum",
      key: "pnum",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const formattedStatus =
          status.charAt(0).toUpperCase() + status.slice(1); // Capitalize first letter
        const statusColors: Record<string, string> = {
          Active: "text-green-500",
          Inactive: "text-red-500",
        };
        return (
          <span
            className={`${
              statusColors[formattedStatus] || "text-gray-500"
            } font-bold`}
          >
            {formattedStatus}
          </span>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: () => (
        <div className="flex gap-2">
          <ActionButton type="primary" icon={<EditOutlined />} />
          <ActionButton danger icon={<DeleteOutlined />} />
        </div>
      ),
    },
  ];
  return (
    <StyledContainer className="max-w-full overflow-x-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-gray-500 text-sm">Easily manage all users</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            className="bg-red-500 text-white hover:bg-red-600 rounded-md shadow-md"
            icon={<FolderOutlined />}
            onClick={() => console.log("Archived button clicked")}
          >
            Archived
          </Button>
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="1">Sort by Name</Menu.Item>
                <Menu.Item key="2">Sort by Status</Menu.Item>
              </Menu>
            }
            trigger={["click"]}
          >
            <Button icon={<FilterOutlined />} className="flex items-center">
              Sort by Name
            </Button>
          </Dropdown>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <Shimmer />
      ) : (
        <StyledTable
          dataSource={currentUsers}
          columns={columns}
          pagination={{
            current: currentPage,
            pageSize: itemsPerPage,
            total: dataSource.length,
            onChange: (page) => setCurrentPage(page),
          }}
          scroll={{ x: true }} // Makes it scrollable on mobile
        />
      )}
    </StyledContainer>
  );
};

export default ManageUser;
