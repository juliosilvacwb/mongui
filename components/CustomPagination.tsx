"use client";

import { Box, IconButton, Select, MenuItem, Typography } from "@mui/material";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useTranslation } from "@/lib/i18n/TranslationContext";

interface CustomPaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

export default function CustomPagination({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [25, 50, 100, 1000, 10000, 100000],
}: CustomPaginationProps) {
  const { t } = useTranslation();
  
  const totalPages = Math.ceil(totalCount / pageSize);
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage >= totalPages - 1;

  const handleFirst = () => onPageChange(0);
  const handlePrevious = () => onPageChange(Math.max(0, currentPage - 1));
  const handleNext = () => onPageChange(Math.min(totalPages - 1, currentPage + 1));
  const handleLast = () => onPageChange(totalPages - 1);

  const formatPageSize = (size: number) => {
    if (size >= 1000) {
      return `${size / 1000}K`;
    }
    return size.toString();
  };

  if (totalCount === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        p: 2,
        borderTop: 1,
        borderColor: "divider",
        bgcolor: (theme) => theme.palette.mode === "dark" ? "#1e1e1e" : "#fafafa",
      }}
    >
      {/* Page Size Selector */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {t.documentGrid.pageSize || "Tamanho da Página"}:
        </Typography>
        <Select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          size="small"
          sx={{
            minWidth: 80,
            "& .MuiSelect-select": {
              py: 0.5,
            },
          }}
        >
          {pageSizeOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {formatPageSize(option)}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Page Navigation */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton
          onClick={handleFirst}
          disabled={isFirstPage}
          size="small"
          title={t.documentGrid.firstPage || "Primeira"}
        >
          <FirstPageIcon fontSize="small" />
        </IconButton>

        <IconButton
          onClick={handlePrevious}
          disabled={isFirstPage}
          size="small"
          title={t.documentGrid.previousPage || "Anterior"}
        >
          <NavigateBeforeIcon fontSize="small" />
        </IconButton>

        <Typography variant="body2" sx={{ mx: 2, minWidth: 100, textAlign: "center" }}>
          {t.documentGrid.page || "Página"} {currentPage + 1} {t.documentGrid.of || "de"} {totalPages}
        </Typography>

        <IconButton
          onClick={handleNext}
          disabled={isLastPage}
          size="small"
          title={t.documentGrid.nextPage || "Próxima"}
        >
          <NavigateNextIcon fontSize="small" />
        </IconButton>

        <IconButton
          onClick={handleLast}
          disabled={isLastPage}
          size="small"
          title={t.documentGrid.lastPage || "Última"}
        >
          <LastPageIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}

