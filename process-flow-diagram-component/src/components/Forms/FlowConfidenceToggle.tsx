import { Button, SxProps, Theme } from "@mui/material";
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { FlowConfidence } from "process-flow-lib";
import { useFlowConfidenceColor, getFlowConfidenceLabel } from "../Edges/FlowConfidenceIcon";
import SmallTooltip from "../StyledMUI/SmallTooltip";

/**
 * Single-button toggle for annotating a flow value as Estimated (unconfident) or Metered (confident).
 * Shows only the current state's icon; clicking flips to the other state. Confidence only ever
 * changes via this explicit click - the app never reverts a Metered value back to Estimated on
 * recalculation.
 */
const FlowConfidenceToggle = (props: FlowConfidenceToggleProps) => {
    const { confidence, onChange, disabled, sx } = props;
    const getColor = useFlowConfidenceColor();
    const nextConfidence: FlowConfidence = confidence === 'metered' ? 'estimated' : 'metered';

    const handleClick = () => {
        onChange(nextConfidence);
    };

    return (
        <SmallTooltip title={`Mark as ${getFlowConfidenceLabel(nextConfidence)}`}
            slotProps={{
                popper: {
                    disablePortal: true,
                }
            }}>
            <span>
                <Button
                    variant="outlined"
                    aria-label="flow confidence"
                    disabled={disabled}
                    size="small"
                    sx={[{ mr: 1, padding: '2px 6px', minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
                    onClick={handleClick}
                >
                    {confidence === 'metered'
                        ? <LockIcon fontSize="small" style={{ color: getColor('metered') }} />
                        : <LockOpenIcon fontSize="small" style={{ color: getColor('estimated') }} />
                    }
                </Button>
            </span>
        </SmallTooltip>
    );
};

export default FlowConfidenceToggle;

interface FlowConfidenceToggleProps {
    confidence: FlowConfidence,
    onChange: (confidence: FlowConfidence) => void,
    disabled?: boolean,
    sx?: SxProps<Theme>,
}
