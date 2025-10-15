/* eslint-disable @typescript-eslint/no-explicit-any */
import { FilterOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Dropdown, Input, Menu, Table, Tag } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import styled from "styled-components";
import InventoryModal from "../WorkerModals/AddSupplyModal";
import EditInventoryModal from "../WorkerModals/EditSupplyModal";
import ViewInventoryModal from "../WorkerModals/ViewInventoryModal";

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

// ✅ Updated interface (removed fname, lname, profile_pic, created_by)
interface InventoryItem {
  inventory_id: number;
  product_name: string;
  category: string;

  stock_in: number;
  stock_out: number;
  unit: string;

  status: string;
  created_at: string;
}

const WorkerManageInventory = () => {
  const [dataSource, setDataSource] = useState<InventoryItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await axios.get(`${apiUrl}/get_inventory`);
        console.log("🟢 Backend Response:", response.data);
        if (response.data.success) {
          setDataSource(response.data.data); // replace the data, don't append
        } else {
          console.error("⚠️ Backend returned error:", response.data.message);
        }
      } catch (error) {
        console.error("❌ Error fetching inventory:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventory(); // fetch only once
  }, [apiUrl]);

  const handleAddInventory = (values: any) => {
    console.log("New Product Added:", values);
    setIsModalVisible(false);
    // Optionally refresh inventory after adding
  };

  // ✅ Cleaned columns (removed Created By, fname, lname, profile_pic)
  const columns = [
    {
      title: "ID",
      dataIndex: "inventory_id",
      key: "inventory_id",
      render: (_text: any, record: any, _index: number) =>
        `${record.inventory_id.toString().padStart(3, "0")}`,
    },
    { title: "Product Name", dataIndex: "product_name", key: "product_name" },
    { title: "Category", dataIndex: "category", key: "category" },

    { title: "Stock In", dataIndex: "stock_in", key: "stock_in" },
    { title: "Stock Out", dataIndex: "stock_out", key: "stock_out" },
    { title: "Unit", dataIndex: "unit", key: "unit" },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "Available" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (createdAt: string) =>
        dayjs(createdAt).format("YYYY-MM-DD h:mm A"), // ✅ format like 2025-09-03 8:10 PM
    },
  ];

  return (
    <StyledContainer>
      {/* Header Section */}
      <div className="flex flex-col gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold">Food Inventory</h2>
          <p className="text-gray-500 text-sm">Manage your food inventory</p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Input
          placeholder="Search food"
          prefix={<SearchOutlined />}
          className="w-full sm:w-1/4 bg-gray-100 dark:bg-[#1f2937] dark:text-white custom-placeholder"
        />
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="1">Sort by Stock</Menu.Item>
              <Menu.Item key="2">Sort by Price</Menu.Item>
            </Menu>
          }
          trigger={["click"]}
        >
          <Button
            icon={<FilterOutlined />}
            className="w-full sm:w-[170px] px-3 py-1.5 text-center"
          >
            Sort by Stock
          </Button>
        </Dropdown>
      </div>

      {/* Table */}
      <StyledTable
        dataSource={dataSource}
        columns={columns}
        rowKey="inventory_id"
        pagination={{ pageSize: 5, showSizeChanger: false }}
        loading={isLoading}
      />

      {/* Add Inventory Modal */}
      <InventoryModal
        visible={isModalVisible}
        onFinish={handleAddInventory}
        onClose={() => setIsModalVisible(false)}
      />
      {/* View Inventory Modal */}
      <ViewInventoryModal
        visible={viewModalVisible}
        selectedItem={selectedItem}
        onClose={() => {
          setViewModalVisible(false);
          setSelectedItem(null);
        }}
      />
      {/* Edit Inventory Modal */}
      <EditInventoryModal
        visible={editModalVisible}
        selectedItem={selectedItem}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedItem(null);
        }}
        onFinish={() => {
          window.location.reload();
        }}
      />
    </StyledContainer>
  );
};

export default WorkerManageInventory;
