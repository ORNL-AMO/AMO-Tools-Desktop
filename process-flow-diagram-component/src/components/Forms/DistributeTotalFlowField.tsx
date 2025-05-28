import { FormikErrors } from "formik";
import { useEffect } from "react";
import { getFlowDisplayValues } from "../Diagram/FlowUtils";
import { Edge } from "@xyflow/react";
import { CustomEdgeData } from "process-flow-lib";

/**
   * A utility component to render flow value updates not triggerd by formik
   */
const DistributeTotalFlowField = ({ componentEdges, setFieldValue }: {
    componentEdges: Edge<CustomEdgeData>[],
    setFieldValue: (field: string, value: any, shouldValidate?: boolean) => Promise<void | FormikErrors<{ totalFlow: string | number; flows: (string | number)[]; }>>,
}) => {
    const flowValues = getFlowDisplayValues(componentEdges);
    useEffect(() => {
        setFieldValue("flows", flowValues, true);
    }, [componentEdges, setFieldValue]);

    return null;
};

export default DistributeTotalFlowField;