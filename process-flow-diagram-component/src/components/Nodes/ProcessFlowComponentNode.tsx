import { memo } from 'react';
import { Position, NodeProps } from '@xyflow/react';
import { Typography } from '@mui/material';
import CustomHandle from './CustomHandle';
import FlowValueDisplay from '../Diagram/FlowValueDisplay';
import FlowDisplayUnit from '../Diagram/FlowDisplayUnit';
import { openDrawerWithSelected } from '../Diagram/diagramReducer';
import { useAppDispatch, useAppSelector } from '../../hooks/state';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import { DiagramNode, NodeFlowData } from 'process-flow-lib';
import { selectNodeCalculatedFlowData } from '../Diagram/store';

const ProcessFlowComponentNode = ({ data, id, isConnectable, selected }: NodeProps<DiagramNode>) => {
  const dispatch = useAppDispatch();
  const calculatedData: NodeFlowData = useAppSelector((state) => selectNodeCalculatedFlowData(state, id));
  // let transformString = `translate(0%, 0%) translate(180px, -36px)`;
  let showInSystemTreatment: boolean;
  if (data.processComponentType === 'water-using-system' && data.inSystemTreatment.length > 0) {
    showInSystemTreatment = true;
  }

  const onEditNode = () => {
    dispatch(openDrawerWithSelected(id));
  }

  return (
    <>
    {data.handles.inflowHandles.a &&
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
        {data.handles.inflowHandles.b &&
          <CustomHandle
            type="target"
            position={Position.Top}
            id="b"
          />
        }

        {data.handles.inflowHandles.c &&
          <CustomHandle
            type="target"
            position={Position.Top}
            id="c"
          />
        }

        {data.handles.inflowHandles.d &&
          <CustomHandle
            type="target"
            position={Position.Top}
            id="d"
          />
        }
      </div>

      <div className="node-inner-input">
        {showInSystemTreatment &&
          <div style={{
            position: 'absolute',
            display: 'flex',
            width: '100px',
            height: '20px',
            left: '-12px',
            top: '-12px',
            background: 'rgb(0, 147, 134)',
            borderTopLeftRadius: '6px',
            borderBottomRightRadius: '6px'
          }} >
            <WaterDropIcon style={{
              fontSize: '12px',
              color: '#fff',
              marginRight: '.25rem',
              marginLeft: '.25rem',
              alignSelf: 'center'
            }} />
            <span style={{
              alignSelf: 'center'
            }}>
              Treatment
            </span>
          </div>
        }
      
        {/* <EditDataDrawerButton 
          onEdit={onEditNode}
          selected={selected}
          transformLocation={transformString}/> */}

        <Typography sx={{ width: '100%' }} >
          {data.name}
        </Typography>

      </div>

      {data.handles.outflowHandles.e &&
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

        {data.handles.outflowHandles.f &&
          <CustomHandle
            type="source"
            position={Position.Bottom}
            id="f"
          />
        }

        {data.handles.outflowHandles.g &&
          <CustomHandle
            type="source"
            position={Position.Bottom}
            id="g"
          />
        }

        {data.handles.outflowHandles.h &&
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
