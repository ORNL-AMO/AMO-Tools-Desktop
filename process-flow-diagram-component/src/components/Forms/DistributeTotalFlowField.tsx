import { FormikErrors } from "formik";
import { CustomEdgeData } from "../../../../src/process-flow-types/shared-process-flow-types";
import { useEffect } from "react";
import { Edge } from "reactflow";

/**
   * A utility component to render flow value updates not triggerd by formik
   */
const DistributeTotalFlowField = ({ componentEdges, setFieldValue }: {
    componentEdges: Edge<CustomEdgeData>[],
    setFieldValue: (field: string, value: any, shouldValidate?: boolean) => Promise<void | FormikErrors<{ totalFlow: string | number; flows: (string | number)[]; }>>,
}) => {
    const flowValues = componentEdges.map(edge => edge.data.flowValue);

    useEffect(() => {
        setFieldValue("flows", flowValues, true);
    }, [componentEdges, setFieldValue]);

    return null;
};

export default DistributeTotalFlowField;