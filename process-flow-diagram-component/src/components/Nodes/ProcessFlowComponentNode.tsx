import { memo, CSSProperties } from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { DiagramNode, Handles, ProcessFlowNodeType, ProcessFlowPartStyleClass } from '../../../../src/process-flow-types/shared-process-flow-types';
import EditIcon from '@mui/icons-material/Edit';
import { Typography } from '@mui/material';
import CustomHandle from './CustomHandle';
import EditNodeButton from './EditNodeButton';

const ProcessFlowComponentNode = ({ data, id, isConnectable, selected }: NodeProps<DiagramNode>) => {

  const transformString = `translate(0%, 0%) translate(180px, -36px)`;

  const allowInflowOnly: boolean = data.disableInflowConnections; 
  const allowOutflowOnly: boolean = data.disableOutflowConnections; 
  const allowAllHandles: boolean = !allowInflowOnly && !allowOutflowOnly;

  return (
    <>

    {(allowAllHandles || allowOutflowOnly) && data.handles.inflowHandles.a &&
      <CustomHandle
        type="target"
        position={Position.Left}
        id="a"
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
          <CustomHandle
            type="target"
            position={Position.Top}
            id="b"
          />
        }

        {(allowAllHandles || allowOutflowOnly) && data.handles.inflowHandles.c &&
          <CustomHandle
            type="target"
            position={Position.Top}
            id="c"
          />
        }

        {(allowAllHandles || allowOutflowOnly) && data.handles.inflowHandles.d &&
          <CustomHandle
            type="target"
            position={Position.Top}
            id="d"
          />
        }
      </div>

      <div className="node-inner-input">
        <EditNodeButton 
          data={data}
          selected={selected}
          transformLocation={transformString}/>
        <Typography sx={{ width: '100%' }} >
          {data.name}
        </Typography>
      </div>

      {(allowAllHandles || allowInflowOnly) && data.handles.outflowHandles.e &&
        <CustomHandle
          type="source"
          position={Position.Right}
          id="e"
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
          <CustomHandle
            type="source"
            position={Position.Bottom}
            id="f"
          />
        }

        {(allowAllHandles || allowInflowOnly) && data.handles.outflowHandles.g &&
          <CustomHandle
            type="source"
            position={Position.Bottom}
            id="g"
          />
        }

        {(allowAllHandles || allowInflowOnly) && data.handles.outflowHandles.h &&
          <CustomHandle
            type="source"
            position={Position.Bottom}
            id="h"
          />
        }
      </div>
    </>
  );
};

export default memo(ProcessFlowComponentNode);
