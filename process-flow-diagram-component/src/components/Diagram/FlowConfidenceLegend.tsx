import FlowConfidenceIcon, { useFlowConfidenceColor, getFlowConfidenceLabel } from '../Edges/FlowConfidenceIcon';

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
      gap: 5,
      background: '#fff',
      borderRadius: 11,
      padding: '8px 13px',
      boxShadow: '0 0 2px 1px rgba(0, 0, 0, 0.08)',
      fontSize: 16,
    }} className={"nodrag nopan"}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <FlowConfidenceIcon confidence="estimated" color={getColor('estimated')} sx={{ fontSize: 27 }} />
        <span style={{ color: getColor('estimated') }}>{getFlowConfidenceLabel('estimated')}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <FlowConfidenceIcon confidence="metered" color={getColor('metered')} sx={{ fontSize: 27 }} />
        <span style={{ color: getColor('metered') }}>{getFlowConfidenceLabel('metered')}</span>
      </div>
    </div>
  );
};

export default FlowConfidenceLegend;
