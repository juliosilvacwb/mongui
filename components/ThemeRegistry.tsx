"use client";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ReactNode, useState, useMemo, createContext, useContext, useEffect } from "react";

const getTheme = (mode: "light" | "dark") =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === "dark" ? "#00ED64" : "#00684A",
      },
      secondary: {
        main: mode === "dark" ? "#E3FCF7" : "#001E2B",
      },
      background: {
        default: mode === "dark" ? "#1C1C1C" : "#F5F5F5",
        paper: mode === "dark" ? "#2C2C2C" : "#FFFFFF",
      },
    },
    typography: {
      fontFamily: "Roboto, sans-serif",
      h6: {
        fontWeight: 600,
      },
    },
    components: {
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === "dark" ? "#252525" : "#FAFAFA",
          },
        },
      },
    },
  });

interface ThemeContextType {
  toggleTheme: () => void;
  mode: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType>({
  toggleTheme: () => {},
  mode: "dark",
});

export const useThemeMode = () => useContext(ThemeContext);

export default function ThemeRegistry({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Carregar tema salvo do localStorage
    const savedMode = localStorage.getItem("mongui-theme") as "light" | "dark" | null;
    if (savedMode) {
      setMode(savedMode);
    }
    setMounted(true);
  }, []);

  const theme = useMemo(() => getTheme(mode), [mode]);

  const toggleTheme = () => {
    setMode((prev) => {
      const newMode = prev === "dark" ? "light" : "dark";
      localStorage.setItem("mongui-theme", newMode);
      return newMode;
    });
  };

  // Prevenir flash de tema errado
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ toggleTheme, mode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
