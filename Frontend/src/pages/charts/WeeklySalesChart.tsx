import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const initialData = [
  { week: "Week 1", sales: 520 },
  { week: "Week 2", sales: 780 },
  { week: "Week 3", sales: 610 },
  { week: "Week 4", sales: 890 },
];

const WeeklySalesChart = () => {
  const [data] = useState(initialData);

  return (
    <div className="bg-white dark:bg-[#001f3f] rounded-lg shadow-lg w-full h-full p-6 flex flex-col transition-colors">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 border-b border-dotted pb-2">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">
          Weekly Sales
        </h2>
      </div>

      {/* Bar Chart */}
      <div className="flex justify-center items-center min-h-[400px]">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={data}
            margin={{ top: 5, right: 20, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
            <XAxis
              dataKey="week"
              axisLine={false}
              tick={{
                fill: "#9CA3AF",
                fontSize: 12,
                fontWeight: 600, // ✅ semi-bold
              }}
              tickLine={false}
              tickMargin={6}
            />
            <YAxis
              axisLine={false}
              tick={{
                fill: "#9CA3AF",
                fontSize: 12,
                fontWeight: 600, // ✅ semi-bold
              }}
              tickLine={false}
              tickMargin={10}
            />
            <Tooltip
              labelFormatter={(label) => `Week: ${label}`}
              contentStyle={{ backgroundColor: "#333", color: "#fff" }}
              labelStyle={{ color: "#fff" }}
              cursor={{ fill: "#fa8c16", opacity: 0.1 }}
            />
            <Bar
              dataKey="sales"
              fill="#fa8c16"
              name="Sales"
              barSize={40}
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklySalesChart;
