"use client";

import { use } from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import AppBarTop from "@/components/AppBarTop";
import SideDrawer from "@/components/SideDrawer";
import DocumentGrid from "@/components/DocumentGrid";

export default function CollectionPage({
  params,
}: {
  params: Promise<{ db: string; collection: string }>;
}) {
  const { db, collection } = use(params);

  return (
    <Box sx={{ display: "flex" }}>
      <AppBarTop />
      <SideDrawer />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <DocumentGrid dbName={db} collectionName={collection} />
      </Box>
    </Box>
  );
}
