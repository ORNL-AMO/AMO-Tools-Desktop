import { NodeProps, Position } from "@xyflow/react";
import { CSSProperties, useContext } from "react";
import { DiagramNode } from "../../../../src/process-flow-types/shared-process-flow-types";
import { Typography } from "@mui/material";
import CustomHandle from "./CustomHandle";
import EditDataDrawerButton from "../Drawer/EditDataDrawerButton";
import { DiagramContext } from "../Diagram/FlowTypes";
import { RootDiagramContext } from "../Diagram/Diagram";

const KnownLossNode = ({ data, id, selected }: NodeProps<DiagramNode>) => {
  const diagramContext: DiagramContext = useContext<DiagramContext>(RootDiagramContext);
  
  const transformString = `translate(0%, 0%) translate(145px, -30px)`;
  const lossInnerStyle: CSSProperties = {
    top: '0',
    right: '-75px',
    position: 'absolute'
  };

  const onEditNode = () => {
    diagramContext.setManageDataId(id);
    diagramContext.setIsDataDrawerOpen(true);
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
        connectionLimit={1}
      />
    </div>
  );
}

export default KnownLossNode;