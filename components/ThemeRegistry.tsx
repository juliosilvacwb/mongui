"use client";

import { ThemeProvider, createTheme, alpha } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ReactNode, useState, useMemo, createContext, useContext, useEffect } from "react";

const getTheme = (mode: "light" | "dark") =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === "dark" ? "#00ED64" : "#00684A",
        light: mode === "dark" ? "#4DFFA1" : "#00A86B",
        dark: mode === "dark" ? "#00B84F" : "#004D35",
        contrastText: mode === "dark" ? "#000000" : "#FFFFFF",
      },
      secondary: {
        main: mode === "dark" ? "#E3FCF7" : "#001E2B",
        light: mode === "dark" ? "#FFFFFF" : "#003D5B",
        dark: mode === "dark" ? "#B0E9E0" : "#000000",
        contrastText: mode === "dark" ? "#000000" : "#FFFFFF",
      },
      error: {
        main: mode === "dark" ? "#F44336" : "#D32F2F",
        light: mode === "dark" ? "#E57373" : "#EF5350",
        dark: mode === "dark" ? "#D32F2F" : "#C62828",
      },
      warning: {
        main: mode === "dark" ? "#FF9800" : "#F57C00",
        light: mode === "dark" ? "#FFB74D" : "#FF9800",
        dark: mode === "dark" ? "#F57C00" : "#E65100",
      },
      info: {
        main: mode === "dark" ? "#2196F3" : "#1976D2",
        light: mode === "dark" ? "#64B5F6" : "#42A5F5",
        dark: mode === "dark" ? "#1976D2" : "#1565C0",
      },
      success: {
        main: mode === "dark" ? "#4CAF50" : "#388E3C",
        light: mode === "dark" ? "#81C784" : "#66BB6A",
        dark: mode === "dark" ? "#388E3C" : "#2E7D32",
      },
      background: {
        default: mode === "dark" ? "#1C1C1C" : "#F5F5F5",
        paper: mode === "dark" ? "#2C2C2C" : "#FFFFFF",
      },
      text: {
        primary: mode === "dark" ? "#FFFFFF" : "#000000",
        secondary: mode === "dark" ? "#B0B0B0" : "#666666",
        disabled: mode === "dark" ? "#6A6A6A" : "#9E9E9E",
      },
      divider: mode === "dark" ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)",
      action: {
        active: mode === "dark" ? "#FFFFFF" : "#000000",
        hover: mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)",
        selected: mode === "dark" ? "rgba(255, 255, 255, 0.16)" : "rgba(0, 0, 0, 0.08)",
        disabled: mode === "dark" ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.26)",
        disabledBackground: mode === "dark" ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)",
      },
    },
    typography: {
      fontFamily: "'Roboto', 'Segoe UI', 'Arial', sans-serif",
      h1: {
        fontWeight: 700,
        fontSize: "2.5rem",
      },
      h2: {
        fontWeight: 700,
        fontSize: "2rem",
      },
      h3: {
        fontWeight: 600,
        fontSize: "1.75rem",
      },
      h4: {
        fontWeight: 600,
        fontSize: "1.5rem",
      },
      h5: {
        fontWeight: 600,
        fontSize: "1.25rem",
      },
      h6: {
        fontWeight: 600,
        fontSize: "1rem",
      },
      body1: {
        fontSize: "1rem",
        lineHeight: 1.5,
      },
      body2: {
        fontSize: "0.875rem",
        lineHeight: 1.43,
      },
      button: {
        textTransform: "none",
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 8,
    },
    shadows: mode === "dark" ? [
      "none",
      "0px 2px 4px rgba(0, 0, 0, 0.5)",
      "0px 4px 8px rgba(0, 0, 0, 0.5)",
      "0px 8px 16px rgba(0, 0, 0, 0.5)",
      "0px 12px 24px rgba(0, 0, 0, 0.5)",
      "0px 16px 32px rgba(0, 0, 0, 0.5)",
      "0px 20px 40px rgba(0, 0, 0, 0.5)",
      "0px 24px 48px rgba(0, 0, 0, 0.5)",
      "0px 28px 56px rgba(0, 0, 0, 0.5)",
      "0px 32px 64px rgba(0, 0, 0, 0.5)",
      "0px 36px 72px rgba(0, 0, 0, 0.5)",
      "0px 40px 80px rgba(0, 0, 0, 0.5)",
      "0px 44px 88px rgba(0, 0, 0, 0.5)",
      "0px 48px 96px rgba(0, 0, 0, 0.5)",
      "0px 52px 104px rgba(0, 0, 0, 0.5)",
      "0px 56px 112px rgba(0, 0, 0, 0.5)",
      "0px 60px 120px rgba(0, 0, 0, 0.5)",
      "0px 64px 128px rgba(0, 0, 0, 0.5)",
      "0px 68px 136px rgba(0, 0, 0, 0.5)",
      "0px 72px 144px rgba(0, 0, 0, 0.5)",
      "0px 76px 152px rgba(0, 0, 0, 0.5)",
      "0px 80px 160px rgba(0, 0, 0, 0.5)",
      "0px 84px 168px rgba(0, 0, 0, 0.5)",
      "0px 88px 176px rgba(0, 0, 0, 0.5)",
      "0px 92px 184px rgba(0, 0, 0, 0.5)",
    ] : [
      "none",
      "0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)",
      "0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)",
      "0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)",
      "0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)",
      "0px 3px 5px -1px rgba(0,0,0,0.2),0px 5px 8px 0px rgba(0,0,0,0.14),0px 1px 14px 0px rgba(0,0,0,0.12)",
      "0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)",
      "0px 4px 5px -2px rgba(0,0,0,0.2),0px 7px 10px 1px rgba(0,0,0,0.14),0px 2px 16px 1px rgba(0,0,0,0.12)",
      "0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)",
      "0px 5px 6px -3px rgba(0,0,0,0.2),0px 9px 12px 1px rgba(0,0,0,0.14),0px 3px 16px 2px rgba(0,0,0,0.12)",
      "0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)",
      "0px 6px 7px -4px rgba(0,0,0,0.2),0px 11px 15px 1px rgba(0,0,0,0.14),0px 4px 20px 3px rgba(0,0,0,0.12)",
      "0px 7px 8px -4px rgba(0,0,0,0.2),0px 12px 17px 2px rgba(0,0,0,0.14),0px 5px 22px 4px rgba(0,0,0,0.12)",
      "0px 7px 8px -4px rgba(0,0,0,0.2),0px 13px 19px 2px rgba(0,0,0,0.14),0px 5px 24px 4px rgba(0,0,0,0.12)",
      "0px 7px 9px -4px rgba(0,0,0,0.2),0px 14px 21px 2px rgba(0,0,0,0.14),0px 5px 26px 4px rgba(0,0,0,0.12)",
      "0px 8px 9px -5px rgba(0,0,0,0.2),0px 15px 22px 2px rgba(0,0,0,0.14),0px 6px 28px 5px rgba(0,0,0,0.12)",
      "0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)",
      "0px 8px 11px -5px rgba(0,0,0,0.2),0px 17px 26px 2px rgba(0,0,0,0.14),0px 6px 32px 5px rgba(0,0,0,0.12)",
      "0px 9px 11px -5px rgba(0,0,0,0.2),0px 18px 28px 2px rgba(0,0,0,0.14),0px 7px 34px 6px rgba(0,0,0,0.12)",
      "0px 9px 12px -6px rgba(0,0,0,0.2),0px 19px 29px 2px rgba(0,0,0,0.14),0px 7px 36px 6px rgba(0,0,0,0.12)",
      "0px 10px 13px -6px rgba(0,0,0,0.2),0px 20px 31px 3px rgba(0,0,0,0.14),0px 8px 38px 7px rgba(0,0,0,0.12)",
      "0px 10px 13px -6px rgba(0,0,0,0.2),0px 21px 33px 3px rgba(0,0,0,0.14),0px 8px 40px 7px rgba(0,0,0,0.12)",
      "0px 10px 14px -6px rgba(0,0,0,0.2),0px 22px 35px 3px rgba(0,0,0,0.14),0px 8px 42px 7px rgba(0,0,0,0.12)",
      "0px 11px 14px -7px rgba(0,0,0,0.2),0px 23px 36px 3px rgba(0,0,0,0.14),0px 9px 44px 8px rgba(0,0,0,0.12)",
      "0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)",
    ],
    transitions: {
      duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        standard: 300,
        complex: 375,
        enteringScreen: 225,
        leavingScreen: 195,
      },
      easing: {
        easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
        easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
        easeIn: "cubic-bezier(0.4, 0, 1, 1)",
        sharp: "cubic-bezier(0.4, 0, 0.6, 1)",
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: mode === "dark" ? "#464646 #1E1E1E" : "#B0B0B0 #E0E0E0",
            "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
              width: 10,
              height: 10,
            },
            "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
              borderRadius: 5,
              backgroundColor: mode === "dark" ? "#464646" : "#B0B0B0",
              minHeight: 24,
              transition: "background-color 0.2s ease",
            },
            "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
              backgroundColor: mode === "dark" ? "#00ED64" : "#00684A",
            },
            "&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track": {
              borderRadius: 5,
              backgroundColor: mode === "dark" ? "#1E1E1E" : "#E0E0E0",
            },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === "dark" ? "#252525" : "#FAFAFA",
            borderRight: `1px solid ${mode === "dark" ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)"}`,
            transition: "background-color 0.3s ease, border-color 0.3s ease",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === "dark" ? "#2C2C2C" : "#FFFFFF",
            color: mode === "dark" ? "#FFFFFF" : "#000000",
            boxShadow: mode === "dark" 
              ? "0px 2px 4px rgba(0, 0, 0, 0.5)" 
              : "0px 2px 4px rgba(0, 0, 0, 0.1)",
            transition: "background-color 0.3s ease, box-shadow 0.3s ease",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            transition: "background-color 0.3s ease, box-shadow 0.3s ease",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: "none",
            fontWeight: 500,
            transition: "all 0.2s ease",
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: mode === "dark" 
                ? "0px 4px 8px rgba(0, 0, 0, 0.5)" 
                : "0px 4px 8px rgba(0, 0, 0, 0.15)",
            },
          },
          contained: {
            boxShadow: "none",
            "&:hover": {
              boxShadow: mode === "dark" 
                ? "0px 4px 8px rgba(0, 0, 0, 0.5)" 
                : "0px 4px 8px rgba(0, 0, 0, 0.15)",
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: mode === "dark" 
                ? "rgba(255, 255, 255, 0.08)" 
                : "rgba(0, 0, 0, 0.04)",
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            transition: "all 0.2s ease",
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: mode === "dark" ? "#464646" : "#616161",
            fontSize: "0.75rem",
            padding: "8px 12px",
            borderRadius: 6,
          },
          arrow: {
            color: mode === "dark" ? "#464646" : "#616161",
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            transition: "background-color 0.2s ease",
            "&.Mui-selected": {
              backgroundColor: mode === "dark" 
                ? alpha("#00ED64", 0.16) 
                : alpha("#00684A", 0.12),
              "&:hover": {
                backgroundColor: mode === "dark" 
                  ? alpha("#00ED64", 0.24) 
                  : alpha("#00684A", 0.18),
              },
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              transition: "border-color 0.2s ease",
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 12,
          },
        },
      },
      MuiSnackbar: {
        styleOverrides: {
          root: {
            "& .MuiPaper-root": {
              borderRadius: 8,
            },
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
    // Adicionar classe para desabilitar transições durante troca
    document.body.classList.add("disable-transitions");
    
    setMode((prev) => {
      const newMode = prev === "dark" ? "light" : "dark";
      localStorage.setItem("mongui-theme", newMode);
      return newMode;
    });

    // Re-habilitar transições após um frame
    setTimeout(() => {
      document.body.classList.remove("disable-transitions");
    }, 50);
  };

  // Prevenir flash de tema errado (FOUC - Flash of Unstyled Content)
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ toggleTheme, mode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="fade-in">
          {children}
        </div>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
