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
  { month: "January", sales: 1200 },
  { month: "February", sales: 1500 },
  { month: "March", sales: 1800 },
  { month: "April", sales: 1600 },
  { month: "May", sales: 2000 },
  { month: "June", sales: 2200 },
  { month: "July", sales: 1750 },
  { month: "August", sales: 1950 },
  { month: "September", sales: 2100 },
  { month: "October", sales: 2300 },
  { month: "November", sales: 1900 },
  { month: "December", sales: 2500 },
];

const MonthlySalesChart = () => {
  const [data] = useState(initialData);

  return (
    <div className="bg-white dark:bg-[#001f3f] rounded-lg shadow-lg w-full h-full p-6 flex flex-col transition-colors">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 border-b border-dotted pb-2">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">
          Monthly Sales
        </h2>
      </div>

      {/* Bar Chart */}
      <div className="flex justify-center items-center min-h-[420px]">
        {/* ⬆️ added height so chart sits lower */}
        <ResponsiveContainer width="100%" height={360}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 20, left: 10, bottom: 80 }}
            // ⬆️ moved chart down + more space for labels
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tick={{
                fill: "#9CA3AF",
                fontSize: 12,
                fontWeight: 600, // ✅ semi-bold
              }}
              tickLine={false}
              tickMargin={15} // ⬆️ push labels farther down
              angle={-30} // ✅ slanted labels
              textAnchor="end"
              interval={0} // ✅ force all 12 months to display
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
              labelFormatter={(label) => `Month: ${label}`}
              contentStyle={{ backgroundColor: "#333", color: "#fff" }}
              labelStyle={{ color: "#fff" }}
              cursor={{ fill: "#fa8c16", opacity: 0.1 }}
            />

            <Bar
              dataKey="sales"
              fill="#fa8c16"
              name="Sales"
              barSize={30}
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlySalesChart;
