import { waterTreatmentTypeOptions } from "process-flow-lib";
import { CSSProperties, memo } from "react";
import { Select, MenuItem } from "@mui/material";

/**
* Render a select element for water or water water treatment types
*/
const SelectedTreatmentType = (props: SelectedTreatmentTypeProps) => {
    const { handleTreatmentTypeChange, treatmentType, treatmentOptions, style } = props;
    const treatmentTypeOptions: Array<{ value: number, display: string }> = treatmentOptions? treatmentOptions : waterTreatmentTypeOptions;
    const defaultStyle = {
        width: '100%',
        height: '2.25rem'
    };
    return (
        <Select
            id={'treatmentType'}
            name="treatmentType"
            value={treatmentType}
            onChange={handleTreatmentTypeChange}
            size="small"
            sx={{ width: '100%', height: '2.25rem', ...style }}
        >
            {treatmentTypeOptions.map((option, index) => (
                <MenuItem key={option.display + '_' + index} value={option.value}>
                    {option.display}
                </MenuItem>
            ))}
        </Select>
    );
}

export default memo(SelectedTreatmentType);

export interface SelectedTreatmentTypeProps {
    treatmentType: number,
    treatmentOptions?: Array<{ value: number, display: string }>,
    handleTreatmentTypeChange: (event) => void,
    style?: CSSProperties;
}


