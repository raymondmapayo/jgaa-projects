import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const initialData = [
  { year: "2020", sales: 15000 },
  { year: "2021", sales: 18000 },
  { year: "2022", sales: 21000 },
  { year: "2023", sales: 19000 },
  { year: "2024", sales: 25000 },
  { year: "2025", sales: 27000 },
];

const YearlySalesChart = () => {
  const [data] = useState(initialData);

  return (
    <div className="bg-white dark:bg-[#001f3f] rounded-lg shadow-lg w-full h-full p-6 flex flex-col transition-colors">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 border-b border-dotted pb-2">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">
          Yearly Sales
        </h2>
      </div>

      {/* Line Chart */}
      <div className="flex justify-center items-center min-h-[400px]">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={data}
            margin={{ top: 20, right: 20, left: 10, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
            <XAxis
              dataKey="year"
              axisLine={false}
              tick={{
                fill: "#9CA3AF",
                fontSize: 12,
                fontWeight: 600, // ✅ semi-bold
              }}
              tickLine={false}
              tickMargin={10}
            />
            <YAxis
              axisLine={false}
              tick={{
                fill: "#9CA3AF",
                fontSize: 12,
                fontWeight: 600,
              }}
              tickLine={false}
              tickMargin={10}
            />
            <Tooltip
              labelFormatter={(label) => `Year: ${label}`}
              contentStyle={{ backgroundColor: "#333", color: "#fff" }}
              labelStyle={{ color: "#fff" }}
              cursor={{ stroke: "#fa8c16", strokeWidth: 1, opacity: 0.2 }}
            />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#fa8c16"
              strokeWidth={3}
              dot={{ fill: "#fa8c16", r: 5 }}
              name="Sales"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default YearlySalesChart;
