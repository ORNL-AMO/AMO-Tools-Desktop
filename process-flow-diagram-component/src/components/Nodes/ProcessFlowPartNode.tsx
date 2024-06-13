import { memo, FC, CSSProperties } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow';
import { ProcessFlowPart } from '../../../../src/process-flow-types/shared-process-flow-types';

const targetHandleStyleA: CSSProperties = { 
  // left: 50 
};
const sourceHandleStyleB: CSSProperties = {
  // right: 50,
  // left: 'auto',
};

export interface FlowPartProps extends ProcessFlowPart {
}

// * note the type of NodeProps is automagically accessible via the 'data' property 
const ProcessFlowPartNode: FC<NodeProps<FlowPartProps>> = (props) => {
  return (
    <>
      {/* <NodeResizer /> */}
      <Handle type="target" position={Position.Left} />
      <div>
        <div>
          {props.data.defaultLabel}
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        id="a"
        style={targetHandleStyleA}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="b"
        style={sourceHandleStyleB}
      />
    </>
  );
};

export default memo(ProcessFlowPartNode);
