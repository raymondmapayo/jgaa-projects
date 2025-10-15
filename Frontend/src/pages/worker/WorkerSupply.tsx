/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  EditOutlined,
  FilterOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Dropdown, Input, Menu, Table, Tooltip } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import styled from "styled-components";
import SupplyModal from "../WorkerModals/AddSupplyModal";
import EditInventoryModal from "../WorkerModals/EditSupplyModal";
import ViewInventoryModal from "../WorkerModals/ViewInventoryModal";
import WorkerHistoryInventoryModal from "./WorkerHistoryInventory";

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

// ====================== Interface ======================
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

// ====================== Component ======================
const WorkerSupply = () => {
  const [dataSource, setDataSource] = useState<SupplyItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchSupply = async () => {
      try {
        const response = await axios.get(`${apiUrl}/get_supply`);
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
  }, [apiUrl]);

  const handleAddSupply = (values: any) => {
    console.log("New Supply Added:", values);
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "supply_id",
      key: "supply_id",
      render: (_: any, record: any) =>
        `S${record.supply_id.toString().padStart(3, "0")}`,
    },
    {
      title: "Product Name",
      dataIndex: "product_name",
      key: "product_name",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Stock In",
      dataIndex: "stock_in",
      key: "stock_in",
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (createdAt: string) =>
        dayjs(createdAt).format("YYYY-MM-DD h:mm A"),
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
      {/* ===== Header Section ===== */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold">Supply List</h2>
            <p className="text-gray-500 text-sm">Manage and track supplies</p>
          </div>
        </div>

        {/* ===== Search + Action Buttons ===== */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Search Bar */}
          <Input
            placeholder="Search supply"
            prefix={<SearchOutlined />}
            className="w-full sm:w-1/4 bg-gray-100 dark:bg-[#1f2937] dark:text-white custom-placeholder"
          />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
              className="px-3 sm:px-4 py-1.5 shadow-md w-full sm:w-[170px]"
            >
              Add New Supply
            </Button>

            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item key="1">Sort by Date</Menu.Item>
                  <Menu.Item key="2">Sort by Price</Menu.Item>
                </Menu>
              }
              trigger={["click"]}
            >
              <Button
                icon={<FilterOutlined />}
                className="w-full sm:w-[170px] px-3 py-1.5 text-center"
              >
                Sort
              </Button>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* ===== Table Section ===== */}
      <div className="overflow-x-auto lg:overflow-x-hidden">
        <StyledTable
          dataSource={dataSource}
          columns={columns}
          rowKey="supply_id"
          pagination={{ pageSize: 5, showSizeChanger: false }}
          loading={isLoading}
          scroll={{ x: true }}
        />
      </div>

      {/* ===== Modals ===== */}
      <SupplyModal
        visible={isModalVisible}
        onFinish={handleAddSupply}
        onClose={() => setIsModalVisible(false)}
      />

      <ViewInventoryModal
        visible={viewModalVisible}
        selectedItem={selectedItem}
        onClose={() => {
          setViewModalVisible(false);
          setSelectedItem(null);
        }}
      />

      <EditInventoryModal
        visible={editModalVisible}
        selectedItem={selectedItem}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedItem(null);
        }}
        onFinish={() => window.location.reload()}
      />

      <WorkerHistoryInventoryModal
        isModalVisible={historyModalVisible}
        setIsModalVisible={setHistoryModalVisible}
      />
    </StyledContainer>
  );
};

export default WorkerSupply;
