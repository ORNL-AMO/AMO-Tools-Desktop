import { ConvertValue } from "../../../shared/convert-units/ConvertValue";
import { CompressorControls, PerformancePoint } from "../../../shared/models/compressed-air-assessment";
import { Settings } from "../../../shared/models/settings";
import { FullLoadPerformancePoint } from "./FullLoadPerformancePoint";
import { roundAirFlowForPresentation, roundPowerForPresentation, roundPressureForPresentation } from "./performancePointHelpers";

export class TurndownPerformancePoint implements PerformancePoint {


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

    setPoints(compressorControls: CompressorControls, fullLoad: FullLoadPerformancePoint, settings: Settings) {
        //AIRFLOW FIRST. Used in pressure calc
        this.setAirflow(compressorControls, fullLoad, settings);
        this.setPressure(fullLoad, settings);
        this.setPower(fullLoad);
    }

    setPressure(fullLoad: FullLoadPerformancePoint, settings: Settings) {
        if (this.isDefaultPressure) {
            let modPressureRange: number = 6;
            if (settings.unitsOfMeasure == 'Metric') {
                modPressureRange = new ConvertValue(modPressureRange, 'psig', 'barg').convertedValue;
            }
            let defaultPressure: number = fullLoad.dischargePressure + (modPressureRange * (1 - (this.airflow / fullLoad.airflow)));
            this.dischargePressure = roundPressureForPresentation(defaultPressure, settings);
        }
    }

    setAirflow(compressorControls: CompressorControls, fullLoad: FullLoadPerformancePoint, settings: Settings) {
        if (this.isDefaultAirFlow) {
            let defaultAirflow: number = (compressorControls.unloadPointCapacity / 100) * fullLoad.airflow;
            this.airflow = roundAirFlowForPresentation(defaultAirflow, settings);
        }
    }

    setPower(fullLoad: FullLoadPerformancePoint) {
        if (this.isDefaultPower) {
            let LFFM: number = 15;
            let defaultPower: number = ((LFFM / 100) * (1 - Math.pow(this.airflow / fullLoad.airflow, 1)) + Math.pow(this.airflow / fullLoad.airflow, 1)) * fullLoad.power;
            this.power = roundPowerForPresentation(defaultPower);
        }
    }
}