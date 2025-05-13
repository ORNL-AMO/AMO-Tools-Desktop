import { Box } from "@mui/material";
import DiagramResults from "../Drawer/DiagramResults";

// todo TESTING
const ResultsPanel = () => {
  return (
    <Box
     sx={{
        position: "absolute",
        left: 555,
        bottom: 60,
        minWidth: '1000px',
        width: '70%',
        zIndex: 999,
      }}>
    <DiagramResults />
    </Box>
  );
};

export default ResultsPanel;
export type ResultsPanelLocation = 'diagram';