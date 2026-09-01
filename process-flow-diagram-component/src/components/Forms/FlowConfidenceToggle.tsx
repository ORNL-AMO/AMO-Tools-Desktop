import { Button, SxProps, Theme } from "@mui/material";
import { FlowConfidence } from "process-flow-lib";
import FlowConfidenceIcon, { useFlowConfidenceColor, getFlowConfidenceLabel } from "../Edges/FlowConfidenceIcon";
import SmallTooltip from "../StyledMUI/SmallTooltip";

/**
 * Single-button toggle for annotating a flow value as Estimated (unconfident) or Metered (confident).
 * Shows only the current state's icon; clicking flips to the other state. Confidence only ever
 * changes via this explicit click - the app never reverts a Metered value back to Estimated on
 * recalculation, except when flow propagation overwrites a downstream edge's value, which then
 * inherits the seed edge's confidence.
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
                    <FlowConfidenceIcon confidence={confidence} color={getColor(confidence)} sx={{ fontSize: '1.25rem' }} />
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
