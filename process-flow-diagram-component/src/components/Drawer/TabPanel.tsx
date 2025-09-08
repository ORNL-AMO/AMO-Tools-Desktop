import { ParentContainerDimensions } from "process-flow-lib";
import { CSSProperties } from "react";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  let wrapperCSSProps: CSSProperties = { 
    width: '100%', 
    padding: '.5rem',
    paddingTop: '1rem',
    flex: 1,    
    overflowY: 'auto',   
    minHeight: 0,
    flexDirection: 'column',
  };

  if (value === index && (value === 0 || value === 2)) {
    wrapperCSSProps.display = 'flex'
    wrapperCSSProps.justifyContent = 'space-between';
  }

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`diagram-tabpanel-${index}`}
      aria-labelledby={`diagram-tab-${index}`}
      style={wrapperCSSProps}
      {...other}
    >
      {value === index && 
        <>{children}</>
      }
    </div>
  );
}

export default TabPanel;