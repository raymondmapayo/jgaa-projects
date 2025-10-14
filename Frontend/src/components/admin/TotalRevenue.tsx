import { useState } from "react";
import { MdRefresh } from "react-icons/md";
import {
  CartesianGrid,
  DotProps,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const AdminTotalRevenue = () => {
  const initialData = [
    { month: "Jan", income: 80, expenses: 40 },
    { month: "Feb", income: 90, expenses: 50 },
    { month: "Mar", income: 70, expenses: 30 }, // low
    { month: "Apr", income: 100, expenses: 60 },
    { month: "May", income: 60, expenses: 40 }, // borderline
    { month: "Jun", income: 50, expenses: 35 }, // low
    { month: "Jul", income: 70, expenses: 45 },
    { month: "Aug", income: 80, expenses: 50 },
    { month: "Sep", income: 90, expenses: 60 },
    { month: "Oct", income: 85, expenses: 55 },
    { month: "Nov", income: 75, expenses: 40 },
    { month: "Dec", income: 95, expenses: 30 }, // low expense
  ];

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setData(initialData);
      setLoading(false);
    }, 800);
  };

  const totalIncome = data.reduce((sum, item) => sum + item.income, 0);
  const totalExpenses = data.reduce((sum, item) => sum + item.expenses, 0);

  // Custom dot for dynamic coloring
  const renderCustomDot = (props: DotProps & { value?: number }) => {
    const { cx, cy, value } = props;
    const isLow = value !== undefined && value < 60;
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
    <div className="bg-white dark:bg-[#001f3f] rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 border-b border-dotted pt-6 pb-4 px-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800">
          Total Revenue
        </h2>
        <button
          onClick={handleRefresh}
          className="text-white bg-[#fa8c16] hover:bg-[#e07b12] text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition"
        >
          Refresh <MdRefresh className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Line Chart */}
      <div className="px-4 min-h-[200px] sm:min-h-[300px] flex items-center justify-center">
        {loading ? (
          <div className="flex gap-2">
            <div className="w-3 sm:w-4 h-3 sm:h-4 rounded-full bg-[#fa8c16] animate-bounce"></div>
            <div className="w-3 sm:w-4 h-3 sm:h-4 rounded-full bg-[#ffc069] animate-bounce [animation-delay:-.3s]"></div>
            <div className="w-3 sm:w-4 h-3 sm:h-4 rounded-full bg-[#fa8c16] animate-bounce [animation-delay:-.5s]"></div>
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height={250}
            className="sm:!h-[300px]"
          >
            <LineChart
              data={data}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                tickLine={false}
                tickMargin={6}
              />
              <YAxis
                axisLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                tickLine={false}
                tickMargin={10}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #fa8c16",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  padding: "6px 10px",
                  color: "#333",
                }}
                cursor={{ stroke: "#fa8c16", strokeWidth: 1, opacity: 0.2 }}
              />
              <Legend
                align="center"
                verticalAlign="top"
                wrapperStyle={{ paddingBottom: "10px" }}
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#fa8c16"
                strokeWidth={3}
                dot={renderCustomDot}
                name="Total Income"
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#ffc069"
                strokeWidth={3}
                dot={{ r: 4, fill: "#ffc069", stroke: "#fff", strokeWidth: 1 }}
                name="Total Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Summary Section (Flex only) */}
      <div className="flex justify-around items-center gap-4 p-4 flex-nowrap">
        {/* Payments */}
        <div className="flex flex-col items-center space-y-2">
          {loading ? (
            <div className="flex flex-col items-center gap-2 animate-pulse">
              <div className="flex gap-2">
                <div className="w-6 sm:w-8 h-4 sm:h-5 bg-gray-200 rounded" />
                <div className="w-6 sm:w-8 h-4 sm:h-5 bg-gray-200 rounded" />
                <div className="w-6 sm:w-8 h-4 sm:h-5 bg-gray-200 rounded" />
              </div>
              <div className="w-14 sm:w-16 h-3 sm:h-4 bg-gray-100 rounded mt-2" />
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <img
                  src="https://coderthemes.com/adminto/layouts/assets/images/cards/american-express.svg"
                  alt="AMEX"
                  className="w-6 sm:w-8 h-4 sm:h-5"
                />
                <img
                  src="https://coderthemes.com/adminto/layouts/assets/images/cards/discover-card.svg"
                  alt="Discover"
                  className="w-6 sm:w-8 h-4 sm:h-5"
                />
                <img
                  src="https://coderthemes.com/adminto/layouts/assets/images/cards/mastercard.svg"
                  alt="Visa"
                  className="w-6 sm:w-8 h-4 sm:h-5"
                />
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500">Payments</p>
            </>
          )}
        </div>

        {/* Expenses */}
        <div className="flex flex-col items-center space-y-1">
          {loading ? (
            <div className="w-14 sm:w-16 h-4 sm:h-5 bg-gray-200 rounded animate-pulse" />
          ) : (
            <>
              <h3 className="text-sm sm:text-lg font-bold text-red-500">
                ${totalExpenses.toFixed(2)}k
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-500">Expenses</p>
            </>
          )}
        </div>

        {/* Revenue */}
        <div className="flex flex-col items-center space-y-1">
          {loading ? (
            <div className="w-14 sm:w-16 h-4 sm:h-5 bg-gray-200 rounded animate-pulse" />
          ) : (
            <>
              <h3 className="text-sm sm:text-lg font-bold text-green-500">
                ${totalIncome.toFixed(2)}k
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-500">Revenue</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTotalRevenue;
