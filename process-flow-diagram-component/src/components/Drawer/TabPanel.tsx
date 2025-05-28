import { Box, BoxProps, styled } from "@mui/material";
import { ParentContainerDimensions } from "process-flow-lib";
import { CSSProperties } from "react";

interface TabPanelProps {
  children?: React.ReactNode;
  diagramParentDimensions?: ParentContainerDimensions;
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
  '&:Mui-Box-root': {
    height: '100%',
  },
}));

function TabPanel(props: TabPanelProps) {
  const { children, value, diagramParentDimensions, index, ...other } = props;

  let wrapperProps: CSSProperties = { height: '100%', width: '100%', marginTop: '.5rem' };
  if (props.diagramParentDimensions) {
    if (props.diagramParentDimensions.height && props.diagramParentDimensions.headerHeight !== undefined && props.diagramParentDimensions.footerHeight !== undefined) {
      let availableHeight = props.diagramParentDimensions.height - props.diagramParentDimensions.headerHeight - props.diagramParentDimensions.footerHeight;
      availableHeight = availableHeight - (availableHeight * 0.30); 
      wrapperProps.height = `${availableHeight}px`;
    }
    wrapperProps.overflowY = 'auto';
  }

  if (value === index && (value === 0 || value === 2)) {
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