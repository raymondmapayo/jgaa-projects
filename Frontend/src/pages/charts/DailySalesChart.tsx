import { useState } from "react";
import {
  CartesianGrid,
  DotProps,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const DailySalesChart = () => {
  // Sample daily sales data (real dates)
  const initialData = [
    { date: "2025-08-01", sales: 120 },
    { date: "2025-08-05", sales: 150 },
    { date: "2025-08-09", sales: 90 },
    { date: "2025-08-13", sales: 180 },
    { date: "2025-08-17", sales: 130 },
    { date: "2025-08-21", sales: 200 },
    { date: "2025-08-25", sales: 160 },
    { date: "2025-08-29", sales: 210 },
  ];

  const [data] = useState(initialData);

  // Custom dot styling (highlight low sales)
  const renderCustomDot = (props: DotProps & { value?: number }) => {
    const { cx, cy, value } = props;
    const isLow = value !== undefined && value < 100;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill={isLow ? "#ffa940" : "#fa8c16"}
        stroke="#fff"
        strokeWidth={1}
      />
    );
  };

  return (
    <div className="bg-white dark:bg-[#001f3f] rounded-lg shadow-lg w-full h-full p-6 flex flex-col transition-colors">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 border-b border-dotted pb-2">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">
          Daily Sales
        </h2>
      </div>

      {/* Line Chart */}
      <div className="flex justify-center items-center min-h-[400px]">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tick={{
                fill: "#9CA3AF",
                fontSize: 12,
                fontWeight: 600, // ✅ semi-bold (like Tailwind font-semibold)
              }}
              tickLine={false}
              tickMargin={6}
              angle={-30}
              textAnchor="end"
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
              labelFormatter={(label) => `Date: ${label}`}
              contentStyle={{ backgroundColor: "#333", color: "#fff" }}
              labelStyle={{ color: "#fff" }}
              cursor={{ stroke: "#fa8c16", strokeWidth: 1, opacity: 0.2 }}
            />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#fa8c16"
              strokeWidth={3}
              dot={renderCustomDot}
              name="Sales"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DailySalesChart;
