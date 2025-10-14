import { useMemo, useState } from "react";
import Calendar, { CalendarProps } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ---------- Types ----------
type DailyData = { date: string; sales: number };
type WeeklyData = { week: string; sales: number };
type MonthlyData = { month: string; sales: number };
type YearlyData = { year: string; sales: number };

type SalesPoint = DailyData | WeeklyData | MonthlyData | YearlyData;

type SalesGroup = {
  current: SalesPoint[];
  previous: SalesPoint[];
};

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

// ---------- Data ----------
const salesData: Record<"daily" | "weekly" | "monthly" | "yearly", SalesGroup> =
  {
    daily: {
      current: [
        { date: "2025-08-01", sales: 120 },
        { date: "2025-08-05", sales: 150 },
        { date: "2025-08-09", sales: 90 },
        { date: "2025-08-13", sales: 180 },
        { date: "2025-08-17", sales: 130 },
        { date: "2025-08-21", sales: 200 },
        { date: "2025-08-25", sales: 160 },
        { date: "2025-08-29", sales: 210 },
      ],
      previous: [
        { date: "2024-08-01", sales: 100 },
        { date: "2024-08-05", sales: 140 },
        { date: "2024-08-09", sales: 110 },
        { date: "2024-08-13", sales: 170 },
        { date: "2024-08-17", sales: 120 },
        { date: "2024-08-21", sales: 190 },
        { date: "2024-08-25", sales: 150 },
        { date: "2024-08-29", sales: 180 },
      ],
    },
    weekly: {
      current: [
        { week: "Week 1", sales: 520 },
        { week: "Week 2", sales: 780 },
        { week: "Week 3", sales: 610 },
        { week: "Week 4", sales: 890 },
      ],
      previous: [
        { week: "Week 1", sales: 480 },
        { week: "Week 2", sales: 700 },
        { week: "Week 3", sales: 640 },
        { week: "Week 4", sales: 850 },
      ],
    },
    monthly: {
      current: [
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
      ],
      previous: [
        { month: "January", sales: 1100 },
        { month: "February", sales: 1400 },
        { month: "March", sales: 1700 },
        { month: "April", sales: 1500 },
        { month: "May", sales: 1850 },
        { month: "June", sales: 2100 },
        { month: "July", sales: 1600 },
        { month: "August", sales: 1750 },
        { month: "September", sales: 2000 },
        { month: "October", sales: 2200 },
        { month: "November", sales: 1800 },
        { month: "December", sales: 2400 },
      ],
    },
    yearly: {
      current: [
        { year: "2020", sales: 15000 },
        { year: "2021", sales: 18000 },
        { year: "2022", sales: 21000 },
        { year: "2023", sales: 19000 },
        { year: "2024", sales: 25000 },
        { year: "2025", sales: 27000 },
      ],
      previous: [
        { year: "2019", sales: 14000 },
        { year: "2020", sales: 16000 },
        { year: "2021", sales: 17500 },
        { year: "2022", sales: 20000 },
        { year: "2023", sales: 18500 },
        { year: "2024", sales: 24000 },
      ],
    },
  };

// ---------- Key field mapping ----------
const keyFieldMap = {
  daily: "date",
  weekly: "week",
  monthly: "month",
  yearly: "year",
} as const;

const SalesChartWithCalendar = () => {
  const [filter, setFilter] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("daily");

  const [selectedDate, setSelectedDate] = useState<Value>(new Date());

  const currentData = salesData[filter].current;
  const previousData = salesData[filter].previous;
  const keyField = keyFieldMap[filter];

  // Merge data for Recharts
  const mergedData = currentData.map((item, idx) => ({
    [keyField]: (item as any)[keyField],
    currentSales: item.sales,
    previousSales: previousData[idx]?.sales || 0,
  }));

  // Handle calendar change
  const handleDateChange: CalendarProps["onChange"] = (value) => {
    setSelectedDate(value);

    if (Array.isArray(value)) {
      const diff = (value[1]?.getTime() || 0) - (value[0]?.getTime() || 0);
      const days = diff / (1000 * 60 * 60 * 24);

      if (days >= 6 && days <= 7) {
        setFilter("weekly");
      } else if (days >= 28 && days <= 31) {
        setFilter("monthly");
      } else if (days > 365) {
        setFilter("yearly");
      }
    } else {
      setFilter("daily");
    }
  };

  // Generate insights
  const insights = useMemo(() => {
    if (!currentData.length || !previousData.length) return "";

    const highest = currentData.reduce((a, b) => (a.sales > b.sales ? a : b));
    const lowest = currentData.reduce((a, b) => (a.sales < b.sales ? a : b));

    const totalCurrent = currentData.reduce((sum, d) => sum + d.sales, 0);
    const totalPrevious = previousData.reduce((sum, d) => sum + d.sales, 0);
    const overallChange = (
      ((totalCurrent - totalPrevious) / totalPrevious) *
      100
    ).toFixed(1);

    const highestIdx = currentData.findIndex(
      (d) => (d as any)[keyField] === (highest as any)[keyField]
    );
    const lowestIdx = currentData.findIndex(
      (d) => (d as any)[keyField] === (lowest as any)[keyField]
    );

    const highestPrev = previousData[highestIdx]?.sales || 0;
    const lowestPrev = previousData[lowestIdx]?.sales || 0;

    const highestChange = (
      ((highest.sales - highestPrev) / highestPrev) *
      100
    ).toFixed(1);
    const lowestChange = (
      ((lowest.sales - lowestPrev) / lowestPrev) *
      100
    ).toFixed(1);

    return `
On ${(highest as any)[keyField]}, sales reached ${
      highest.sales
    }, compared to ${highestPrev} last period → ${
      Number(highestChange) >= 0 ? "📈" : "📉"
    } ${highestChange}% change.

The lowest point was ${(lowest as any)[keyField]} (${
      lowest.sales
    }), which was ${Math.abs(Number(lowestChange))}% ${
      Number(lowestChange) < 0 ? "lower" : "higher"
    } than last year’s ${lowestPrev}.

Overall, ${filter} sales showed a ${overallChange}% change compared to last period.
    `;
  }, [filter, currentData, previousData, keyField]);

  return (
    <div className="bg-white dark:bg-[#001f3f] rounded-lg shadow-lg w-full h-full p-6 flex flex-col transition-colors">
      {/* Calendar */}
      <div className="mb-4 flex justify-center">
        <Calendar
          selectRange
          onChange={handleDateChange}
          value={selectedDate}
        />
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-4 border-b border-dotted pb-2">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">
          {filter.charAt(0).toUpperCase() + filter.slice(1)} Sales Comparison
        </h2>
      </div>

      {/* Chart */}
      <div className="flex justify-center items-center min-h-[400px]">
        <ResponsiveContainer width="100%" height={350}>
          {filter === "yearly" || filter === "daily" ? (
            <LineChart data={mergedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
              <XAxis dataKey={keyField} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="currentSales"
                stroke="#fa8c16"
                strokeWidth={3}
                dot
                name="2025"
              />
              <Line
                type="monotone"
                dataKey="previousSales"
                stroke="#8884d8"
                strokeWidth={3}
                dot
                name="2024"
              />
            </LineChart>
          ) : (
            <BarChart data={mergedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
              <XAxis dataKey={keyField} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="currentSales"
                fill="#fa8c16"
                barSize={40}
                radius={[6, 6, 0, 0]}
                name="2025"
              />
              <Bar
                dataKey="previousSales"
                fill="#8884d8"
                barSize={40}
                radius={[6, 6, 0, 0]}
                name="2024"
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="mt-4 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
        {insights}
      </div>
    </div>
  );
};

export default SalesChartWithCalendar;
