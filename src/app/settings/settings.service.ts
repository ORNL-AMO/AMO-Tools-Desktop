import { Injectable } from '@angular/core';
import { UntypedFormBuilder, Validators, UntypedFormGroup } from '@angular/forms';
import { Settings } from '../shared/models/settings';
import { BehaviorSubject } from 'rxjs';
declare const packageJson;

@Injectable()
export class SettingsService {

  setDontShow: BehaviorSubject<boolean>;
  updateUnitsModalOpen: BehaviorSubject<boolean>;

  constructor(private formBuilder: UntypedFormBuilder) {
    this.setDontShow = new BehaviorSubject<boolean>(false);
    this.updateUnitsModalOpen = new BehaviorSubject<boolean>(false);

  }

  // getSettingsForm(): FormGroup {
  //   return this.formBuilder.group({
  //     'language': ['', Validators.required],
  //     'currency': ['', Validators.required],
  //     'unitsOfMeasure': ['', Validators.required],
  //     'distanceMeasurement': [''],
  //     'flowMeasurement': [''],
  //     'powerMeasurement': [''],
  //     'pressureMeasurement': [''],
  //     'steamPressureMeasurement': [''],
  //     'steamTemperatureMeasurement': [''],
  //     'steamSpecificEnthalpyMeasurement': [''],
  //     'steamSpecificEntropyMeasurement': [''],
  //     'steamSpecificVolumeMeasurement': [''],
  //     'steamPowerMeasurement': [''],
  //     'steamMassFlowMeasurement': [''],
  //     'steamVolumeMeasurement': [''],
  //     'steamVolumeFlowMeasurement': [''],
  //     'steamVacuumPressure': [''],
  //     'currentMeasurement': [''],
  //     'viscosityMeasurement': [''],
  //     'voltageMeasurement': [''],
  //     'energySourceType': [''],
  //     'furnaceType': [''],
  //     'energyResultUnit': [''],
  //     'customFurnaceName': [''],
  //     'temperatureMeasurement': [''],
  //     'phastRollupUnit': [''],
  //     'defaultPanelTab': [''],
  //     'fuelCost': [3.99],
  //     'steamCost': [4.69],
  //     'electricityCost': [.066],
  //     'densityMeasurement': ['']
  //   });
  // }

  getFormFromSettings(settings: Settings): UntypedFormGroup {
    if (settings.steamPressureMeasurement === 'psi') {
      settings.steamPressureMeasurement = 'psig';
    }
    if (settings.steamPressureMeasurement === 'kPag') {
      settings.steamPressureMeasurement = 'kPag';
    }
    return this.formBuilder.group({
      'language': [settings.language, Validators.required],
      'currency': [settings.currency, Validators.required],
      'unitsOfMeasure': [settings.unitsOfMeasure, Validators.required],
      'distanceMeasurement': [settings.distanceMeasurement],
      'flowMeasurement': [settings.flowMeasurement],
      'powerMeasurement': [settings.powerMeasurement],
      'pressureMeasurement': [settings.pressureMeasurement],
      'steamPressureMeasurement': [settings.steamPressureMeasurement],
      'steamTemperatureMeasurement': [settings.steamTemperatureMeasurement],
      'steamSpecificEnthalpyMeasurement': [settings.steamSpecificEnthalpyMeasurement],
      'steamSpecificEntropyMeasurement': [settings.steamSpecificEntropyMeasurement],
      'steamSpecificVolumeMeasurement': [settings.steamSpecificVolumeMeasurement],
      'steamMassFlowMeasurement': [settings.steamMassFlowMeasurement],
      'steamPowerMeasurement': [settings.steamPowerMeasurement || 'kW'],
      'steamVolumeMeasurement': [settings.steamVolumeMeasurement || 'gal'],
      'steamVolumeFlowMeasurement': [settings.steamVolumeFlowMeasurement || 'gpm'],
      'steamVacuumPressure': [settings.steamVacuumPressure || 'psia'],
      'currentMeasurement': [settings.currentMeasurement],
      'viscosityMeasurement': [settings.viscosityMeasurement],
      'voltageMeasurement': [settings.voltageMeasurement],
      'energySourceType': [settings.energySourceType],
      'furnaceType': [settings.furnaceType],
      'energyResultUnit': [settings.energyResultUnit],
      'customFurnaceName': [settings.customFurnaceName],
      'temperatureMeasurement': [settings.temperatureMeasurement],
      'phastRollupUnit': [settings.phastRollupUnit],
      'fanCurveType': [settings.fanCurveType],
      'fanConvertedConditions': [settings.fanConvertedConditions],
      'phastRollupFuelUnit': [settings.phastRollupFuelUnit],
      'phastRollupElectricityUnit': [settings.phastRollupElectricityUnit],
      'phastRollupSteamUnit': [settings.phastRollupSteamUnit],
      'defaultPanelTab': [settings.defaultPanelTab],
      'fuelCost': [settings.fuelCost || 3.99],
      'steamCost': [settings.steamCost || 4.69],
      'electricityCost': [settings.electricityCost || .066],
      'densityMeasurement': [settings.densityMeasurement || 'lbscf'],
      'fanFlowRate': [settings.fanFlowRate || 'ft3/h'],
      'fanPressureMeasurement': [settings.fanPressureMeasurement || 'inH2o'],
      'fanBarometricPressure': [settings.fanBarometricPressure || 'inHg'],
      'fanSpecificHeatGas': [settings.fanSpecificHeatGas || 'btulbF'],
      'fanPowerMeasurement': [settings.fanPowerMeasurement || 'hp'],
      'fanTemperatureMeasurement': [settings.fanTemperatureMeasurement || 'F'],
      'steamEnergyMeasurement': [settings.steamEnergyMeasurement || 'MMBtu'],
      'disableTutorial': settings.disableTutorial || false,
      'disableDashboardTutorial': settings.disableDashboardTutorial || false,
      'disablePsatTutorial': settings.disablePsatTutorial || false,
      'disableFansTutorial': settings.disableFansTutorial || false,
      'disablePhastTutorial': settings.disablePhastTutorial || false,
      'disableWasteWaterTutorial': settings.disableWasteWaterTutorial || false,
      'disableSteamTutorial': settings.disableSteamTutorial || false,
      'disableMotorInventoryTutorial': settings.disableMotorInventoryTutorial || false,
      'disableTreasureHuntTutorial': settings.disableTreasureHuntTutorial || false,
      'disableDataExplorerTutorial': settings.disableDataExplorerTutorial || false,
      'compressedAirCost': settings.compressedAirCost || 0.022,
      'otherFuelCost': settings.otherFuelCost || 0,
      'waterCost': settings.waterCost || 0,
      'waterWasteCost': settings.waterWasteCost || 0,
      'printPsatRollup': settings.printPsatRollup || true,
      'printPhastRollup': settings.printPhastRollup || true,
      'printFsatRollup': settings.printFsatRollup || true,
      'printTreasureHuntRollup': settings.printTreasureHuntRollup || true,
      'printReportGraphs': settings.printReportGraphs || true,
      'printReportSankey': settings.printReportSankey || true,
      'printResults': settings.printResults || true,
      'printInputData': settings.printInputData || true,
      'printExecutiveSummary': settings.printExecutiveSummary || true,
      'printEnergySummary': settings.printEnergySummary || true,
      'printLossesSummary': settings.printLossesSummary || true,
      'printReportOpportunityPayback': settings.printReportOpportunityPayback || true,
      'printReportOpportunitySummary': settings.printReportOpportunitySummary || true,
      'printSsmtRollup': settings.printSsmtRollup || true,
      'printWasteWaterRollup': settings.printWasteWaterRollup || true,
      'printDetailedResults': settings.printDetailedResults || true,
      'printReportDiagram': settings.printReportDiagram || true,
      'printAll': settings.printAll || true,
      'co2SavingsEnergyType': settings.co2SavingsEnergyType || 'electricity',
      'co2SavingsEnergySource': settings.co2SavingsEnergySource || 'Natural Gas',
      'co2SavingsFuelType': settings.co2SavingsFuelType || 'Natural Gas',
      'totalEmissionOutputRate': settings.totalEmissionOutputRate || 401.07,
      'electricityUse': settings.electricityUse || 0,
      'eGridRegion': settings.eGridRegion || '',
      'eGridSubregion': settings.eGridSubregion || 'U.S. Average',
      'totalEmissionOutput': settings.totalEmissionOutput || 0,
      'totalFuelEmissionOutputRate': settings.totalFuelEmissionOutputRate || 0,
      'userEnteredBaselineEmissions': settings.userEnteredBaselineEmissions || false,
      'userEnteredModificationEmissions': settings.userEnteredModificationEmissions || false,
      'totalNaturalGasEmissionOutputRate': settings.totalNaturalGasEmissionOutputRate || 53.06,
      'totalCoalEmissionOutputRate': settings.totalCoalEmissionOutputRate || 0,
      'totalOtherEmissionOutputRate': settings.totalOtherEmissionOutputRate || 0,
      'coalFuelType': settings.coalFuelType ||'Mixed - Industrial Sector',
      'eafOtherFuelSource': settings.eafOtherFuelSource ||'None',
      'otherFuelType': settings.otherFuelType ||'',
      'zipcode': settings.zipcode || '00000',
      'commonRollupUnit': settings.commonRollupUnit,
      'pumpsRollupUnit': settings.pumpsRollupUnit,
      'fansRollupUnit': settings.fansRollupUnit,
      'steamRollupUnit': settings.steamRollupUnit,
      'wasteWaterRollupUnit': settings.wasteWaterRollupUnit,
      'compressedAirRollupUnit': settings.compressedAirRollupUnit
    
    });
  }

  getSettingsFromForm(form: UntypedFormGroup) {
    let tmpSettings: Settings = {
      language: form.controls.language.value,
      currency: form.controls.currency.value,
      unitsOfMeasure: form.controls.unitsOfMeasure.value,
      distanceMeasurement: form.controls.distanceMeasurement.value,
      flowMeasurement: form.controls.flowMeasurement.value,
      powerMeasurement: form.controls.powerMeasurement.value,
      pressureMeasurement: form.controls.pressureMeasurement.value,
      steamPressureMeasurement: form.controls.steamPressureMeasurement.value,
      steamTemperatureMeasurement: form.controls.steamTemperatureMeasurement.value,
      steamSpecificEnthalpyMeasurement: form.controls.steamSpecificEnthalpyMeasurement.value,
      steamSpecificEntropyMeasurement: form.controls.steamSpecificEntropyMeasurement.value,
      steamSpecificVolumeMeasurement: form.controls.steamSpecificVolumeMeasurement.value,
      steamMassFlowMeasurement: form.controls.steamMassFlowMeasurement.value,
      steamPowerMeasurement: form.controls.steamPowerMeasurement.value,
      steamVolumeMeasurement: form.controls.steamVolumeMeasurement.value,
      steamVolumeFlowMeasurement: form.controls.steamVolumeFlowMeasurement.value,
      steamVacuumPressure: form.controls.steamVacuumPressure.value,
      currentMeasurement: form.controls.currentMeasurement.value,
      viscosityMeasurement: form.controls.viscosityMeasurement.value,
      voltageMeasurement: form.controls.voltageMeasurement.value,
      energySourceType: form.controls.energySourceType.value,
      furnaceType: form.controls.furnaceType.value,
      energyResultUnit: form.controls.energyResultUnit.value,
      customFurnaceName: form.controls.customFurnaceName.value,
      temperatureMeasurement: form.controls.temperatureMeasurement.value,
      appVersion: packageJson.version,
      fanCurveType: form.controls.fanCurveType.value,
      fanConvertedConditions: form.controls.fanConvertedConditions.value,
      phastRollupUnit: form.controls.phastRollupUnit.value,
      phastRollupFuelUnit: form.controls.phastRollupFuelUnit.value,
      phastRollupElectricityUnit: form.controls.phastRollupElectricityUnit.value,
      phastRollupSteamUnit: form.controls.phastRollupSteamUnit.value,
      defaultPanelTab: form.controls.defaultPanelTab.value,
      fuelCost: form.controls.fuelCost.value,
      steamCost: form.controls.steamCost.value,
      electricityCost: form.controls.electricityCost.value,
      densityMeasurement: form.controls.densityMeasurement.value,
      fanFlowRate: form.controls.fanFlowRate.value,
      fanPressureMeasurement: form.controls.fanPressureMeasurement.value,
      fanBarometricPressure: form.controls.fanBarometricPressure.value,
      fanSpecificHeatGas: form.controls.fanSpecificHeatGas.value,
      fanPowerMeasurement: form.controls.fanPowerMeasurement.value,
      fanTemperatureMeasurement: form.controls.fanTemperatureMeasurement.value,
      steamEnergyMeasurement: form.controls.steamEnergyMeasurement.value,
      disableTutorial: form.controls.disableTutorial.value,
      disableDashboardTutorial: form.controls.disableDashboardTutorial.value,
      disablePsatTutorial: form.controls.disablePsatTutorial.value,
      disableFansTutorial: form.controls.disableFansTutorial.value,
      disablePhastTutorial: form.controls.disablePhastTutorial.value,
      disableWasteWaterTutorial: form.controls.disableWasteWaterTutorial.value,
      disableSteamTutorial: form.controls.disableSteamTutorial.value,
      disableMotorInventoryTutorial: form.controls.disableMotorInventoryTutorial.value,
      disableTreasureHuntTutorial: form.controls.disableTreasureHuntTutorial.value,
      disableDataExplorerTutorial: form.controls.disableDataExplorerTutorial.value,
      compressedAirCost: form.controls.compressedAirCost.value || 0.022,
      otherFuelCost: form.controls.otherFuelCost.value || 0,
      waterCost: form.controls.waterCost.value || 0,
      waterWasteCost: form.controls.waterWasteCost.value || 0,
      printPsatRollup: form.controls.printPsatRollup.value,
      printPhastRollup: form.controls.printPhastRollup.value,
      printFsatRollup: form.controls.printFsatRollup.value,
      printTreasureHuntRollup: form.controls.printTreasureHuntRollup.value,
      printReportGraphs: form.controls.printReportGraphs.value,
      printReportSankey: form.controls.printReportSankey.value,
      printResults: form.controls.printResults.value,
      printInputData: form.controls.printInputData.value,
      printExecutiveSummary: form.controls.printExecutiveSummary.value,
      printEnergySummary: form.controls.printEnergySummary.value,
      printLossesSummary: form.controls.printLossesSummary.value,
      printReportOpportunityPayback: form.controls.printReportOpportunityPayback.value,
      printReportOpportunitySummary: form.controls.printReportOpportunitySummary.value,
      printSsmtRollup: form.controls.printSsmtRollup.value,
      printWasteWaterRollup: form.controls.printWasteWaterRollup.value,
      printDetailedResults: form.controls.printDetailedResults.value,
      printReportDiagram: form.controls.printReportDiagram.value,
      printAll: form.controls.printAll.value,
      co2SavingsEnergyType: form.controls.co2SavingsEnergyType.value,
      co2SavingsEnergySource: form.controls.co2SavingsEnergySource.value,
      co2SavingsFuelType: form.controls.co2SavingsFuelType.value,
      totalEmissionOutputRate: form.controls.totalEmissionOutputRate.value,
      totalFuelEmissionOutputRate: form.controls.totalFuelEmissionOutputRate.value,
      electricityUse: form.controls.electricityUse.value,
      eGridRegion: form.controls.eGridRegion.value,
      eGridSubregion: form.controls.eGridSubregion.value,
      totalEmissionOutput: form.controls.totalEmissionOutput.value,
      totalNaturalGasEmissionOutputRate: form.controls.totalNaturalGasEmissionOutputRate.value,
      totalCoalEmissionOutputRate: form.controls.totalCoalEmissionOutputRate.value,
      totalOtherEmissionOutputRate: form.controls.totalOtherEmissionOutputRate.value,
      coalFuelType: form.controls.coalFuelType.value,
      eafOtherFuelSource: form.controls.eafOtherFuelSource.value,
      otherFuelType: form.controls.otherFuelType.value,
      userEnteredBaselineEmissions: form.controls.userEnteredBaselineEmissions.value,
      userEnteredModificationEmissions: form.controls.userEnteredModificationEmissions.value,
      zipcode: form.controls.zipcode.value,
      commonRollupUnit: form.controls.commonRollupUnit.value,
      pumpsRollupUnit: form.controls.pumpsRollupUnit.value,
      fansRollupUnit: form.controls.fansRollupUnit.value,
      steamRollupUnit: form.controls.steamRollupUnit.value,
      wasteWaterRollupUnit: form.controls.wasteWaterRollupUnit.value,
      compressedAirRollupUnit: form.controls.compressedAirRollupUnit.value
    };
    return tmpSettings;
  }

  getNewSettingFromSetting(settings: Settings): Settings {
    let defaultSettings: Settings = this.getNewSettingsDefaults(settings)
    let newSettings: Settings = {
      language: settings.language,
      currency: settings.currency,
      unitsOfMeasure: settings.unitsOfMeasure,
      distanceMeasurement: settings.distanceMeasurement,
      flowMeasurement: settings.flowMeasurement,
      powerMeasurement: settings.powerMeasurement,
      pressureMeasurement: settings.pressureMeasurement,
      steamPressureMeasurement: settings.steamPressureMeasurement,
      steamTemperatureMeasurement: settings.steamTemperatureMeasurement,
      steamSpecificEnthalpyMeasurement: settings.steamSpecificEnthalpyMeasurement,
      steamSpecificEntropyMeasurement: settings.steamSpecificEntropyMeasurement,
      steamSpecificVolumeMeasurement: settings.steamSpecificVolumeMeasurement,
      steamMassFlowMeasurement: settings.steamMassFlowMeasurement,
      steamPowerMeasurement: settings.steamPowerMeasurement || defaultSettings.steamPowerMeasurement,
      steamVolumeMeasurement: settings.steamVolumeMeasurement || defaultSettings.steamVolumeMeasurement,
      steamVolumeFlowMeasurement: settings.steamVolumeFlowMeasurement || defaultSettings.steamVolumeFlowMeasurement,
      steamVacuumPressure: settings.steamVacuumPressure || defaultSettings.steamVacuumPressure,
      currentMeasurement: settings.currentMeasurement,
      viscosityMeasurement: settings.viscosityMeasurement,
      voltageMeasurement: settings.voltageMeasurement,
      energySourceType: settings.energySourceType,
      furnaceType: settings.furnaceType,
      customFurnaceName: settings.customFurnaceName,
      temperatureMeasurement: settings.temperatureMeasurement,
      phastRollupUnit: settings.phastRollupUnit,
      fanCurveType: settings.fanCurveType,
      fanConvertedConditions: settings.fanConvertedConditions,
      phastRollupFuelUnit: settings.phastRollupFuelUnit,
      phastRollupElectricityUnit: settings.phastRollupElectricityUnit,
      phastRollupSteamUnit: settings.phastRollupSteamUnit,
      defaultPanelTab: settings.defaultPanelTab,
      fuelCost: settings.fuelCost,
      steamCost: settings.steamCost,
      electricityCost: settings.electricityCost,
      densityMeasurement: settings.densityMeasurement || defaultSettings.densityMeasurement,
      fanFlowRate: settings.fanFlowRate || defaultSettings.fanFlowRate,
      fanPressureMeasurement: settings.fanPressureMeasurement || defaultSettings.fanPressureMeasurement,
      fanBarometricPressure: settings.fanBarometricPressure || defaultSettings.fanBarometricPressure,
      fanSpecificHeatGas: settings.fanSpecificHeatGas || defaultSettings.fanSpecificHeatGas,
      fanPowerMeasurement: settings.fanPowerMeasurement || defaultSettings.fanPowerMeasurement,
      fanTemperatureMeasurement: settings.fanTemperatureMeasurement || defaultSettings.fanTemperatureMeasurement,
      steamEnergyMeasurement: settings.steamEnergyMeasurement || defaultSettings.steamEnergyMeasurement,
      disableTutorial: settings.disableTutorial,
      disableDashboardTutorial: settings.disableDashboardTutorial,
      disablePsatTutorial: settings.disablePsatTutorial,
      disableFansTutorial: settings.disableFansTutorial,
      disablePhastTutorial: settings.disablePhastTutorial,
      disableWasteWaterTutorial: settings.disableWasteWaterTutorial,
      disableSteamTutorial: settings.disableSteamTutorial,
      disableMotorInventoryTutorial: settings.disableMotorInventoryTutorial,
      disableTreasureHuntTutorial: settings.disableTreasureHuntTutorial,
      disableDataExplorerTutorial: settings.disableDataExplorerTutorial,
      compressedAirCost: settings.compressedAirCost || 0.022,
      otherFuelCost: settings.otherFuelCost || 0,
      waterCost: settings.waterCost || 0,
      waterWasteCost: settings.waterWasteCost || 0,
      printPsatRollup: settings.printPsatRollup,
      printPhastRollup: settings.printPhastRollup,
      printFsatRollup: settings.printFsatRollup,
      printTreasureHuntRollup: settings.printTreasureHuntRollup,
      printReportGraphs: settings.printReportGraphs,
      printReportSankey: settings.printReportSankey,
      printResults: settings.printResults,
      printInputData: settings.printInputData,
      printExecutiveSummary: settings.printExecutiveSummary,
      printEnergySummary: settings.printEnergySummary,
      printLossesSummary: settings.printLossesSummary,
      printReportOpportunityPayback: settings.printReportOpportunityPayback,
      printReportOpportunitySummary: settings.printReportOpportunitySummary,
      printSsmtRollup: settings.printSsmtRollup,
      printWasteWaterRollup: settings.printWasteWaterRollup,
      printDetailedResults: settings.printDetailedResults,
      printReportDiagram: settings.printReportDiagram,
      printAll: settings.printAll,
      co2SavingsEnergyType: settings.co2SavingsEnergyType,
      co2SavingsEnergySource: settings.co2SavingsEnergySource,
      co2SavingsFuelType: settings.co2SavingsFuelType,
      totalEmissionOutputRate: settings.totalEmissionOutputRate,
      totalFuelEmissionOutputRate: settings.totalFuelEmissionOutputRate,
      electricityUse: settings.electricityUse,
      eGridRegion: settings.eGridRegion,
      eGridSubregion: settings.eGridSubregion,
      totalEmissionOutput: settings.totalEmissionOutput,
      totalNaturalGasEmissionOutputRate: settings.totalNaturalGasEmissionOutputRate,
      totalCoalEmissionOutputRate: settings.totalCoalEmissionOutputRate,
      totalOtherEmissionOutputRate: settings.totalOtherEmissionOutputRate,
      coalFuelType: settings.coalFuelType,
      eafOtherFuelSource: settings.eafOtherFuelSource,
      otherFuelType: settings.otherFuelType,
      userEnteredBaselineEmissions: settings.userEnteredBaselineEmissions,
      userEnteredModificationEmissions: settings.userEnteredModificationEmissions,
      zipcode: settings.zipcode,
      commonRollupUnit: settings.commonRollupUnit,
      pumpsRollupUnit: settings.pumpsRollupUnit,
      fansRollupUnit: settings.fansRollupUnit,
      steamRollupUnit: settings.steamRollupUnit,
      wasteWaterRollupUnit: settings.wasteWaterRollupUnit,
      compressedAirRollupUnit: settings.compressedAirRollupUnit
    }
    return newSettings;
  }

  getNewSettingsDefaults(currentSettings: Settings): Settings {
    let currentSettingsForm: UntypedFormGroup = this.getFormFromSettings(currentSettings);
    currentSettingsForm = this.setUnits(currentSettingsForm);
    let defaultSettings: Settings = this.getSettingsFromForm(currentSettingsForm);
    return defaultSettings;
  }



  setUnits(settingsForm: UntypedFormGroup): UntypedFormGroup {
    if (settingsForm.controls.unitsOfMeasure.value === 'Imperial') {
      settingsForm.patchValue({
        powerMeasurement: PumpImperialDefaults.powerMeasurement,
        flowMeasurement: PumpImperialDefaults.flowMeasurement,
        distanceMeasurement: PumpImperialDefaults.distanceMeasurement,
        pressureMeasurement: PumpImperialDefaults.pressureMeasurement,
        temperatureMeasurement: PumpImperialDefaults.temperatureMeasurement,
        steamPressureMeasurement: SteamImperialDefaults.steamPressureMeasurement,
        steamTemperatureMeasurement: SteamImperialDefaults.steamTemperatureMeasurement,
        steamSpecificEnthalpyMeasurement: SteamImperialDefaults.steamSpecificEnthalpyMeasurement,
        steamSpecificEntropyMeasurement: SteamImperialDefaults.steamSpecificEntropyMeasurement,
        steamSpecificVolumeMeasurement: SteamImperialDefaults.steamSpecificVolumeMeasurement,
        steamMassFlowMeasurement: SteamImperialDefaults.steamMassFlowMeasurement,
        steamVolumeMeasurement: SteamImperialDefaults.steamVolumeMeasurement,
        steamVolumeFlowMeasurement: SteamImperialDefaults.steamVolumeFlowMeasurement,
        steamVacuumPressure: SteamImperialDefaults.steamVacuumPressure,
        energyResultUnit: 'MMBtu',
        phastRollupUnit: 'MMBtu',
        phastRollupFuelUnit: 'MMBtu',
        phastRollupElectricityUnit: 'kWh',
        phastRollupSteamUnit: 'MMBtu',
        densityMeasurement: FanImperialDefaults.densityMeasurement,
        fanPowerMeasurement: FanImperialDefaults.fanPowerMeasurement,
        fanFlowRate: FanImperialDefaults.fanFlowRate,
        fanPressureMeasurement: FanImperialDefaults.fanPressureMeasurement,
        fanBarometricPressure: FanImperialDefaults.fanBarometricPressure,
        fanSpecificHeatGas: FanImperialDefaults.fanSpecificHeatGas,
        fanTemperatureMeasurement: FanImperialDefaults.fanTemperatureMeasurement,
        steamEnergyMeasurement: SteamImperialDefaults.steamEnergyMeasurement,
        steamPowerMeasurement: SteamImperialDefaults.steamPowerMeasurement,
        commonRollupUnit: 'MMBtu',
        pumpsRollupUnit: 'MWh',
        fansRollupUnit: 'MWh',
        steamRollupUnit: 'MMBtu',
        wasteWaterRollupUnit: 'MWh',
        compressedAirRollupUnit: 'MWh',
        co2SavingsEnergyType: "electricity",
        co2SavingsEnergySource: "Natural Gas",
        co2SavingsFuelType: "Natural Gas",
        totalEmissionOutputRate: 401.07,
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
        totalFuelEmissionOutputRate: 0,
        userEnteredBaselineEmissions: false,
        userEnteredModificationEmissions: false,
        zipcode: '00000',
        // currentMeasurement: 'A',
        // viscosityMeasurement: 'cST',
        // voltageMeasurement: 'V'
      });

    } else if (settingsForm.controls.unitsOfMeasure.value === 'Metric') {
      settingsForm.patchValue({
        powerMeasurement: PumpMetricDefaults.powerMeasurement,
        flowMeasurement: PumpMetricDefaults.flowMeasurement,
        distanceMeasurement: PumpMetricDefaults.distanceMeasurement,
        pressureMeasurement: PumpMetricDefaults.pressureMeasurement,
        temperatureMeasurement: PumpMetricDefaults.temperatureMeasurement,
        steamPressureMeasurement: SteamMetricDefaults.steamPressureMeasurement,
        steamTemperatureMeasurement: SteamMetricDefaults.steamTemperatureMeasurement,
        steamSpecificEnthalpyMeasurement: SteamMetricDefaults.steamSpecificEnthalpyMeasurement,
        steamSpecificEntropyMeasurement: SteamMetricDefaults.steamSpecificEntropyMeasurement,
        steamSpecificVolumeMeasurement: SteamMetricDefaults.steamSpecificVolumeMeasurement,
        steamMassFlowMeasurement: SteamMetricDefaults.steamMassFlowMeasurement,
        steamVolumeMeasurement: SteamMetricDefaults.steamVolumeMeasurement,
        steamVolumeFlowMeasurement: SteamMetricDefaults.steamVolumeFlowMeasurement,
        steamVacuumPressure: SteamMetricDefaults.steamVacuumPressure,
        energyResultUnit: 'GJ',
        phastRollupUnit: 'GJ',
        phastRollupFuelUnit: 'GJ',
        phastRollupElectricityUnit: 'kWh',
        phastRollupSteamUnit: 'GJ',
        densityMeasurement: FanMetricDefaults.densityMeasurement,
        fanPowerMeasurement: FanMetricDefaults.fanPowerMeasurement,
        fanFlowRate: FanMetricDefaults.fanFlowRate,
        fanPressureMeasurement: FanMetricDefaults.fanPressureMeasurement,
        fanBarometricPressure: FanMetricDefaults.fanBarometricPressure,
        fanSpecificHeatGas: FanMetricDefaults.fanSpecificHeatGas,
        fanTemperatureMeasurement: FanMetricDefaults.fanTemperatureMeasurement,
        steamEnergyMeasurement: SteamMetricDefaults.steamEnergyMeasurement,
        steamPowerMeasurement: SteamMetricDefaults.steamPowerMeasurement,
        co2SavingsEnergyType: "electricity",
        co2SavingsEnergySource: "Natural Gas",
        co2SavingsFuelType: "Natural Gas",
        totalEmissionOutputRate: 401.07,
        totalNaturalGasEmissionOutputRate: 53.06,
        totalCoalEmissionOutputRate: 0,
        totalOtherEmissionOutputRate: 0,
        coalFuelType: 'Mixed - Industrial Sector',
        eafOtherFuelSource: 'None',
        otherFuelType: '',
        totalFuelEmissionOutputRate: 0,
        electricityUse: 0,
        eGridRegion: '',
        eGridSubregion: 'U.S. Average',
        totalEmissionOutput: 0,
        userEnteredBaselineEmissions: false,
        userEnteredModificationEmissions: false,
        zipcode: '00000',
        commonRollupUnit: 'GJ',
        pumpsRollupUnit: 'MWh',
        fansRollupUnit: 'MWh',
        steamRollupUnit: 'GJ',
        wasteWaterRollupUnit: 'MWh',
        compressedAirRollupUnit: 'MWh'
        // currentMeasurement: 'A',
        // viscosityMeasurement: 'cST',
        // voltageMeasurement: 'V'
      });
    }
    settingsForm = this.setEnergyResultUnit(settingsForm);
    return settingsForm;
  }

  setEnergyResultUnit(settingsForm: UntypedFormGroup): UntypedFormGroup {
    if (settingsForm.controls.unitsOfMeasure.value === 'Imperial') {
      settingsForm.patchValue({
        energyResultUnit: 'MMBtu'
      });
    }
    else if (settingsForm.controls.unitsOfMeasure.value === 'Metric') {
      settingsForm.patchValue({
        energyResultUnit: 'GJ'
      });
    }

    if (settingsForm.controls.energySourceType.value === 'Electricity') {
      settingsForm.patchValue({
        energyResultUnit: 'kWh'
      });
    }
    return settingsForm;
  }

  setEnergyResultUnitSetting(settings: Settings): Settings {
    if (settings.unitsOfMeasure === 'Imperial') {
      settings.energyResultUnit = 'MMBtu';
    }
    else if (settings.unitsOfMeasure === 'Metric') {
      settings.energyResultUnit = 'GJ';
    }

    if (settings.energySourceType === 'Electricity') {
      settings.energyResultUnit = 'kWh';
    }
    return settings;
  }

  setPhastResultUnit(settings: Settings): Settings {
    if (settings.unitsOfMeasure === 'Imperial') {
      settings.phastRollupUnit = 'MMBtu';
    }
    else if (settings.unitsOfMeasure === 'Metric') {
      settings.phastRollupUnit = 'GJ';
    }

    if (settings.energySourceType === 'Electricity') {
      settings.phastRollupUnit = 'kWh';
    }
    return settings;
  }

  setTemperatureUnit(settings: Settings): Settings {
    if (settings.unitsOfMeasure === 'Imperial') {
      settings.temperatureMeasurement = 'F';
    } else if (settings.unitsOfMeasure === 'Metric') {
      settings.temperatureMeasurement = 'C';
      settings.steamTemperatureMeasurement = 'C';
    } else {
      settings.temperatureMeasurement = 'F';
      settings.steamTemperatureMeasurement = 'F';
    }
    return settings;
  }

  setSteamUnits(settings: Settings): Settings {
    if (settings.unitsOfMeasure === 'Imperial') {
      if (!settings.steamTemperatureMeasurement) {
        settings.steamTemperatureMeasurement = 'F';
      }
      if (!settings.steamPressureMeasurement || settings.steamPressureMeasurement === 'psi') {
        settings.steamPressureMeasurement = 'psig';
      }
      if (!settings.steamSpecificEnthalpyMeasurement) {
        settings.steamSpecificEnthalpyMeasurement = 'Btu/lb';
      }
      if (!settings.steamSpecificEntropyMeasurement) {
        settings.steamSpecificEntropyMeasurement = 'Btu/lb-F';
      }
      if (!settings.steamSpecificVolumeMeasurement) {
        settings.steamSpecificVolumeMeasurement = 'ft3/lb';
      }
      if (!settings.steamMassFlowMeasurement) {
        settings.steamMassFlowMeasurement = 'klb';
      }
      if (!settings.steamEnergyMeasurement) {
        settings.steamEnergyMeasurement = 'MMBtu';
      }
      if (!settings.steamVolumeMeasurement) {
        settings.steamVolumeMeasurement = 'gal';
      }
      if (!settings.steamVolumeFlowMeasurement) {
        settings.steamVolumeFlowMeasurement = 'gpm';
      }
      if (!settings.steamVacuumPressure) {
        settings.steamVacuumPressure = 'psia';
      }
    } else {
      if (!settings.steamTemperatureMeasurement) {
        settings.steamTemperatureMeasurement = 'C';
      }
      if (!settings.steamPressureMeasurement || settings.steamPressureMeasurement === 'kPa') {
        settings.steamPressureMeasurement = 'kPag';
      }
      if (!settings.steamSpecificEnthalpyMeasurement) {
        settings.steamSpecificEnthalpyMeasurement = 'kJ/kg';
      }
      if (!settings.steamSpecificEntropyMeasurement) {
        settings.steamSpecificEntropyMeasurement = 'kJ/kg/K';
      }
      if (!settings.steamSpecificVolumeMeasurement) {
        settings.steamSpecificVolumeMeasurement = 'm3/kg';
      }
      if (!settings.steamMassFlowMeasurement) {
        settings.steamMassFlowMeasurement = 'tonne';
      }
      if (!settings.steamEnergyMeasurement) {
        settings.steamEnergyMeasurement = 'kWh';
      }

      if (!settings.steamVolumeMeasurement) {
        settings.steamVolumeMeasurement = 'L';
      }
      if (!settings.steamVolumeFlowMeasurement) {
        settings.steamVolumeFlowMeasurement = 'L/min';
      }
      if (!settings.steamVacuumPressure) {
        settings.steamVacuumPressure = 'bara';
      }
    }
    return settings;
  }


  setFanUnits(settings: Settings): Settings {
    if (settings.unitsOfMeasure === 'Metric' || settings.unitsOfMeasure === 'Other') {
      if (!settings.densityMeasurement) {
        settings.densityMeasurement = 'kgNm3';
      }
      if (!settings.fanFlowRate) {
        settings.fanFlowRate = 'm3/s';
      }
      if (!settings.fanPressureMeasurement) {
        settings.fanPressureMeasurement = 'Pa';
      }
      if (!settings.fanBarometricPressure) {
        settings.fanBarometricPressure = 'Pa';
      }
      if (!settings.fanSpecificHeatGas) {
        settings.fanSpecificHeatGas = 'kJkgC';
      }
      if (!settings.fanTemperatureMeasurement) {
        settings.fanTemperatureMeasurement = 'C';
      }
      if (!settings.fanPowerMeasurement) {
        settings.fanPowerMeasurement = 'kW';
      }
    } else {
      if (!settings.densityMeasurement) {
        settings.densityMeasurement = 'lbscf';
      }
      if (!settings.fanFlowRate) {
        settings.fanFlowRate = 'ft3/min';
      }
      if (!settings.fanPressureMeasurement) {
        settings.fanPressureMeasurement = 'inH2o';
      }
      if (!settings.fanBarometricPressure) {
        settings.fanBarometricPressure = 'inHg';
      }
      if (!settings.fanSpecificHeatGas) {
        settings.fanSpecificHeatGas = 'btulbF';
      }
      if (!settings.fanTemperatureMeasurement) {
        settings.fanTemperatureMeasurement = 'F';
      }
      if (!settings.fanPowerMeasurement) {
        settings.fanPowerMeasurement = 'hp';
      }
    }
    return settings;
  }
}

export const SteamImperialDefaults = {
  steamTemperatureMeasurement: 'F',
  steamPressureMeasurement: 'psig',
  steamSpecificEnthalpyMeasurement: 'btuLb',
  steamSpecificEntropyMeasurement: 'btulbF',
  steamSpecificVolumeMeasurement: 'ft3lb',
  steamMassFlowMeasurement: 'klb',
  steamVolumeMeasurement: 'gal',
  steamVolumeFlowMeasurement: 'gpm',
  steamVacuumPressure: 'psia',
  steamEnergyMeasurement: 'MMBtu',
  steamPowerMeasurement: 'kW',
}

export const SteamMetricDefaults = {
  steamPressureMeasurement: 'barg',
  steamTemperatureMeasurement: 'C',
  steamSpecificEnthalpyMeasurement: 'kJkg',
  steamSpecificEntropyMeasurement: 'kJkgK',
  steamSpecificVolumeMeasurement: 'm3kg',
  steamMassFlowMeasurement: 'tonne',
  steamVolumeMeasurement: 'L',
  steamVolumeFlowMeasurement: 'L/min',
  steamVacuumPressure: 'bara',
  steamEnergyMeasurement: 'GJ',
  steamPowerMeasurement: 'kW',
}

export const FanImperialDefaults = {
  densityMeasurement: 'lbscf',
  fanPowerMeasurement: 'hp',
  fanFlowRate: 'ft3/min',
  fanPressureMeasurement: 'inH2o',
  fanBarometricPressure: 'inHg',
  fanSpecificHeatGas: 'btulbF',
  fanTemperatureMeasurement: 'F',
}

export const FanMetricDefaults = {
  densityMeasurement: 'kgNm3',
  fanPowerMeasurement: 'kW',
  fanFlowRate: 'm3/s',
  fanPressureMeasurement: 'Pa',
  fanBarometricPressure: 'Pa',
  fanSpecificHeatGas: 'kJkgC',
  fanTemperatureMeasurement: 'C',
}

export const PumpImperialDefaults = {
  powerMeasurement: 'hp',
  flowMeasurement: 'gpm',
  distanceMeasurement: 'ft',
  pressureMeasurement: 'psi',
  temperatureMeasurement: 'F',
}

export const PumpMetricDefaults = {
  powerMeasurement: 'kW',
  flowMeasurement: 'm3/h',
  distanceMeasurement: 'm',
  pressureMeasurement: 'kPa',
  temperatureMeasurement: 'C',
}