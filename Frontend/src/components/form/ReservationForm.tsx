// src/components/form/ReservationForm.tsx
import { motion } from "framer-motion";

interface ReservationFormProps {
  fullName: string;
  setFullName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  reservationDate: string;
  setReservationDate: (value: string) => void;
  reservationTime: string;
  setReservationTime: (value: string) => void;
  numOfPeople: number;
  setNumOfPeople: (value: number) => void;
  notes: string;
  setNotes: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const ReservationForm: React.FC<ReservationFormProps> = ({
  fullName,
  setFullName,
  email,
  setEmail,
  phone,
  setPhone,
  reservationDate,
  setReservationDate,
  reservationTime,
  setReservationTime,
  numOfPeople,
  setNumOfPeople,
  notes,
  setNotes,
  handleSubmit,
}) => {
  return (
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
        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
      />

      <input
        type="email"
        placeholder="Email Address*"
        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="text"
        placeholder="Phone number*"
        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
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
        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
        value={numOfPeople}
        onChange={(e) => setNumOfPeople(Number(e.target.value))}
        required
      />

      <textarea
        placeholder="Notes* (Optional)"
        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      ></textarea>

      <motion.button
        type="submit"
        className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition"
        whileHover={{ scale: 1.05 }}
      >
        Reserve Table
      </motion.button>
    </motion.form>
  );
};

export default ReservationForm;
