import { styled, Tooltip, tooltipClasses, TooltipProps } from "@mui/material";

const SmallTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        padding: '.5rem',
        fontSize: 14,
    },
}));

export default SmallTooltip;