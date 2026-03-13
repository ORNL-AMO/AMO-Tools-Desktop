export interface Settings {
    language?: string,
    currency?: string,
    unitsOfMeasure?: string
    assessmentId?: number,
    directoryId?: number,
    inventoryId?: number,
    diagramId?: number,
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
    flowDecimalPrecision?: number,
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
    disableFansTutorial?: boolean,
    disablePhastTutorial?: boolean,
    disableWasteWaterTutorial?: boolean,
    disableSteamTutorial?: boolean,
    disableMotorInventoryTutorial?: boolean,
    disableTreasureHuntTutorial?: boolean,
    disableDataExplorerTutorial?: boolean,
    disableCompressedAirTutorial?: boolean,
    disableProcessCoolingTutorial?: boolean,
    disableWaterTutorial?: boolean,

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
    printWaterSystemCostReport?: boolean,
    printWaterSystemSummary?: boolean,
    printEnergySummary?: boolean,
    printLossesSummary?: boolean,
    printReportOpportunityPayback?: boolean,
    printReportOpportunitySummary?: boolean,
    printSsmtRollup?: boolean,
    printWasteWaterRollup?: boolean,
    printDetailedResults?: boolean,
    printReportDiagram?: boolean,
    printAll?: boolean,
    printCompressedAirRollup?: boolean,
    printSystemProfiles?: boolean
    printPerformanceProfiles?: boolean

    // Co2SavingsData
    co2SavingsEnergyType?: string,
    co2SavingsEnergySource?: string,
    co2SavingsFuelType?: string,
    totalEmissionOutputRate?: number,
    emissionsUnit?: 'Metric' | 'Imperial',
    electricityUse?: number,
    eGridRegion?: string,
    eGridSubregion?: string,
    totalEmissionOutput?: number,
    totalFuelEmissionOutputRate?: number,
    totalNaturalGasEmissionOutputRate?: number,
    totalCoalEmissionOutputRate?: number,
    totalOtherEmissionOutputRate?: number,
    coalFuelType?: string;
    eafOtherFuelSource?: string,
    otherFuelType?: string;
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

    //global
    suiteDbItemsInitialized?: boolean;
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


export function getDefaultSettings(): Settings {
    return {
        language: "English",
        currency: "$",
        unitsOfMeasure: "Imperial",
        distanceMeasurement: "ft",
        flowMeasurement: "gpm",
        powerMeasurement: "hp",
        pressureMeasurement: "psi",
        currentMeasurement: null,
        viscosityMeasurement: null,
        voltageMeasurement: null,
        energySourceType: "Fuel",
        customFurnaceName: null,
        temperatureMeasurement: "F",
        steamTemperatureMeasurement: "F",
        steamPressureMeasurement: "psig",
        steamSpecificEnthalpyMeasurement: "btuLb",
        steamSpecificEntropyMeasurement: "btulbF",
        steamSpecificVolumeMeasurement: "ft3lb",
        steamMassFlowMeasurement: "klb",
        fuelCost: 3.99,
        steamCost: 4.69,
        electricityCost: 0.066,
        compressedAirCost: 0.022,
        defaultPanelTab: 'results',
        phastRollupFuelUnit: 'MMBtu',
        phastRollupElectricityUnit: 'kWh',
        phastRollupSteamUnit: 'MMBtu',
        energyResultUnit: "MMBtu",
        phastRollupUnit: 'MMBtu',
        facilityInfo: {
            companyName: 'ORNL',
            facilityName: 'ORNL Test Facility',
            address: {
                street: '1 Bethel Valley Rd.',
                city: 'Oak Ridge',
                state: 'TN',
                country: 'U.S.',
                zip: '37831'
            },
            facilityContact: {
                contactName: 'T. Owner',
                phoneNumber: 8655767658,
                email: 't.owner@ornl.com'
            },
            assessmentContact: {
                contactName: 'D.O. Energy',
                phoneNumber: 1234567890,
                email: 'AMO_ToolHelpDesk@ee.doe.gov'
            }
        },
        co2SavingsEnergyType: "electricity",
        co2SavingsEnergySource: "Natural Gas",
        co2SavingsFuelType: "Natural Gas",
        totalEmissionOutputRate: 401.07,
        emissionsUnit: 'Metric',
        totalFuelEmissionOutputRate: 0,
        totalNaturalGasEmissionOutputRate: 53.06,
        totalCoalEmissionOutputRate: 0,
        totalOtherEmissionOutputRate: 0,
        coalFuelType: 'Mixed - Industrial Sector',
        eafOtherFuelSource: 'None',
        otherFuelType: '',
        electricityUse: 0,
        eGridRegion: '',
        eGridSubregion: 'U.S. Average',
        totalEmissionOutput: 0,
        userEnteredBaselineEmissions: false,
        userEnteredModificationEmissions: false,
        zipcode: '00000',
        commonRollupUnit: "MMBtu",
        pumpsRollupUnit: "MWh",
        fansRollupUnit: "MWh",
        steamRollupUnit: "MMBtu",
        wasteWaterRollupUnit: "MWh",
        compressedAirRollupUnit: "MWh",
        flowDecimalPrecision: 2
    }
};
