import { NodeProps, useReactFlow } from "@xyflow/react";
import { CSSProperties } from "react";
import { DiagramNode } from "../../../../src/process-flow-types/shared-process-flow-types";
import DeleteIcon from '@mui/icons-material/Delete';

const DeleteButton = ({ id, data, selected, transformLocation }: DeleteButtonProps) => {
    const {setNodes, setEdges} = useReactFlow();
    const onDeleteNode = () => {
        // todo integrate warning
        setNodes((nodes) => nodes.filter((nd) => nd.id !== id));
        setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
    };

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
                    <button className="node-button hover-highlight" onClick={onDeleteNode}>
                        <DeleteIcon sx={{ width: 'unset', height: 'unset' }} />
                    </button>
                }
            </div>
        </>

    );
}
  
  export default DeleteButton;

  export interface DeleteButtonProps extends Partial<NodeProps<DiagramNode>>{
    transformLocation: string, 
  }