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

import dayjs from "dayjs"; // ✅ import dayjs
import AddSupplyCategories from "../WorkerModals/AddSupplyCategories";
import Archive from "../WorkerModals/Archive";
import EditSupplyCategories from "../WorkerModals/EditSupplyCategories";
// ====================== Styled Components ======================
const StyledContainer = styled.div`
  width: 100%;
  background-color: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.08);
  transition: background-color 0.3s ease;
  margin: 0 auto;

  .dark & {
    background-color: #001f3f;
    color: white;
  }

  /* ===== Mobile full-stretch ===== */
  @media (max-width: 1024px) {
    border-radius: 0;
    box-shadow: none;
    width: 100vw;
    margin-left: calc(-50vw + 50%);
    margin-right: calc(-50vw + 50%);
    padding: 16px;
  }
`;

const StyledTable = styled(Table)`
  width: 100%;
  .ant-table {
    width: 100%;
  }

  .ant-table-thead > tr > th {
    background: #f9fafb;
    font-weight: bold;
    color: #374151;
  }

  tr:hover td {
    background-color: #f9fafb !important;
  }

  /* Make table responsive on smaller screens */
  @media (max-width: 1024px) {
    font-size: 13px;
    .ant-table-content {
      overflow-x: auto;
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

interface SupplyCategoryItem {
  key?: string;
  cat_supply_id: number;
  supply_cat_name: string;
  created_at: string;
}

const WorkerManageSupplyCategories = () => {
  const [dataSource, setDataSource] = useState<SupplyCategoryItem[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isArchivedModalVisible, setIsArchivedModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMenus = dataSource.slice(indexOfFirstItem, indexOfLastItem);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const apiUrl = import.meta.env.VITE_API_URL;
  // ✅ Fetch supply categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${apiUrl}/get_supply_categories`);
        setDataSource(response.data); // replaces old data
      } catch (error) {
        console.error("Error fetching supply categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories(); // fetch only once
  }, [apiUrl]);

  // ✅ Handle Add Category
  const handleAddCategory = (newCategory: SupplyCategoryItem) => {
    setDataSource((prev) => [...prev, newCategory]);
    setIsAddModalVisible(false);
  };

  // ✅ Handle Delete Category
  const handleDelete = async (cat_supply_id: number) => {
    Modal.confirm({
      title: "Are you sure you want to delete this supply category?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          setDataSource((prevData) =>
            prevData.filter((item) => item.cat_supply_id !== cat_supply_id)
          );
          await axios.delete(
            `${apiUrl}/delete_supply_category/${cat_supply_id}`
          );
        } catch (error) {
          console.error("Error deleting supply category:", error);
          const response = await axios.get(`${apiUrl}/get_supply_categories`);
          setDataSource(response.data);
        }
      },
    });
  };

  const handleEdit = (record: SupplyCategoryItem) => {
    setSelectedItem(record);
    setIsEditModalVisible(true);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "cat_supply_id",
      key: "cat_supply_id",
    },
    {
      title: "Supply Category Name",
      dataIndex: "supply_cat_name",
      key: "supply_cat_name",
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (createdAt: string) =>
        dayjs(createdAt).format("YYYY-MM-DD h:mm A"), // ✅ format like 2025-09-03 8:10 PM
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <div className="flex gap-2">
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
              onClick={() => handleDelete(record.cat_supply_id)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <StyledContainer>
      <div className="flex flex-col gap-4 mb-6">
        {/* Heading */}
        <div>
          <h2 className="text-xl font-bold">Supply Categories List</h2>
          <p className="text-gray-500 text-sm">Manage your Supply Categories</p>
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
              onClick={() => setIsArchivedModalVisible(true)}
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
            rowKey="cat_supply_id"
            scroll={{ x: true }}
          />
        )}
      </div>

      {/* Archived Modal */}
      <Archive
        isArchivedModalVisible={isArchivedModalVisible}
        onClose={() => setIsArchivedModalVisible(false)}
      />
      <EditSupplyCategories
        isEditModalVisible={isEditModalVisible}
        setIsEditModalVisible={setIsEditModalVisible}
        selectedItem={selectedItem}
      />

      {/* Add Supply Category Modal */}
      <AddSupplyCategories
        isAddModalVisible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onAddCategory={handleAddCategory}
      />
    </StyledContainer>
  );
};

export default WorkerManageSupplyCategories;
