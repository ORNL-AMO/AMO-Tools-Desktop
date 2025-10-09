import { isNull, isUndefined } from "lodash";
import { roundVal } from "../../shared/helperFunctions";
import { CompressedAirAssessment, CompressorInventoryItem, SystemProfileSetup } from "../../shared/models/compressed-air-assessment";
import { AirflowValidation } from "./CompressedAirAssessmentValidation";

export function checkIsPowerValid(power: number, currentCompressor: CompressorInventoryItem): string {
    let motorServiceFactor: number = currentCompressor.nameplateData.totalPackageInputPower * currentCompressor.designDetails.serviceFactor;
    motorServiceFactor = roundVal(motorServiceFactor, 2);
    if (power > motorServiceFactor) {
        return `Power exceeds Motor Service Factor (${motorServiceFactor})`;
    } else if (checkIsInvalidNumber(power)) {
        return `Power must be 0 or greater`;
    }
    return null;
}

export function checkIsAirflowValid(airflow: number, currentCompressor: CompressorInventoryItem): AirflowValidation {
    let airFlowValidation: AirflowValidation = {
        airFlowValid: null,
        airFlowWarning: null,
    }
    let airFlowLimit = currentCompressor.nameplateData.fullLoadRatedCapacity * 1.50;
    if (airflow >= airFlowLimit) {
        airFlowValidation.airFlowWarning = `Airflow should be less than 150% of Rated Flow (${airFlowLimit})`;
    } else if (checkIsInvalidNumber(airflow)) {
        airFlowValidation.airFlowWarning = `Airflow must be 0 or greater`;
    }
    return airFlowValidation;
}

export function checkPercentCapacityValid(percentValue: number): string {
    if (checkIsInvalidNumber(percentValue)) {
        return 'Percent must be 0 or greater'
    } else if (percentValue > 150) {
        return 'Percent must be less than 150%';
    }
    return null;
}

export function checkPercentPowerValid(percentValue: number, compressor: CompressorInventoryItem): string {
    if (checkIsInvalidNumber(percentValue)) {
        return 'Percent must be 0 or greater'
    } else {
        let serviceFactorPercent: number = 100 * compressor.designDetails.serviceFactor;
        if (serviceFactorPercent < percentValue) {
            return 'Percent must be less than ' + serviceFactorPercent.toFixed(0) + '%';
        }
    }
    return null;
}

export function checkPowerFactorInputData(powerFactor: number, amps: number, volts: number, compressor: CompressorInventoryItem): { powerFactorError: string, ampError: string, voltError: string, isValid: boolean } {
    let powerFactorError: string = checkIsPowerFactorValid(powerFactor);
    let ampError: string = checkIsAmpsValid(amps, compressor);
    let voltError: string = checkIsVoltsValid(volts);
    let isValid: boolean = (!powerFactorError && !ampError && !voltError);
    return { powerFactorError, ampError, voltError, isValid };
}

export function checkIsPowerFactorValid(powerFactor: number): string {
    if (powerFactor >= 1) {
        return `Power Factor must be less than 1`;
    } else if (checkIsInvalidNumber(powerFactor)) {
        return `Power Factor must be 0 or greater`;
    }
    return null;
}

export function checkIsVoltsValid(volts: number): string {
    if (checkIsInvalidNumber(volts)) {
        return `Volts must be 0 or greater`;
    }
    return null;
}

export function checkIsAmpsValid(amps: number, compressor: CompressorInventoryItem): string {
    let maxAmps: number = roundVal(compressor.nameplateData.fullLoadAmps * compressor.designDetails.serviceFactor, 2);
    if (amps >= maxAmps) {
        return `Amps cannot be greater than ${maxAmps}`;
    } else if (checkIsInvalidNumber(amps)) {
        return `Amps must be 0 or greater`;
    }
    return null;
}

export function checkIsInvalidNumber(num: number): boolean {
    return num < 0 || isNaN(num) || isNull(num) || isUndefined(num);
}


export function getHourIntervals(systemProfileSetup: SystemProfileSetup, hours?: number) {
    let hourIntervals = new Array();
    if (hours === undefined) {
        hours = systemProfileSetup.numberOfHours
    }

    for (let index = 0; index < hours;) {
        hourIntervals.push(index);
        index = index + systemProfileSetup.dataInterval;
    }
    return hourIntervals;
}

export function getHasMissingTrimSelection(compressedAirAssessment: CompressedAirAssessment): boolean {
    let hasMissingTrimSelection: boolean = compressedAirAssessment.systemInformation.trimSelections.some(selection => {
        let dayTypeInUse = compressedAirAssessment.compressedAirDayTypes.some(dayType => dayType.dayTypeId === selection.dayTypeId);
        if (dayTypeInUse && selection.compressorId) {
            return false;
        } else {
            return true;
        }
    });
    return hasMissingTrimSelection;
}