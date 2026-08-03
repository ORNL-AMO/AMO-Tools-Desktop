import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { useTheme } from '@mui/material';
import { CSSProperties, JSX } from 'react';
import { FlowConfidence } from 'process-flow-lib';
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

const FlowConfidenceIcon = ({ confidence, sx }: { confidence: FlowConfidence, sx?: CSSProperties }): JSX.Element => {
  const getColor = useFlowConfidenceColor();
  const style: CSSProperties = {
    color: getColor(confidence),
    ...sx
  }
  return confidence === 'metered' ? <LockIcon style={style} /> : <LockOpenIcon style={style} />
}

export default FlowConfidenceIcon;
