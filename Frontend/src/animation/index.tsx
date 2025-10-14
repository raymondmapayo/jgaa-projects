// TransitionWrapper.tsx
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import React, { ReactNode } from "react";

interface TransitionWrapperProps {
  children: ReactNode;
}

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 },
};


const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.8,
};

const TransitionWrapper: React.FC<TransitionWrapperProps> = ({ children }) => {
  const location = useLocation();
  return (
    <motion.div
      key={location.pathname}
      initial="initial"
      animate="in"
      exit="out"
      className="font-montserrat"
      style={{
        transform:'none !important'
      }}
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
};

export default TransitionWrapper;
