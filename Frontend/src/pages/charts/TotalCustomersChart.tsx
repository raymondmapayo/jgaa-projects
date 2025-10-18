// src/components/Worker/TotalCustomersChart.tsx
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
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

interface CustomerItem {
  name: string; // date from backend
  customers: number;
}

interface TotalCustomersChartProps {
  dates: [Dayjs | null, Dayjs | null]; // ✅ receive from WorkerDashboard
}

const TotalCustomersChart: React.FC<TotalCustomersChartProps> = ({ dates }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const apiUrl = import.meta.env.VITE_API_URL;

  // --- Fetch Data ---
  const fetchData = async (start?: string, end?: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/total_users_bytime`, {
        params: { start, end },
      });
      const result: CustomerItem[] = res.data || [];

      const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayMap: { [key: string]: string } = {
        Sunday: "Sun",
        Monday: "Mon",
        Tuesday: "Tue",
        Wednesday: "Wed",
        Thursday: "Thu",
        Friday: "Fri",
        Saturday: "Sat",
      };

      const mappedData = weekdays.map((shortDay) => {
        const fullDay = Object.keys(dayMap).find(
          (key) => dayMap[key] === shortDay
        )!;
        const items = result.filter(
          (item) => dayjs(item.name).format("dddd") === fullDay
        );

        return {
          name: shortDay,
          customers:
            items.length > 0 ? Math.max(...items.map((i) => i.customers)) : 0,
          details: items.map((i) => ({
            date: dayjs(i.name).format("MM/DD/YYYY"),
            customers: i.customers,
          })),
        };
      });

      setData(mappedData);

      // --- Descriptive Analytics ---
      if (result.length > 0) {
        const sorted = [...result].sort((a, b) => b.customers - a.customers);
        const top = sorted[0];
        const bottom = sorted[sorted.length - 1];

        const avg =
          result.reduce(
            (sum: number, curr: CustomerItem) => sum + curr.customers,
            0
          ) / result.length;

        let desc = `📌 ${dayjs(top.name).format(
          "dddd, MMMM D"
        )} had the highest customer count with ${top.customers} customer${
          top.customers !== 1 ? "s" : ""
        }`;

        if (bottom && bottom.name !== top.name) {
          desc += `, while ${dayjs(bottom.name).format(
            "dddd, MMMM D"
          )} had the lowest, also with ${bottom.customers} customer${
            bottom.customers !== 1 ? "s" : ""
          }`;
        }

        desc += `. On average, the restaurant served ${avg.toFixed(
          1
        )} customer${avg !== 1 ? "s" : ""} per day.`;

        setDescription(desc);
      } else {
        setDescription("No users data available for the selected date range.");
      }
    } catch (error) {
      console.error(error);
      setData([]);
      setDescription("No users data available for the selected date range.");
    }
    setLoading(false);
  };

  // --- Refetch when date filter changes ---
  useEffect(() => {
    const [start, end] = dates;
    fetchData(start?.format("YYYY-MM-DD"), end?.format("YYYY-MM-DD"));
  }, [dates]); // ✅ updates automatically

  return (
    <div className="relative -mx-6 sm:mx-0">
      <div className="bg-white dark:bg-[#001f3f] rounded-lg shadow-lg sm:w-full h-full p-6 flex flex-col transition-colors">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 border-b border-dotted pb-2">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">
            Total Customers
          </h2>
          <div className="flex-shrink-0 text-sm text-gray-500 dark:text-gray-300">
            {dates[0]?.format("MMM DD, YYYY")} →{" "}
            {dates[1]?.format("MMM DD, YYYY")}
          </div>
        </div>

        {/* Chart or No Data */}
        <div className="flex justify-center items-center min-h-[300px]">
          {loading ? (
            <div className="flex gap-2 items-center">
              <div className="w-4 h-4 rounded-full bg-[#fa8c16] animate-bounce" />
              <div className="w-4 h-4 rounded-full bg-[#ffc069] animate-bounce [animation-delay:-.2s]" />
              <div className="w-4 h-4 rounded-full bg-[#C3EBFA] animate-bounce [animation-delay:-.4s]" />
            </div>
          ) : data.every((d) => d.customers === 0) ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              No customer data available yet.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="90%">
              <BarChart
                data={data}
                barSize={25}
                margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={({ x, y, payload }) => (
                    <text
                      x={x}
                      y={y + 10}
                      fill="#6b7280"
                      fontSize={12}
                      textAnchor="end"
                      transform={`rotate(-45, ${x}, ${y + 10})`}
                    >
                      {payload.value}
                    </text>
                  )}
                />

                <YAxis
                  axisLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "10px",
                    borderColor: "#d1d5db",
                    backgroundColor: "#f9fafb",
                    color: "#374151",
                    whiteSpace: "pre-line",
                  }}
                  cursor={{ fill: "rgba(250, 140, 22, 0.1)" }}
                  labelFormatter={(label: string) => label}
                  formatter={(_value: number, _name: string, props: any) => {
                    const item = data.find(
                      (d: {
                        name: string;
                        details?: { date: string; customers: number }[];
                      }) => d.name === props.payload.name
                    );
                    if (!item || !item.details) return ["0", null];

                    const detailsText = item.details
                      .map(
                        (d: { date: string; customers: number }) =>
                          `${d.date} - ${d.customers} customer${
                            d.customers !== 1 ? "s" : ""
                          }`
                      )
                      .join("\n");

                    return [detailsText, null];
                  }}
                />

                <Legend
                  align="center"
                  verticalAlign="top"
                  wrapperStyle={{
                    paddingTop: "20px",
                    paddingBottom: "10px",
                    color: "#4b5563",
                  }}
                />
                <Bar
                  dataKey="customers"
                  name="Customers"
                  fill="#fa8c16"
                  legendType="circle"
                  radius={[8, 8, 0, 0]}
                  minPointSize={2}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Description */}
        <div className="mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed text-justify">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TotalCustomersChart;
