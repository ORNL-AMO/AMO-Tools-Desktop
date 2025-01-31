import { CentrifugalSpecifics, CompressorNameplateData, DesignDetails, PerformancePoint } from "../../../shared/models/compressed-air-assessment";
import { Settings } from "../../../shared/models/settings";
import { FullLoadPerformancePoint } from "./FullLoadPerformancePoint";
import { calculateAirFlow, calculatePower, roundAirFlowForPresentation, roundPowerForPresentation, roundPressureForPresentation } from "./performancePointHelpers";
import * as regression from 'regression';

export class MaxFullFlowPerformancePoint implements PerformancePoint {


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

    setPoints(designDetails: DesignDetails, nameplateData: CompressorNameplateData, fullLoad: FullLoadPerformancePoint, maxFullFlow: MaxFullFlowPerformancePoint, centrifugalSpecifics: CentrifugalSpecifics, atmosphericPressure: number, settings: Settings) {
        this.setPressure(designDetails, settings);
        this.setAirFlow(nameplateData, fullLoad, maxFullFlow, centrifugalSpecifics, atmosphericPressure, settings);
        this.setPower(nameplateData, designDetails, fullLoad, maxFullFlow, atmosphericPressure, settings);
        // selectedCompressor.performancePoints.maxFullFlow.dischargePressure = this.getMaxFullFlowPressure(selectedCompressor, selectedCompressor.performancePoints.maxFullFlow.isDefaultPressure, settings);
        // selectedCompressor.performancePoints.maxFullFlow.airflow = this.getMaxFullFlowAirFlow(selectedCompressor, selectedCompressor.performancePoints.maxFullFlow.isDefaultAirFlow, atmosphericPressure, settings);
        // selectedCompressor.performancePoints.maxFullFlow.power = this.getMaxFullFlowPower(selectedCompressor, selectedCompressor.performancePoints.maxFullFlow.isDefaultPower, atmosphericPressure, settings);
        // return selectedCompressor.performancePoints.maxFullFlow;
    }

    setPressure(designDetails: DesignDetails, settings: Settings) {
        if (this.isDefaultPressure) {
            //all control types the same
            this.dischargePressure = roundPressureForPresentation(designDetails.maxFullFlowPressure, settings);
        }
    }

    setAirFlow(nameplateData: CompressorNameplateData, fullLoad: FullLoadPerformancePoint, maxFullFlow: MaxFullFlowPerformancePoint, centrifugalSpecifics: CentrifugalSpecifics, atmosphericPressure: number, settings: Settings) {
        if (this.isDefaultAirFlow) {
            let defaultAirflow: number;
            if (nameplateData.compressorType != 6) {
                //non centrifugal
                defaultAirflow = calculateAirFlow(fullLoad.airflow, maxFullFlow.dischargePressure, fullLoad.dischargePressure, atmosphericPressure, settings);
            } else {
                //centrifugal
                defaultAirflow = this.calculateCentrifugalAirflow(centrifugalSpecifics, nameplateData, maxFullFlow);
                // defaultAirflow = selectedCompressor.performancePoints.fullLoad.airflow;
            }
            this.airflow = roundAirFlowForPresentation(defaultAirflow, settings);
        }
    }

    setPower(nameplateData: CompressorNameplateData, designDetails: DesignDetails, fullLoad: FullLoadPerformancePoint, maxFullFlow: MaxFullFlowPerformancePoint, atmosphericPressure: number, settings: Settings) {
        if (this.isDefaultAirFlow) {
            let defaultPower: number;
            if (nameplateData.compressorType != 6) {
                //non centrifugal
                defaultPower = calculatePower(nameplateData.compressorType, designDetails.inputPressure, maxFullFlow.dischargePressure, fullLoad.dischargePressure, fullLoad.power, atmosphericPressure, settings);
            } else {
                //centrifugal
                defaultPower = fullLoad.power;
            }
            this.airflow = roundPowerForPresentation(defaultPower);
        }
    }


    calculateCentrifugalAirflow(centrifugalSpecifics: CentrifugalSpecifics, nameplateData: CompressorNameplateData, maxFullFlow: MaxFullFlowPerformancePoint): number {
        //y: MaxSurgePressure, x: MaxPressureSurgeFlow
        let maxSurgePoints: Array<number> = [centrifugalSpecifics.maxFullLoadPressure, centrifugalSpecifics.maxFullLoadCapacity];
        //y: RatedPressure, x: RatedCapacity
        let ratedPoints: Array<number> = [nameplateData.fullLoadOperatingPressure, nameplateData.fullLoadRatedCapacity];
        //y: MinStonewallPressure, x: MinPressureStonewallFlow
        let minSurgePoints: Array<number> = [centrifugalSpecifics.minFullLoadPressure, centrifugalSpecifics.minFullLoadCapacity];
        let regressionData: Array<Array<number>> = [maxSurgePoints, ratedPoints, minSurgePoints];
        let result = regression.polynomial(regressionData, { precision: 5 });
        let prediction = result.predict(maxFullFlow.dischargePressure);
        //prediction = [x (dischargePressure), y(airflow)];
        return prediction[1];
    }
}