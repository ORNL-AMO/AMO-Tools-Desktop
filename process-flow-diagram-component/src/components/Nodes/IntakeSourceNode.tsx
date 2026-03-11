import { memo } from 'react';
import { Position, NodeProps } from '@xyflow/react';
import { Chip, Typography } from '@mui/material';
import CustomHandle from './CustomHandle';
import FlowValueDisplay from '../Diagram/FlowValueDisplay';
import FlowDisplayUnit from '../Diagram/FlowDisplayUnit';
import { useAppDispatch, useAppSelector } from '../../hooks/state';
import { DiagramNode, NodeFlowData, ProcessFlowPart } from 'process-flow-lib';
import { selectNodeCalculatedFlowData } from '../Diagram/store';
import CustomNodeToolbar from './CustomNodeToolbar';
import { openDrawerWithSelected } from '../Diagram/diagramReducer';

const IntakeSourceNode = ({ data, id, selected }: NodeProps<DiagramNode>) => {
  const dispatch = useAppDispatch();
  const calculatedData: NodeFlowData = useAppSelector((state) => selectNodeCalculatedFlowData(state, id));
  let plantLevelFlow: number | string = data.userEnteredData.totalDischargeFlow ? data.userEnteredData.totalDischargeFlow : calculatedData && calculatedData.totalDischargeFlow;
  let condensedPadding: boolean = plantLevelFlow !== undefined && plantLevelFlow !== null;


  const onEditNode = () => {
    dispatch(openDrawerWithSelected(id));
  }

  return (
    <>
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
        {/* // * TOP */}
        {data.handles.outflowHandles.g &&
          <CustomHandle
            type="source"
            position={Position.Top}
            id="g"
            className='custom-handle source-handle'
          />
        }
        {data.handles.outflowHandles.i &&
          <CustomHandle
            type="source"
            position={Position.Top}
            id="i"
            className='custom-handle source-handle'
          />
        }
        {data.handles.outflowHandles.k &&
          <CustomHandle
            type="source"
            position={Position.Top}
            id="k"
            className='custom-handle source-handle'
          />
        }

      </div>

      <div className="node-inner-input" style={{
        padding: condensedPadding ? '0' : undefined
      }}>
        <CustomNodeToolbar onEdit={onEditNode} nodeData={data as ProcessFlowPart} selected={selected} />

        <Typography sx={{ width: '100%' }} >
          {data.name}
        </Typography>

        {plantLevelFlow !== undefined && plantLevelFlow !== null &&
          <Chip label={
            <>
              <FlowValueDisplay flowValue={plantLevelFlow} />
              <FlowDisplayUnit />
            </>
          }
            variant="outlined"
            sx={{ background: '#fff', borderRadius: '8px', marginTop: '.25rem' }}
          />
        }
      </div>


      <div
        style={{
          display: 'block',
          position: 'absolute',
          right: 0,
          top: '20px',
        }}
      >

        {/* // * RIGHT SIDE */}
        {data.handles.outflowHandles.e &&
          <CustomHandle
            type="source"
            position={Position.Right}
            id="e"
            className='custom-handle source-handle'
            customStyle={{
              top: '30px'
            }}
          />
        }

        {data.handles.outflowHandles.f &&
          <CustomHandle
            type="source"
            position={Position.Right}
            id="f"
            className='custom-handle source-handle'
          />
        }

      </div>

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
        {/* // * BOTTOM */}
        {data.handles.outflowHandles.h &&
          <CustomHandle
            type="source"
            position={Position.Bottom}
            id="h"
            className='custom-handle source-handle'
          />
        }
        {data.handles.outflowHandles.j &&
          <CustomHandle
            type="source"
            position={Position.Bottom}
            id="j"
            className='custom-handle source-handle'
          />
        }
        {data.handles.outflowHandles.l &&
          <CustomHandle
            type="source"
            position={Position.Bottom}
            id="l"
            className='custom-handle source-handle'
          />
        }

      </div>
    </>
  );
};

export default memo(IntakeSourceNode);
