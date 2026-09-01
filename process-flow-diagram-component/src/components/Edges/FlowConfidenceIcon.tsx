import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { useTheme } from '@mui/material';
import { CSSProperties, JSX } from 'react';
import { CustomEdgeData, FlowConfidence } from 'process-flow-lib';
import { useAppSelector } from '../../hooks/state';
import { RootState } from '../Diagram/store';

/**
 * Resolves the color for a confidence state, honoring the user's custom
 * Estimated/Metered colors from the Options tab (`UserDiagramOptions.estimatedFlowColor` /
 * `meteredFlowColor`) and falling back to the theme's warning/success colors when unset.
 */
export const useFlowConfidenceColor = () => {
  const theme = useTheme();
  const estimatedFlowColor = useAppSelector((state: RootState) => state.diagram.diagramOptions.estimatedFlowColor);
  const meteredFlowColor = useAppSelector((state: RootState) => state.diagram.diagramOptions.meteredFlowColor);

  return (confidence: FlowConfidence): string => {
    return confidence === 'metered'
      ? (meteredFlowColor || theme.palette.success.main)
      : (estimatedFlowColor || theme.palette.warning.main);
  };
}

export const getFlowConfidenceLabel = (confidence: FlowConfidence): string => {
  return confidence === 'metered' ? 'Metered' : 'Estimated';
}

/**
 * Shared with CustomizeEdge/DiagramBaseEdge so the edge's own stroke color and any UI showing its
 * confidence color (flow value label, icon) always agree, including when the user has manually
 * overridden the stroke or turned off "Color Edges by Confidence".
 */
export const resolveEdgeStrokeColor = (
  data: Pick<CustomEdgeData, 'confidence' | 'hasManualColorOverride'>,
  styleStroke: string | undefined,
  colorEdgesByConfidence: boolean,
  getColor: (confidence: FlowConfidence) => string
): string => {
  return (data.hasManualColorOverride || !colorEdgesByConfidence) ? styleStroke : getColor(data.confidence);
}

const FlowConfidenceIcon = ({ confidence, color, sx }: { confidence: FlowConfidence, color: string, sx?: CSSProperties }): JSX.Element => {
  const style: CSSProperties = {
    color,
    ...sx
  }
  return confidence === 'metered' ? <LockIcon style={style} /> : <LockOpenIcon style={style} />
}

export default FlowConfidenceIcon;
