import { TextField, FormControl, FormHelperText, } from '@mui/material';


const HoursPerYearInputField = (props: HoursPerYearInputFieldProps) => {
    const { formik, handleInputChange } = props;

    return (
            <FormControl fullWidth margin="normal" error={formik.touched.hoursPerYear && Boolean(formik.errors.hoursPerYear)}>
                <TextField
                    id="hoursPerYear"
                    name="hoursPerYear"
                    label={'Hours Water Used Per Year'}
                    type="number"
                    size={'small'}
                    onChange={handleInputChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.hoursPerYear}
                />
                {formik.touched.hoursPerYear && formik.errors.hoursPerYear && (
                    <FormHelperText>{formik.errors.hoursPerYear}</FormHelperText>
                )}
            </FormControl>
    );
};

export default HoursPerYearInputField;

export interface HoursPerYearInputFieldProps {
    formik;
    handleInputChange: (e) => void;
}