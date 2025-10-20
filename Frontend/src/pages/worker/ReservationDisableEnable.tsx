import { motion } from "framer-motion";
import { Button } from "antd";

const ReservationDisableEnable = () => {
  return (
    <motion.div
      className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[70vh]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.h1
        className="font-core text-3xl font-bold text-center mb-6"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        Sawasdee! 😊
      </motion.h1>

      {/* Message */}
      <motion.p
        className="font-core text-center text-gray-700 mb-8 max-w-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Our online reservation is not available right now, but you can easily
        reserve a table by calling:
      </motion.p>

      {/* Call Button */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Button
          type="primary"
          size="large"
          href=""
          className="bg-orange-500 hover:bg-orange-600 font-core font-bold text-white px-8 py-3 rounded-lg shadow-lg transition"
        >
          Call 0956 517 8708
        </Button>
      </motion.div>

      {/* Footer note */}
      <motion.p
        className="font-core text-center text-gray-500 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        We’ll take care of it for you!
      </motion.p>
    </motion.div>
  );
};

export default ReservationDisableEnable;
