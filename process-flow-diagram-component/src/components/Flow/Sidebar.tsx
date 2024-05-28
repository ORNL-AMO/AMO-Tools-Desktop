import React from 'react';

const Sidebar = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    // todo programmatically list component types
    <aside>
      <div className="alert alert-info description ">Drag water process components to the pane on the right</div>
      <div className="dndnode input" onDragStart={(event) => onDragStart(event, 'Water Intake')} draggable>
        Water Intake
      </div>
      <div className="dndnode" onDragStart={(event) => onDragStart(event, 'Process Use')} draggable>
        Process Use
      </div>
      <div className="dndnode output" onDragStart={(event) => onDragStart(event, 'Water Discharge')} draggable>
        Water Discharge
      </div>
    </aside>
  );
};


export default Sidebar;