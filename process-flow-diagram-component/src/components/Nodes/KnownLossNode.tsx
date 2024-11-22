import { Handle, NodeProps, Position, useHandleConnections } from "@xyflow/react";
import { CSSProperties } from "react";
import { DiagramNode } from "../../../../src/process-flow-types/shared-process-flow-types";
import { Typography } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import CustomHandle from "./CustomHandle";
import EditNodeButton from "./EditNodeButton";


const KnownLossNode = ({ data, id, selected }: NodeProps<DiagramNode>) => {
  
  const transformString = `translate(0%, 0%) translate(145px, -30px)`;
  const lossInnerStyle: CSSProperties = {
    top: '0',
    right: '-75px',
    position: 'absolute'
  };

  return (
    <div>
      <div className="node-inner-input" style={lossInnerStyle}>
        <EditNodeButton
          data={data}
          selected={selected}
          transformLocation={transformString}
        />
        <Typography sx={{ width: '100%' }} >
          {data.name}
        </Typography>
      </div>
      <CustomHandle
        id={id}
        type="target"
        position={Position.Top}
        className={'knownLoss-handle'}
        connectionLimit={1}
      />
    </div>
  );
}

export default KnownLossNode;