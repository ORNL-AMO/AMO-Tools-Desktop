import { waterTreatmentTypeOptions } from "process-flow-lib";
import { CSSProperties, memo } from "react";

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
        <select className="form-control diagram-select" id={'treatmentType'} name="treatmentType"
            style={{...defaultStyle, ...style}}
            value={treatmentType}
            onChange={(e) => handleTreatmentTypeChange(Number(e.target.value))}>
            {treatmentTypeOptions.map((option, index) => {
                return (
                    <option key={option.display + '_' + index} value={option.value}>{option.display}</option>
                )
            })
            }
        </select>
    );
}

export default memo(SelectedTreatmentType);

export interface SelectedTreatmentTypeProps {
    treatmentType: number,
    treatmentOptions?: Array<{ value: number, display: string }>,
    handleTreatmentTypeChange: (treatmentType: number) => void,
    style?: CSSProperties;
}


