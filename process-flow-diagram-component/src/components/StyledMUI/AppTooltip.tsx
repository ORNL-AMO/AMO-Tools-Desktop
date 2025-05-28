import * as React from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import HelpIcon from '@mui/icons-material/Help';

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
  },
}));

export const AppTooltip = (props: AppTooltipProps) => {
  return (
    <div style={{alignSelf: 'center'}} >
      <HtmlTooltip
        title={
          <React.Fragment>
            <Typography color="inherit">{props.title}</Typography>
            {props.message}
          </React.Fragment>
        }
      >
        <Button><HelpIcon/></Button>
      </HtmlTooltip>
    </div>
  );
}
export default AppTooltip;

export interface AppTooltipProps {
  title: string
  message: string
 }