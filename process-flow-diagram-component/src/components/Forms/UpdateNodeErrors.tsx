import { FormikErrors } from "formik";
import { useAppDispatch } from "../../hooks/state";
import { FlowType, nodeErrorsChange } from "../Diagram/diagramReducer";
import { useEffect } from "react";

/**
   * A utility component to render flow value updates not triggerd by formik
   */
const UpdateNodeErrors = ({ flowType, errors }: {
    flowType: FlowType,
    errors: FormikErrors<{ totalFlow: string | number; flows: (string | number)[]; }>,
}) => {
    const dispatch = useAppDispatch();
    useEffect(() => {
        dispatch(nodeErrorsChange({flowType, errors}));
    }, [errors, flowType]);
    return null;
};

export default UpdateNodeErrors;