import { memo, FC } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow';
import { ProcessFlowPart } from '../../../../src/process-flow-types/shared-process-flow-types';

export interface FlowPartProps extends ProcessFlowPart {

}

// * note the type of NodeProps is automagically accessible via the 'data' property 
const SplitterNodeFour: FC<NodeProps<FlowPartProps>> = (props) => {
  return (
    <>
      <div className="node-inner-input junction-circle"></div>
      <Handle type="target" id={'a'} position={Position.Left} />
      <div
                style={{
                    display: 'flex',
                    position: 'absolute',
                    top: 0,
                    width: '100%',
                    justifyContent: 'space-evenly',
                }}
            >
                <Handle
                    style={{ position: 'relative', left: 0, transform: 'none' }}
                    id={'b'}
                    type="target"
                    position={Position.Top}
                />
                <Handle
                    style={{ position: 'relative', left: 0, transform: 'none' }}
                    id={'c'}
                    type="target"
                    position={Position.Top}
                />
            </div>
      <Handle type="source" id={'f'} position={Position.Right} />
      <div
                style={{
                    display: 'flex',
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    justifyContent: 'space-evenly',
                }}
            >
                <Handle
                    style={{ position: 'relative', left: 0, transform: 'none' }}
                    id={'d'}
                    type="target"
                    position={Position.Bottom}
                />
                <Handle
                    style={{ position: 'relative', left: 0, transform: 'none' }}
                    id={'e'}
                    type="target"
                    position={Position.Bottom}
                />
            </div>
      <NodeResizer/>
    </>


  );
};



export default memo(SplitterNodeFour);
