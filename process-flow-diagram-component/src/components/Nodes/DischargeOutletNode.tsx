import { memo } from 'react';
import { Position, NodeProps } from '@xyflow/react';
import { Chip, Typography } from '@mui/material';
import CustomHandle from './CustomHandle';
import FlowValueDisplay from '../Diagram/FlowValueDisplay';
import FlowDisplayUnit from '../Diagram/FlowDisplayUnit';
import { useAppSelector } from '../../hooks/state';
import { DiagramNode, NodeFlowData } from 'process-flow-lib';
import { selectNodeCalculatedFlowData } from '../Diagram/store';

const DischargeOutletNode = ({ data, id, isConnectable, selected }: NodeProps<DiagramNode>) => {
  const calculatedData: NodeFlowData = useAppSelector((state) => selectNodeCalculatedFlowData(state, id));
  // let transformString = `translate(0%, 0%) translate(188px, -25px)`;
  let plantLevelFlow: number | string = data.userEnteredData.totalSourceFlow ? data.userEnteredData.totalSourceFlow : calculatedData && calculatedData.totalSourceFlow;
  let condensedPadding: boolean = plantLevelFlow !== undefined && plantLevelFlow !== null;

  // const onEditNode = () => {
  //   dispatch(openDrawerWithSelected(id));
  // }

  return (
    <>
      <CustomHandle
        type="target"
        position={Position.Left}
        id="a"
        className='custom-handle target-handle'
      />
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
        <CustomHandle
          type="target"
          position={Position.Top}
          id="b"
          className='custom-handle target-handle'
        />
        <CustomHandle
          type="target"
          position={Position.Top}
          id="c"
          className='custom-handle target-handle'
        />

        <CustomHandle
          type="target"
          position={Position.Top}
          id="d"
          className='custom-handle target-handle'
        />
      </div>

      <div className="node-inner-input" style={{
        padding: condensedPadding ? '0' : undefined
      }}>

        {/* <EditDataDrawerButton 
          onEdit={onEditNode}
          selected={selected}
          transformLocation={transformString}/> */}

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
          display: 'flex',
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          justifyContent: 'space-around',
        }}
      >
        <CustomHandle
          type="target"
          position={Position.Bottom}
          id="f"
          className='custom-handle target-handle'
        />
        <CustomHandle
          type="target"
          position={Position.Bottom}
          id="g"
          className='custom-handle target-handle'
        />
        <CustomHandle
          type="target"
          position={Position.Bottom}
          id="h"
          className='custom-handle target-handle'
        />
      </div>
    </>
  );
};

export default memo(DischargeOutletNode);
