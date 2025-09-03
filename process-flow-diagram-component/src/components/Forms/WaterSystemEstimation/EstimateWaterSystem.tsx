import { Box, Divider, FormControl, InputLabel, MenuItem, Popover, Select, Typography } from '@mui/material';
import React, { ReactNode, useEffect, useRef } from 'react';
import LandscapingForm from './LandscapingForm';
import { useAppSelector } from '../../../hooks/state';
import { selectCurrentNode } from '../../Diagram/store';
import BoilerWaterForm from './BoilerWaterForm';
import CoolingTowerForm from './CoolingTowerForm';
import KitchenRestroomForm from './KitchenRestroomForm';
import ProcessUseForm from './ProcessUseForm';
import useMeasurToolsSuite from '../../../hooks/useMeasurToolsSuite';

export interface EstimateSystemState {
    estimate: number;
    setEstimate: (estimate: number) => void;
    shadowRootRef?: any;
}
export const EstimateSystemContext = React.createContext<EstimateSystemState>(null);

const EstimateWaterSystem = (props: EstimateWaterSystemProps) => {
    const { shadowRootRef } = props;
    const [estimate, setEstimate] = React.useState<number>(0);
    const selectedComponent = useAppSelector(selectCurrentNode);

    const WASMmodule = useMeasurToolsSuite();
    const waterAssessmentRef = useRef<any>(null);
    const [isWasmReady, setIsWasmReady] = React.useState(false);

    useEffect(() => {
        if (WASMmodule && !waterAssessmentRef.current) {
            waterAssessmentRef.current = new WASMmodule.WaterAssessment();
            setIsWasmReady(true);
        }
        return () => {
            if (waterAssessmentRef.current) {
                waterAssessmentRef.current.delete();
                waterAssessmentRef.current = null;
            }
            setIsWasmReady(false);
        };
    }, [WASMmodule]);

    let SystemTypeComponent: ReactNode;
    if (isWasmReady) {
        switch (selectedComponent.data.systemType) {
            case 0:
                SystemTypeComponent = <ProcessUseForm />;
                break;
            case 1:
                SystemTypeComponent = <CoolingTowerForm WaterAssessmentModule={waterAssessmentRef.current} />;
                break;
            case 2:
                SystemTypeComponent = <BoilerWaterForm WaterAssessmentModule={waterAssessmentRef.current} />;
                break;
            case 3:
                SystemTypeComponent = <KitchenRestroomForm WaterAssessmentModule={waterAssessmentRef.current} />;
                break;
            case 4:
                SystemTypeComponent = <LandscapingForm WaterAssessmentModule={waterAssessmentRef.current} />;
                break;
            default:
                SystemTypeComponent = <span></span>;
                break;
        }
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
    );
}

export default EstimateWaterSystem;
export interface EstimateWaterSystemProps {
    shadowRootRef: any;
}

export interface WaterAssessmentModuleConsumer {
    WaterAssessmentModule: any;
}