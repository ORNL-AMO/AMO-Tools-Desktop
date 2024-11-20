import { Handle, Position } from "@xyflow/react";

const FlowLossNode = () => {

  // const flowLossValue = 123.33;
  
  return (
    <div className={'flowLoss'}>
      {/* {flowLossValue} */}
      <Handle
        type="target"
        className={'flowLoss-handle'}
        position={Position.Top}
        isConnectable
        />
    </div>
  );
}

export default FlowLossNode;