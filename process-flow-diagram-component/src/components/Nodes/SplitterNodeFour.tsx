import { memo, FC } from 'react';
import { DiagramNode } from './ProcessFlowComponentNode';
import { Handle, NodeProps, NodeResizer, Position } from '@xyflow/react';


const SplitterNodeFour = (id, { data }: NodeProps<DiagramNode>) =>  {
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
