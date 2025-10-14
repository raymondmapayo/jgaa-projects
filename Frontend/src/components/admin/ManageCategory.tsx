import { EllipsisOutlined } from "@ant-design/icons";
import { Button, Dropdown, Menu, Table } from "antd";

const ManagementCategory = () => {
  const data = [
    {
      key: "1",
      categoryID: "001",
      categoryName: "Electronics",
    },
    {
      key: "2",
      categoryID: "002",
      categoryName: "Home Decor",
    },
    {
      key: "3",
      categoryID: "003",
      categoryName: "Technology",
    },
    {
      key: "4",
      categoryID: "004",
      categoryName: "Health",
    },
    {
      key: "5",
      categoryID: "005",
      categoryName: "Automotive",
    },
  ];

  const columns = [
    {
      title: "Category ID",
      dataIndex: "categoryID",
      key: "categoryID",
    },
    {
      title: "Category Name",
      dataIndex: "categoryName",
      key: "categoryName",
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Category Management</h2>
        <Button type="primary">Add Category +</Button>
      </div>

      {/* Table */}
      <Table
        dataSource={data}
        columns={columns}
        pagination={{
          pageSize: 5,
          showTotal: (total, range) =>
            `Showing ${range[0]}-${range[1]} of ${total} Results`,
        }}
        className="rounded-lg shadow-md"
        rowClassName="hover:bg-gray-100"
        bordered
      />
    </div>
  );
};

export default ManagementCategory;
