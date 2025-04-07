import { Box, Divider, FormControl, InputLabel, MenuItem, Popover, Select, Typography } from '@mui/material';
import React, { ReactNode, useRef } from 'react';
import LandscapingForm from './LandscapingForm';
import { useAppSelector } from '../../../hooks/state';
import { selectCurrentNode } from '../../Diagram/store';
import BoilerWaterForm from './BoilerWaterForm';
import CoolingTowerForm from './CoolingTowerForm';
import KitchenRestroomForm from './KitchenRestroomForm';
import ProcessUseForm from './ProcessUseForm';

export interface EstimateSystemState {
    estimate: number;
    setEstimate: (estimate: number) => void;
    shadowRootRef?: any;
}
export const EstimateSystemContext = React.createContext<EstimateSystemState>(null);

const EstimateWaterSystem = (props: EstimateWaterSystemProps) => {
    const {shadowRootRef} = props;
    const [estimate, setEstimate] = React.useState<number>(0);
    const selectedComponent = useAppSelector(selectCurrentNode);

    const applyEstimate = (estimate: number): void => {
        // todo set flows
        console.log('apply estimate to flows')
    }

    
    let SystemTypeComponent: ReactNode;
    switch (selectedComponent.data.systemType) {
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
                {SystemTypeComponent}
            </Box>
        </EstimateSystemContext.Provider>

    )
}

export default EstimateWaterSystem;
export interface EstimateWaterSystemProps {
    shadowRootRef: any;
}