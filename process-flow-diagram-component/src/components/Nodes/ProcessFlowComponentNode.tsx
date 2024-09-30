import { memo, CSSProperties } from 'react';
import { Handle, Position, NodeProps, useReactFlow, Node } from '@xyflow/react';
import { ProcessFlowNodeType, ProcessFlowPartStyleClass } from '../../../../src/process-flow-types/shared-process-flow-types';
import EditIcon from '@mui/icons-material/Edit';
import { Typography } from '@mui/material';



const targetHandleStyleA: CSSProperties = {};
const sourceHandleStyleB: CSSProperties = {};


// * patches v11 -> v12 typing changes
export type DiagramNode = Node<{name: string,
  processComponentType: ProcessFlowNodeType,
  className: ProcessFlowPartStyleClass,
  isValid: boolean,
  hasAssessmentData: boolean,
  diagramNodeId?: string,
  modifiedDate?: Date,
  splitterTargets?: Array<string>;
  setManageDataId?: (id: string) => void;
  openEditData?: (boolean) => void;
  processComponentContext?: any;}, 'processFlowPart'>;
 
const ProcessFlowComponentNode = ({ data, id, isConnectable, selected}: NodeProps<DiagramNode>) => {

  const onEditNode = () => {
    if (data.setManageDataId && data.openEditData) {
      data.setManageDataId(data.diagramNodeId);
      data.openEditData(true);
    }
  }

  const { setNodes } = useReactFlow();
  const updateNodeName = (event, diagramNodeId) => {
    setNodes((nds) =>
      nds.map((n: Node) => {
        const processFlowPart = n.data;
        if (processFlowPart.diagramNodeId === diagramNodeId) {
          return {
            ...n,
            data: {
              ...processFlowPart,
              name: event.target.value
            }
          };
        }
        return n;
      }),
    );
  };

  const transformString = `translate(0%, 0%) translate(180px, -36px)`;
  const customStyle: CSSProperties = {
    position: 'absolute',
    transform: transformString,
    color: '#fff',
    fontSize: 16,
    pointerEvents: 'all',
  }

  return (
    <>
      <div className="node-inner-input">
        <div
          style={customStyle}
          className="nodrag nopan"
          >
          {selected &&
          <button className="edit-button hover-highlight" onClick={onEditNode}>
            <EditIcon sx={{width: 'unset', height: 'unset'}} />
          </button>
          }
        </div>
        <Typography sx={{width: '100%'}} >
          {data.name}
        </Typography>

      </div>

      <Handle
        type="target"
        position={Position.Left}
        id="a"
        style={targetHandleStyleA}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="b"
        style={sourceHandleStyleB}
      />
    </>
  );
};

export default memo(ProcessFlowComponentNode);
