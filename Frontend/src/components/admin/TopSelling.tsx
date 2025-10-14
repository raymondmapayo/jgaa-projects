import { Button, Pagination, Table } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { CustomRate } from "../worker/WorkerRate";

const AdminTopSelling = () => {
  const [topSelling, setTopSelling] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;

  useEffect(() => {
    axios
      .get("http://localhost:8081/top_selling")
      .then((response) => {
        setTopSelling(response.data);
      })
      .catch((error) => {
        console.error("Error fetching top selling data:", error);
      });
  }, []);

  const paginatedData = topSelling.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns = [
    {
      title: "Product",
      dataIndex: "item_name",
      key: "item_name",
      render: (text: string, record: any) => (
        <div className="flex flex-wrap items-center gap-3 min-w-[200px]">
          <img
            src={`http://localhost:8081/uploads/images/${record.menu_img}`}
            alt={record.item_name}
            className="w-12 h-12 object-cover rounded-lg border flex-shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <p className="font-semibold text-gray-700 dark:text-white text-sm sm:text-base break-words">
              {text}
            </p>
            <div className="flex items-center mt-1">
              <CustomRate value={parseFloat(record.avg_rating)} />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (text: string) => (
        <div>
          <p className="font-semibold text-gray-700 dark:text-white text-sm sm:text-base">{`$${text}`}</p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Price
          </p>
        </div>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "total_order_quantity",
      key: "total_order_quantity",
      render: (text: number) => (
        <div>
          <p className="font-semibold text-gray-700 dark:text-white text-sm sm:text-base">
            {text}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Total Quantity
          </p>
        </div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "total_order_amount",
      key: "total_order_amount",
      render: (text: string) => (
        <div>
          <p className="font-semibold text-gray-700 dark:text-white text-sm sm:text-base">{`$${text}`}</p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Total Amount
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white dark:bg-[#001529] rounded-lg p-6 pb-10 w-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-center sm:text-left dark:text-white">
          Top Selling Products
        </h2>
        <div className="flex gap-2 flex-wrap justify-center sm:justify-end">
          <Button className="flex items-center gap-2">
            <i className="fa fa-download"></i> Import
          </Button>
          <Button type="primary" className="flex items-center gap-2">
            <i className="fa fa-upload"></i> Export
          </Button>
        </div>
      </div>

      {/* Scrollable Table */}
      <div className="overflow-x-auto lg:overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        <Table
          dataSource={paginatedData}
          columns={columns}
          pagination={false}
          rowKey="item_name"
          className="
            [&_.ant-table-thead>tr>th]:bg-gray-100 
            [&_.ant-table-thead>tr>th]:font-bold 
            [&_.ant-table-row:hover]:!bg-gray-100
            dark:[&_.ant-table-thead>tr>th]:bg-[#0d1a26]
            dark:[&_.ant-table-row:hover]:!bg-[#112d4e]
            dark:[&_.ant-table]:text-white
          "
        />
      </div>

      {/* Sticky Pagination */}
      <div className="sticky bottom-0 bg-white dark:bg-[#001529] pt-3 flex justify-end z-10 border-t border-gray-200 dark:border-gray-700">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={topSelling.length}
          onChange={(page) => setCurrentPage(page)}
          showTotal={(total, range) => (
            <span className="whitespace-nowrap text-xs sm:text-lg dark:text-white">
              Showing {range[0]}-{range[1]} of {total} Results
            </span>
          )}
        />
      </div>
    </div>
  );
};

export default AdminTopSelling;
