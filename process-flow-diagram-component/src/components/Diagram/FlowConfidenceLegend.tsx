import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { useFlowConfidenceColor, getFlowConfidenceLabel } from '../Edges/FlowConfidenceIcon';

/**
 * Small key explaining the Estimated/Metered flow indicators shown on diagram edges.
 * Rendered next to the canvas Controls panel (zoom/fit-view/interactive-lock).
 */
const FlowConfidenceLegend = () => {
  const getColor = useFlowConfidenceColor();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      background: '#fff',
      borderRadius: 8,
      padding: '6px 10px',
      boxShadow: '0 0 2px 1px rgba(0, 0, 0, 0.08)',
      fontSize: 12,
    }} className={"nodrag nopan"}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <LockOpenIcon fontSize="small" style={{ color: getColor('estimated') }} />
        <span style={{ color: getColor('estimated') }}>{getFlowConfidenceLabel('estimated')}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <LockIcon fontSize="small" style={{ color: getColor('metered') }} />
        <span style={{ color: getColor('metered') }}>{getFlowConfidenceLabel('metered')}</span>
      </div>
    </div>
  );
};

export default FlowConfidenceLegend;
