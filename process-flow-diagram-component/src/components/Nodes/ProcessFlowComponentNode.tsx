import { memo, CSSProperties } from 'react';
import { Handle, Position, NodeProps, useReactFlow, Node } from '@xyflow/react';
import { HandleOption, Handles, ProcessFlowNodeType, ProcessFlowPartStyleClass } from '../../../../src/process-flow-types/shared-process-flow-types';
import EditIcon from '@mui/icons-material/Edit';
import { Typography } from '@mui/material';


const mainTargetHandleStyle: CSSProperties = {
  left: '-5px',
  height: '20px',
  width: '10px',
  borderRadius: '2px 0 0 2px',
}

const mainSourceHandleStyle: CSSProperties = {
  right: '-5px',
  height: '20px',
  width: '10px',
  borderRadius: '0 2px 2px 0',
}

const topTargetHandleStyle: CSSProperties = {
  top: '-15px',
  height: '20px',
  width: '10px',
  transform: 'rotate(90deg)',
  borderRadius: '2px 0 0 2px',
  left: 0,
  position: 'relative'
}

const bottomSourceHandleStyle: CSSProperties = {
  bottom: '-15px',
  height: '20px',
  width: '10px',
  transform: 'rotate(90deg)',
  borderRadius: '0 2px 2px 0',
  left: 0,
  position: 'relative'
};


// * patches v11 -> v12 typing changes
// todo this type needs to duplicate ProcessFlowPart - how to merge types
export type DiagramNode = Node<{
  name: string,
  processComponentType: ProcessFlowNodeType,
  className: ProcessFlowPartStyleClass,
  isValid: boolean,
  createdByAssessment: boolean,
  diagramNodeId?: string,
  disableInflowConnections?: boolean,
  disableOutflowConnections?: boolean,
  modifiedDate?: Date,
  handles?: Handles,
  splitterTargets?: Array<string>;
  setManageDataId?: (id: string) => void;
  openEditData?: (boolean) => void;
  processComponentContext?: any;
}, 'processFlowPart'>;

const ProcessFlowComponentNode = ({ data, id, isConnectable, selected }: NodeProps<DiagramNode>) => {

  const onEditNode = () => {
    if (data.setManageDataId && data.openEditData) {
      data.setManageDataId(data.diagramNodeId);
      data.openEditData(true);
    }
  }
  const transformString = `translate(0%, 0%) translate(180px, -36px)`;
  const customStyle: CSSProperties = {
    position: 'absolute',
    transform: transformString,
    color: '#fff',
    fontSize: 16,
    pointerEvents: 'all',
  }

  const allowInflowOnly: boolean = data.disableInflowConnections; 
  const allowOutflowOnly: boolean = data.disableOutflowConnections; 
  const allowAllHandles: boolean = !allowInflowOnly && !allowOutflowOnly;

  return (
    <>

    {(allowAllHandles || allowOutflowOnly) && data.handles.inflowHandles.a &&
      <Handle
      type="target"
      className='target-handle'
      position={Position.Left}
      id="a"
      isConnectableEnd={true}
      style={mainTargetHandleStyle}
      />
    }

      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          justifyContent: 'space-around',
        }}
      >
        {(allowAllHandles || allowOutflowOnly) && data.handles.inflowHandles.b &&
          <Handle
            type="target"
            className='target-handle'
            position={Position.Top}
            id="b"
            style={topTargetHandleStyle}
          />
        }

        {(allowAllHandles || allowOutflowOnly) && data.handles.inflowHandles.c &&
          <Handle
            type="target"
            className='target-handle'
            position={Position.Top}
            id="c"
            style={topTargetHandleStyle}
          />
        }

        {(allowAllHandles || allowOutflowOnly) && data.handles.inflowHandles.d &&
          <Handle
            type="target"
            className='target-handle'
            position={Position.Top}
            id="d"
            style={topTargetHandleStyle}
          />
        }
      </div>

      <div className="node-inner-input">
        <div
          style={customStyle}
          className="nodrag nopan"
        >
          {selected &&
            <button className="edit-button hover-highlight" onClick={onEditNode}>
              <EditIcon sx={{ width: 'unset', height: 'unset' }} />
            </button>
          }
        </div>
        <Typography sx={{ width: '100%' }} >
          {data.name}
        </Typography>

      </div>

      {(allowAllHandles || allowInflowOnly) && data.handles.outflowHandles.e &&
        <Handle
          type="source"
          className='source-handle'
          position={Position.Right}
          id="e"
          style={mainSourceHandleStyle}
        />
      }

      <div
        style={{
          display: 'flex',
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          justifyContent: 'space-around',
        }}
      >

        {(allowAllHandles || allowInflowOnly) && data.handles.outflowHandles.f &&
          <Handle
            type="source"
            className='source-handle'
            position={Position.Bottom}
            id="f"
            style={bottomSourceHandleStyle}
          />
        }

        {(allowAllHandles || allowInflowOnly) && data.handles.outflowHandles.g &&
          <Handle
            type="source"
            className='source-handle'
            position={Position.Bottom}
            id="g"
            style={bottomSourceHandleStyle}
          />
        }

        {(allowAllHandles || allowInflowOnly) && data.handles.outflowHandles.h &&
          <Handle
            type="source"
            className='source-handle'
            position={Position.Bottom}
            id="h"
            style={bottomSourceHandleStyle}
          />
        }
      </div>
    </>
  );
};

export default memo(ProcessFlowComponentNode);
