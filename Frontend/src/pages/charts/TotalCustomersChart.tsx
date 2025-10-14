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
import CustomerFilterModal from "../WorkerModals/CustomerFilterModal";

interface CustomerItem {
  name: string; // date from backend
  customers: number;
}

const TotalCustomersChart = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [filterRange, setFilterRange] = useState<[Dayjs | null, Dayjs | null]>([
    dayjs().startOf("month"),
    dayjs(),
  ]);
  const apiUrl = import.meta.env.VITE_API_URL;
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

      // Map backend data into weekdays with details
      const mappedData = weekdays.map((shortDay) => {
        // find items from backend that match the full day name
        const fullDay = Object.keys(dayMap).find(
          (key) => dayMap[key] === shortDay
        )!;
        const items = result.filter(
          (item) => dayjs(item.name).format("dddd") === fullDay
        );

        return {
          name: shortDay, // short name for X-axis
          customers:
            items.length > 0 ? Math.max(...items.map((i) => i.customers)) : 0, // prioritize max
          details: items.map((i) => ({
            date: dayjs(i.name).format("MM/DD/YYYY"),
            customers: i.customers,
          })),
        };
      });

      setData(mappedData);

      // Descriptive analytics
      // Descriptive analytics
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
        )} customer${avg !== 1 ? "s" : ""} per day, showing consistent${
          top.customers === bottom.customers ? " but low" : ""
        } activity during the period.`;

        setDescription(desc);
      } else {
        setDescription("No customer data available yet.");
      }
    } catch (error) {
      console.error(error);
      setData([]);
      setDescription("No customer data available yet.");
    }
    setLoading(false);
  };

  useEffect(() => {
    const [start, end] = filterRange;
    fetchData(start?.format("YYYY-MM-DD"), end?.format("YYYY-MM-DD"));
  }, []);

  return (
    <div className="relative -mx-6 sm:mx-0">
      <div className="bg-white dark:bg-[#001f3f] rounded-lg shadow-lg  sm:w-full h-full p-6 flex flex-col transition-colors">
        {/* Header with filter */}
        <div className="flex flex-wrap justify-between items-center mb-4 border-b border-dotted pb-2 gap-3">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white flex-1">
            Total Customers
          </h2>
          <div className="flex-shrink-0">
            <CustomerFilterModal
              onApply={(start, end) => {
                setFilterRange([start, end]);
                fetchData(
                  start?.format("YYYY-MM-DD"),
                  end?.format("YYYY-MM-DD")
                );
              }}
              onReset={() => {
                const start = dayjs().startOf("month");
                const end = dayjs();
                setFilterRange([start, end]);
                fetchData(start.format("YYYY-MM-DD"), end.format("YYYY-MM-DD"));
              }}
            />
          </div>
        </div>

        {/* Chart */}
        <div className="flex justify-center items-center min-h-[300px]">
          {loading ? (
            <div className="flex gap-2 items-center">
              <div className="w-4 h-4 rounded-full bg-[#fa8c16] animate-bounce" />
              <div className="w-4 h-4 rounded-full bg-[#ffc069] animate-bounce [animation-delay:-.2s]" />
              <div className="w-4 h-4 rounded-full bg-[#C3EBFA] animate-bounce [animation-delay:-.4s]" />
            </div>
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
                      y={y + 10} // adjust vertical position
                      fill="#6b7280"
                      fontSize={12}
                      textAnchor="end"
                      transform={`rotate(-45, ${x}, ${y + 10})`} // rotate around the tick position
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
                    if (!item || !item.details) return ["0", null]; // <-- second argument null

                    const detailsText = item.details
                      .map(
                        (d: { date: string; customers: number }) =>
                          `${d.date} - ${d.customers} customer${
                            d.customers !== 1 ? "s" : ""
                          }`
                      )
                      .join("\n");

                    return [detailsText, null]; // <-- second argument null removes "Customers:"
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

        {/* Descriptive Analytics */}
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1"></h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed text-justify">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TotalCustomersChart;
