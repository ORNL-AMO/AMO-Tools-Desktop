import { memo, CSSProperties, useState, useContext } from 'react';
import { DiagramNode } from '../../../../src/process-flow-types/shared-process-flow-types';
import { NodeProps, Position } from '@xyflow/react';
import CustomHandle from './CustomHandle';
import DeleteButton from './DeleteButton';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import { FlowContext } from '../Flow';


// export const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
//   <Tooltip {...props} classes={{ popper: className }} />
// ))(({ theme }) => ({
//   [`& .${tooltipClasses.tooltip}`]: {
//     backgroundColor: '#525252',
//     color: '#fff',
//     padding: '.5rem',
//     maxWidth: 300,
//     fontSize: theme.typography.pxToRem(10),
//   },
// }));

// * note the type of NodeProps is automagically accessible via the 'data' property 
const SummingNode = ({ data, id, selected }: NodeProps<DiagramNode>) => {
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const deleteTransformString = `translate(0%, 0%) translate(96px, 0)`;
  const expandTransformString = `translate(0%, 0%) translate(36px, 0)`;

  const [isExpanded, setIsExpanded] = useState(true);

  const onExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const onHover = (
    event: React.MouseEvent<HTMLInputElement>
  ) => {
    setIsHovering(!isHovering);
  };

  const nodeStyle: CSSProperties = {
    height: isExpanded ? undefined : '0',
    padding: isExpanded ? undefined : '0',
    border: isExpanded ? undefined : 'none',
  }

  const collapsedStyle: CSSProperties = {
    top: '0px !important',
    height: '0px !important',
    width: '0px !important',
    visibility: 'hidden'
  }

  return (
    <>
    <div style={nodeStyle} onMouseEnter={onHover} onMouseLeave={onHover}>
      <CustomHandle
        type="target"
        position={Position.Left}
        collapsedStyle={isExpanded ? undefined : collapsedStyle}
        id="a"
      />

      <div style={{
        display: 'flex',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        justifyContent: 'space-around'
      }}>
        <CustomHandle
          type="target"
          position={Position.Top}
          collapsedStyle={isExpanded ? undefined : collapsedStyle}
          id="b"
        />

        <CustomHandle
          type="target"
          position={Position.Top}
          collapsedStyle={isExpanded ? undefined : collapsedStyle}
          id="c"
        />

        <CustomHandle
          type="target"
          position={Position.Top}
          collapsedStyle={isExpanded ? undefined : collapsedStyle}
          id="d"
        />
      </div>

      {/* <HtmlTooltip
      placement={'top'}
      open={!selected && isHovering && !isExpanded}
      title={
        <>
          <Typography color="inherit" fontSize={'.75rem'}>Summing Connector</Typography>
          <div>{"Select the collapsed line and click expand to manage connections"}</div>
        </>
      }
      enterDelay={500} leaveDelay={500}
      slotProps={{
        popper: {
          modifiers: [
            // {
            //   name: 'offset',
            //   options: {
            //     offset: [0, -50],
            //   },
              
            // },
          ],
          disablePortal: true,
        },
      }}
      > */}
      <div className="node-inner-input" style={{ display: isExpanded ? undefined : 'none !important' }}>
        <div
          style={{
            position: 'absolute',
            transform: expandTransformString,
            color: '#fff',
            fontSize: 16,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          {selected &&
            <button className="node-button expand-button hover-highlight" onClick={onExpand}>
              {!isExpanded &&
                <AspectRatioIcon sx={{ width: 'unset', height: 'unset' }} />
              }
              {isExpanded &&
                <CloseFullscreenIcon sx={{ width: 'unset', height: 'unset' }} />
              }
            </button>
          }
        </div>
        <DeleteButton
          id={id}
          data={data}
          selected={selected}
          transformLocation={deleteTransformString} />
        {/* {plantLevelFlow !== undefined && plantLevelFlow !== null &&
        <Chip label={`${plantLevelFlow} Mgal`} 
        variant="outlined" 
        sx={{background: '#fff', borderRadius: '8px', marginTop: '.25rem'}}
        />
    } */}
      </div>
      {/* </HtmlTooltip> */}

        <CustomHandle
          type="source"
          position={Position.Right}
          collapsedStyle={isExpanded ? undefined : collapsedStyle}
          id="e"
        />

        <div
          style={{
            display: 'flex',
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            justifyContent: 'space-around',
          }}
        >
          <CustomHandle
            type="source"
            position={Position.Bottom}
            collapsedStyle={isExpanded ? undefined : collapsedStyle}
            id="f"
          />

          <CustomHandle
            type="source"
            position={Position.Bottom}
            collapsedStyle={isExpanded ? undefined : collapsedStyle}
            id="g"
          />

          <CustomHandle
            type="source"
            position={Position.Bottom}
            collapsedStyle={isExpanded ? undefined : collapsedStyle}
            id="h"
          />
        </div>
    </div>
</>
  );
};


export default memo(SummingNode);
