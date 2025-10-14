// src/components/worker/WorkerTotalRevenue.tsx
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import DateFilterModal from "../../pages/WorkerModals/DateFilterModal";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(isoWeek);

interface RevenueData {
  date: string;
  sales: number;
}

const apiUrl = import.meta.env.VITE_API_URL;

const WorkerTotalRevenue = () => {
  const [rawData, setRawData] = useState<RevenueData[]>([]);
  const [data, setData] = useState<RevenueData[]>([]);
  const [filterType, setFilterType] = useState<"daily" | "weekly" | "monthly">(
    "daily"
  );

  // Generate all dates for the current month
  const generateMonthDates = (start: Dayjs, end: Dayjs) => {
    const dates: string[] = [];
    for (let d = start; d.isSameOrBefore(end); d = d.add(1, "day")) {
      dates.push(d.format("YYYY-MM-DD"));
    }
    return dates;
  };

  // Fetch all payments
  useEffect(() => {
    fetch(`${apiUrl}/get_payments`)
      .then((res) => res.json())
      .then((payments) => {
        const grouped: { [key: string]: number } = {};
        payments
          .filter((p: any) => p.payment_status === "Completed")
          .forEach((p: any) => {
            const date = dayjs(p.payment_date).format("YYYY-MM-DD");
            grouped[date] = (grouped[date] || 0) + Number(p.amount_paid);
          });

        // Convert grouped object to array
        const allData: RevenueData[] = Object.keys(grouped)
          .sort((a, b) => dayjs(a).unix() - dayjs(b).unix())
          .map((d) => ({ date: d, sales: grouped[d] }));

        setRawData(allData);

        // Default display: current month only
        const today = dayjs();
        const start = today.startOf("month");
        const end = today.endOf("month");
        const monthData = generateMonthDates(start, end).map((d) => {
          const item = allData.find((r) => r.date === d);
          return { date: d, sales: item ? item.sales : 0 };
        });

        setData(monthData);
      })
      .catch((err) => console.error("Error fetching payments:", err));
  }, []);

  const groupData = (
    dataset: RevenueData[],
    type: "daily" | "monthly"
  ): RevenueData[] => {
    const sorted = [...dataset].sort((a, b) =>
      dayjs(a.date).diff(dayjs(b.date))
    );

    if (type === "daily") return sorted;

    if (type === "monthly") {
      const grouped: { [key: string]: number } = {};
      sorted.forEach((item) => {
        const monthKey = dayjs(item.date).format("YYYY-MM");
        grouped[monthKey] = (grouped[monthKey] || 0) + item.sales;
      });

      const year = dayjs().year();
      const months: string[] = [];
      for (let m = 0; m < 12; m++) {
        const monthKey = dayjs(new Date(year, m, 1)).format("YYYY-MM");
        months.push(monthKey);
        if (!grouped[monthKey]) grouped[monthKey] = 0;
      }

      return months.map((m) => ({
        date: m + "-01", // keep a valid YYYY-MM-DD
        sales: grouped[m],
      }));
    }

    return sorted;
  };

  const handleDateFilter = (start: Dayjs | null, end: Dayjs | null) => {
    if (!start || !end) return;

    const dates: string[] = [];
    for (
      let d = start.startOf("day");
      d.isSameOrBefore(end.startOf("day"));
      d = d.add(1, "day")
    ) {
      dates.push(d.format("YYYY-MM-DD"));
    }

    const filtered = dates.map((d) => {
      const item = rawData.find((r) => r.date === d);
      return { date: d, sales: item ? item.sales : 0 };
    });

    const diffDays = end.diff(start, "day") + 1;
    const diffMonths = end.diff(start, "month") + 1;

    if (diffMonths > 1) {
      setFilterType("monthly");
      setData(groupData(filtered, "monthly"));
    } else if (diffDays > 13) {
      setFilterType("weekly");
      setData(groupData(filtered, "daily")); // keep all days individually
    } else {
      setFilterType("daily");
      setData(groupData(filtered, "daily"));
    }
  };

  const totalSales = data.reduce((sum, item) => sum + item.sales, 0);

  const summary = useMemo(() => {
    const valid = data.filter((item) => item.sales > 0);
    if (valid.length === 0) return "";

    const highest = valid.reduce((a, b) => (a.sales > b.sales ? a : b));
    const lowest = valid.reduce((a, b) => (a.sales < b.sales ? a : b));
    const last = valid[valid.length - 1];
    const prev = valid.length > 1 ? valid[valid.length - 2] : null;

    let changeText = "-";
    if (prev && prev.sales !== 0) {
      const change = ((last.sales - prev.sales) / prev.sales) * 100;
      const sign = change >= 0 ? "+" : ""; // negative automatically shows '-'
      changeText = `${sign}${change.toFixed(1)}% ${change >= 0 ? "📈" : "📉"}`;
    }
    return `
📅 ${dayjs(last.date).format("MM/DD/YYYY")}: (₱${last.sales} — ${
      prev
        ? `${changeText} compared to ${dayjs(prev.date).format(
            "MM/DD/YYYY"
          )}: (₱${prev.sales})`
        : "-"
    }
🔼 Highest: ${dayjs(highest.date).format("MM/DD/YYYY")} — ₱${highest.sales}
🔽 Lowest: ${dayjs(lowest.date).format("MM/DD/YYYY")} — ₱${lowest.sales}
💰 Total Sales: ₱${valid.reduce((sum, item) => sum + item.sales, 0)}
  `.trim();
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const dateLabel =
        filterType === "monthly"
          ? dayjs(item.date).format("MMM YYYY")
          : item.date.includes(" → ")
          ? item.date
          : dayjs(item.date).format("MMM DD, YYYY");
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border rounded shadow-md text-sm">
          <p>{dateLabel}</p>
          <p>Sales: ₱{item.sales}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative -mx-6 sm:mx-0">
      <div className="bg-white dark:bg-[#001f3f] rounded-lg shadow-lg sm:w-full h-full p-6 flex flex-col transition-colors">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 border-b border-dotted pb-2">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">
            Total Sales (
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)})
          </h2>

          <div className="flex items-center gap-2">
            <DateFilterModal onApply={handleDateFilter} />
            <button
              onClick={() => {
                // Reset to current month daily
                const today = dayjs();
                const start = today.startOf("month");
                const end = today.endOf("month");
                const monthData = generateMonthDates(start, end).map((d) => {
                  const item = rawData.find((r) => r.date === d);
                  return { date: d, sales: item ? item.sales : 0 };
                });
                setData(monthData);
                setFilterType("daily");
              }}
              className="px-2 py-1 border rounded bg-blue-600 text-white text-sm"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="flex flex-col justify-center items-center min-h-[300px] w-full">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data}
              margin={{ top: 5, right: 20, left: 10, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                interval="preserveStartEnd"
                minTickGap={20}
                tickFormatter={(date) =>
                  filterType === "monthly"
                    ? dayjs(date).format("MMM")
                    : dayjs(date).format("MMM DD")
                }
              />
              <YAxis />
              <Tooltip content={CustomTooltip} />
              <Legend
                align="center"
                iconType="circle"
                verticalAlign="top"
                wrapperStyle={{
                  paddingTop: "20px",
                  paddingBottom: "10px",
                  color: "#4b5563",
                }}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#fa8c16"
                strokeWidth={3}
                name="Sales"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Summary + Total Sales (below the chart) */}
        <div className="flex justify-center items-center gap-4 p-1 -mt-4">
          <div className="flex flex-col items-center -mt-2">
            <h3 className="text-sm sm:text-lg font-bold text-green-500">
              ₱{totalSales.toFixed(2)}
            </h3>
            <p className="text-xs text-gray-500">Total Sales</p>
          </div>
        </div>

        <div className="text-sm text-gray-700 whitespace-pre-line mt-1 sm:mt-2">
          {summary}
        </div>
      </div>
    </div>
  );
};

export default WorkerTotalRevenue;
