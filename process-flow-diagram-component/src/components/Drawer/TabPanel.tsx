import type { ReactNode } from "react";
import { CSSProperties } from "react";

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
  style?: CSSProperties;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, style, ...other } = props;

  let wrapperCSSProps: CSSProperties = { 
    width: '100%', 
    padding: '.5rem',
    paddingTop: '1rem',
    flex: 1,    
    overflowY: 'auto',   
    minHeight: 0,
    flexDirection: 'column',
    ...style,
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