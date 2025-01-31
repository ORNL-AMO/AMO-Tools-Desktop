import { CompressorControls, CompressorNameplateData, DesignDetails, PerformancePoint } from "../../../shared/models/compressed-air-assessment";
import { Settings } from "../../../shared/models/settings";
import { FullLoadPerformancePoint } from "./FullLoadPerformancePoint";
import { roundPowerForPresentation, roundPressureForPresentation } from "./performancePointHelpers";

export class NoLoadPerformancePoint implements PerformancePoint {


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

    setPoints(nameplateData: CompressorNameplateData, compressorControls: CompressorControls, designDetails: DesignDetails, fullLoad: FullLoadPerformancePoint, settings: Settings) {
        this.setPressure(nameplateData, compressorControls, designDetails, fullLoad, settings);
        this.setAirFlow();
        this.setPower(nameplateData, compressorControls, designDetails, fullLoad);
        // selectedCompressor.performancePoints.noLoad.dischargePressure = this.getNoLoadPressure(selectedCompressor, selectedCompressor.performancePoints.noLoad.isDefaultPressure, settings);
        // selectedCompressor.performancePoints.noLoad.airflow = this.getNoLoadAirFlow(selectedCompressor, selectedCompressor.performancePoints.noLoad.isDefaultAirFlow);
        // selectedCompressor.performancePoints.noLoad.power = this.getNoLoadPower(selectedCompressor, selectedCompressor.performancePoints.noLoad.isDefaultPower);
        // return selectedCompressor.performancePoints.noLoad;
    }

    setPressure(nameplateData: CompressorNameplateData, compressorControls: CompressorControls, designDetails: DesignDetails, fullLoad: FullLoadPerformancePoint, settings: Settings) {
        if (this.isDefaultPressure) {
            let defaultPressure: number;
            if (nameplateData.compressorType == 6 || compressorControls.controlType == 6
                || nameplateData.compressorType == 4 || nameplateData.compressorType == 5 ||
                nameplateData.compressorType == 3) {
                //centrifugal or start/stop or reciprocating or lubricant free
                defaultPressure = 0
            } else if (compressorControls.controlType == 1) {
                //without unloading
                defaultPressure = fullLoad.dischargePressure + designDetails.modulatingPressureRange;
            } else {
                //rest of options
                defaultPressure = compressorControls.unloadSumpPressure;
            }
            this.dischargePressure = roundPressureForPresentation(defaultPressure, settings);
        }
    }

    setAirFlow() {
        if (this.isDefaultAirFlow) {
            this.airflow = 0;
        }
    }

    setPower(nameplateData: CompressorNameplateData, compressorControls: CompressorControls, designDetails: DesignDetails, fullLoad: FullLoadPerformancePoint) {
        if (this.isDefaultPower) {
            let defaultPower: number;
            if (compressorControls.controlType == 1) {
                //without unloading
                defaultPower = this.calculateNoLoadPowerWithoutUnloading(designDetails, fullLoad);
            } else if (compressorControls.controlType == 6) {
                //start stop
                defaultPower = 0
            } else {
                defaultPower = this.calculateNoLoadPower(designDetails.noLoadPowerUL, nameplateData.totalPackageInputPower, designDetails.designEfficiency);
            }
            this.power = roundPowerForPresentation(defaultPower);
        }
    }

    calculateNoLoadPower(NoLoadPowerUL: number, TotPackageInputPower: number, designEfficiency: number): number {
        if (NoLoadPowerUL < 25) {
            let noLoadPower: number = NoLoadPowerUL * TotPackageInputPower / (NoLoadPowerUL / (NoLoadPowerUL - 25 + 2521.834 / designEfficiency) / designEfficiency) / 10000;
            return noLoadPower;
        } else {
            let noLoadPower: number = NoLoadPowerUL * TotPackageInputPower / 100;
            return noLoadPower;
        }
    }

    //Without unloading
    calculateNoLoadPowerWithoutUnloading(designDetails: DesignDetails, fullLoad: FullLoadPerformancePoint): number {
        return designDetails.noLoadPowerFM / 100 * fullLoad.power;
    }
}