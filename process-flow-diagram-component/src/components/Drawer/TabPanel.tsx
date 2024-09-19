import { Box, BoxProps, styled } from "@mui/material";
import { CSSProperties } from "react";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export const TabPanelBox = styled((props: BoxProps) => (
  <Box {...props} />
))(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  // height: '100%',
  width: '100%',
}));

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  let wrapperProps: CSSProperties = { height: '100%', width: '100%' };

  if (value === index && value === 0) {
    wrapperProps.display = 'flex'
    wrapperProps.justifyContent = 'space-between';
  }

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`diagram-tabpanel-${index}`}
      aria-labelledby={`diagram-tab-${index}`}
      style={wrapperProps}
      {...other}
    >
      {value === index && <TabPanelBox>{children}</TabPanelBox>}
    </div>
  );
}

export default TabPanel;