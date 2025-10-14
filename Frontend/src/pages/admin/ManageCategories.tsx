import {
  DeleteOutlined,
  EditOutlined,
  FilterOutlined,
  FolderOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Dropdown, Input, Menu, Modal, Table, Tooltip } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import styled from "styled-components";
import AddCategories from "../../components/form/AddCategories";
import Archive from "./AdminModals/Archive";
import CategoriesEditModal from "./AdminModals/CategoriesEditModal";

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
interface CategoryItem {
  key: string;
  categories_name: string;
  categories_img: string;
  description: string;
  status: string;
  categories_id: number;
}

const AdminManageCategories = () => {
  const [dataSource, setDataSource] = useState<CategoryItem[]>([]);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMenus = dataSource.slice(indexOfFirstItem, indexOfLastItem);
  const [isArchivedModalVisible, setIsArchivedModalVisible] = useState(false);

  // Polling function to fetch updated categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8081/get_categories"
        );
        setDataSource(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false); // Set loading to false once the data fetch is complete
      }
    };

    fetchCategories();

    // Poll every 10 seconds
    const interval = setInterval(fetchCategories, 10);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const handleAddCategory = async () => {
    try {
      const response = await axios.get("http://localhost:8081/get_categories");
      setDataSource(response.data);
      setIsAddModalVisible(false);
    } catch (error) {
      console.error("Error fetching updated categories:", error);
    }
  };

  const handleEdit = (record: CategoryItem) => {
    setSelectedItem(record);
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = (updatedCategory: Partial<CategoryItem>) => {
    setDataSource((prevData) =>
      prevData.map((category) =>
        category.categories_id === updatedCategory.categories_id
          ? { ...category, ...updatedCategory }
          : category
      )
    );
  };

  const handleViewDetails = (record: any) => {
    setSelectedItem(record);
    setIsDetailModalVisible(true);
  };

  const handleDelete = async (categories_id: number) => {
    Modal.confirm({
      title: "Are you sure you want to archive this category?",
      content:
        "This action will mark the category as deleted, but will not remove it permanently.",
      okText: "Yes, Archive",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          // Optimistic UI: Remove from state before actual deletion
          setDataSource((prevData) =>
            prevData.filter((item) => item.categories_id !== categories_id)
          );

          // Perform actual archive operation
          await axios.delete(
            `http://localhost:8081/categories/${categories_id}`
          );
        } catch (error) {
          console.error("Error archiving category:", error);
          // Re-fetch categories on error to restore previous state
          const response = await axios.get(
            "http://localhost:8081/get_categories"
          );
          setDataSource(response.data);
        }
      },
    });
  };

  const columns = [
    {
      title: "Category ID",
      dataIndex: "categories_id",
      key: "categories_id",
    },
    {
      title: "Category Name",
      dataIndex: "categories_name",
      key: "categories_name",
      render: (text: any, record: any) => (
        <div className="flex items-center gap-3">
          <img
            src={`http://localhost:8081/uploads/images/${record.categories_img}`}
            alt={record.categories_name}
            className="w-10 h-10 rounded object-cover flex-shrink-0"
          />
          <span className="text-sm sm:text-base">{text}</span>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const formattedStatus =
          status.charAt(0).toUpperCase() + status.slice(1);
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
          <Tooltip title="View Category Details">
            <ActionButton
              type="primary"
              icon={<SearchOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Edit Category">
            <ActionButton
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)} // Open the Edit Modal
            />
          </Tooltip>
          <Tooltip title="Delete Category">
            <ActionButton
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.categories_id)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const handleShowArchived = () => {
    setIsArchivedModalVisible(true);
  };

  const handleCloseArchived = () => {
    setIsArchivedModalVisible(false);
  };

  return (
    <StyledContainer>
      <div className="flex flex-col gap-4 mb-6">
        {/* Heading */}
        <div>
          <h2 className="text-xl font-bold">Categories List</h2>
          <p className="text-gray-500 text-sm">Manage your Categories</p>
        </div>

        {/* Search + Actions Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left: Search */}
          <Input
            placeholder="Search categories"
            prefix={<SearchOutlined />}
            className="w-full sm:w-1/4 bg-gray-100 dark:bg-[#1f2937] dark:text-white custom-placeholder"
          />

          {/* Right: Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {/* Archived */}
            <Button
              className="bg-red-500 text-white hover:bg-red-600 focus:ring-4 focus:ring-red-300 rounded-md w-full sm:w-[170px]"
              icon={<FolderOutlined />}
              onClick={handleShowArchived}
              size="middle"
            >
              Archived
            </Button>

            {/* Add */}
            <Button
              type="primary"
              size="middle"
              icon={<PlusOutlined />}
              onClick={() => setIsAddModalVisible(true)}
              className="px-3 sm:px-4 py-1.5 shadow-md w-full sm:w-[170px]"
            >
              Add New Category
            </Button>

            {/* Sort */}
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item key="1">Sort by Date</Menu.Item>
                  <Menu.Item key="2">Sort by Name</Menu.Item>
                </Menu>
              }
              trigger={["click"]}
            >
              <Button
                icon={<FilterOutlined />}
                className="w-full sm:w-[170px] px-3 py-1.5 text-center"
              >
                Sort by
              </Button>
            </Dropdown>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto lg:overflow-x-hidden">
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
            scroll={{ x: true }}
          />
        )}
      </div>
      {/* Category Detail Modal */}
      <Modal
        title="Category Details"
        visible={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Close
          </Button>,
        ]}
      >
        {selectedItem && (
          <div>
            <p>
              <strong>Category Name:</strong> {selectedItem.categories_name}
            </p>
            <p>
              <strong>Description:</strong> {selectedItem.description}
            </p>
            <p>
              <strong>Status:</strong> {selectedItem.status}
            </p>
          </div>
        )}
      </Modal>

      <CategoriesEditModal
        isEditModalVisible={isEditModalVisible}
        setIsEditModalVisible={setIsEditModalVisible}
        selectedItem={selectedItem}
        handleSaveEdit={handleSaveEdit} // Pass handleSaveEdit
      />

      <Archive
        isArchivedModalVisible={isArchivedModalVisible}
        onClose={handleCloseArchived}
      />
      <AddCategories
        isAddModalVisible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onAddCategory={handleAddCategory}
      />
    </StyledContainer>
  );
};

export default AdminManageCategories;
