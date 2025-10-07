"use client";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import TerminalIcon from "@mui/icons-material/Terminal";
import HomeIcon from "@mui/icons-material/Home";
import { Box, Chip, Tooltip } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AppBarTopProps {
  onToggleTheme?: () => void;
  isDarkMode?: boolean;
  connectionStatus?: "connected" | "disconnected" | "connecting";
}

export default function AppBarTop({
  onToggleTheme,
  isDarkMode = true,
  connectionStatus = "connected",
}: AppBarTopProps) {
  const pathname = usePathname();
  const isShellPage = pathname === "/shell";
  const isHomePage = pathname === "/";

  const statusColors = {
    connected: "success",
    disconnected: "error",
    connecting: "warning",
  } as const;

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              cursor: "pointer",
              "&:hover": {
                opacity: 0.8
              }
            }}
          >
            🍃 Mongo UI
          </Typography>
        </Link>
        
        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Chip
            label={connectionStatus}
            color={statusColors[connectionStatus]}
            size="small"
            sx={{ textTransform: "capitalize" }}
          />

          {!isHomePage && (
            <Tooltip title="Home">
              <Link href="/" passHref style={{ textDecoration: "none", color: "inherit" }}>
                <IconButton color="inherit">
                  <HomeIcon />
                </IconButton>
              </Link>
            </Tooltip>
          )}

          <Tooltip title={isShellPage ? "Já está no Shell" : "Abrir MongoDB Shell"}>
            <span>
              <Link 
                href="/shell" 
                passHref 
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <IconButton color="inherit" disabled={isShellPage}>
                  <TerminalIcon />
                </IconButton>
              </Link>
            </span>
          </Tooltip>

          <Tooltip title={isDarkMode ? "Tema Claro" : "Tema Escuro"}>
            <IconButton color="inherit" onClick={onToggleTheme}>
              {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
