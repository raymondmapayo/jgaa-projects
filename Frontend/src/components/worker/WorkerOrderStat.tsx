import { useState } from "react";
import { MdRefresh } from "react-icons/md";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const WorkerOrderStat = () => {
  const themeColors = ["#fa8c16", "#ffc069", "#C3EBFA", "#F1F0FF"];

  const originalData = [
    { name: "Direct", value: 48.5, color: themeColors[0] },
    { name: "Social", value: 10.4, color: themeColors[1] },
    { name: "Marketing", value: 7.5, color: themeColors[2] },
    { name: "Affiliates", value: 33.6, color: themeColors[3] },
  ];

  const originalStatistics = [
    { name: "Direct", value: 965, change: "down", color: themeColors[0] },
    { name: "Social", value: 75, change: "up", color: themeColors[1] },
    { name: "Marketing", value: 102, change: "up", color: themeColors[2] },
    { name: "Affiliates", value: 96, change: "up", color: themeColors[3] },
  ];

  const [data, setData] = useState(originalData);
  const [statistics, setStatistics] = useState(originalStatistics);
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setData([...originalData]);
      setStatistics([...originalStatistics]);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="bg-white dark:bg-[#001f3f] rounded-lg shadow-lg w-full h-full p-2 sm:p-4 flex flex-col transition-colors">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 border-b border-dotted pt-4 sm:pt-6 pb-2 px-2 sm:px-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">
          Orders Statistics
        </h2>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 text-white text-xs sm:text-sm bg-[#fa8c16] hover:bg-[#e07b12] px-3 py-1.5 rounded-lg transition duration-200 -mt-4"
        >
          Refresh <MdRefresh className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Chart */}
      <div className="flex justify-center items-center min-h-[250px]">
        {loading ? (
          <div className="flex gap-2 items-center">
            <div className="w-3 sm:w-4 h-3 sm:h-4 rounded-full bg-[#fa8c16] animate-bounce" />
            <div className="w-3 sm:w-4 h-3 sm:h-4 rounded-full bg-[#ffc069] animate-bounce [animation-delay:-.2s]" />
            <div className="w-3 sm:w-4 h-3 sm:h-4 rounded-full bg-[#fa8c16] animate-bounce [animation-delay:-.4s]" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  color: "#333",
                  border: "1px solid #fa8c16",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  padding: "6px 10px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                }}
                itemStyle={{ color: "#fa8c16", fontWeight: "bold" }}
                cursor={{ fill: "rgba(250,140,22,0.1)" }}
              />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                wrapperStyle={{
                  marginTop: "5px",
                  fontSize: "0.8rem",
                  color: "#fff",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Statistics */}
      <div className="mt-4 flex flex-col sm:flex-row sm:flex-wrap justify-between gap-2 pb-4 sm:pb-6 pt-2 px-2 sm:px-4 text-xs sm:text-sm">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex justify-between items-center w-full sm:w-[48%] mb-2"
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-300 animate-pulse" />
                  <div className="w-20 h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                </div>
                <div className="w-10 h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
            ))
          : statistics.map((stat, index) => (
              <div
                key={index}
                className="flex justify-between items-center w-full sm:w-[48%] mb-2"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: stat.color }}
                  />
                  <span className="text-gray-700 dark:text-gray-200">
                    {stat.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`${
                      stat.change === "up" ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {stat.change === "up" ? "▲" : "▼"}
                  </span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {stat.value}
                  </span>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default WorkerOrderStat;
