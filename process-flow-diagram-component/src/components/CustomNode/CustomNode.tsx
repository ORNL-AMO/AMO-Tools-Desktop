import { memo, FC, CSSProperties } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow';

const targetHandleStyleA: CSSProperties = { 
  // left: 50 
};
const sourceHandleStyleB: CSSProperties = {
  // right: 50,
  // left: 'auto',
};

const CustomNode: FC<NodeProps> = ({ data, xPos, yPos }) => {
  return (
    <>
      {/* <NodeResizer /> */}
      <Handle type="target" position={Position.Left} />
      <div>
        <div>
          {data.label}
        </div>
        {/* <div>
          Position:{' '}
          <strong>
            {xPos.toFixed(2)},{yPos.toFixed(2)}
          </strong>
        </div> */}
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

export default memo(CustomNode);
