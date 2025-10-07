"use client";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ReactNode, useState, useMemo } from "react";

const getTheme = (mode: "light" | "dark") =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === "dark" ? "#00ED64" : "#00684A",
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
  });

export default function ThemeRegistry({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<"light" | "dark">("dark");
  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
