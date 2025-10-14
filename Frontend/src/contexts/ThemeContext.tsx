import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [bgColor, setBgColor] = useState<string>("");

  useEffect(() => {
    const root = document.documentElement;

    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsLoading(true);
    setBgColor(isDarkMode ? "bg-white" : "bg-black");

    // Switch theme after 5 seconds (halfway)
    setTimeout(() => {
      setIsDarkMode((prev) => !prev);
    }, 1000);

    // Hide loader after 10 seconds
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {isLoading && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-75 ${bgColor}`}
        >
          <div className="w-[90%] h-[90%]">
            <DotLottieReact
              src="https://lottie.host/67f7c982-4316-4513-ac93-c4ba36945141/Zr3MC13ZT8.lottie"
              loop
              autoplay
            />
          </div>
        </div>
      )}
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
