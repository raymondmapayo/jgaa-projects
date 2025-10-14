import axios from "axios";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const WorkerAnalyticsInsights = () => {
  // Data for reports
  const totalSalesData = [
    { name: "January", sales: 12000 },
    { name: "February", sales: 15000 },
    { name: "March", sales: 18000 },
    { name: "April", sales: 16000 },
    { name: "May", sales: 20000 },
    { name: "June", sales: 22000 },
  ];

  const topSellingProducts = [
    { name: "Cheeseburger", sales: 150 },
    { name: "Margherita Pizza", sales: 120 },
    { name: "Caesar Salad", sales: 100 },
    { name: "Spaghetti Carbonara", sales: 80 },
    { name: "Grilled Chicken", sales: 130 },
  ];
  const apiUrl = import.meta.env.VITE_API_URL;
  const COLORS = ["#8884d8", "#83a6ed", "#8dd1e1", "#82ca9d", "#ffc658"];
  const [reservedTablesData, setReservedTablesData] = useState<any[]>([]);
  const [totalCustomersData, setTotalCustomersData] = useState([]);
  useEffect(() => {
    const fetchReservedTables = async () => {
      try {
        const response = await axios.get(`${apiUrl}/get_reserved`);
        console.log("Response data:", response.data); // Log the response to check structure

        if (response.data.message) {
          console.log(response.data.message); // Log if no data is found
          setReservedTablesData([]); // Ensure no data is passed to the chart
          return;
        }

        // Map the response to match the structure needed for the chart
        const formattedData = response.data.reservedTables.map(
          (table: any) => ({
            name: `Table ${table.table_id}`, // Name format for the chart
            reservations: table.most_reservation, // The number of reservations
          })
        );

        console.log("Formatted data for the chart:", formattedData); // Log the formatted data for the chart
        setReservedTablesData(formattedData); // Set the formatted data to the state
      } catch (error) {
        console.error("Error fetching reserved tables:", error);
      }
    };

    fetchReservedTables();
  }, []);

  useEffect(() => {
    const fetchTotalCustomers = async () => {
      try {
        const response = await axios.get(`${apiUrl}/total_users_bytime`);
        console.log("Fetched total customers data:", response.data);
        setTotalCustomersData(response.data);
      } catch (error) {
        console.error("Failed to fetch total customers data", error);
      }
    };

    fetchTotalCustomers();
  }, []);

  return (
    <div className="min-h-screen p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
        {/* Total Sales Chart */}
        <div className="bg-white p-6 dark:text-white rounded-lg shadow-md dark:bg-[#001f3f]">
          <h2 className="text-lg font-bold mb-4">Total Sales</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={totalSalesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#666" />
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip
                contentStyle={{ backgroundColor: "#333", color: "#fff" }}
                labelStyle={{ color: "#fff" }}
              />
              <Legend />
              <Bar dataKey="sales" fill="#8884d8" name="Sales" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Total Customers Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md dark:bg-[#001f3f]">
          <h2 className="text-lg font-bold mb-4">Total Customers</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={totalCustomersData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#666" />
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip
                contentStyle={{ backgroundColor: "#333", color: "#fff" }}
                labelStyle={{ color: "#fff" }}
              />
              <Legend />
              <Bar dataKey="customers" fill="#82ca9d" name="Customers" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Most Reserved Tables */}
        <div className="bg-white p-6 rounded-lg shadow-md dark:bg-[#001f3f]">
          <h2 className="text-lg font-bold mb-4">Most Reserved Tables</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reservedTablesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#666" />
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip
                contentStyle={{ backgroundColor: "#333", color: "#fff" }}
                labelStyle={{ color: "#fff" }}
              />
              <Legend />
              <Bar dataKey="reservations" fill="#ffc658" name="Reservations" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white p-6 rounded-lg shadow-md dark:bg-[#001f3f]">
          <h2 className="text-lg font-bold mb-4">Top Selling Products</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topSellingProducts}
                dataKey="sales"
                nameKey="name"
                outerRadius={100}
                label
              >
                {topSellingProducts.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#333", color: "#fff" }}
                labelStyle={{ color: "#fff" }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default WorkerAnalyticsInsights;
