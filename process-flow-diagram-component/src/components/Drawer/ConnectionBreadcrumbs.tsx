import { Breadcrumbs, Typography } from "@mui/material";
import React from "react";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { ProcessFlowPart } from "process-flow-lib";


export const ConnectionBreadcrumbs = (props: ConnectionBreadcrumbsProps) => {
    const relationships = [
        <Typography key="1" color="text.primary" fontSize={'.75rem'}>
          {props.source.name}
        </Typography>,
        <Typography key="2" color="text.primary" fontSize={'.75rem'}>
          {props.target.name}
        </Typography>
      ]
    return (
        <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
      >
        {relationships}
      </Breadcrumbs>
    );
};


export default ConnectionBreadcrumbs;

export interface ConnectionBreadcrumbsProps {
    source: ProcessFlowPart;
    target: ProcessFlowPart;
}