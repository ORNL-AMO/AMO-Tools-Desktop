import { CentrifugalSpecifics, CompressorNameplateData, DesignDetails, PerformancePoint } from "../../../shared/models/compressed-air-assessment";
import * as regression from 'regression';
import { Settings } from "../../../shared/models/settings";
import { calculateAirFlow, calculatePower, roundAirFlowForPresentation, roundPowerForPresentation } from "./performancePointHelpers";

export class FullLoadPerformancePoint implements PerformancePoint {


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


    setPoints(nameplateData: CompressorNameplateData, centrifugalSpecifics: CentrifugalSpecifics, designDetails: DesignDetails, atmosphericPressure: number, settings: Settings) {
        this.setDischargePressure(nameplateData);
        this.setAirFlow(nameplateData, centrifugalSpecifics, atmosphericPressure, settings);
        this.setPower(nameplateData, designDetails, atmosphericPressure, settings);

        // this.dischargePressure = this.getFullLoadDischargePressure(selectedCompressor, this.isDefaultPressure, settings);
        // this.airflow = this.getFullLoadAirFlow(selectedCompressor, this.isDefaultAirFlow, atmosphericPressure, settings);
        // this.power = this.getFullLoadPower(selectedCompressor, this.isDefaultPower, atmosphericPressure, settings);
    }

    setDischargePressure(nameplateData: CompressorNameplateData) {
        if (this.isDefaultPressure) {
            this.dischargePressure = nameplateData.fullLoadOperatingPressure;
        }
    }

    setAirFlow(nameplateData: CompressorNameplateData, centrifugalSpecifics: CentrifugalSpecifics, atmosphericPressure: number, settings: Settings) {
        if (this.isDefaultAirFlow) {
            let defaultAirflow: number;
            if (nameplateData.compressorType == 6) {
                //centrifugal
                //y1 = MaxPressSurgeFlow, x1 = MaxSurgePressure
                //y2 = RatedCapacity, x2 = RatedPressure
                //y3 = MinPressureStonewallFlow, x3 = MinStonewallPressure
                let regressionData: Array<Array<number>> = [
                    [centrifugalSpecifics.maxFullLoadPressure, centrifugalSpecifics.maxFullLoadCapacity],
                    [nameplateData.fullLoadOperatingPressure, nameplateData.fullLoadRatedCapacity],
                    [centrifugalSpecifics.minFullLoadPressure, centrifugalSpecifics.minFullLoadCapacity]
                ];
                let regressionEquation = regression.polynomial(regressionData, { order: 2, precision: 50 });
                let regressionValue = regressionEquation.predict(this.dischargePressure);
                defaultAirflow = regressionValue[1];
            } else {
                defaultAirflow = calculateAirFlow(nameplateData.fullLoadRatedCapacity, this.dischargePressure, nameplateData.fullLoadOperatingPressure, atmosphericPressure, settings);
            }
            this.airflow = roundAirFlowForPresentation(defaultAirflow, settings);
        }
    }

    setPower(nameplateData: CompressorNameplateData, designDetails: DesignDetails, atmosphericPressure: number, settings: Settings) {
        if (this.isDefaultPower) {
            let defaultPower: number;
            if (nameplateData.compressorType == 6) {
                //centrifugal
                defaultPower = nameplateData.totalPackageInputPower;
            } else {
                defaultPower = calculatePower(nameplateData.compressorType, designDetails.inputPressure, this.dischargePressure, nameplateData.fullLoadOperatingPressure, nameplateData.totalPackageInputPower, atmosphericPressure, settings);
            }
            this.power = roundPowerForPresentation(defaultPower);
        }
    }
}