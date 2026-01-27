import { Box } from "@mui/material";
import DebugResults from "../Drawer/DebugResults";

// todo TESTING
const ResultsPanel = (props: { style?: React.CSSProperties }) => {
  return (
    <Box
     sx={{
        position: "absolute",
        left: 555,
        bottom: 60,
        minWidth: '1000px',
        width: '70%',
        zIndex: 999,
        ...props.style
      }}>
    <DebugResults />
    </Box>
  );
};

export default ResultsPanel;
export type ResultsPanelLocation = 'diagram';