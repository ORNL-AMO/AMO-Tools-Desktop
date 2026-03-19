import { ConvertValue } from "../../../shared/convert-units/ConvertValue";
import { roundVal } from "../../../shared/helperFunctions";
import { CentrifugalSpecifics } from "../../../shared/models/compressed-air-assessment";
import { Settings } from "../../../shared/models/settings";


export function calculateAirFlow(capacity: number, pointPressure: number, potentialPressure: number, atmosphericPressure: number, settings: Settings): number {
    let maxFullFlowAirFlow: number;
    if (settings.unitsOfMeasure == 'Metric') {
        atmosphericPressure = new ConvertValue(atmosphericPressure, 'kPaa', 'psia').convertedValue;
        capacity = new ConvertValue(capacity, 'm3/min', 'ft3/min').convertedValue;
        pointPressure = new ConvertValue(pointPressure, 'barg', 'psig').convertedValue;
        potentialPressure = new ConvertValue(potentialPressure, 'barg', 'psig').convertedValue;
        maxFullFlowAirFlow = (0.000258 * Math.pow(atmosphericPressure, 3) - 0.0116 * Math.pow(atmosphericPressure, 2) + .176 * atmosphericPressure + 0.09992) * capacity * (1 - 0.00075 * (pointPressure - potentialPressure));
        maxFullFlowAirFlow = new ConvertValue(maxFullFlowAirFlow, 'ft3/min', 'm3/min').convertedValue;
    } else {
        maxFullFlowAirFlow = (0.000258 * Math.pow(atmosphericPressure, 3) - 0.0116 * Math.pow(atmosphericPressure, 2) + .176 * atmosphericPressure + 0.09992) * capacity * (1 - 0.00075 * (pointPressure - potentialPressure));
    }

    return maxFullFlowAirFlow;
}

export function calculatePower(compressorType: number, inputPressure: number, performancePointPressure: number, ratedFullLoadOperatingPressure: number, TotPackageInputPower: number, atmosphericPressure: number, settings: Settings): number {
    let polytropicExponent: number = (1.4 - 1) / 1.4;
    let p1: number;
    let p2: number;
    if (settings.unitsOfMeasure == 'Metric') {
        atmosphericPressure = new ConvertValue(atmosphericPressure, 'kPaa', 'psia').convertedValue;
        inputPressure = new ConvertValue(inputPressure, 'barg', 'psig').convertedValue;
        performancePointPressure = new ConvertValue(performancePointPressure, 'barg', 'psig').convertedValue;
        ratedFullLoadOperatingPressure = new ConvertValue(ratedFullLoadOperatingPressure, 'barg', 'psig').convertedValue;
    }

    if (compressorType == 1 || compressorType == 2 || compressorType == 3) {
        //screw
        p1 = -.0000577 * Math.pow(atmosphericPressure, 3) + 0.000251 * Math.pow(atmosphericPressure, 2) + .0466 * atmosphericPressure + .4442;
        p2 = (performancePointPressure + inputPressure) / inputPressure;
    } else {
        p1 = (atmosphericPressure / inputPressure);
        p2 = (performancePointPressure + atmosphericPressure) / atmosphericPressure;
    }
    let p3: number = Math.pow(((ratedFullLoadOperatingPressure + inputPressure) / inputPressure), polytropicExponent) - 1;
    let maxFullFlowPower: number = p1 * (Math.pow(p2, polytropicExponent) - 1) / p3 * TotPackageInputPower;
    return maxFullFlowPower;
}


export function roundPressureForPresentation(dischargePressure: number, settings: Settings) {
    if (settings.unitsOfMeasure == 'Imperial') {
        dischargePressure = roundVal(dischargePressure, 1);
    } else {
        dischargePressure = roundVal(dischargePressure, 2);
    }
    return dischargePressure;
}

export function roundAirFlowForPresentation(airflow: number, settings: Settings) {
    if (settings.unitsOfMeasure == 'Imperial') {
        airflow = roundVal(airflow, 0);
    } else {
        airflow = roundVal(airflow, 3);
    }
    return airflow;
}

export function roundPowerForPresentation(power: number) {
    power = roundVal(power, 1);
    return power;
}


export function calculateUnloadPointPower(NoLoadPowerFM: number, unloadPointCapacity: number, exponent: number, maxFullFlowPower: number): number {
    let unloadPointPower: number = ((NoLoadPowerFM / 100) * (1 - Math.pow((unloadPointCapacity / 100), exponent)) + Math.pow((unloadPointCapacity / 100), exponent)) * maxFullFlowPower;
    return Number(unloadPointPower.toFixed(1));
}

export function calculateUnloadPointAirFlow(fullLoadRatedCapacity: number, unloadPointCapacity: number): number {
    let unloadPointAirFlow: number = fullLoadRatedCapacity * (unloadPointCapacity / 100);
    return unloadPointAirFlow;
}

export function calculateUnloadPointDischargePressure(maxFullFlowPressure: number, modulatingPressureRange: number, fullLoadAirFlow: number, unloadPointAirFlow: number): number {
    let unloadPointDischargePressure: number = maxFullFlowPressure + (modulatingPressureRange * (1 - (unloadPointAirFlow / fullLoadAirFlow)));
    return unloadPointDischargePressure;
}

export function calculateCentrifugalUnloadPointAirFlow(centrifugalSpecifics: CentrifugalSpecifics, pressure: number): number {
    let C37: number = pressure;
    let C24: number = centrifugalSpecifics.minFullLoadPressure;
    let C22: number = centrifugalSpecifics.maxFullLoadPressure;
    let C23: number = centrifugalSpecifics.maxFullLoadCapacity;
    let C26: number = centrifugalSpecifics.surgeAirflow;
    let result: number = (C37 - (C24 - (((C22 - C24) / (C23 - C26)) * C26))) / ((C22 - C24) / (C23 - C26));
    return result;
}