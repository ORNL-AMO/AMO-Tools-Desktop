import React, { useCallback } from 'react';
import DownloadButton from '../DownloadButton';

const Sidebar = (props: SidebarProps) => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    // todo programmatically list component types
    <aside>
      <div className="alert alert-info description ">Drag water process components to the pane on the right</div>
      <div className="dndnode waterIntake" onDragStart={(event) => onDragStart(event, 'waterIntake')} draggable>
        Water Intake
      </div>
      <div className="dndnode" onDragStart={(event) => onDragStart(event, 'processUse')} draggable>
        Process Use
      </div>
      <div className="dndnode waterDischarge" onDragStart={(event) => onDragStart(event, 'waterDischarge')} draggable>
        Water Discharge
      </div>
      <div className="dndnode" onDragStart={(event) => onDragStart(event, 'default')} draggable>
        Default
      </div>
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