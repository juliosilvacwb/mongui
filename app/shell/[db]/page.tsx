import { use } from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import AppBarTop from "@/components/AppBarTop";
import SideDrawer from "@/components/SideDrawer";
import ShellConsole from "@/components/ShellConsole";

export default function ShellDBPage({
  params,
}: {
  params: Promise<{ db: string }>;
}) {
  const { db } = use(params);

  return (
    <Box sx={{ display: "flex" }}>
      <AppBarTop />
      <SideDrawer />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <ShellConsole dbName={db} />
      </Box>
    </Box>
  );
}
