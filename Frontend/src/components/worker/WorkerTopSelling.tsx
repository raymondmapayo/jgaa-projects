// WorkerTopSelling.tsx
import { Pagination, Table } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { CustomRate } from "../worker/WorkerRate";

const WorkerTopSelling = () => {
  const [topSelling, setTopSelling] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;
  const apiUrl = import.meta.env.VITE_API_URL;
  useEffect(() => {
    axios
      .get(`${apiUrl}/top_selling`)
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
            src={`${apiUrl}/uploads/images/${record.menu_img}`}
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
          <p className="font-semibold text-gray-700 dark:text-white text-sm sm:text-base">{`₱${text}`}</p>
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
        </div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "total_order_amount",
      key: "total_order_amount",
      render: (text: string) => (
        <div>
          <p className="font-semibold text-gray-700 dark:text-white text-sm sm:text-base">{`₱${text}`}</p>
        </div>
      ),
    },
  ];

  return (
    <div className="relative -mx-6 sm:mx-0">
      <div className="bg-white dark:bg-[#001f3f] rounded-lg shadow-lg  sm:w-full h-full p-6 flex flex-col transition-colors">
        {/* Header with filter */}
        <div className="flex flex-wrap justify-between items-center mb-4 border-b border-dotted pb-2 gap-3">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white flex-1">
            Top Selling Menu
          </h2>
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
        <div className="sticky bottom-0 bg-white dark:bg-[#001f3f] pt-3 flex justify-end z-10 border-t border-gray-200 dark:border-gray-700">
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
    </div>
  );
};

export default WorkerTopSelling;
