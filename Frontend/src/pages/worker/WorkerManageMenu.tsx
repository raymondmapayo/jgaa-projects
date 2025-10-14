/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  EditOutlined,
  FilterOutlined,
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Button, Dropdown, Input, Menu, Table, Tag, Tooltip } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import styled from "styled-components";
import AddMenuForm from "../../components/form/AddMenu";
import MenuEditModal from "../WorkerModals/MenuEditModal";
import ViewDetailsModal from "../WorkerModals/ViewDetailsModal";

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
    color: #374151;
  }
  .ant-table {
    border-radius: 8px;
  }
  tr:hover td {
    background-color: #f9fafb !important;
  }
  @media (max-width: 768px) {
    .ant-table {
      font-size: 13px;
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
interface MenuItem {
  key: string;
  item_name: string;
  category: string;
  price: string;
  description: string;

  menu_img: string;
  menu_id: number; // Add the menu_id property
  availability: string; // Add availability property
}

const WorkerManageMenu = () => {
  const [dataSource, setDataSource] = useState<MenuItem[]>([]);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMenus = dataSource.slice(indexOfFirstItem, indexOfLastItem);
  const apiUrl = import.meta.env.VITE_API_URL;
  // Fetch menu items from the database
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await axios.get(`${apiUrl}/menu_items`);
        console.log("Fetched Data:", response.data);
        setDataSource(response.data);
      } catch (error) {
        console.error("Error fetching menu items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch on mount
    fetchMenuItems();
  }, [apiUrl]);

  // Handlers
  const handleViewDetails = (record: any) => {
    setSelectedItem(record);
    setIsDetailModalVisible(true);
  };

  const handleEdit = (record: MenuItem) => {
    setSelectedItem(record);
    setIsEditModalVisible(true);
  };

  // Updated Save Edit handler
  const handleSaveEdit = async (values: MenuItem) => {
    const updatedData = dataSource.map((item) =>
      item.menu_id === selectedItem?.menu_id ? { ...item, ...values } : item
    );

    setDataSource(updatedData); // update table
    setIsEditModalVisible(false);
    setSelectedItem(null);
  };

  // Table Columns
  const columns = [
    {
      title: "Food Name",
      dataIndex: "item_name",
      key: "item_name",
      render: (text: any, record: any) => (
        <div className="flex items-center gap-3 min-w-[160px]">
          <img
            src={`${apiUrl}/uploads/images/${record.menu_img}`}
            alt={record.item_name}
            className="w-10 h-10 rounded object-cover flex-shrink-0"
          />
          <span className="text-sm sm:text-base">{text}</span>
        </div>
      ),
    },
    { title: "Category", dataIndex: "categories_name", key: "categories_name" },
    { title: "Price", dataIndex: "price", key: "price" },
    { title: "Description", dataIndex: "description", key: "description" },

    {
      title: "Availability",
      dataIndex: "availability",
      key: "availability",
      render: (text: string) => {
        const colors: Record<string, string> = {
          Available: "green",
          Unavailable: "red",
        };
        return <Tag color={colors[text] || "default"}>{text}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <div className="flex gap-2">
          <Tooltip title="View Details">
            <ActionButton
              type="primary"
              icon={<SearchOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Edit Menu">
            <ActionButton
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  // Updated Add Menu handler
  const handleAddMenu = async () => {
    try {
      const response = await axios.get(`${apiUrl}/menu_items`);
      setDataSource(response.data); // refresh table after adding
      setIsAddModalVisible(false);
    } catch (error) {
      console.error("Error fetching updated menu items:", error);
    }
  };
  return (
    <StyledContainer>
      {/* Header Section */}
      <div className="mb-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          {/* Left: Title */}
          <div>
            <h2 className="text-xl font-bold">Menu List</h2>
            <p className="text-gray-500 text-sm">Manage your food menu</p>
          </div>
        </div>

        {/* Search + Actions Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Search */}
          <Input
            placeholder="Search categories"
            prefix={<SearchOutlined />}
            className="w-full sm:w-1/4 bg-gray-100 dark:bg-[#1f2937] dark:text-white custom-placeholder"
          />

          {/* Right Side: Add + Import + Sort */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {/* Add Menu */}
            <Button
              type="primary"
              size="middle"
              icon={<PlusOutlined />}
              onClick={() => setIsAddModalVisible(true)}
              className="px-4 py-1.5 shadow-md w-full sm:w-[140px] text-center"
            >
              Add Menu
            </Button>

            {/* Import Menu */}
            <Button
              type="default"
              size="middle"
              icon={<UploadOutlined />}
              className="px-4 py-1.5 w-full sm:w-[140px] text-center"
            >
              Import Menu
            </Button>

            {/* Sort */}
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item key="1">Sort by Date</Menu.Item>
                  <Menu.Item key="2">Sort by Availability</Menu.Item>
                </Menu>
              }
              trigger={["click"]}
            >
              <Button
                icon={<FilterOutlined />}
                className="w-full sm:w-[140px] px-4 py-1.5 text-center"
              >
                Sort
              </Button>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Menu Table - scrolls on small screens */}
      <div className="overflow-x-auto lg:overflow-x-hidden">
        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
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
            scroll={{ x: true }}
          />
        )}
      </div>

      {/* Modals */}
      <ViewDetailsModal
        isVisible={isDetailModalVisible}
        selectedItem={selectedItem}
        onClose={() => setIsDetailModalVisible(false)}
      />
      <MenuEditModal
        isVisible={isEditModalVisible}
        selectedItem={selectedItem}
        onClose={() => setIsEditModalVisible(false)}
        onSave={handleSaveEdit}
      />
      <AddMenuForm
        isAddModalVisible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onAddMenu={handleAddMenu}
      />
    </StyledContainer>
  );
};

export default WorkerManageMenu;
