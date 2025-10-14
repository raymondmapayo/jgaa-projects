/* eslint-disable @typescript-eslint/no-explicit-any */
import { EllipsisOutlined } from "@ant-design/icons";
import { Button, Dropdown, Menu, Table, Tag } from "antd";
import styled from "styled-components";

// Styled Components
const StyledContainer = styled.div`
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  h2 {
    font-size: 18px;
    font-weight: bold;
    margin: 0;
  }

  .ant-btn {
    font-size: 14px;
    padding: 8px 16px;
  }
`;

const StyledTable = styled(Table)`
  .ant-table-thead > tr > th {
    background: #f9f9f9;
    font-weight: bold;
  }

  .ant-table-row {
    &:hover {
      background: #f6f8fa !important;
    }
  }

  .ant-pagination-item-active {
    background-color: #4f46e5;
    border-color: #4f46e5;
    a {
      color: #fff;
    }
  }
`;

// Data for the table
const data = [
  {
    key: "1",
    category: "Electronics",
    name: "TechNova - Germany",
    established: "Since 2015",
    stores: "1,200",
    products: "15,320",
    status: "Active",
    statusColor: "green",
  },
  {
    key: "2",
    category: "Home Decor",
    name: "DecoLux - France",
    established: "Since 2000",
    stores: "450",
    products: "6,800",
    status: "Pending",
    statusColor: "orange",
  },
  {
    key: "3",
    category: "Technology",
    name: "InnovTech - Japan",
    established: "Since 2012",
    stores: "850",
    products: "12,500",
    status: "Active",
    statusColor: "green",
  },
  {
    key: "4",
    category: "Health",
    name: "WellCare - UK",
    established: "Since 2008",
    stores: "300",
    products: "4,200",
    status: "Active",
    statusColor: "green",
  },
  {
    key: "5",
    category: "Automotive",
    name: "AutoDrive - USA",
    established: "Since 1999",
    stores: "600",
    products: "8,900",
    status: "Inactive",
    statusColor: "red",
  },
];

// Table Columns
const columns = [
  {
    title: "Brand",
    dataIndex: "name",
    key: "name",
    render: (text: string, record: any) => (
      <div className="flex items-center gap-4">
        <div
          className="w-10 h-10 flex items-center justify-center rounded-full text-white"
          style={{
            backgroundColor: "#4F46E5",
          }}
        >
          {record.category[0]}
        </div>
        <div>
          <p className="font-semibold text-gray-700">{text}</p>
          <p className="text-sm text-gray-500">{record.category}</p>
        </div>
      </div>
    ),
  },
  {
    title: "Established",
    dataIndex: "established",
    key: "established",
  },
  {
    title: "Stores",
    dataIndex: "stores",
    key: "stores",
  },
  {
    title: "Products",
    dataIndex: "products",
    key: "products",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (text: string, record: any) => (
      <Tag color={record.statusColor}>{text}</Tag>
    ),
  },
  {
    title: "",
    key: "action",
    render: () => (
      <Dropdown
        overlay={
          <Menu>
            <Menu.Item key="1">Edit</Menu.Item>
            <Menu.Item key="2">Delete</Menu.Item>
          </Menu>
        }
        trigger={["click"]}
      >
        <EllipsisOutlined style={{ cursor: "pointer", fontSize: "18px" }} />
      </Dropdown>
    ),
  },
];

const WorkerCuisineListing = () => {
  return (
    <StyledContainer>
      {/* Header */}
      <StyledHeader>
        <h2>Brands Listing</h2>
        <Button type="primary">Add Brand +</Button>
      </StyledHeader>

      {/* Subheader */}
      <p className="text-gray-500 mb-4">75 Active brands out of 120</p>

      {/* Table */}
      <StyledTable
        dataSource={data}
        columns={columns}
        pagination={{
          pageSize: 5,
          showTotal: (total, range) =>
            `Showing ${range[0]}-${range[1]} of ${total} Results`,
        }}
      />
    </StyledContainer>
  );
};

export default WorkerCuisineListing;
