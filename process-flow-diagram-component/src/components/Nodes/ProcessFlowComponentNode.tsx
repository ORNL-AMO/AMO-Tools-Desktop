import { memo, useContext } from 'react';
import { Position, NodeProps } from '@xyflow/react';
import { DiagramNode } from '../../../../src/process-flow-types/shared-process-flow-types';
import { Chip, Typography } from '@mui/material';
import CustomHandle from './CustomHandle';
import { FlowContext } from '../Flow';
import EditDataDrawerButton from '../Drawer/EditDataDrawerButton';
import { formatNumberValue } from '../Flow/FlowUtils';

const ProcessFlowComponentNode = ({ data, id, isConnectable, selected }: NodeProps<DiagramNode>) => {
  const flowContext: FlowContext = useContext<FlowContext>(FlowContext);
  let transformString = `translate(0%, 0%) translate(180px, -36px)`;

  const allowInflowOnly: boolean = data.disableInflowConnections; 
  const allowOutflowOnly: boolean = data.disableOutflowConnections; 
  const allowAllHandles: boolean = !allowInflowOnly && !allowOutflowOnly;
  let plantLevelFlow: number | string;
  let condensedPadding: boolean;
  if (data.processComponentType === 'water-intake') {
    plantLevelFlow = data.userEnteredData.totalDischargeFlow? data.userEnteredData.totalDischargeFlow : flowContext.nodeCalculatedDataMap[id] && flowContext.nodeCalculatedDataMap[id].totalDischargeFlow;
    plantLevelFlow = formatNumberValue(plantLevelFlow, flowContext.userDiagramOptions.flowDecimalPrecision);
    condensedPadding = plantLevelFlow !== undefined && plantLevelFlow !== null;
    transformString = `translate(0%, 0%) translate(188px, -25px)`;
  }
  if (data.processComponentType === 'water-discharge') {
    plantLevelFlow = data.userEnteredData.totalSourceFlow? data.userEnteredData.totalSourceFlow : flowContext.nodeCalculatedDataMap[id] && flowContext.nodeCalculatedDataMap[id].totalSourceFlow;
    plantLevelFlow = formatNumberValue(plantLevelFlow, flowContext.userDiagramOptions.flowDecimalPrecision);
    condensedPadding = plantLevelFlow !== undefined && plantLevelFlow !== null;
    transformString = `translate(0%, 0%) translate(188px, -25px)`;
  }

  const onEditNode = () => {
    flowContext.setManageDataId(id);
    flowContext.setIsDataDrawerOpen(true);
}

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

      <div className="node-inner-input" style={{
        padding: condensedPadding? '0' : undefined
      }}>
        <EditDataDrawerButton 
          onEdit={onEditNode}
          selected={selected}
          transformLocation={transformString}/>

        <Typography sx={{ width: '100%' }} >
          {data.name}
        </Typography>

        {plantLevelFlow !== undefined && plantLevelFlow !== null &&
            <Chip label={`${plantLevelFlow} Mgal`} 
            variant="outlined" 
            sx={{background: '#fff', borderRadius: '8px', marginTop: '.25rem'}}
            />
        }
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
