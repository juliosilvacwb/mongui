"use client";

import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import AppBarTop from "@/components/AppBarTop";
import SideDrawer from "@/components/SideDrawer";
import ShellConsole from "@/components/ShellConsole";
import { useThemeMode } from "@/components/ThemeRegistry";

export default function ShellPage() {
  const { toggleTheme, mode } = useThemeMode();

  return (
    <Box sx={{ display: "flex" }}>
      <AppBarTop
        onToggleTheme={toggleTheme}
        isDarkMode={mode === "dark"}
        connectionStatus="connected"
      />
      <SideDrawer />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <ShellConsole />
      </Box>
    </Box>
  );
}

