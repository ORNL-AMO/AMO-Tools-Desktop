import { NodeProps, Position } from "@xyflow/react";
import { CSSProperties } from "react";
import { Typography } from "@mui/material";
import CustomHandle from "./CustomHandle";
import EditDataDrawerButton from "../Drawer/EditDataDrawerButton";
import { useAppDispatch } from "../../hooks/state";
import { openDrawerWithSelected } from "../Diagram/diagramReducer";
import { DiagramNode } from "process-flow-lib";
import React from "react";

const KnownLossNode = ({ data, id, selected }: NodeProps<DiagramNode>) => {
  const dispatch = useAppDispatch();
  const transformString = `translate(0%, 0%) translate(145px, -30px)`;
  const lossInnerStyle: CSSProperties = {
    top: '0',
    right: '-75px',
    position: 'absolute'
  };

  const onEditNode = () => {
    dispatch(openDrawerWithSelected(id));
}

  return (
    <div>
      <div className="node-inner-input" style={lossInnerStyle}>
      <EditDataDrawerButton 
          onEdit={onEditNode}
          selected={selected}
          transformLocation={transformString}/>
        <Typography sx={{ width: '100%' }} >
          {data.name}
        </Typography>
      </div>
      <CustomHandle
        id={id}
        type="target"
        position={Position.Top}
        className={'knownLoss-handle'}
      />
    </div>
  );
}

export default KnownLossNode;