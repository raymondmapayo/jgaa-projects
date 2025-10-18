import { notification } from "antd";
import axios from "axios";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BsCheck2Circle } from "react-icons/bs";

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
    const storedUserId = sessionStorage.getItem("user_id");

    if (storedEmail && storedUserId) {
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

  const handleTableClick = (tableName: string) => {
    const isReserved = reservedTables.includes(tableName);

    if (isReserved) {
      notification.warning({
        message: "Table Reserved",
        description: `Table ${tableName} has already been reserved.`,
        placement: "topRight",
      });
      return;
    }

    const isSelected = selectedTables.includes(tableName);
    let updatedTables;

    if (isSelected) {
      updatedTables = selectedTables.filter((t) => t !== tableName);
      setSelectedTables(updatedTables);

      if (updatedTables.length === 0) {
        notification.info({
          message: "All Tables Deselected",
          description: "You deselected all tables.",
          placement: "topRight",
        });
      } else {
        notification.info({
          message: "Table Deselected",
          description: `You deselected table ${tableName}.`,
          placement: "topRight",
        });
      }
    } else {
      updatedTables = [...selectedTables, tableName];
      setSelectedTables(updatedTables);

      if (updatedTables.length === 1) {
        notification.success({
          message: "Table Selected",
          description: `You selected table ${tableName}.`,
          placement: "topRight",
        });
      } else {
        notification.success({
          message: "Tables Selected",
          description: `You selected tables ${updatedTables.join(", ")}.`,
          placement: "topRight",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const userId = sessionStorage.getItem("user_id");
    if (!isAuthenticated || !userId) {
      return notification.warning({
        message: "Login Required",
        description: "You need to log in before reserving a table.",
      });
    }

    if (
      !fullName ||
      !email ||
      !phone ||
      !reservationDate ||
      !reservationTime ||
      numOfPeople <= 0
    ) {
      return notification.warning({
        message: "Incomplete Details",
        description: "Please fill in all required fields.",
      });
    }

    if (selectedTables.length === 0) {
      return notification.warning({
        message: "Select Tables",
        description: "Please select at least one table.",
      });
    }

    try {
      // 1️⃣ Add reservation
      const reservationResponse = await axios.post(
        `${apiUrl}/add_reservation/${userId}`,
        {
          full_name: fullName,
          email,
          pnum: phone,
          reservation_date: reservationDate,
          reservation_time: reservationTime,
          num_of_people: numOfPeople,
          special_request: notes,
          table_ids: selectedTables,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const reserveId = reservationResponse.data.reserveId;

      notification.success({
        message: "Reservation Added",
        description: "Your reservation has been added successfully.",
      });

      // 2️⃣ Update most_reserve per table
      await Promise.all(
        selectedTables.map((tableId) =>
          axios.post(
            `${apiUrl}/most_reserve`,
            { table_id: tableId, reservation_date: reservationDate },
            { headers: { "Content-Type": "application/json" } }
          )
        )
      );

      // 3️⃣ Add reservation activity
      await axios.post(
        `${apiUrl}/reservation_activity/${userId}`,
        { reservation_id: reserveId, activity_date: reservationDate },
        { headers: { "Content-Type": "application/json" } }
      );

      // 4️⃣ Reset selection & update reserved tables
      setReservedTables((prev) => [...prev, ...selectedTables]);
      setSelectedTables([]);
    } catch (err: any) {
      console.error(
        "Error during reservation:",
        err.response?.data || err.message
      );
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
        <motion.div className="flex flex-wrap gap-4 flex-1 h-[480px] overflow-y-auto justify-center">
          {tables.map((table) => {
            const isReserved = reservedTables.includes(table.tableName);
            const isSelected = selectedTables.includes(table.tableName);

            return (
              <motion.div
                key={table.reservation_id}
                className={`
          relative flex justify-center items-center rounded-lg overflow-hidden cursor-pointer transition-all duration-300
          border flex-auto
          min-w-[45%] sm:min-w-[30%] md:min-w-[25%] lg:min-w-[30%] xl:min-w-[30%]
          max-w-[45%] sm:max-w-[30%] md:max-w-[25%] lg:max-w-[30%] xl:max-w-[30%]
          ${
            isReserved
              ? "border-4 border-gray-400 bg-white cursor-not-allowed"
              : isSelected
              ? "border-4 border-green-500 bg-white"
              : "border-4 border-green-500 bg-white"
          }
        `}
                onClick={() => handleTableClick(table.tableName)}
              >
                {/* ✅ Show the check icon ONLY when selected */}
                {!isReserved && isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0, rotate: -90 }}
                    animate={{ scale: 1.1, opacity: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="absolute top-2 left-2 z-10"
                  >
                    <BsCheck2Circle
                      className="text-green-600 drop-shadow-[0_0_3px_rgba(34,197,94,0.8)]
                text-[20px] sm:text-[22px] md:text-[24px] lg:text-[26px] xl:text-[28px]"
                    />
                  </motion.div>
                )}

                {/* Image fills the card */}
                <img
                  src={table.img}
                  alt={`Table ${table.tableName}`}
                  className={`
            absolute inset-0 object-cover w-full h-full z-0
            transition-transform duration-300
            ${
              isReserved || isSelected
                ? "opacity-80 scale-95"
                : "opacity-100 scale-100"
            }
          `}
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
