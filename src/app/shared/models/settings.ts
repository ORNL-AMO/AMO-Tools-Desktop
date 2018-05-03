export interface Settings {
    language?: string,
    currency?: string,
    unitsOfMeasure?: string
    assessmentId?: number,
    directoryId?: number,
    createdDate?: Date,
    modifiedDate?: Date
    flowMeasurement?: string,
    powerMeasurement?: string,
    distanceMeasurement?: string,
    pressureMeasurement?: string,
    steamPressureMeasurement?: string,
    steamTemperatureMeasurement?: string,
    steamSpecificEnthalpyMeasurement?: string,
    steamSpecificEntropyMeasurement?: string,
    steamSpecificVolumeMeasurement?: string,
    steamMassFlowMeasurement?: string,
    currentMeasurement?: string,
    viscosityMeasurement?: string,
    voltageMeasurement?: string,
    temperatureMeasurement?: string,
    id?: number,
    energySourceType?: string,
    furnaceType?: string,
    energyResultUnit?: string,
    customFurnaceName?: string,
    appVersion?: string,
    phastRollupUnit?: string,
    facilityInfo?: FacilityInfo,
    fanCurveType?: string,
    fanConvertedConditions?: string
    phastRollupFuelUnit?: string,
    phastRollupSteamUnit?: string,
    phastRollupElectricityUnit?: string,
    defaultPanelTab?: string,
    electricityCost?: number,
    fuelCost?: number,
    steamCost?: number,
    disableTutorial?: boolean
}


export interface FacilityInfo {
    companyName?: string,
    facilityName?: string,
    address?: StreetAddress,
    facilityContact?: Contact,
    assessmentContact?: Contact,
    date?: string
}

export interface StreetAddress {
    street?: string,
    city?: string,
    state?: string,
    country?: string,
    zip?: string
}

export interface Contact {
    contactName?: string,
    phoneNumber?: number,
    email?: string
}
