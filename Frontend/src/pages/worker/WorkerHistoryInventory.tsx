import { FilterOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Dropdown, Input, Menu, Modal, Table } from "antd";
import React from "react";
import styled from "styled-components";

interface WorkerHistoryInventoryModalProps {
  isModalVisible: boolean; // <-- prop to control visibility
  setIsModalVisible: React.Dispatch<React.SetStateAction<boolean>>; // <-- setter
}

// Example Table Data & Columns
const dataSource = [
  {
    key: "1",
    id: 1,
    foodName: "Cheeseburger",
    category: "Fast Food",
    stock_in: 20,
    stock_out: 5,
    price: "$5.00",
    createdBy: "John Doe",
    image: "/food-menu-1.png",
  },
  {
    key: "2",
    id: 2,
    foodName: "Margherita Pizza",
    category: "Italian",
    stock_in: 10,
    stock_out: 0,
    price: "$8.50",
    createdBy: "Jane Smith",
    image: "/food-menu-2.png",
  },
];

const columns = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
    render: (id: number) => `P${id.toString().padStart(3, "0")}`,
  },
  {
    title: "Food Name",
    dataIndex: "foodName",
    key: "foodName",
    render: (text: any, record: any) => (
      <div className="flex items-center gap-3">
        <img
          src={record.image}
          alt={record.foodName}
          className="w-10 h-10 rounded"
        />
        <span>{text}</span>
      </div>
    ),
  },
  { title: "Category", dataIndex: "category", key: "category" },
  { title: "Stock In", dataIndex: "stock_in", key: "stock_in" },
  { title: "Stock Out", dataIndex: "stock_out", key: "stock_out" },
];

const StyledTable = styled(Table)`
  .ant-table-thead > tr > th {
    background: #f5f5f5;
    font-weight: bold;
  }
`;

const WorkerHistoryInventoryModal: React.FC<
  WorkerHistoryInventoryModalProps
> = ({ isModalVisible, setIsModalVisible }) => {
  return (
    <Modal
      title="History of Inventory"
      open={isModalVisible}
      onCancel={() => setIsModalVisible(false)}
      footer={null}
      width={900}
    >
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
        <Input
          placeholder="Search food"
          prefix={<SearchOutlined />}
          className="w-full sm:w-1/4 bg-gray-100"
        />
        <div className="flex gap-2">
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="1">Sort by Stock</Menu.Item>
                <Menu.Item key="2">Sort by Price</Menu.Item>
              </Menu>
            }
            trigger={["click"]}
          >
            <Button icon={<FilterOutlined />}>Sort by Stock</Button>
          </Dropdown>
        </div>
      </div>

      {/* Table */}
      <StyledTable
        dataSource={dataSource}
        columns={columns}
        pagination={{ pageSize: 5 }}
      />
    </Modal>
  );
};

export default WorkerHistoryInventoryModal;
