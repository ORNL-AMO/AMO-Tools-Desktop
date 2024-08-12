import React, { useCallback, useState } from 'react';
import { ProcessFlowPart } from '../../../../src/process-flow-types/shared-process-flow-types';
import { useReactFlow } from '@xyflow/react';

export function NodeContextMenu({
  id,
  processFlowPartData,
  top,
  left,
  right,
  bottom,
  ...props
}: NodeContextMenuProps) {
  const { setNodes, setEdges } = useReactFlow();
  
  const onDeleteNode = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setEdges((edges) => edges.filter((edge) => edge.source !== id));
  }, [id, setNodes, setEdges]);
  
  return (
    <>
    <div
      style={{ top, left, right, bottom }}
      className="context-menu"
      {...props}
    >
      <p style={{ margin: '0.5em', fontWeight: 'bold', fontSize: '.75rem'}}>{processFlowPartData.name}</p>
      <button onClick={onDeleteNode}><small>Delete</small></button>
    </div>
    </>
  );
}


export interface NodeContextMenuProps {
  id: string,
  processFlowPartData: ProcessFlowPart,
  top: number,
  left: number,
  right: number,
  bottom: number
}

