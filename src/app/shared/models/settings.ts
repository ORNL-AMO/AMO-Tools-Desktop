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
    specificEnthalpyMeasurement?: string,
    specificEntropyMeasurement?: string,
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
    phastRollupFuelUnit?: string,
    phastRollupSteamUnit?: string,
    phastRollupElectricityUnit?: string,
    facilityInfo?: FacilityInfo,
    defaultPanelTab?: string,
    electricityCost?: number,
    fuelCost?: number,
    steamCost?: number
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
