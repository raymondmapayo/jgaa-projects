import { useState } from "react";
import { MdRefresh } from "react-icons/md";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const originalData = [
  { name: "January", sales: 12000 },
  { name: "February", sales: 15000 },
  { name: "March", sales: 18000 },
  { name: "April", sales: 16000 },
  { name: "May", sales: 20000 },
  { name: "June", sales: 22000 },
];

const TotalSalesChart = () => {
  const [data, setData] = useState(originalData);
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setData([...originalData]);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="bg-white dark:bg-[#001f3f] rounded-lg shadow-lg w-full h-full p-6 flex flex-col transition-colors">
      <div className="flex justify-between items-center mb-4 border-b border-dotted pb-2">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">
          Total Sales
        </h2>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 text-white text-xs sm:text-sm bg-[#fa8c16] hover:bg-[#e07b12] px-3 py-1.5 rounded-lg transition duration-200"
        >
          Refresh <MdRefresh className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="flex justify-center items-center min-h-[400px]">
        {loading ? (
          <div className="flex gap-2 items-center">
            <div className="w-4 h-4 rounded-full bg-[#fa8c16] animate-bounce" />
            <div className="w-4 h-4 rounded-full bg-[#ffc069] animate-bounce [animation-delay:-.2s]" />
            <div className="w-4 h-4 rounded-full bg-[#C3EBFA] animate-bounce [animation-delay:-.4s]" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#666" />
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip
                contentStyle={{ backgroundColor: "#333", color: "#fff" }}
                labelStyle={{ color: "#fff" }}
              />
              <Legend />
              <Bar
                dataKey="sales"
                fill="#fa8c16"
                name="Sales"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default TotalSalesChart;
