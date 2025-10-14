import { useState } from "react";
import { MdRefresh } from "react-icons/md";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const WorkerSaleStat = () => {
  const originalData = [
    { year: "2019", revenue: 80 },
    { year: "2020", revenue: 100 },
    { year: "2021", revenue: 60 }, // Low
    { year: "2022", revenue: 120 },
    { year: "2023", revenue: 90 },
    { year: "2024", revenue: 100 },
    { year: "2025", revenue: 40 }, // Low
  ];

  const originalSummary = [
    {
      label: "Revenue",
      value: "$29.5k",
      change: "up",
      color: "text-green-500",
    },
    {
      label: "Expenses",
      value: "$15.07k",
      change: "down",
      color: "text-red-500",
    },
    { label: "Profit", value: "$71.5k", change: "up", color: "text-green-500" },
  ];

  const [data, setData] = useState(originalData);
  const [summaryData, setSummaryData] = useState(originalSummary);
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setData([...originalData]);
      setSummaryData([...originalSummary]);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="bg-white dark:bg-[#001f3f]  rounded-lg shadow-lg w-full h-full p-2 sm:p-4 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 border-b border-dotted pt-4 sm:pt-6 pb-2 px-2 sm:px-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800">
          Statistics
        </h2>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 text-white text-xs sm:text-sm bg-[#fa8c16] hover:bg-[#e07b12] px-3 py-1.5 rounded-lg transition duration-200 -mt-4"
        >
          Refresh <MdRefresh className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Chart */}
      <div className="flex justify-center items-center min-h-[250px] sm:min-h-[310px] px-2 sm:px-4">
        {loading ? (
          <div className="flex gap-2">
            <div className="w-3 sm:w-4 h-3 sm:h-4 rounded-full bg-[#fa8c16] animate-bounce"></div>
            <div className="w-3 sm:w-4 h-3 sm:h-4 rounded-full bg-[#ffc069] animate-bounce [animation-delay:-.3s]"></div>
            <div className="w-3 sm:w-4 h-3 sm:h-4 rounded-full bg-[#fa8c16] animate-bounce [animation-delay:-.5s]"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} barSize={20}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#ddd"
              />
              <XAxis
                dataKey="year"
                axisLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 10 }}
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 10 }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff7ef", // Soft theme background
                  color: "#333",
                  border: "1px solid #fa8c16", // Primary theme border
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  padding: "6px 10px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                }}
                labelStyle={{
                  color: "#fa8c16", // Theme-colored label
                  fontWeight: "bold",
                }}
                itemStyle={{
                  color: "#333", // Text inside the tooltip
                }}
                cursor={{ fill: "rgba(250,140,22,0.15)" }}
              />

              <Bar dataKey="revenue" radius={[10, 10, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.revenue < 70 ? "#ffa940" : "#fa8c16"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Summary Section (Only Flex) */}
      <div className="flex justify-between items-center gap-4 mt-4">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 animate-pulse"
              >
                <div className="w-12 sm:w-16 h-5 sm:h-6 bg-gray-200 rounded mb-1 sm:mb-2"></div>
                <div className="w-10 sm:w-12 h-3 sm:h-4 bg-gray-100 rounded"></div>
              </div>
            ))
          : summaryData.map((item, index) => (
              <div
                key={index}
                className="flex-1 flex flex-col items-center justify-center"
              >
                <h3
                  className={`text-base sm:text-lg md:text-xl font-bold ${item.color}`}
                >
                  {item.value}
                </h3>
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-500">
                  {item.label}
                </p>
              </div>
            ))}
      </div>
    </div>
  );
};

export default WorkerSaleStat;
