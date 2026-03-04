import { memo } from 'react';
import { Position, NodeProps } from '@xyflow/react';
import { Typography } from '@mui/material';
import CustomHandle from './CustomHandle';
import { openDrawerWithSelected } from '../Diagram/diagramReducer';
import { useAppDispatch, useAppSelector } from '../../hooks/state';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import { DiagramNode, ProcessFlowPart, getSystemEstimatedUnknownLosses, WaterUsingSystem } from 'process-flow-lib';
import { getNodeHasErrorLevel } from 'process-flow-lib/water/logic/validation';
import { selectTotalSourceFlow, selectNodeErrors, selectTotalDischargeFlow } from '../Diagram/store';
import CustomNodeToolbar from './CustomNodeToolbar';
import { Tooltip } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
const ProcessFlowComponentNode = ({ data, id, isConnectable, selected }: NodeProps<DiagramNode>) => {
  const dispatch = useAppDispatch();

  let showInSystemTreatment: boolean;
  if (data.processComponentType === 'water-using-system' && data.inSystemTreatment.length > 0) {
    showInSystemTreatment = true;
  }

  const totalSourceFlow = useAppSelector(state => selectTotalSourceFlow(state, id));
  const nodeError = useAppSelector(state => selectNodeErrors(state)[id]);
  const totalDischargeFlow = useAppSelector(state => selectTotalDischargeFlow(state, id));
  let totalUnknownLoss = getSystemEstimatedUnknownLosses(data as WaterUsingSystem, totalSourceFlow, totalDischargeFlow);

  const isWaterSystemComponentType = [
    'water-using-system',
    'water-treatment',
    'waste-water-treatment'
  ].includes(data.processComponentType);
  const showWarningAlert = isWaterSystemComponentType && totalUnknownLoss > 0;
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

      {/* Overlays above node */}
      {(showWarningAlert || getNodeHasErrorLevel(nodeError)) && (
        <div
          style={{
            position: 'absolute',
            top: -36,
            left: 0,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          {showWarningAlert && !getNodeHasErrorLevel(nodeError) && (
            <Tooltip title="System Imbalance" placement="top" arrow>
              <WarningIcon color="warning" sx={{ fontSize: 30, mr: getNodeHasErrorLevel(nodeError) ? 1 : 0 }} />
            </Tooltip>
          )}
          {getNodeHasErrorLevel(nodeError) && (
            <Tooltip title="Node Error" placement="top" arrow>
              <ErrorIcon color="error" sx={{ fontSize: 30 }} />
            </Tooltip>
          )}
        </div>
      )}
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
        <CustomNodeToolbar onEdit={onEditNode} nodeData={data as ProcessFlowPart} selected={selected} />
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
