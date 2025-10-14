/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DeleteOutlined,
  EditOutlined,
  FilterOutlined,
  FolderOutlined,
  SearchOutlined,
  UploadOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import {
  Input as AntInput,
  Button,
  Dropdown,
  Form,
  Input,
  Menu,
  Modal,
  Table,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import styled from "styled-components";
import AddWorkersForm from "../../components/form/AddWorkers";

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

interface WorkersItem {
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

const ManageWorker = () => {
  const [dataSource, setDataSource] = useState<WorkersItem[]>([]);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [dataEdit, setDataEdit] = useState<WorkersItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMenus = dataSource.slice(indexOfFirstItem, indexOfLastItem);

  // Fetch menu items from the database
  useEffect(() => {
    const fetchWorkersItems = async () => {
      try {
        const response = await axios.get("http://localhost:8081/get_workers");
        console.log("Fetched Data:", response.data); // Debugging

        // Filter only workers in case the backend returns more roles
        const workersOnly = response.data.filter(
          (worker: WorkersItem) => worker.role === "worker"
        );

        setDataSource(workersOnly);
      } catch (error) {
        console.error("Error fetching workers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkersItems();
  }, []);
  const handleAddWorkers = async () => {
    try {
      const response = await axios.get("http://localhost:8081/get_workers");
      console.log("Updated Data:", response.data);

      // Ensure only workers are displayed
      const workersOnly = response.data.filter(
        (worker: WorkersItem) => worker.role === "worker"
      );

      setDataSource(workersOnly);
      setIsAddModalVisible(false);
    } catch (error) {
      console.error("Error fetching updated workers:", error);
    }
  };

  // Handlers
  const handleViewDetails = (record: any) => {
    setSelectedItem(record);
    setIsDetailModalVisible(true);
  };

  const handleEdit = (record: WorkersItem) => {
    setSelectedItem(record);
    setDataEdit([record]); // Store the selected item for editing
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = (values: Partial<WorkersItem>) => {
    const updatedData = dataEdit.map((item: WorkersItem) =>
      item.key === selectedItem.key ? { ...selectedItem, ...values } : item
    );
    setDataSource(updatedData);
    setIsEditModalVisible(false);
    setSelectedItem(null);
  };

  // Columns
  const columns = [
    {
      title: "Name",
      dataIndex: "fname",
      key: "fname",
      render: (text: any, record: any) => (
        <div className="flex items-center gap-3">
          <img
            src={`http://localhost:8081/uploads/images/${record.profile_pic}`}
            alt={record.fname}
            className="w-10 h-10 rounded"
          />

          <span>{text}</span>
        </div>
      ),
    },
    {
      title: "ID Picture",
      dataIndex: "id_pic",
      key: "id_pic",
      render: (_text: any, record: any) => (
        <div className="flex items-center gap-3">
          {record.id_pic ? (
            <img
              src={`http://localhost:8081/uploads/images/${record.id_pic}`}
              alt="ID Worker"
              className="w-10 h-10 rounded"
            />
          ) : (
            <span className="text-gray-500 italic">No ID Picture Yet</span>
          )}
          <span>Worker ID</span>
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
      render: (_: any, record: any) => (
        <div className="flex gap-2">
          <ActionButton
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => handleViewDetails(record)}
          />
          <ActionButton
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <ActionButton danger icon={<DeleteOutlined />} />
        </div>
      ),
    },
  ];

  return (
    <StyledContainer className="max-w-full overflow-x-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold">Workers List</h2>
          <p className="text-gray-500 text-sm">Manage your workers</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => setIsAddModalVisible(true)}
          >
            Add Worker
          </Button>
          <Button
            className="bg-red-500 text-white hover:bg-red-600 rounded-md shadow-md"
            icon={<FolderOutlined />}
          >
            Archived
          </Button>
          <Button type="default" icon={<UploadOutlined />}>
            Import
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
        <Input
          placeholder="Search workers"
          prefix={<SearchOutlined />}
          className="sm:w-1/3 bg-gray-100"
        />
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="1">Sort by Date</Menu.Item>
              <Menu.Item key="2">Sort by Name</Menu.Item>
            </Menu>
          }
          trigger={["click"]}
        >
          <Button icon={<FilterOutlined />} className="flex items-center">
            Sort
          </Button>
        </Dropdown>
      </div>

      {/* Worker Table */}
      {isLoading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <StyledTable
          dataSource={currentMenus}
          columns={columns}
          pagination={{
            current: currentPage,
            pageSize: itemsPerPage,
            total: dataSource.length,
            onChange: (page) => setCurrentPage(page),
          }}
          scroll={{ x: true }} // Enables scroll on small devices
        />
      )}

      {/* View Details Modal */}
      <Modal
        title="Worker Details"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Close
          </Button>,
        ]}
      >
        {selectedItem && (
          <div className="flex items-start gap-6">
            {/* Profile Image on the left */}
            <img
              src={`http://localhost:8081/uploads/images/${selectedItem.profile_pic}`}
              alt="Profile"
              style={{
                width: "150px",
                height: "150px",
                objectFit: "cover",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            />

            {/* Basic Info on the right */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <p className="text-gray-500 font-medium">First Name</p>
                <p className="text-black">{selectedItem.fname}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Last Name</p>
                <p className="text-black">{selectedItem.lname}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Email</p>
                <p className="text-black">{selectedItem.email}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Address</p>
                <p className="text-black">{selectedItem.address}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Status</p>
                <p className="text-black">{selectedItem.status}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Role</p>
                <p className="text-black">{selectedItem.role}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Info Modal */}
      <Modal
        title="Edit Food Info"
        visible={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
      >
        {selectedItem && (
          <Form
            initialValues={selectedItem}
            onFinish={handleSaveEdit}
            layout="vertical"
          >
            <Form.Item
              label="Name"
              name="fname"
              rules={[{ required: true, message: "Name is required" }]}
            >
              <AntInput />
            </Form.Item>
            <Form.Item
              label="Last Name"
              name="lname"
              rules={[{ required: true, message: "Last Name is required" }]}
            >
              <AntInput />
            </Form.Item>
            <Form.Item
              label="Address"
              name="address"
              rules={[{ required: true, message: "Address is required" }]}
            >
              <AntInput />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: "Email is required" }]}
            >
              <AntInput />
            </Form.Item>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setIsEditModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Save
              </Button>
            </div>
          </Form>
        )}
      </Modal>
      <AddWorkersForm
        isAddModalVisible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onAddWorker={handleAddWorkers}
      />
    </StyledContainer>
  );
};

export default ManageWorker;
