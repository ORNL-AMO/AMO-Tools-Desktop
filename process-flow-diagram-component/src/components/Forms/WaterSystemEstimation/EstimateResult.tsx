import { Box, Typography, Button, useTheme } from "@mui/material"
import { blue, grey } from "@mui/material/colors"
import FlowDisplayUnit from "../../Diagram/FlowDisplayUnit"
import FlowValueDisplay from "../../Diagram/FlowValueDisplay"
import { useContext } from "react"
import { EstimateSystemContext, EstimateSystemState } from "./EstimateWaterSystem"
import FormActionGroupButtons from "../FormActionGroupButtons"

const EstimateResult = (props: EstimateResultProps) => {
    const theme = useTheme();
    const estimateSystemContext = useContext<EstimateSystemState>(EstimateSystemContext);
    
    const { estimate } = estimateSystemContext;
    const { handleApplyEstimate, handleResetEstimate} = props;

    return (
        <>
        <Box display={'flex'} flexDirection={'column'} justifyContent={'center'} alignItems={'center'}
                sx={{
                    background: blue[50],
                    borderRadius: '8px',
                    border: `1px solid ${theme.palette.primary.dark}`,
                    width: '100%',
                    marginTop: '1rem',
                }}>
                <Box display={'flex'} 
                    flexDirection={'row'} 
                    justifyContent={'space-around'} 
                    alignItems={'center'} 
                    margin={'1rem .5rem'} 
                    width={'100%'}
                    fontSize={'.9rem'}
                    fontWeight={'700'}
                    sx={{ color: theme.palette.primary.dark, fontWeight: '700'}}
                    >
                    <Typography>
                        Gross Water Use
                    </Typography>
                    <Typography fontSize={'1.25rem'}>
                        <span>
                            {estimate !== null? 
                                <FlowValueDisplay flowValue={estimate} />
                                : 0
                            }</span>
                        <FlowDisplayUnit style={{fontSize: '1.25rem'}}/>
                    </Typography>
                </Box>
            </Box>
                <FormActionGroupButtons 
                    cancelContext={{label: 'Reset', handler: handleResetEstimate}}
                    actionContext={{label: 'Apply to Flows', handler: () => handleApplyEstimate(estimate)}}
                    />
        </>
    )
}

export default EstimateResult
export interface EstimateResultProps {
    handleResetEstimate: () => void;
    handleApplyEstimate: (estimate: number) => void;
}