import { Button, ToggleButton, ToggleButtonGroup } from "@mui/material";
import FlowDisplayUnit from "../Diagram/FlowDisplayUnit";
/**
   * A utility component to render flow value updates not triggerd by formik
   */
const ToggleDataEntryUnitButton = (props: ToggleDataEntryUnitProps) => {
    const { handleToggleDataEntryUnit, inPercent, disabled } = props;
    return (
        <ToggleButtonGroup
            value={inPercent}
            exclusive
            color={"primary"}
            onChange={handleToggleDataEntryUnit}
            aria-label="data entry unit"
            sx={{
                marginBottom: '.75rem',
                padding: '2px 12px',
                display: 'flex',
                justifyContent: 'center',
                width: '100%'
            }}
        >
            <ToggleButton value={false} aria-label="inMgalOrMetersCubed" 
            sx={{width: '50%'}}
            disabled={disabled}
            >
                Flows in <FlowDisplayUnit />
            </ToggleButton>
            <ToggleButton value={true} aria-label="percent"
            disabled={disabled}
            sx={{width: '50%'}}
            >
                Flows in %
            </ToggleButton>
        </ToggleButtonGroup>
    );
};

export default ToggleDataEntryUnitButton;
interface ToggleDataEntryUnitProps {
    handleToggleDataEntryUnit: () => void,
    inPercent: boolean,
    disabled: boolean
}