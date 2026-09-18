import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import CalculateIcon from '@mui/icons-material/Calculate';
import { useTheme } from '@mui/material';
import { CSSProperties, JSX } from 'react';
import { CustomEdgeData, FlowConfidence } from 'process-flow-lib';
import { useAppSelector } from '../../hooks/state';
import { RootState } from '../Diagram/store';

/**
 * Resolves the color for a confidence state, honoring the user's custom
 * Estimated/Metered/Cascaded colors from the Options tab (`UserDiagramOptions.estimatedFlowColor` /
 * `meteredFlowColor` / `calculatedFlowColor`) and falling back to the theme's info/success/warning
 * colors when unset.
 */
export const useFlowConfidenceColor = () => {
  const theme = useTheme();
  const estimatedFlowColor = useAppSelector((state: RootState) => state.diagram.diagramOptions.estimatedFlowColor);
  const meteredFlowColor = useAppSelector((state: RootState) => state.diagram.diagramOptions.meteredFlowColor);
  const calculatedFlowColor = useAppSelector((state: RootState) => state.diagram.diagramOptions.calculatedFlowColor);

  return (confidence: FlowConfidence): string => {
    if (confidence === 'metered') {
      return meteredFlowColor || theme.palette.success.main;
    }
    if (confidence === 'calculated') {
      return calculatedFlowColor || theme.palette.warning.main;
    }
    return estimatedFlowColor || theme.palette.info.main;
  };
}

export const getFlowConfidenceLabel = (confidence: FlowConfidence): string => {
  if (confidence === 'metered') {
    return 'Metered';
  }
  if (confidence === 'calculated') {
    return 'Cascaded';
  }
  return 'Estimated';
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
  if (confidence === 'metered') {
    return <LockIcon style={style} />
  }
  if (confidence === 'calculated') {
    return <CalculateIcon style={style} />
  }
  return <LockOpenIcon style={style} />
}

export default FlowConfidenceIcon;
