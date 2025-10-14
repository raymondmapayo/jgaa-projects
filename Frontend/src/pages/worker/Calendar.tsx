import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

// Function to check if the date is a weekend
const isWeekend = (date: Date) => {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday (0) or Saturday (6)
};

// Function to get the name of the weekday (Saturday/Sunday)
const getWeekdayName = (date: Date) => {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return daysOfWeek[date.getDay()];
};

// Filter weekends for the selected month
const filterWeekendsByMonth = (month: number, currentYear: number) => {
  const filteredWeekends: { date: Date; name: string }[] = [];

  for (let day = 1; day <= 31; day++) {
    const date = new Date(currentYear, month, day);
    if (date.getMonth() === month && isWeekend(date)) {
      filteredWeekends.push({
        date: date,
        name: `${date.toLocaleDateString("en-US")} - ${getWeekdayName(date)}`,
      });
    }
  }

  return filteredWeekends;
};

const CalendarComponent = () => {
  const [noWeekendMessage, setNoWeekendMessage] = useState<string>(""); // State for no weekend message

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // Get the current month

  // Display weekends for the current month on load
  useEffect(() => {
    const filteredWeekends = filterWeekendsByMonth(currentMonth, currentYear);

    // If there are no weekends for the current month, display a message
    if (filteredWeekends.length === 0) {
      setNoWeekendMessage(
        `No weekends for ${new Date().toLocaleString("default", {
          month: "long",
        })}`
      );
    } else {
      setNoWeekendMessage(""); // Clear the message if weekends exist
    }
  }, [currentYear, currentMonth]);

  return (
    <div>
      <Calendar
        value={new Date()} // Set initial date or value here
        tileClassName={({ date }) => (isWeekend(date) ? "weekend" : "")} // Adding CSS classes for weekends
      />
      <div>
        {/* Display message if no weekends for the selected month */}
        {noWeekendMessage && <p>{noWeekendMessage}</p>}
      </div>
    </div>
  );
};

export default CalendarComponent;
