import { DBConfig } from "ngx-indexed-db";

export const AssessmentStoreMeta = {
  store: 'assessments',
  storeConfig: { keyPath: 'id', autoIncrement: true },
  storeSchema: [
    { name: 'directoryId', keypath: 'directoryId', options: { unique: false } },
    { name: 'psat', keypath: 'psat', options: { unique: false } },
    { name: 'phast', keypath: 'phast', options: { unique: false } },
    { name: 'fsat', keypath: 'fsat', options: { unique: false } },
    { name: 'ssmt', keypath: 'ssmt', options: { unique: false } },
    { name: 'treasureHunt', keypath: 'treasureHunt', options: { unique: false } },
    { name: 'wasteWater', keypath: 'wasteWater', options: { unique: false } },
    { name: 'compressedAirAssessment', keypath: 'compressedAirAssessment', options: { unique: false } },
    { name: 'createdDate', keypath: 'createdDate', options: { unique: false } },
    { name: 'modifiedDate', keypath: 'modifiedDate', options: { unique: false } },
    { name: 'type', keypath: 'type', options: { unique: false } },
    { name: 'name', keypath: 'name', options: { unique: false } },
    { name: 'selected', keypath: 'selected', options: { unique: false } },
    { name: 'appVersion', keypath: 'appVersion', options: { unique: false } },
    { name: 'isexample', keypath: 'isexample', options: { unique: false } },
  ]
};

export const DirectoryStoreMeta = {
  store: 'directories',
  storeConfig: { keyPath: 'id', autoIncrement: true },
  storeSchema: [
    { name: 'name', keypath: 'name', options: { unique: false } },
    { name: 'parentDirectoryId', keypath: 'parentDirectoryId', options: { unique: false } },
    { name: 'settingsId', keypath: 'settingsId', options: { unique: false } },
    { name: 'createdDate', keypath: 'createdDate', options: { unique: false } },
    { name: 'modifiedDate', keypath: 'modifiedDate', options: { unique: false } },
  ]
};

export const CalculatorStoreMeta =  {
  store: 'calculator',
  storeConfig: { keyPath: 'id', autoIncrement: true },
  storeSchema: [
    { name: 'directoryId', keypath: 'directoryId', options: {unique: false} },
    { name: 'assessmentId', keypath: 'assessmentId', options: {unique: false} },
    { name: 'name', keypath: 'name', options: {unique: false} },
    { name: 'createdDate', keypath: 'createdDate', options: {unique: false} },
    { name: 'modifiedDate', keypath: 'modifiedDate', options: {unique: false} },
    { name: 'type', keypath: 'type', options: {unique: false} },
    { name: 'preAssessments', keypath: 'preAssessments', options: {unique: false} },
    { name: 'headTool', keypath: 'headTool', options: {unique: false} },
    { name: 'headToolSuction', keypath: 'headToolSuction', options: {unique: false} },
    { name: 'headToolType', keypath: 'headToolType', options: {unique: false} },
    { name: 'motorPerformanceInputs', keypath: 'motorPerformanceInputs', options: {unique: false} },
    { name: 'nemaInputs', keypath: 'nemaInputs', options: {unique: false} },
    { name: 'fullLoadAmpsInput', keypath: 'fullLoadAmpsInput', options: {unique: false} },
    { name: 'altitudeCorrectionInput', keypath: 'altitudeCorrectionInput', options: {unique: false} },
    { name: 'receiverTankInput', keypath: 'receiverTankInput', options: {unique: false} },
    { name: 'compressedAirPressureReduction', keypath: 'compressedAirPressureReduction', options: {unique: false} },
    { name: 'airSystemCapacityInputs', keypath: 'airSystemCapacityInputs', options: {unique: false} },
    { name: 'specificSpeedInputs', keypath: 'specificSpeedInputs', options: {unique: false} },
    { name: 'pipeSizingInputs', keypath: 'pipeSizingInputs', options: {unique: false} },
    { name: 'airVelocityInputs', keypath: 'airVelocityInputs', options: {unique: false} },
    { name: 'airLeakInput', keypath: 'airLeakInput', options: {unique: false} },
    { name: 'airFlowConversionInputs', keypath: 'airFlowConversionInputs', options: {unique: false} },
    { name: 'o2EnrichmentInputs', keypath: 'o2EnrichmentInputs', options: {unique: false} },
    { name: 'efficiencyImprovementInputs', keypath: 'efficiencyImprovementInputs', options: {unique: false} },
    { name: 'energyEquivalencyInputs', keypath: 'energyEquivalencyInputs', options: {unique: false} },
    { name: 'flowCalculations', keypath: 'flowCalculations', options: {unique: false} },
    { name: 'fanEfficiencyInputs', keypath: 'fanEfficiencyInputs', options: {unique: false} },
    { name: 'fan203Inputs', keypath: 'fan203Inputs', options: {unique: false} },
    { name: 'selected', keypath: 'selected', options: {unique: false} },
    { name: 'systemAndEquipmentCurveData', keypath: 'systemAndEquipmentCurveData', options: {unique: false} },
  ]
};

export const SettingsStoreMeta = {
  store: 'settings',
  storeConfig: { keyPath: 'id', autoIncrement: true },
  storeSchema: [
    { name: 'language', keypath: 'language', options: {unique: false} },
    { name: 'currency', keypath: 'currency', options: {unique: false} },
    { name: 'unitsOfMeasure', keypath: 'unitsOfMeasure', options: {unique: false} },
    { name: 'assessmentId', keypath: 'assessmentId', options: {unique: false} },
    { name: 'directoryId', keypath: 'directoryId', options: {unique: false} },
    { name: 'inventoryId', keypath: 'inventoryId', options: {unique: false} },
    { name: 'createdDate', keypath: 'createdDate', options: {unique: false} },
    { name: 'modifiedDate', keypath: 'modifiedDate', options: {unique: false} },
    { name: 'flowMeasurement', keypath: 'flowMeasurement', options: {unique: false} },
    { name: 'powerMeasurement', keypath: 'powerMeasurement', options: {unique: false} },
    { name: 'distanceMeasurement', keypath: 'distanceMeasurement', options: {unique: false} },
    { name: 'densityMeasurement', keypath: 'densityMeasurement', options: {unique: false} },
    { name: 'pressureMeasurement', keypath: 'pressureMeasurement', options: {unique: false} },
    { name: 'steamPressureMeasurement', keypath: 'steamPressureMeasurement', options: {unique: false} },
    { name: 'steamTemperatureMeasurement', keypath: 'steamTemperatureMeasurement', options: {unique: false} },
    { name: 'steamSpecificEnthalpyMeasurement', keypath: 'steamSpecificEnthalpyMeasurement', options: {unique: false} },
    { name: 'steamSpecificEntropyMeasurement', keypath: 'steamSpecificEntropyMeasurement', options: {unique: false} },
    { name: 'steamSpecificVolumeMeasurement', keypath: 'steamSpecificVolumeMeasurement', options: {unique: false} },
    { name: 'steamMassFlowMeasurement', keypath: 'steamMassFlowMeasurement', options: {unique: false} },
    { name: 'steamEnergyMeasurement', keypath: 'steamEnergyMeasurement', options: {unique: false} },
    { name: 'steamPowerMeasurement', keypath: 'steamPowerMeasurement', options: {unique: false} },
    { name: 'steamVolumeMeasurement', keypath: 'steamVolumeMeasurement', options: {unique: false} },
    { name: 'steamVolumeFlowMeasurement', keypath: 'steamVolumeFlowMeasurement', options: {unique: false} },
    { name: 'steamVacuumPressure', keypath: 'steamVacuumPressure', options: {unique: false} },
    { name: 'fanPressureMeasurement', keypath: 'fanPressureMeasurement', options: {unique: false} },
    { name: 'fanFlowRate', keypath: 'fanFlowRate', options: {unique: false} },
    { name: 'fanPowerMeasurement', keypath: 'fanPowerMeasurement', options: {unique: false} },
    { name: 'fanBarometricPressure', keypath: 'fanBarometricPressure', options: {unique: false} },
    { name: 'fanSpecificHeatGas', keypath: 'fanSpecificHeatGas', options: {unique: false} },
    { name: 'fanTemperatureMeasurement', keypath: 'fanTemperatureMeasurement', options: {unique: false} },
    { name: 'currentMeasurement', keypath: 'currentMeasurement', options: {unique: false} },
    { name: 'viscosityMeasurement', keypath: 'viscosityMeasurement', options: {unique: false} },
    { name: 'voltageMeasurement', keypath: 'voltageMeasurement', options: {unique: false} },
    { name: 'temperatureMeasurement', keypath: 'temperatureMeasurement', options: {unique: false} },
    { name: 'energySourceType', keypath: 'energySourceType', options: {unique: false} },
    { name: 'furnaceType', keypath: 'furnaceType', options: {unique: false} },
    { name: 'energyResultUnit', keypath: 'energyResultUnit', options: {unique: false} },
    { name: 'customFurnaceName', keypath: 'customFurnaceName', options: {unique: false} },
    { name: 'appVersion', keypath: 'appVersion', options: {unique: false} },
    { name: 'phastRollupUnit', keypath: 'phastRollupUnit', options: {unique: false} },
    { name: 'facilityInfo', keypath: 'facilityInfo', options: {unique: false} },
    { name: 'fanCurveType', keypath: 'fanCurveType', options: {unique: false} },
    { name: 'fanConvertedConditions', keypath: 'fanConvertedConditions', options: {unique: false} },        
    { name: 'phastRollupFuelUnit', keypath: 'phastRollupFuelUnit', options: {unique: false} },
    { name: 'phastRollupSteamUnit', keypath: 'phastRollupSteamUnit', options: {unique: false} },
    { name: 'phastRollupElectricityUnit', keypath: 'phastRollupElectricityUnit', options: {unique: false} },
    { name: 'defaultPanelTab', keypath: 'defaultPanelTab', options: {unique: false} },
    { name: 'disableTutorial', keypath: 'disableTutorial', options: {unique: false} },
    { name: 'disableDashboardTutorial', keypath: 'disableDashboardTutorial', options: {unique: false} },
    { name: 'disablePsatTutorial', keypath: 'disablePsatTutorial', options: {unique: false} },
    { name: 'disableFansTutorial', keypath: 'disableFansTutorial', options: {unique: false} },
    { name: 'disablePhastTutorial', keypath: 'disablePhastTutorial', options: {unique: false} },
    { name: 'disableWasteWaterTutorial', keypath: 'disableWasteWaterTutorial', options: {unique: false} },
    { name: 'disableSteamTutorial', keypath: 'disableSteamTutorial', options: {unique: false} },
    { name: 'disableMotorInventoryTutorial', keypath: 'disableMotorInventoryTutorial', options: {unique: false} },
    { name: 'disableTreasureHuntTutorial', keypath: 'disableTreasureHuntTutorial', options: {unique: false} },
    { name: 'disableDataExplorerTutorial', keypath: 'disableDataExplorerTutorial', options: {unique: false} },
    { name: 'disableCompressedAirTutorial', keypath: 'disableCompressedAirTutorial', options: {unique: false} },
    { name: 'electricityCost', keypath: 'electricityCost', options: {unique: false} },
    { name: 'fuelCost', keypath: 'fuelCost', options: {unique: false} },
    { name: 'steamCost', keypath: 'steamCost', options: {unique: false} },
    { name: 'compressedAirCost', keypath: 'compressedAirCost', options: {unique: false} },
    { name: 'otherFuelCost', keypath: 'otherFuelCost', options: {unique: false} },
    { name: 'waterCost', keypath: 'waterCost', options: {unique: false} },
    { name: 'waterWasteCost', keypath: 'waterWasteCost', options: {unique: false} },
    { name: 'printPsatRollup', keypath: 'printPsatRollup', options: {unique: false} },
    { name: 'printPhastRollup', keypath: 'printPhastRollup', options: {unique: false} },
    { name: 'printFsatRollup', keypath: 'printFsatRollup', options: {unique: false} },
    { name: 'printTreasureHuntRollup', keypath: 'printTreasureHuntRollup', options: {unique: false} },
    { name: 'printReportGraphs', keypath: 'printReportGraphs', options: {unique: false} },
    { name: 'printReportSankey', keypath: 'printReportSankey', options: {unique: false} },
    { name: 'printResults', keypath: 'printResults', options: {unique: false} },
    { name: 'printInputData', keypath: 'printInputData', options: {unique: false} },
    { name: 'printExecutiveSummary', keypath: 'printExecutiveSummary', options: {unique: false} },
    { name: 'printEnergySummary', keypath: 'printEnergySummary', options: {unique: false} },
    { name: 'printLossesSummary', keypath: 'printLossesSummary', options: {unique: false} },
    { name: 'printReportOpportunityPayback', keypath: 'printReportOpportunityPayback', options: {unique: false} },
    { name: 'printReportOpportunitySummary', keypath: 'printReportOpportunitySummary', options: {unique: false} },
    { name: 'printSsmtRollup', keypath: 'printSsmtRollup', options: {unique: false} },
    { name: 'printWasteWaterRollup', keypath: 'printWasteWaterRollup', options: {unique: false} },
    { name: 'printDetailedResults', keypath: 'printDetailedResults', options: {unique: false} },
    { name: 'printReportDiagram', keypath: 'printReportDiagram', options: {unique: false} },
    { name: 'printAll', keypath: 'printAll', options: {unique: false} },
    { name: 'printCompressedAirRollup', keypath: 'printCompressedAirRollup', options: {unique: false} },
    { name: 'printSystemProfiles', keypath: 'printSystemProfiles', options: {unique: false} },        
    { name: 'printPerformanceProfiles', keypath: 'printPerformanceProfiles', options: {unique: false} },        
    { name: 'co2SavingsEnergyType', keypath: 'co2SavingsEnergyType', options: {unique: false} },
    { name: 'co2SavingsEnergySource', keypath: 'co2SavingsEnergySource', options: {unique: false} },
    { name: 'co2SavingsFuelType', keypath: 'co2SavingsFuelType', options: {unique: false} },
    { name: 'totalEmissionOutputRate', keypath: 'totalEmissionOutputRate', options: {unique: false} },
    { name: 'electricityUse', keypath: 'electricityUse', options: {unique: false} },
    { name: 'eGridRegion', keypath: 'eGridRegion', options: {unique: false} },
    { name: 'eGridSubregion', keypath: 'eGridSubregion', options: {unique: false} },
    { name: 'totalEmissionOutput', keypath: 'totalEmissionOutput', options: {unique: false} },
    { name: 'totalFuelEmissionOutputRate', keypath: 'totalFuelEmissionOutputRate', options: {unique: false} },
    { name: 'totalNaturalGasEmissionOutputRate', keypath: 'totalNaturalGasEmissionOutputRate', options: {unique: false} },
    { name: 'totalCoalEmissionOutputRate', keypath: 'totalCoalEmissionOutputRate', options: {unique: false} },
    { name: 'totalOtherEmissionOutputRate', keypath: 'totalOtherEmissionOutputRate', options: {unique: false} },
    { name: 'coalFuelType', keypath: 'coalFuelType', options: {unique: false} },
    { name: 'eafOtherFuelSource', keypath: 'eafOtherFuelSource', options: {unique: false} },
    { name: 'otherFuelType', keypath: 'otherFuelType', options: {unique: false} },
    { name: 'userEnteredBaselineEmissions', keypath: 'userEnteredBaselineEmissions', options: {unique: false} },
    { name: 'userEnteredModificationEmissions', keypath: 'userEnteredModificationEmissions', options: {unique: false} },
    { name: 'zipcode', keypath: 'zipcode', options: {unique: false} },
    { name: 'commonRollupUnit', keypath: 'commonRollupUnit', options: {unique: false} },
    { name: 'pumpsRollupUnit', keypath: 'pumpsRollupUnit', options: {unique: false} },
    { name: 'fansRollupUnit', keypath: 'fansRollupUnit', options: {unique: false} },
    { name: 'steamRollupUnit', keypath: 'steamRollupUnit', options: {unique: false} },
    { name: 'wasteWaterRollupUnit', keypath: 'wasteWaterRollupUnit', options: {unique: false} },
    { name: 'compressedAirRollupUnit', keypath: 'compressedAirRollupUnit', options: {unique: false} },
  ]
};

export const InventoryStoreMeta = {
  store: 'inventoryItems',
  storeConfig: { keyPath: 'id', autoIncrement: true },
  storeSchema: [
    { name: 'directoryId', keypath: 'directoryId', options: {unique: false} },
    { name: 'motorInventoryData', keypath: 'motorInventoryData', options: {unique: false} },
    { name: 'batchAnalysisSettings', keypath: 'batchAnalysisSettings', options: {unique: false} },
    { name: 'createdDate', keypath: 'createdDate', options: {unique: false} },
    { name: 'modifiedDate', keypath: 'modifiedDate', options: {unique: false} },
    { name: 'type', keypath: 'type', options: {unique: false} },
    { name: 'name', keypath: 'name', options: {unique: false} },
    { name: 'selected', keypath: 'selected', options: {unique: false} },
    { name: 'appVersion', keypath: 'appVersion', options: {unique: false} },
    { name: 'isExample', keypath: 'isExample', options: {unique: false} },
  ]
};

export const LogToolStoreMeta = {
  store: 'logTool',
  storeConfig: { keyPath: 'id', autoIncrement: true },
  storeSchema: [
    { name: 'id', keypath: 'id', options: {unique: false } },
    { name: 'name', keypath: 'name', options: {unique: false } },
    { name: 'modifiedDate', keypath: 'modifiedDate', options: {unique: false } },
    { name: 'origin', keypath: 'origin', options: {unique: false } },
    { name: 'setupData', keypath: 'setupData', options: {unique: false } },
    { name: 'visualizeData', keypath: 'visualizeData', options: {unique: false } },
    { name: 'dayTypeData', keypath: 'dayTypeData', options: {unique: false } },
  ]
};

export const WeatherDataStoreMeta = {
  store: 'weatherData',
  storeConfig: { keyPath: 'id', autoIncrement: true },
  storeSchema: [
    { name: 'id', keypath: 'id', options: {unique: false } },
    { name: 'name', keypath: 'name', options: {unique: false } },
    { name: 'modifiedDate', keypath: 'modifiedDate', options: {unique: false } },
    { name: 'filename', keypath: 'filename', options: {unique: false } },
    { name: 'setupData', keypath: 'setupData', options: {unique: false } },
  ]
};

export const AnalyticStoreMeta = {
  store: 'analyticsData',
  storeConfig: { keyPath: 'id', autoIncrement: true },
  storeSchema: [
    { name: 'clientId', keypath: 'clientId', options: {unique: false } },
    { name: 'modifiedDate', keypath: 'modifiedDate', options: {unique: false } },
  ]
};

export const WaterDiagramStoreMeta = {
  store: 'waterProcess',
  storeConfig: { keyPath: 'id', autoIncrement: true },
  storeSchema: [
    { name: 'id', keypath: 'id', options: {unique: false } },
    { name: 'modifiedDate', keypath: 'modifiedDate', options: {unique: false } },
  ]
};



export const GasLoadMaterialStoreMeta = {
  store: 'gasLoadChargeMaterial',
  storeConfig: { keyPath: 'id', autoIncrement: true },
  storeSchema: [
    { name: 'selected', keypath: 'selected', options: { unique: false } },
    { name: 'specificHeatVapor', keypath: 'specificHeatVapor', options: { unique: false } },
    { name: 'substance', keypath: 'substance', options: { unique: false } },
  ]
};

export const SolidLoadMaterialStoreMeta = {
  store: 'solidLoadChargeMaterial',
  storeConfig: { keyPath: 'id', autoIncrement: true },
  storeSchema: [
    { name: 'selected', keypath: 'selected', options: { unique: false } },
    { name: 'latentHeat', keypath: 'latentHeat', options: { unique: false } },
    { name: 'meltingPoint', keypath: 'meltingPoint', options: { unique: false } },
    { name: 'specificHeatLiquid', keypath: 'specificHeatLiquid', options: { unique: false } },
    { name: 'specificHeatSolid', keypath: 'specificHeatSolid', options: { unique: false } },
    { name: 'substance', keypath: 'substance', options: { unique: false } },
  ]
};

export const LiquidLoadMaterialStoreMeta = {
  store: 'liquidLoadChargeMaterial',
  storeConfig: { keyPath: 'id', autoIncrement: true },
  storeSchema: [
    { name: 'selected', keypath: 'selected', options: { unique: false } },
    { name: 'latentHeat', keypath: 'latentHeat', options: { unique: false } },
    { name: 'specificHeatLiquid', keypath: 'specificHeatLiquid', options: { unique: false } },
    { name: 'specificHeatVapor', keypath: 'specificHeatVapor', options: { unique: false } },
    { name: 'substance', keypath: 'substance', options: { unique: false } },
    { name: 'vaporizationTemperature', keypath: 'vaporizationTemperature', options: { unique: false } },
  ]
};

export const AtmosphereStoreMeta = {
  store: 'atmosphereSpecificHeat',
  storeConfig: { keyPath: 'id', autoIncrement: true },
  storeSchema: [
    { name: 'selected', keypath: 'selected', options: { unique: false } },
    { name: 'specificHeat', keypath: 'specificHeat', options: { unique: false } },
    { name: 'substance', keypath: 'substance', options: { unique: false } },
  ]
};

export const WallLossesSurfaceStoreMeta = {
  store: 'wallLossesSurface',
  storeConfig: { keyPath: 'id', autoIncrement: true },
  storeSchema: [
    { name: 'conditionFactor', keypath: 'conditionFactor', options: { unique: false } },
    { name: 'selected', keypath: 'selected', options: { unique: false } },
    { name: 'surface', keypath: 'surface', options: { unique: false } },
  ]
};

export const FlueGasMaterialStoreMeta = {
  store: 'flueGasMaterial',
  storeConfig: { keyPath: 'id', autoIncrement: true },
  storeSchema: [
    { name: 'C2H6', keypath: 'C2H6', options: {unique: false } },
    { name: 'C3H8', keypath: 'C3H8', options: {unique: false } },
    { name: 'C4H10_CnH2n', keypath: 'C4H10_CnH2n', options: {unique: false } },
    { name: 'CH4', keypath: 'CH4', options: {unique: false } },
    { name: 'CO', keypath: 'CO', options: {unique: false } },
    { name: 'CO2', keypath: 'CO2', options: {unique: false } },
    { name: 'H2', keypath: 'H2', options: {unique: false } },
    { name: 'H2O', keypath: 'H2O', options: {unique: false } },
    { name: 'N2', keypath: 'N2', options: {unique: false } },
    { name: 'O2', keypath: 'O2', options: {unique: false } },
    { name: 'SO2', keypath: 'SO2', options: {unique: false } },
    { name: 'heatingValue', keypath: 'heatingValue', options: {unique: false } },
    { name: 'heatingValueVolume', keypath: 'heatingValueVolume', options: {unique: false } },
    { name: 'selected', keypath: 'selected', options: {unique: false } },
    { name: 'specificGravity', keypath: 'specificGravity', options: {unique: false } },
    { name: 'substance', keypath: 'substance', options: {unique: false } },
  ]
};

export const SolidLiquidFlueGasMaterialStoreMeta = {
  store: 'solidLiquidFlueGasMaterial',
  storeConfig: { keyPath: 'id', autoIncrement: true },
  storeSchema: [
    { name: 'carbon', keypath: 'carbon', options: {unique: false } },
    { name: 'hydrogen', keypath: 'hydrogen', options: {unique: false } },
    { name: 'selected', keypath: 'selected', options: {unique: false } },
    { name: 'inertAsh', keypath: 'inertAsh', options: {unique: false } },
    { name: 'moisture', keypath: 'moisture', options: {unique: false } },
    { name: 'nitrogen', keypath: 'nitrogen', options: {unique: false } },
    { name: 'o2', keypath: 'o2', options: {unique: false } },
    { name: 'substance', keypath: 'substance', options: {unique: false } },
    { name: 'sulphur', keypath: 'sulphur', options: {unique: false } },
    { name: 'heatingValue', keypath: 'heatingValue', options: {unique: false } },
  ]
}



export const dbConfig: DBConfig = {
  name: 'CrudDB',
  version: 7,
  objectStoresMeta: [
    AssessmentStoreMeta,
    DirectoryStoreMeta,
    CalculatorStoreMeta,
    SettingsStoreMeta,
    InventoryStoreMeta,
    LogToolStoreMeta,
    WeatherDataStoreMeta,
    AnalyticStoreMeta,
    GasLoadMaterialStoreMeta,
    SolidLoadMaterialStoreMeta,
    LiquidLoadMaterialStoreMeta,
    AtmosphereStoreMeta,
    WallLossesSurfaceStoreMeta,
    FlueGasMaterialStoreMeta,
    SolidLiquidFlueGasMaterialStoreMeta,
    WaterDiagramStoreMeta
  ]
};