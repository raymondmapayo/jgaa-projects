import { useEffect, useState } from "react";
import {
  FaBoxOpen,
  FaDollarSign,
  FaShoppingCart,
  FaTags,
  FaWallet,
} from "react-icons/fa";

import "react-calendar/dist/Calendar.css";

import TopSelling from "../../components/admin/TopSelling";
import TotalRevenue from "../../components/admin/TotalRevenue";
import DailySalesChart from "../charts/DailySalesChart";
import MonthlySalesChart from "../charts/MonthlySalesChart";
import MostReservedTablesChart from "../charts/MostReservedTablesChart";
import TopSellingProductsChart from "../charts/TopSellingProductsChart";
import TotalCustomersChart from "../charts/TotalCustomersChart";
import WeeklySalesChart from "../charts/WeeklySalesChart";
import YearlySalesChart from "../charts/YearlySalesChart";
import CategoriesModal from "./AdminModals/CategoriesModal";
import TotalProductsModal from "./AdminModals/TotalProductsModal";

interface Category {
  categories_id: number;
  categories_name: string;
  categories_img: string;
  status: string;
}

const AdminDashboard = () => {
  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [changeData, setChangeData] = useState<{
    change: string;
    changeType: "up" | "down";
  }>({
    change: "",
    changeType: "up",
  });

  const [totalCategories, setTotalCategories] = useState<number | null>(null);
  const [categoriesChangeData, setCategoriesChangeData] = useState<{
    change: string;
    changeType: "up" | "down";
  }>({
    change: "",
    changeType: "up",
  });

  const [isProductsModalVisible, setIsProductsModalVisible] = useState(false);
  const openProductsModal = () => setIsProductsModalVisible(true);
  const closeProductsModal = () => setIsProductsModalVisible(false);

  const [isCategoriesModalVisible, setIsCategoriesModalVisible] =
    useState(false);
  const openCategoriesModal = () => setIsCategoriesModalVisible(true);
  const closeCategoriesModal = () => setIsCategoriesModalVisible(false);

  const [categoriesList, setCategoriesList] = useState<Category[]>([]);

  const previousTotalProducts: number = 10;
  const previousTotalCategories: number = 1400;

  useEffect(() => {
    fetch("http://localhost:8081/total_products")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.totalProducts === "number") {
          setTotalProducts(data.totalProducts);
          const current = data.totalProducts;
          const prev = previousTotalProducts;

          let changePercent = 0;
          let type: "up" | "down" = "up";

          if (prev === 0) {
            changePercent = 100;
            type = "up";
          } else {
            changePercent = ((current - prev) / prev) * 100;
            type = changePercent >= 0 ? "up" : "down";
          }

          const formattedChange = `${
            type === "up" ? "+" : ""
          }${changePercent.toFixed(1)}%`;

          setChangeData({
            change: formattedChange,
            changeType: type,
          });
        } else {
          setTotalProducts(null);
          setChangeData({ change: "N/A", changeType: "down" });
        }
      })
      .catch(() => {
        setTotalProducts(null);
        setChangeData({ change: "N/A", changeType: "down" });
      });
  }, []);

  useEffect(() => {
    fetch("http://localhost:8081/total_categories")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.totalCategories === "number") {
          setTotalCategories(data.totalCategories);
          const current = data.totalCategories;
          const prev = previousTotalCategories;

          let changePercent = 0;
          let type: "up" | "down" = "up";

          if (prev === 0) {
            changePercent = 100;
            type = "up";
          } else {
            changePercent = ((current - prev) / prev) * 100;
            type = changePercent >= 0 ? "up" : "down";
          }

          const formattedChange = `${
            type === "up" ? "+" : ""
          }${changePercent.toFixed(1)}%`;

          setCategoriesChangeData({
            change: formattedChange,
            changeType: type,
          });
        } else {
          setTotalCategories(null);
          setCategoriesChangeData({ change: "N/A", changeType: "down" });
        }
      })
      .catch(() => {
        setTotalCategories(null);
        setCategoriesChangeData({ change: "N/A", changeType: "down" });
      });
  }, []);

  useEffect(() => {
    if (isCategoriesModalVisible) {
      fetch("http://localhost:8081/categories_list")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.categories)) {
            setCategoriesList(data.categories);
          } else {
            setCategoriesList([]);
          }
        })
        .catch(() => setCategoriesList([]));
    }
  }, [isCategoriesModalVisible]);

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
    <div className="space-y-6 bg-white dark:bg-[rgb(0,51,102)] text-black dark:text-white p-4">
      <h1 className="text-lg font-semibold">Dashboard</h1>

      <div className="bg-white dark:bg-[#1e293b] flex flex-wrap justify-center gap-6 p-6 rounded-lg shadow-md">
        {totalProducts === null || totalCategories === null
          ? [...Array(5)].map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-2xl bg-white dark:bg-[rgb(0,51,102)] p-4 flex-1 min-w-[200px] max-w-[250px] shadow-md"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
                    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
                  </div>
                  <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-md" />
                </div>
                <div className="flex justify-between items-center mt-6">
                  <div className="h-3 w-10 bg-gray-300 dark:bg-gray-600 rounded-full" />
                  <div className="h-3 w-14 bg-gray-300 dark:bg-gray-600 rounded-full" />
                </div>
              </div>
            ))
          : cardData.map((card, index) => (
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
                      card.changeType === "up"
                        ? "text-green-500"
                        : "text-red-500"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {/* First row */}
        <DailySalesChart />
        <WeeklySalesChart />

        {/* Second row */}
        <MonthlySalesChart />
        <YearlySalesChart />

        {/* Third row */}
        <TotalCustomersChart />
        <TopSellingProductsChart />
        {/* Fourth row */}
        <MostReservedTablesChart />
        <div className="bg-white dark:bg-[#001f3f] rounded-lg shadow-lg w-full h-full p-6 flex flex-col transition-colors">
          <TopSelling />
        </div>
        {/* Fifth row - make TopSelling span full width */}
      </div>
      <div className="col-span-1 sm:col-span-2 bg-white dark:bg-[#001f3f] rounded-lg shadow-lg w-full h-full p-6 flex flex-col transition-colors">
        <TotalRevenue />
      </div>

      <TotalProductsModal
        visible={isProductsModalVisible}
        onClose={closeProductsModal}
        totalProducts={totalProducts}
        change={changeData.change}
      />

      <CategoriesModal
        visible={isCategoriesModalVisible}
        onClose={closeCategoriesModal}
        categories={categoriesList}
        totalCategories={totalCategories}
        change={categoriesChangeData.change}
      />
    </div>
  );
};

export default AdminDashboard;
