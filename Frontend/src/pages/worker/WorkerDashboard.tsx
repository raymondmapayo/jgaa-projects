import { useEffect, useState } from "react";
import "react-calendar/dist/Calendar.css";
import {
  FaBoxOpen,
  FaDollarSign,
  FaShoppingCart,
  FaTags,
  FaWallet,
} from "react-icons/fa";
import TopSelling from "../../components/worker/WorkerTopSelling";
import TotalRevenue from "../../components/worker/WorkerTotalRevenue";
import MostReservedTablesChart from "../charts/MostReservedTablesChart";
import TopSellingProductsChart from "../charts/TopSellingProductsChart";
import TotalCustomersChart from "../charts/TotalCustomersChart";
import CategoriesModal from "../WorkerModals/CategoriesModal";
import TotalProductsModal from "../WorkerModals/TotalProductsModal";

import { Button, DatePicker, Modal, message } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { AiOutlineArrowRight } from "react-icons/ai";
import { FiCalendar, FiFilter } from "react-icons/fi";

interface Category {
  categories_id: number;
  categories_name: string;
  categories_img: string;
  status: string;
}

const WorkerDashboard = () => {
  // --- 🔸 States for Filter Modal ---
  const today = dayjs();
  const firstDayOfMonth = today.startOf("month");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState<Dayjs | null>(firstDayOfMonth);
  const [endDate, setEndDate] = useState<Dayjs | null>(today);
  const [dates, setDates] = useState<[Dayjs | null, Dayjs | null]>([
    firstDayOfMonth,
    today,
  ]);

  // --- 🔸 States for Cards and Stats ---
  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [changeData, setChangeData] = useState<{
    change: string;
    changeType: "up" | "down";
  }>({ change: "", changeType: "up" });

  const [totalCategories, setTotalCategories] = useState<number | null>(null);
  const [categoriesChangeData, setCategoriesChangeData] = useState<{
    change: string;
    changeType: "up" | "down";
  }>({ change: "", changeType: "up" });

  const [isProductsModalVisible, setIsProductsModalVisible] = useState(false);
  const [isCategoriesModalVisible, setIsCategoriesModalVisible] =
    useState(false);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);

  const previousTotalProducts: number = 10;
  const previousTotalCategories: number = 1400;
  const apiUrl = import.meta.env.VITE_API_URL;

  // --- 🔸 Fetch Data (Products) ---
  useEffect(() => {
    fetch(`${apiUrl}/total_products`)
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.totalProducts === "number") {
          setTotalProducts(data.totalProducts);
          const current = data.totalProducts;
          const prev = previousTotalProducts;
          let changePercent = ((current - prev) / prev) * 100;
          const type = changePercent >= 0 ? "up" : "down";
          const formattedChange = `${
            type === "up" ? "+" : ""
          }${changePercent.toFixed(1)}%`;
          setChangeData({ change: formattedChange, changeType: type });
        } else {
          setTotalProducts(null);
        }
      })
      .catch(() => {
        setTotalProducts(null);
      });
  }, [dates]); // ✅ refetch when date changes

  // --- 🔸 Fetch Data (Categories) ---
  useEffect(() => {
    fetch(`${apiUrl}/total_categories`)
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.totalCategories === "number") {
          setTotalCategories(data.totalCategories);
          const current = data.totalCategories;
          const prev = previousTotalCategories;
          let changePercent = ((current - prev) / prev) * 100;
          const type = changePercent >= 0 ? "up" : "down";
          const formattedChange = `${
            type === "up" ? "+" : ""
          }${changePercent.toFixed(1)}%`;
          setCategoriesChangeData({
            change: formattedChange,
            changeType: type,
          });
        } else {
          setTotalCategories(null);
        }
      })
      .catch(() => {
        setTotalCategories(null);
      });
  }, [dates]); // ✅ refetch when date changes

  // --- 🔸 Fetch Data (Categories Modal) ---
  useEffect(() => {
    if (isCategoriesModalVisible) {
      fetch(`${apiUrl}/categories_list`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.categories))
            setCategoriesList(data.categories);
          else setCategoriesList([]);
        })
        .catch(() => setCategoriesList([]));
    }
  }, [isCategoriesModalVisible]);

  // --- 🔸 Filter Handlers ---
  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);

  const handleApply = () => {
    if (startDate && endDate && startDate.isAfter(endDate)) {
      message.error("Start date cannot be after end date!");
      return;
    }
    setDates([startDate, endDate]);
    setIsModalOpen(false);
  };

  const handleReset = () => {
    const resetStart = firstDayOfMonth;
    const resetEnd = today;
    setStartDate(resetStart);
    setEndDate(resetEnd);
    setDates([resetStart, resetEnd]);
    setIsModalOpen(false);
  };

  const openProductsModal = () => setIsProductsModalVisible(true);
  const closeProductsModal = () => setIsProductsModalVisible(false);
  const openCategoriesModal = () => setIsCategoriesModalVisible(true);
  const closeCategoriesModal = () => setIsCategoriesModalVisible(false);

  const formattedTotalProducts =
    totalProducts !== null ? `${totalProducts.toLocaleString()}` : "...";
  const formattedTotalCategories =
    totalCategories !== null ? `${totalCategories.toLocaleString()}` : "...";

  const cardData = [
    {
      title: "Total Products",
      value: formattedTotalProducts,
      icon: <FaBoxOpen size={20} />,
      color: "text-blue-500",
      change: changeData.change,
      changeType: changeData.changeType,
      link: "view more",
      onClick: openProductsModal,
    },
    {
      title: "Total Categories",
      value: formattedTotalCategories,
      icon: <FaTags size={20} />,
      color: "text-red-500",
      change: categoriesChangeData.change,
      changeType: categoriesChangeData.changeType,
      link: "view more",
      onClick: openCategoriesModal,
    },
    {
      title: "Total Sales",
      value: "$18,645",
      icon: <FaShoppingCart size={20} />,
      color: "text-purple-500",
      change: "+24%",
      changeType: "down",
      link: "view more",
    },
    {
      title: "Total Revenue",
      value: "$34,876",
      icon: <FaDollarSign size={20} />,
      color: "text-green-500",
      change: "+0.26%",
      changeType: "up",
      link: "view more",
    },
    {
      title: "Total Expenses",
      value: "$73,579",
      icon: <FaWallet size={20} />,
      color: "text-yellow-500",
      change: "+0.6%",
      changeType: "up",
      link: "view more",
    },
  ];

  return (
    <div
      className="space-y-6 
    bg-white dark:bg-[rgb(0,51,102)] text-black dark:text-white
    p-0 rounded-none w-full
    sm:p-4 sm:rounded-xl"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
        <h1 className="text-lg font-semibold">Dashboard</h1>

        {/* 🔸 Unified Filter Modal Button */}
        <Button
          type="default"
          onClick={showModal}
          className="flex items-center gap-2"
        >
          <FiFilter className="text-orange-500" />
          <span className="font-medium">Filter - </span>
          {dates[0]?.format("MMM DD, YYYY")} →{" "}
          {dates[1]?.format("MMM DD, YYYY")}
        </Button>

        <Modal
          open={isModalOpen}
          footer={null}
          onCancel={handleCancel}
          centered
        >
          <div className="flex items-center gap-2 mb-4 text-lg font-semibold">
            <FiCalendar className="text-orange-500" />
            <span>Filter by Date</span>
          </div>

          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="border px-3 py-1 rounded-md">
              {dates[0] ? dates[0].format("MMM DD") : "Start"}
            </div>
            <AiOutlineArrowRight className="text-xl text-gray-500" />
            <div className="border px-3 py-1 rounded-md">
              {dates[1] ? dates[1].format("MMM DD") : "End"}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex-1">
              <label className="block mb-1 text-gray-600 text-sm">
                Start Date
              </label>
              <DatePicker
                value={startDate}
                onChange={(val: Dayjs | null) => {
                  setStartDate(val);
                  setDates([val, endDate]);
                }}
                format="MMM DD, YYYY"
                style={{ width: "100%" }}
              />
            </div>

            <div className="flex-1">
              <label className="block mb-1 text-gray-600 text-sm">
                End Date
              </label>
              <DatePicker
                value={endDate}
                onChange={(val: Dayjs | null) => {
                  setEndDate(val);
                  setDates([startDate, val]);
                }}
                format="MMM DD, YYYY"
                style={{ width: "100%" }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={handleCancel}>Cancel</Button>
            <Button type="primary" onClick={handleApply}>
              Apply
            </Button>
            <Button onClick={handleReset}>Reset</Button>
          </div>
        </Modal>
      </div>

      {/* 🔸 Cards */}
      <div className="bg-white dark:bg-[#1e293b] flex flex-wrap justify-center gap-6 p-6 rounded-lg shadow-md">
        {cardData.map((card, index) => (
          <div
            key={index}
            className="group rounded-2xl bg-white dark:bg-[rgb(0,51,102)] p-4 flex-1 min-w-[200px] max-w-[250px] shadow-md hover:bg-[rgb(0,51,102)] dark:hover:bg-[rgb(0,41,82)] transition-colors duration-300"
          >
            <div className="flex justify-between items-center">
              <div className="font-bold">
                <h1 className="capitalize text-sm font-medium text-gray-500 group-hover:text-white dark:text-white">
                  {card.title}
                </h1>
                <p className="text-2xl font-semibold my-4 group-hover:text-white dark:text-white">
                  {card.value}
                </p>
              </div>
              <div
                className={`text-3xl ${card.color} bg-gray-100 dark:bg-transparent p-4 rounded-md group-hover:bg-transparent group-hover:text-white dark:text-white transition-colors`}
              >
                {card.icon}
              </div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <p
                className={`text-[10px] px-2 py-1 rounded-full ${
                  card.changeType === "up" ? "text-green-500" : "text-red-500"
                } group-hover:text-white dark:text-white`}
              >
                {card.change}
              </p>
              {card.onClick ? (
                <button
                  className="px-2 py-1 rounded-full text-green-600 group-hover:text-white dark:text-white"
                  onClick={card.onClick}
                >
                  {card.link}
                </button>
              ) : (
                <a
                  href="#"
                  className="px-2 py-1 rounded-full text-green-600 group-hover:text-white dark:text-white"
                >
                  {card.link}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 🔸 Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {/* First row */}
        <TopSellingProductsChart />
        <TopSelling />
        {/* Second row */}
        <TotalCustomersChart dates={dates} />
        <MostReservedTablesChart dates={dates} />
      </div>
      {/* Full-width row */}
      {/* 🔸 Revenue Section */}
      <TotalRevenue dates={dates} />

      {/* 🔸 Modals */}
      <TotalProductsModal
        open={isProductsModalVisible}
        onClose={closeProductsModal}
        totalProducts={totalProducts}
        change={changeData.change}
      />

      <CategoriesModal
        open={isCategoriesModalVisible}
        onClose={closeCategoriesModal}
        categories={categoriesList}
        totalCategories={totalCategories}
        change={categoriesChangeData.change}
      />
    </div>
  );
};

export default WorkerDashboard;
