"use client";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import RefreshIcon from "@mui/icons-material/Refresh";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { Box, Chip } from "@mui/material";

interface AppBarTopProps {
  onRefresh?: () => void;
  onToggleTheme?: () => void;
  isDarkMode?: boolean;
  connectionStatus?: "connected" | "disconnected" | "connecting";
}

export default function AppBarTop({
  onRefresh,
  onToggleTheme,
  isDarkMode = true,
  connectionStatus = "connected",
}: AppBarTopProps) {
  const statusColors = {
    connected: "success",
    disconnected: "error",
    connecting: "warning",
  } as const;

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          🍃 Mongo UI
        </Typography>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Chip
            label={connectionStatus}
            color={statusColors[connectionStatus]}
            size="small"
            sx={{ textTransform: "capitalize" }}
          />

          <IconButton color="inherit" onClick={onRefresh}>
            <RefreshIcon />
          </IconButton>

          <IconButton color="inherit" onClick={onToggleTheme}>
            {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
