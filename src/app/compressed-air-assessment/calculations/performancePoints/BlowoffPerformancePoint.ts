import { CentrifugalSpecifics, DesignDetails, PerformancePoint } from "../../../shared/models/compressed-air-assessment";
import { Settings } from "../../../shared/models/settings";
import { FullLoadPerformancePoint } from "./FullLoadPerformancePoint";
import { calculateCentrifugalUnloadPointAirFlow, calculateUnloadPointPower, roundAirFlowForPresentation, roundPowerForPresentation, roundPressureForPresentation } from "./performancePointHelpers";

export class BlowoffPerformancePoint implements PerformancePoint {


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

    //inlet butterfly modulation with blowoff
    setPoints(designDetails: DesignDetails, centrifugalSpecifics: CentrifugalSpecifics, fullLoad: FullLoadPerformancePoint, settings: Settings) {
        //blowoff
        this.setDischargePressure(fullLoad, settings);
        this.setAirFlow(centrifugalSpecifics, settings);
        this.setPower(fullLoad, designDetails)
    }

    setDischargePressure(fullLoad: FullLoadPerformancePoint, settings: Settings) {
        if (this.isDefaultPressure) {
            this.dischargePressure = roundPressureForPresentation(fullLoad.dischargePressure, settings);
        }
    }

    setAirFlow(centrifugalSpecifics: CentrifugalSpecifics, settings: Settings) {
        if (this.isDefaultAirFlow) {
            let defaultAirflow: number = calculateCentrifugalUnloadPointAirFlow(centrifugalSpecifics, this.dischargePressure);
            this.airflow = roundAirFlowForPresentation(defaultAirflow, settings);
        }
    }

    setPower(fullLoad: FullLoadPerformancePoint, designDetails: DesignDetails) {
        if (this.isDefaultPower) {
            let unloadPointCapacity: number = (this.airflow / fullLoad.airflow) * 100;
            let defaultPower: number = calculateUnloadPointPower(designDetails.noLoadPowerFM, unloadPointCapacity, 1, fullLoad.power);
            this.power = roundPowerForPresentation(defaultPower);
        }
    }
    
    setDefaultsOn(){
        this.isDefaultAirFlow = true;
        this.isDefaultPower = true;
        this.isDefaultPressure = true;
    }

}