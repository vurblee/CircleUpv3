import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { defaultTheme, lightTheme, darkTheme } from "./theme";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(defaultTheme);

  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await AsyncStorage.getItem("appTheme");
      if (storedTheme === "dark") {
        setTheme(darkTheme);
      } else if (storedTheme === "lighter") {
        setTheme(lightTheme);
      } else {
        setTheme(defaultTheme);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme.mode === "original" ? lightTheme : defaultTheme;
    setTheme(newTheme);
    await AsyncStorage.setItem("appTheme", newTheme.mode);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);