import { notification } from "antd";
import axios from "axios";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Reservation {
  reservation_id: number;
  status: string;
  table_id: string;
}

const Reservation = () => {
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [reservationDate, setReservationDate] = useState<string>("");
  const [reservationTime, setReservationTime] = useState<string>("");
  const [numOfPeople, setNumOfPeople] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");

  const [reservedTables, setReservedTables] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const apiUrl = import.meta.env.VITE_API_URL;
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("email");
    const storedFname = sessionStorage.getItem("fname");
    const storedLname = sessionStorage.getItem("lname");
    const storedPhone = sessionStorage.getItem("phone");

    if (storedEmail) {
      setEmail(storedEmail);
      setFullName(`${storedFname} ${storedLname}`);
      setPhone(storedPhone || "");
      setIsAuthenticated(true);
    }

    const today = new Date();
    const todayDate = today.toISOString().split("T")[0];
    setReservationDate(todayDate);

    if (isAuthenticated) {
      fetchReservedTables();
    }
  }, [isAuthenticated]);

  const fetchReservedTables = async () => {
    try {
      const response = await axios.get(`${apiUrl}/get_reserved_tables`);
      setReservedTables(response.data);
    } catch (error) {
      console.error("Error fetching reserved tables:", error);
    }
  };

  const handleTableClick = (tableId: string) => {
    if (reservedTables.includes(tableId)) {
      notification.warning({
        message: "Table Reserved",
        description: "This table has already been reserved.",
      });
      return;
    }

    setSelectedTables((prev) =>
      prev.includes(tableId)
        ? prev.filter((id) => id !== tableId)
        : [...prev, tableId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      notification.warning({
        message: "Login Required",
        description: "You need to log in before reserving a table.",
      });
      return;
    }

    if (
      !fullName ||
      !email ||
      !phone ||
      !reservationDate ||
      !reservationTime ||
      !numOfPeople
    ) {
      notification.warning({
        message: "Incomplete Details",
        description: "Please fill in all required fields before submitting.",
      });
      return;
    }

    if (selectedTables.length === 0) {
      notification.warning({
        message: "Select Tables",
        description:
          "Please select at least one table before submitting your reservation.",
      });
      return;
    }

    const reservationData = {
      full_name: fullName,
      email: email,
      pnum: phone,
      reservation_date: reservationDate,
      reservation_time: reservationTime,
      num_of_people: numOfPeople,
      special_request: notes,
      table_ids: selectedTables, // ✅ multiple tables
    };

    // Retrieve the user_id from sessionStorage
    const userId = sessionStorage.getItem("user_id");

    if (!userId) {
      notification.error({
        message: "Error",
        description: "User is not logged in. Please log in and try again.",
      });
      return;
    }

    try {
      // Send the user_id in the URL from sessionStorage
      const reservationResponse = await axios.post(
        `${apiUrl}/add_reservation/${userId}`,
        reservationData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const reserveId = reservationResponse.data.reserveId;
      console.log("Reserve ID received:", reserveId);

      notification.success({
        message: "Reservation Added",
        description: "New reservation has been added successfully!",
      });

      // Insert into most_reserve_tbl for each table
      for (const tableId of selectedTables) {
        await axios.post(
          `${apiUrl}/most_reserve`,
          {
            reservation_id: reserveId,
            table_id: tableId,
          },
          { headers: { "Content-Type": "application/json" } }
        );
      }

      // Insert activity into activity_tbl
      const activityData = {
        user_id: userId,
        activity_date: new Date().toISOString(),
        reservation_id: reserveId,
      };

      await axios
        .post(`${apiUrl}/reservation_activity/${userId}`, activityData)
        .then((response) => {
          console.log("Activity recorded for reservation", response.data);
        })
        .catch((error) => {
          console.error(
            "Error recording activity:",
            error.response?.data || error.message
          );
          notification.error({
            message: "Error",
            description:
              "Failed to record reservation activity. Please try again later.",
          });
        });

      // Update reserved tables and reset selection
      setReservedTables((prev) => [...prev, ...selectedTables]);
      setSelectedTables([]);
    } catch (error) {
      console.error("Error adding reservation:", error);
      notification.error({
        message: "Error",
        description: "Failed to add reservation. Please try again later.",
      });
    }
  };

  const tables = [
    { reservation_id: 1, tableName: "1", capacity: 4, img: "/Table-1.png" },
    { reservation_id: 2, tableName: "2", capacity: 4, img: "/Table-2.png" },
    { reservation_id: 3, tableName: "3", capacity: 4, img: "/Table-3.png" },
    { reservation_id: 4, tableName: "4", capacity: 6, img: "/Table-4.png" },
    { reservation_id: 5, tableName: "5", capacity: 6, img: "/Table-5.png" },
    { reservation_id: 6, tableName: "6", capacity: 8, img: "/Table-6.png" },
    { reservation_id: 7, tableName: "7", capacity: 2, img: "/Table-7.png" },
    { reservation_id: 8, tableName: "8", capacity: 2, img: "/Table-8.png" },
    { reservation_id: 9, tableName: "9", capacity: 2, img: "/Table-9.png" },
  ];

  return (
    <motion.div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div className="text-center mb-8">
        <h1 className="font-core text-3xl font-bold">
          SELECT DATE AND TIME FOR YOUR RESERVATION
        </h1>
      </motion.div>

      <motion.div className="font-core text-center mb-4 text-gray-700">
        Available tables for your reservation. Click on an available table to
        book it.
      </motion.div>

      {/* Legend */}
      <div className="flex justify-start mt-2 mb-4">
        <div className="flex items-center gap-6 ml-2">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-green-500 border border-black"></span>
            <span className="font-core text-sm text-green-500">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-gray-400 border border-black"></span>
            <span className="font-core text-sm text-gray-700">Reserved</span>
          </div>
        </div>
      </div>

      {/* Flex container for tables and form */}
      <div className="flex flex-wrap md:flex-nowrap gap-12 mt-2">
        {/* Tables Section */}
        <motion.div className="flex flex-wrap gap-4 flex-1 h-[500px] overflow-y-auto">
          {tables.map((table) => {
            const isReserved = reservedTables.includes(table.tableName);
            const isSelected = selectedTables.includes(table.tableName);

            return (
              <motion.div
                key={table.reservation_id}
                className={`relative flex-1 min-w-[30%] max-w-[45%] border flex justify-center items-center rounded-lg overflow-hidden cursor-pointer transition
          ${
            isReserved
              ? "border-4 border-gray-400 bg-white cursor-not-allowed"
              : isSelected
              ? "border-4 border-green-500 bg-white"
              : "border border-gray-200 bg-white"
          }`}
                onClick={() => handleTableClick(table.tableName)}
              >
                {/* Image fills entire card */}
                <img
                  src={table.img}
                  alt={`Table ${table.tableName}`}
                  className={`absolute inset-0 w-full h-full object-cover ${
                    isReserved
                      ? "opacity-80" // reserved table slightly dim but orange shows
                      : isSelected
                      ? "opacity-80"
                      : "opacity-100"
                  }`}
                />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Reservation Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-4 w-full md:w-[40%]"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <input
            type="text"
            placeholder="Fullname*"
            className="font-core w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email Address*"
            className="font-core w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Phone number*"
            className="font-core w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          {/* Flex for Date & Time */}
          <div className="flex gap-4">
            <input
              type="date"
              className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={reservationDate}
              onChange={(e) => setReservationDate(e.target.value)}
              required
            />
            <input
              type="time"
              placeholder="Set Time*"
              className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={reservationTime}
              onChange={(e) => setReservationTime(e.target.value)}
              required
            />
          </div>
          <input
            type="number"
            placeholder="Number of person*"
            className="font-core w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            onChange={(e) => setNumOfPeople(Number(e.target.value))}
            required
          />
          <textarea
            placeholder="Notes* (Optional)"
            className="font-core w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            rows={3}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
          <motion.button
            type="submit"
            className="font-core w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition"
            whileHover={{ scale: 1.05 }}
          >
            Reserve Table
          </motion.button>
        </motion.form>
      </div>
    </motion.div>
  );
};

export default Reservation;
