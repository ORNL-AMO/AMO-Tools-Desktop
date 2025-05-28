import React from "react";
import { Box, Chip, Typography, styled } from "@mui/material";

interface BetaChipProps {
    alertText: string;
    // Optionally, you can add icon/image props here
}

const BetaBadge = styled(Chip)(({ theme }) => ({
    color: "#047334",
    fontSize: 18,
    background: "#fff",
    fontWeight: 600,
    borderRadius: "0.5rem",
    border: "2px solid #047334",
    padding: "0.5rem 0.75rem",
    display: "flex",
    alignItems: "center",
    alignSelf: "center",
    ".MuiChip-label": {
        display: "flex",
        alignItems: "center",
        padding: 0,
    },
}));

const AppIcon = styled("img")({
    width: 22,
    borderRadius: 8,
    marginRight: ".25rem",
});

const InfoIcon = styled("span")({
    fontSize: 22,
    color: "#156739",
    marginRight: "0.25rem",
    display: "flex",
    alignItems: "center",
});

export const BetaChip: React.FC<BetaChipProps> = ({ alertText }) => (
    <BetaBadge
        className="beta-badge-measur badge badge-pill badge-light ml-4"
        // Uncomment and adjust the following lines if you want to use the icon or image
        // icon={<InfoIcon className="fa fa-info-circle" />}
        // avatar={<AppIcon src="assets/images/app-icon.png" alt="App Icon" />}
        label={
            <Typography component="span" sx={{ fontWeight: 600, fontSize: 18 }}>
                {alertText}
            </Typography>
        }
    />
);

