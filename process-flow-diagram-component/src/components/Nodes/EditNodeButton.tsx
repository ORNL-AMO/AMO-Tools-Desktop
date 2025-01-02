import { Handle, NodeProps, Position, useHandleConnections } from "@xyflow/react";
import { CSSProperties } from "react";
import { DiagramNode } from "../../../../src/process-flow-types/shared-process-flow-types";
import { Typography } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';

const EditNodeButton = ({ data, selected, transformLocation }: EditNodeButtonProps) => {

    const onEditNode = () => {
      if (data.setManageDataId && data.openEditData) {
        data.setManageDataId(data.diagramNodeId);
        data.openEditData(true);
      }
    }

    const customStyle: CSSProperties = {
      position: 'absolute',
      transform: transformLocation,
      color: '#fff',
      fontSize: 16,
      pointerEvents: 'all',
    }
  
    return (
        <>
            <div
                style={customStyle}
                className="nodrag nopan"
            >
                {selected &&
                    <button className="node-button edit-button hover-highlight" onClick={onEditNode}>
                        <EditIcon sx={{ width: 'unset', height: 'unset' }} />
                    </button>
                }
            </div>
        </>

    );
}
  
  export default EditNodeButton;

  export interface EditNodeButtonProps extends Partial<NodeProps<DiagramNode>>{
    transformLocation: string, 
  }