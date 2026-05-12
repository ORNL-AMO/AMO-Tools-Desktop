import { useState } from "react";
import { Box, IconButton, Paper, Typography } from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DebugResults from "../Drawer/DebugResults";

const ResultsPanel = (props: { style?: React.CSSProperties }) => {
  const [open, setOpen] = useState(false);
  const { left, transition } = (props.style || {}) as { left?: string | number; transition?: string };

  return (
    <Box
      sx={{
        position: "absolute",
        bottom: 60,
        right: 16,
        zIndex: 999,
        left,
        transition,
      }}
    >
      <Paper elevation={4} sx={{ borderRadius: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 0.75,
            backgroundColor: "#3055cf",
            borderRadius: "8px 8px 0 0",
            cursor: "pointer",
            userSelect: "none",
          }}
          onClick={() => setOpen((prev) => !prev)}
        >
          <Typography variant="subtitle2" sx={{ color: "white", fontWeight: 600 }}>
            True Cost of Systems
          </Typography>
          <IconButton size="small" sx={{ color: "white", p: 0 }}>
            {open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Box>
        {open && <DebugResults />}
      </Paper>
    </Box>
  );
};

export default ResultsPanel;
export type ResultsPanelLocation = "diagram";
