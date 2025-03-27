import { Box, Divider, FormControl, InputLabel, MenuItem, Popover, Select, Typography } from '@mui/material';
import React, { ReactNode, useRef } from 'react';
import { waterUsingSystemTypeOptions } from '../../../../../src/process-flow-types/shared-process-flow-constants';
import ProcessUseForm from './ProcessUseForm';
import CoolingTowerForm from './CoolingTowerForm';
import BoilerWaterForm from './BoilerWaterForm';
import KitchenRestroomForm from './KitchenRestroomForm';
import LandscapingForm from './LandscapingForm';

export interface EstimateSystemState {
    estimate: number;
    setEstimate: (estimate: number) => void;
    shadowRootRef?: any;
}
export const EstimateSystemContext = React.createContext<EstimateSystemState>(null);

const EstimateWaterSystem = (props: EstimateWaterSystemProps) => {
    const {shadowRootRef} = props;
    const [estimateSystemType, setEstimateSystemType] = React.useState<number>(0);
    const [estimate, setEstimate] = React.useState<number>(0);
    const estimateSystemTypeOptions: Array<{ value: number, display: string }> = waterUsingSystemTypeOptions;
    const formControlRef = useRef(null);

    const handleSystemTypeChange = (systemType: number): void => {
        setEstimateSystemType(systemType);
    }
    const applyEstimate = (estimate: number): void => {
        // todo set flows
        console.log('apply estimate to flows')
    }

    
    let SystemTypeComponent: ReactNode;
    switch (estimateSystemType) {
        case 0:
            SystemTypeComponent = <ProcessUseForm />;
            break;
        case 1:
            SystemTypeComponent = <CoolingTowerForm />;
            break;
        case 2:
            SystemTypeComponent = <BoilerWaterForm />;
            break;
        case 3:
            SystemTypeComponent = <KitchenRestroomForm />;
            break;
        case 4:
            SystemTypeComponent = <LandscapingForm />;
            break;
        default:
            SystemTypeComponent = <span></span>;
            break;
    }

    return (
        <EstimateSystemContext.Provider value={{
            setEstimate: setEstimate,
            estimate: estimate,
            shadowRootRef: shadowRootRef
        }}>
            <Box padding={'1rem'}>
                <FormControl fullWidth size='small' variant='outlined' >
                    <InputLabel id={`estimateSystemType-label`}>
                        System Type
                    </InputLabel>
                    <Select
                        labelId={`estimateSystemType-label`}
                        label={'System Type'}
                        id={'estimateSystemType'}
                        name={'estimateSystemType'}
                        size='small'
                        fullWidth
                        value={estimateSystemType}
                        onChange={(e) => handleSystemTypeChange(Number(e.target.value))}
                        MenuProps={{
                            container: () => {
                                const modalContainer = shadowRootRef.getElementById('modal-container');
                                return modalContainer;
                            },
                            disablePortal: false,
                        }}
                    >
                        {estimateSystemTypeOptions.map((option, index) => {
                            return (
                                <MenuItem key={option.display + '_' + index} value={option.value}>
                                    {option.display}
                                </MenuItem>
                            )
                        })
                        }
                    </Select>
                </FormControl>
                {SystemTypeComponent}
            </Box>
        </EstimateSystemContext.Provider>

    )
}

export default EstimateWaterSystem;
export interface EstimateWaterSystemProps {
    shadowRootRef: any;
}