import { max } from "lodash";
import { CentrifugalSpecifics, CompressorControls, CompressorNameplateData, DesignDetails, PerformancePoint } from "../../../shared/models/compressed-air-assessment";
import { Settings } from "../../../shared/models/settings";
import { FullLoadPerformancePoint } from "./FullLoadPerformancePoint";
import { MaxFullFlowPerformancePoint } from "./MaxFullFlowPerformancePoint";
import { calculateCentrifugalUnloadPointAirFlow, calculateUnloadPointAirFlow, calculateUnloadPointDischargePressure, calculateUnloadPointPower, roundAirFlowForPresentation, roundPowerForPresentation, roundPressureForPresentation } from "./performancePointHelpers";

export class UnloadPointPerformancePoint implements PerformancePoint {


    dischargePressure: number;
    isDefaultPressure: boolean;
    airflow: number;
    isDefaultAirFlow: boolean;
    power: number;
    isDefaultPower: boolean;
    constructor(performancePoint: PerformancePoint) {
        this.dischargePressure = performancePoint.dischargePressure;
        this.isDefaultPressure = performancePoint.isDefaultPressure;
        this.airflow = performancePoint.airflow
        this.isDefaultAirFlow = performancePoint.isDefaultAirFlow;
        this.power = performancePoint.power;
        this.isDefaultPower = performancePoint.isDefaultPower;
    }

    setPoints(nameplateData: CompressorNameplateData, designDetails: DesignDetails, centrifugalSpecifics: CentrifugalSpecifics, compressorControls: CompressorControls, maxFullFlow: MaxFullFlowPerformancePoint, fullLoad: FullLoadPerformancePoint, unloadPoint: UnloadPointPerformancePoint, settings: Settings) {
        if (nameplateData.compressorType == 6) {
            this.setPressure(nameplateData, designDetails, maxFullFlow, fullLoad, unloadPoint, settings);
            this.setAirFlow(nameplateData, centrifugalSpecifics, compressorControls, unloadPoint, fullLoad, settings);
        } else {
            //non centrifugal calcs need airflow calc first, discharge pressure uses value
            this.setAirFlow(nameplateData, centrifugalSpecifics, compressorControls, unloadPoint, fullLoad, settings);
            this.setPressure(nameplateData, designDetails, maxFullFlow, fullLoad, unloadPoint, settings);
        }
        this.setPower(nameplateData, designDetails, compressorControls, unloadPoint, fullLoad, maxFullFlow);
    }

    setPressure(nameplateData: CompressorNameplateData, designDetails: DesignDetails, maxFullFlow: MaxFullFlowPerformancePoint, fullLoad: FullLoadPerformancePoint, unloadPoint: UnloadPointPerformancePoint, settings: Settings) {
        if (this.isDefaultPressure) {
            let defaultPressure: number;
            if (nameplateData.compressorType == 6) {
                //centrifugal
                defaultPressure = maxFullFlow.dischargePressure;
            } else {
                defaultPressure = calculateUnloadPointDischargePressure(maxFullFlow.dischargePressure, designDetails.modulatingPressureRange, fullLoad.airflow, unloadPoint.airflow);
            }
            this.dischargePressure = roundPressureForPresentation(defaultPressure, settings);
        }
    }

    setAirFlow(nameplateData: CompressorNameplateData, centrifugalSpecifics: CentrifugalSpecifics, compressorControls: CompressorControls, unloadPoint: UnloadPointPerformancePoint, fullLoad: FullLoadPerformancePoint, settings: Settings) {
        if (this.isDefaultAirFlow) {
            let defaultAirflow: number;
            if (nameplateData.compressorType == 6) {
                //centrifugal
                defaultAirflow = calculateCentrifugalUnloadPointAirFlow(centrifugalSpecifics, unloadPoint.dischargePressure);
            } else {
                defaultAirflow = calculateUnloadPointAirFlow(fullLoad.airflow, compressorControls.unloadPointCapacity);
            }
            this.airflow = roundAirFlowForPresentation(defaultAirflow, settings);
        }
    }

    setPower(nameplateData: CompressorNameplateData, designDetails: DesignDetails, compressorControls: CompressorControls, unloadPoint: UnloadPointPerformancePoint, fullLoad: FullLoadPerformancePoint, maxFullFlow: MaxFullFlowPerformancePoint) {
        if (this.isDefaultPower) {
            //centrifugal
            let defaultPower: number;
            if (nameplateData.compressorType == 6) {
                let unloadPointCapacity: number = (unloadPoint.airflow / maxFullFlow.airflow) * 100;
                defaultPower = calculateUnloadPointPower(designDetails.noLoadPowerFM, unloadPointCapacity, 1, maxFullFlow.power);
            } else if (compressorControls.controlType == 2) {
                //with unloading
                let unloadPointCapacity: number = (unloadPoint.airflow / fullLoad.airflow) * 100;
                defaultPower = calculateUnloadPointPower(designDetails.noLoadPowerFM, unloadPointCapacity, 1, maxFullFlow.power);
            } else if (compressorControls.controlType == 3) {
                //variable displacement
                defaultPower = calculateUnloadPointPower(designDetails.noLoadPowerFM, compressorControls.unloadPointCapacity, 2, maxFullFlow.power);
            }
            this.power = roundPowerForPresentation(defaultPower);
        }
    }

    setDefaultsOn(){
        this.isDefaultAirFlow = true;
        this.isDefaultPower = true;
        this.isDefaultPressure = true;
    }
}