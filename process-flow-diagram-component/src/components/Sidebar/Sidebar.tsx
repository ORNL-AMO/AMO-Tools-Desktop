import React, { useCallback } from 'react';
import DownloadButton from '../DownloadButton';
import { ProcessFlowPart, processFlowDiagramParts } from '../../../../src/process-flow-types/shared-process-flow-types';

const Sidebar = (props: SidebarProps) => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const processFlowParts: ProcessFlowPart[] = [...processFlowDiagramParts];

  return (
    <aside>
      <div className="alert alert-info description ">Drag water process components to the pane on the right</div>
      {processFlowParts.map((part: ProcessFlowPart) => {
        return (
          <div key={part.processComponentType} className={`dndnode ${part.processComponentType}`} onDragStart={(event) => onDragStart(event, part.processComponentType)} draggable>
              {part.name}
            </div>
        );
      })}

      <div className="sidebar-actions">
        <label>
          <input
            type="checkbox"
            onChange={(e) => props.minimapVisibleCallback(e.target.checked)}
          />
          <span>Show Minimap</span>
        </label>
        <label>
          <input
            type="checkbox"
            onChange={(e) => props.controlsVisibleCallback(e.target.checked)}
          />
          <span>Show Controls</span>
        </label>

        <div className="sidebar-action-buttons">
          <DownloadButton shadowRoot={props.shadowRoot} />
        </div>
      </div>
    </aside>
  );
};


export default Sidebar;

export interface SidebarProps {
  minimapVisibleCallback: (enabled: boolean) => void;
  controlsVisibleCallback: (enabled: boolean) => void;
  shadowRoot;
}