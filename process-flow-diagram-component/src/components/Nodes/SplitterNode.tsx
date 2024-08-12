import { memo, FC, CSSProperties, useState, useRef, useEffect } from 'react';
import { ProcessFlowPart, getNewIdString } from '../../../../src/process-flow-types/shared-process-flow-types';
import { DiagramNode } from './ProcessFlowComponentNode';
import { Edge, Handle, Node, NodeProps, NodeResizer, Position, useReactFlow, useUpdateNodeInternals } from '@xyflow/react';


// * note the type of NodeProps is automagically accessible via the 'data' property 
const SplitterNode= (id, { data }: NodeProps<DiagramNode>) => {
  const updateNodeInternals = useUpdateNodeInternals();
  const { setNodes, setEdges } = useReactFlow();
  
  // todo accessing .data , should just treat as processflowpart?
  const splitterRef = useRef(null);
  const initialNodes = data.splitterTargets? data.splitterTargets : [getNewIdString()];
  const [showInnerNode, setShowInnerNode] = useState(true);
  const [targetHandles, setTargetHandles] = useState<Array<string>>(initialNodes);

  const updateNodes = () => {
    updateNodeInternals(id);
    setNodes((nds: Node[]) => {
      return nds.map((n: Node) => {
        if (n.id === id) {
          return {
            ...n,
            data: {
              splitterTargets: targetHandles
            }
          };
        }
        return n;
      })},
    );
  };

  const removeConnectedEdge = (connectedEdgeId) => {
    setEdges((eds) =>
      eds.map((e: Edge) => {
        if (e.targetHandle !== connectedEdgeId) {
          return e;
        }
      }).filter(Boolean),
    );
  };


  const handleSubtractTarget = () => {
    if (targetHandles.length > 1) {
      let targetHandleId: string = targetHandles[targetHandles.length - 1];
      targetHandles.splice(targetHandles.length - 1, 1);
      setTargetHandles([...targetHandles]);
      removeConnectedEdge(targetHandleId);
      updateNodes();
    }
  }

  const handleAddTarget = () => {
    targetHandles.push(getNewIdString());
    setTargetHandles([...targetHandles]);
    updateNodes();
  }

  const checkSplitterHeight = (height) => {
    if (height < 50) {
      setShowInnerNode(false);
    } else {
      setShowInnerNode(true);
    }
  }

  const handleOnResize = (event, params) => {
    checkSplitterHeight(params.height)
  }

  useEffect(() => {
    if (splitterRef) {
      checkSplitterHeight(splitterRef.current.offsetHeight)
    }
  }, [splitterRef]);


  return (
    <>
      <div ref={splitterRef} className="node-inner-input junction-circle"
        style={{
          display: 'flex',
          justifyContent: 'center',
        }}>
        {showInnerNode &&
          <>
            <button onClick={handleSubtractTarget}>
              -1
            </button>
            <button onClick={handleAddTarget}>
              +1
            </button>
          </>
        }
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: 0,
          width: '100%',
          justifyContent: 'space-evenly',
        }}
      >
        {targetHandles.map((handleId, index) => {
          return (
            <Handle
              key={handleId}
              style={{ position: 'relative', left: index, transform: 'none' }}
              id={handleId}
              type="target"
              position={Position.Top}
            />
          )
        })
        }
      </div>
      <NodeResizer
      onResize={(event, params) => handleOnResize(event, params)}
      />
    </>


  );
};

function ResizeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="#000000"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ position: 'absolute', right: 5, bottom: 5 }}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <polyline points="16 20 20 20 20 16" />
      <line x1="14" y1="14" x2="20" y2="20" />
      <polyline points="8 4 4 4 4 8" />
      <line x1="4" y1="4" x2="10" y2="10" />
    </svg>
  );
}

export default memo(SplitterNode);
