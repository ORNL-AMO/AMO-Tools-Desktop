import { memo, FC, CSSProperties } from 'react';
import { Handle, Position, NodeProps, NodeResizer, useReactFlow, Node } from 'reactflow';
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
const ProcessFlowComponentNode: FC<NodeProps<FlowPartProps>> = (props) => {
  const { setNodes } = useReactFlow();

  const updateNodeName = (event, diagramNodeId) => {
    setNodes((nds) =>
      nds.map((n: Node) => {
        const processFlowPart: ProcessFlowPart = n.data as ProcessFlowPart;
        if (processFlowPart.diagramNodeId === diagramNodeId) {
          return {
            ...n,
            data: {
              ...processFlowPart,
              name: event.target.value
            }
          };
        }
        return n;
      }),
    );
  };

  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div className="node-inner-input">
        <input
          type="text"
          value={props.data.name}
          onChange={evt => updateNodeName(evt, props.data.diagramNodeId)}
          className="nodrag"
          disabled={false}
        />
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

export default memo(ProcessFlowComponentNode);
