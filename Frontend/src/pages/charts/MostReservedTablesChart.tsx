import axios from "axios";
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

import dayjs, { Dayjs } from "dayjs";

// ✅ Define type for chart data
interface ReservedTable {
  name: string;
  reservations: number;
  details?: { date: string; reservations: number }[];
}

// ✅ Define props for incoming dates
interface MostReservedTablesChartProps {
  dates: [Dayjs | null, Dayjs | null];
}

const MostReservedTablesChart: React.FC<MostReservedTablesChartProps> = ({
  dates,
}) => {
  const [data, setData] = useState<ReservedTable[]>([]);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");

  const allTables = Array.from({ length: 9 }, (_, i) => `Table ${i + 1}`);
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [start, end] = dates;

      const res = await axios.get(`${apiUrl}/get_reserved`, {
        params: {
          start: start?.format("YYYY-MM-DD"),
          end: end?.format("YYYY-MM-DD"),
        },
      });

      const formatted: ReservedTable[] = allTables.map((t) => {
        const tableData = res.data.reservedTables.find(
          (r: any) => `Table ${r.table_id}` === t
        );

        let filteredDetails: { date: string; reservations: number }[] = [];

        if (tableData?.details) {
          filteredDetails = tableData.details.filter((d: any) => {
            const date = dayjs(d.date);
            return (
              (!start || date.isSameOrAfter(start, "day")) &&
              (!end || date.isSameOrBefore(end, "day"))
            );
          });
        }

        return {
          name: t,
          reservations: filteredDetails.reduce(
            (sum, d) => sum + d.reservations,
            0
          ),
          details: filteredDetails,
        };
      });

      setData(formatted);

      const hasData = formatted.some((t) => t.reservations > 0);
      if (hasData) {
        const sorted = [...formatted].sort(
          (a, b) => b.reservations - a.reservations
        );
        const top = sorted[0];
        const bottom = sorted[sorted.length - 1];

        const avg =
          formatted.reduce((sum, item) => sum + item.reservations, 0) /
          formatted.length;

        let desc = `📌 ${top.name} was the most reserved with ${
          top.reservations
        } reservation${top.reservations !== 1 ? "s" : ""}, `;
        if (bottom && bottom.name !== top.name) {
          desc += `while ${bottom.name} had the fewest with ${
            bottom.reservations === 0 ? "none" : bottom.reservations
          } reservation${bottom.reservations !== 1 ? "s" : ""}. `;
        }
        desc += `On average, each table was reserved about ${avg.toFixed(
          1
        )} times, showing varying levels of table usage across the restaurant.`;

        setDescription(desc);
      } else {
        setDescription(
          "No table reservation data available for the selected date range."
        );
      }
    } catch (error) {
      console.error(error);
      const zeroTables = Array.from({ length: 9 }, (_, i) => ({
        name: `Table ${i + 1}`,
        reservations: 0,
        details: [],
      }));
      setData(zeroTables);
      setDescription(
        "No table reservation data available for the selected date range."
      );
    }
    setLoading(false);
  };

  // 🔹 Fetch whenever date range changes
  useEffect(() => {
    fetchData();
  }, [dates]);

  return (
    <div className="relative -mx-6 sm:mx-0">
      <div className="bg-white dark:bg-[#001f3f] rounded-lg shadow-lg sm:w-full h-full p-6 flex flex-col transition-colors">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 border-b border-dotted pb-2">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">
            Most Reserved
          </h2>
          <div className="flex-shrink-0 text-sm text-gray-500 dark:text-gray-300">
            {dates[0]?.format("MMM DD, YYYY")} →{" "}
            {dates[1]?.format("MMM DD, YYYY")}
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
                  interval={0}
                  tick={({ x, y, payload }) => {
                    const shortLabel = payload.value.replace("Table", "Tab");
                    return (
                      <text
                        x={x}
                        y={y + 10}
                        fill="#6b7280"
                        fontSize={12}
                        textAnchor="end"
                        transform={`rotate(-45, ${x}, ${y + 10})`}
                      >
                        {shortLabel}
                      </text>
                    );
                  }}
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
                    const table = data.find(
                      (d: ReservedTable) => d.name === props.payload.name
                    );
                    if (!table || !table.details || table.details.length === 0)
                      return ["0", null];

                    const detailsText = table.details
                      .map(
                        (d: { date: string; reservations: number }) =>
                          `${dayjs(d.date).format("MM/DD/YYYY")} - ${
                            d.reservations
                          } reservation${d.reservations !== 1 ? "s" : ""}`
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
                  dataKey="reservations"
                  name="Reservations"
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

export default MostReservedTablesChart;
