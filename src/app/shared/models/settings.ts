export interface Settings {
    language?: string,
    currency?: string,
    unitsOfMeasure?: string
    assessmentId?: number,
    directoryId?: number,
    inventoryId?: number,
    createdDate?: Date,
    modifiedDate?: Date
    flowMeasurement?: string,
    powerMeasurement?: string,
    distanceMeasurement?: string,
    densityMeasurement?: string,
    pressureMeasurement?: string,
    steamPressureMeasurement?: string,
    steamTemperatureMeasurement?: string,
    steamSpecificEnthalpyMeasurement?: string,
    steamSpecificEntropyMeasurement?: string,
    steamSpecificVolumeMeasurement?: string,
    steamMassFlowMeasurement?: string,
    steamEnergyMeasurement?: string,
    steamPowerMeasurement?: string,
    steamVolumeMeasurement?: string,
    steamVolumeFlowMeasurement?: string,
    steamVacuumPressure?: string,
    fanPressureMeasurement?: string,
    fanFlowRate?: string,
    fanPowerMeasurement?: string,
    fanBarometricPressure?: string,
    fanSpecificHeatGas?: string,
    fanTemperatureMeasurement?: string,
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

    disableTutorial?: boolean,
    disableDashboardTutorial?: boolean,
    disablePsatTutorial?: boolean,
    // disablePsatSetupTutorial?: boolean,
    // disablePsatAssessmentTutorial?: boolean,
    // disablePsatReportTutorial?: boolean,
    disablePhastSetupTutorial?: boolean,
    disablePhastAssessmentTutorial?: boolean,
    disablePhastReportTutorial?: boolean,
    disableFsatSetupTutorial?: boolean,
    disableFsatAssessmentTutorial?: boolean,
    disableFsatReportTutorial?: boolean,

    disableSsmtSystemSetupTutorial?: boolean,
    disableSsmtAssessmentTutorial?: boolean,
    disableSsmtReportTutorial?: boolean,
    disableSsmtDiagramTutorial?: boolean,

    disableTreasureHuntFindTreasureTutorial?: boolean,
    disableTreasureHuntReportTutorial?: boolean,
    disableTreasureHuntSetupTutorial?: boolean,
    disableTreasureHuntTreasureChestTutorial?: boolean,

    disableSurveyMonkey?: boolean,
    disableDisclaimer?: boolean,
    //costs
    electricityCost?: number,
    fuelCost?: number,
    steamCost?: number,
    compressedAirCost?: number,
    otherFuelCost?: number,
    waterCost?: number,
    waterWasteCost?: number,

    //Print 
    printPsatRollup?: boolean,
    printPhastRollup?: boolean,
    printFsatRollup?: boolean,
    printTreasureHuntRollup?: boolean,
    printReportGraphs?: boolean,
    printReportSankey?: boolean,
    printResults?: boolean,
    printInputData?: boolean,
    printExecutiveSummary?: boolean,
    printEnergySummary?: boolean,
    printLossesSummary?: boolean,
    printReportOpportunityPayback?: boolean,
    printReportOpportunitySummary?: boolean,
    printSsmtRollup?: boolean,
    printWasteWaterRollup?: boolean,
    printDetailedResults?: boolean,
    printReportDiagram?: boolean,
    printAll?: boolean,
    printCompressedAirRollup?: boolean

    // Co2SavingsData
    co2SavingsEnergyType?: string,
    co2SavingsEnergySource?: string,
    co2SavingsFuelType?: string,
    totalEmissionOutputRate?: number,
    electricityUse?: number,
    eGridRegion?: string,
    eGridSubregion?: string,
    totalEmissionOutput?: number,
    totalFuelEmissionOutputRate?: number,
    userEnteredBaselineEmissions?: boolean,
    userEnteredModificationEmissions?: boolean,
    zipcode?: string

    //Rollup Units (phast listed above)
    commonRollupUnit?: string,
    pumpsRollupUnit?: string,
    fansRollupUnit?: string,
    steamRollupUnit?: string,
    wasteWaterRollupUnit?: string,
    compressedAirRollupUnit?: string,
}


export interface FacilityInfo {
    companyName?: string;
    facilityName?: string;
    address?: StreetAddress;
    facilityContact?: Contact;
    assessmentContact?: Contact;
    date?: string;
}

export interface StreetAddress {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
}

export interface Contact {
    contactName?: string;
    phoneNumber?: number;
    email?: string;
}
