import React, { CSSProperties, Fragment } from 'react';
import { Handle, HandleType, Position, useHandleConnections } from '@xyflow/react';

const mainTargetHandleStyle: CSSProperties = {
    left: '-5px',
    height: '20px',
    width: '10px',
    borderRadius: '2px 0 0 2px',
    pointerEvents: 'all'
  }
  
  const mainSourceHandleStyle: CSSProperties = {
    right: '-5px',
    height: '20px',
    width: '10px',
    borderRadius: '0 2px 2px 0',
    pointerEvents: 'all'
  }
  
  const topTargetHandleStyle: CSSProperties = {
    top: '-15px',
    height: '20px',
    width: '10px',
    transform: 'rotate(90deg)',
    borderRadius: '2px 0 0 2px',
    left: 0,
    position: 'relative',
    pointerEvents: 'all'
  }
  
  const bottomSourceHandleStyle: CSSProperties = {
    bottom: '-15px',
    height: '20px',
    width: '10px',
    transform: 'rotate(90deg)',
    borderRadius: '0 2px 2px 0',
    left: 0,
    position: 'relative',
    pointerEvents: 'all'
  };

  
const CustomHandle = (props: HandleProps) => {
    const { type, position, id, connectionLimit } = props;
    let { className } = props;
    const maxConnections = connectionLimit === undefined? 2 : connectionLimit;
    const connections = useHandleConnections({
        type: props.type,
        id: id,
    });
    const blockConnections: boolean = connections.length >= maxConnections;

    let style: CSSProperties = {};
    if (!className) {
    switch (position) {
        case Position.Left:
            style = mainTargetHandleStyle;
            break;
        case Position.Top:
            style = topTargetHandleStyle;
            break;
        case Position.Right:
            style = mainSourceHandleStyle;
            break;
        case Position.Bottom:
            style = bottomSourceHandleStyle;
            break;
        default:
            style = mainSourceHandleStyle;
            break;
      }

        className = 'custom-handle source-handle'
        if (type === 'target') {
          className = 'custom-handle target-handle';
        }
  
        if (blockConnections) {
          className += ' limit-connection';
        }
    }


  return (
      <Handle
          type={type}
          className={className}
          position={position}
          id={id}
          style={style}
          isConnectable={!blockConnections}
          />
        // {blockConnections && 
        //   <BlockIcon className="block-connection-icon"/>
        // }
  );
};

export default CustomHandle;

export interface HandleProps {
    type: HandleType,
    position: Position,
    className?: string,
    connectionLimit?: number,
    id: string,
}