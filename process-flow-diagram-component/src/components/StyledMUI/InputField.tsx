import { TextField, TextFieldProps, styled } from "@mui/material";

const InputField = styled(
    (props: TextFieldProps & { warning?: boolean }) => (
        <TextField {...props} />
    ),
    { shouldForwardProp: (prop) => prop !== "warning" }
)(({ warning, theme }) => {
    return warning? 
    {
        "& fieldset.MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.warning.main,
        },
        "& p.MuiFormHelperText-root": {
            color: theme.palette.warning.main,
        },
        "& .MuiInputLabel-root": {
            color: theme.palette.warning.main,
        },
    } : {}
});

export default InputField