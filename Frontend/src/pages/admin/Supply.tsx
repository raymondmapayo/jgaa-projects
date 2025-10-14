/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  EditOutlined,
  FilterOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Dropdown, Input, Menu, Table, Tooltip } from "antd";
import axios from "axios";
import dayjs from "dayjs"; // ✅ import dayjs
import { useEffect, useState } from "react";
import styled from "styled-components";
import EditInventoryModal from "./AdminModals/EditInventoryModal";
import SupplyModal from "./AdminModals/InventoryModal";
import ViewInventoryModal from "./AdminModals/ViewInventoryModal";

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

// ✅ Matches supply_tbl
interface SupplyItem {
  supply_id: number;
  inventory_id: number;
  product_name: string;
  category: string;
  stock_in: number;
  unit: string;
  price: string;

  created_at: string;
}

const Supply = () => {
  const [dataSource, setDataSource] = useState<SupplyItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

  useEffect(() => {
    const fetchSupply = async () => {
      try {
        const response = await axios.get("http://localhost:8081/get_supply");
        console.log("🟢 Backend Response (supply):", response.data);
        if (response.data.success) {
          setDataSource(response.data.data);
        } else {
          console.error("⚠️ Backend returned error:", response.data.message);
        }
      } catch (error) {
        console.error("❌ Error fetching supply:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSupply();
    const interval = setInterval(fetchSupply, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAddSupply = (values: any) => {
    console.log("New Supply Added:", values);
    setIsModalVisible(false);
  };

  // ✅ Added Created At column with dayjs formatting
  const columns = [
    {
      title: "ID",
      dataIndex: "supply_id",
      key: "supply_id",
      render: (_text: any, record: any) =>
        `S${record.supply_id.toString().padStart(3, "0")}`,
    },
    { title: "Product Name", dataIndex: "product_name", key: "product_name" },
    { title: "Category", dataIndex: "category", key: "category" },

    { title: "Stock In", dataIndex: "stock_in", key: "stock_in" },
    { title: "Unit", dataIndex: "unit", key: "unit" },
    { title: "Price", dataIndex: "price", key: "price" },

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
          <Tooltip title="View Supply Details">
            <ActionButton
              type="primary"
              icon={<SearchOutlined />}
              onClick={() => {
                setSelectedItem(record);
                setViewModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Supply">
            <ActionButton
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedItem(record);
                setEditModalVisible(true);
              }}
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
          <h2 className="text-xl font-bold">Supply</h2>
          <p className="text-gray-500 text-sm">Manage Supply</p>
        </div>

        {/* Search + Actions Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left: Search */}
          <Input
            placeholder="Search supply"
            prefix={<SearchOutlined />}
            className="w-full sm:w-1/4 bg-gray-100 dark:bg-[#1f2937] dark:text-white custom-placeholder"
          />

          {/* Right: Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {/* Add */}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
              className="px-3 sm:px-4 py-1.5 shadow-md w-full sm:w-[170px]"
            >
              Add New Supply
            </Button>

            {/* Sort */}
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item key="1">Sort by Date</Menu.Item>
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

      {/* Table */}
      <StyledTable
        dataSource={dataSource}
        columns={columns}
        rowKey="supply_id"
        pagination={{ pageSize: 4, showSizeChanger: false }}
        loading={isLoading}
      />

      {/* Add Supply Modal */}
      <SupplyModal
        visible={isModalVisible}
        onFinish={handleAddSupply}
        onClose={() => setIsModalVisible(false)}
      />

      {/* View Supply Modal */}
      <ViewInventoryModal
        visible={viewModalVisible}
        selectedItem={selectedItem}
        onClose={() => {
          setViewModalVisible(false);
          setSelectedItem(null);
        }}
      />

      {/* Edit Supply Modal */}
      <EditInventoryModal
        visible={editModalVisible}
        selectedItem={selectedItem}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedItem(null);
        }}
        onFinish={() => window.location.reload()}
      />
    </StyledContainer>
  );
};

export default Supply;
