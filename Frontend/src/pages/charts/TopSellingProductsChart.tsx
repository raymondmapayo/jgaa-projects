// TopSellingProductsChart.tsx
import axios from "axios";
import { useEffect, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const TopSellingProductsChart = () => {
  const [data, setData] = useState<any[]>([]);
  const [description, setDescription] = useState("");
  const apiUrl = import.meta.env.VITE_API_URL;
  useEffect(() => {
    axios.get(`${apiUrl}/most_top_selling`).then((res) => {
      const colors = ["#fa8c16", "#ffc069", "#82ca9d", "#8884d8"];
      const formatted = res.data.map((item: any, idx: number) => ({
        name: item.item_name,
        sales: item.total_order_quantity,
        rating: item.total_avg_rating,
        color: colors[idx % colors.length],
      }));

      const sorted = [...formatted].sort((a, b) => {
        if (b.sales === a.sales) return b.rating - a.rating;
        return b.sales - a.sales;
      });

      setData(sorted);

      if (sorted.length > 0) {
        const top = sorted[0];
        const second = sorted[1];

        let desc = `${top.name} is the top-selling dish with ${top.sales} sales and an average rating of ${top.rating} (⭐).`;

        if (second) {
          desc += ` It’s closely followed by ${second.name}, which also has ${second.sales} sales and a ${second.rating} (⭐) rating. Both dishes show similar levels of popularity and customer satisfaction.`;
        }

        setDescription(desc);
      } else {
        setDescription("No data available yet.");
      }
    });
  }, []);

  return (
    <div className="relative -mx-6 sm:mx-0">
      <div className="bg-white dark:bg-[#001f3f] rounded-lg shadow-lg sm:w-full p-6 flex flex-col transition-colors">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b border-dotted pb-2">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">
            Top-Selling Menu Chart
          </h2>
        </div>

        {/* Chart + Left List */}
        <div className="flex flex-col sm:flex-row justify-start items-start gap-6 w-full">
          {data.length === 0 ? (
            <div className="flex flex-col items-center justify-center w-full min-h-[300px] text-gray-500 dark:text-gray-300">
              <p>No sales data yet 📉</p>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[{ name: "No Data", sales: 1, color: "#e5e7eb" }]}
                    dataKey="sales"
                    nameKey="name"
                    outerRadius="80%"
                    label
                  >
                    <Cell fill="#e5e7eb" />
                  </Pie>
                  <Tooltip formatter={() => ["0 sales", "No Data"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <>
              {/* Left side list */}
              <div className="mt-4 space-y-2 w-full sm:w-1/3">
                {data.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    ></span>
                    <span className="text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap">
                      {item.name} {item.sales} (sales), {item.rating}(⭐)
                    </span>
                  </div>
                ))}
              </div>

              {/* Pie Chart */}
              <div className="flex justify-center items-center w-full sm:w-2/3 min-h-[300px]">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data}
                      dataKey="sales"
                      nameKey="name"
                      outerRadius="80%"
                      label
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [`${value} sales`, name]}
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        color: "#374151",
                        fontWeight: 500,
                      }}
                      labelStyle={{
                        color: "#111827",
                        fontWeight: 600,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>

        {/* Descriptive Analytics */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"></h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed text-justify">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TopSellingProductsChart;
