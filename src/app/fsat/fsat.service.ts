import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { Fan203Inputs, BaseGasDensity, Plane, Modification, FSAT, FsatInput, FsatOutput, PlaneResults, Fan203Results, FsatValid, PsychrometricResults, VelocityResults } from '../shared/models/fans';
import { FanFieldDataService } from './fan-field-data/fan-field-data.service';
import { FanSetupService } from './fan-setup/fan-setup.service';
import { FanMotorService } from './fan-motor/fan-motor.service';
import { FsatFluidService } from './fsat-fluid/fsat-fluid.service';
import { Settings } from '../shared/models/settings';
import { Assessment } from '../shared/models/assessment';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { FanImperialDefaults, SettingsService } from '../settings/settings.service';
import { ConvertFsatService } from './convert-fsat.service';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { FanEfficiencyInputs } from '../calculator/fans/fan-efficiency/fan-efficiency.service';
import { ConvertFanAnalysisService } from '../calculator/fans/fan-analysis/convert-fan-analysis.service';
import { FansSuiteApiService } from '../tools-suite-api/fans-suite-api.service';
import { OperationsService } from './operations/operations.service';
import { AssessmentCo2SavingsService } from '../shared/assessment-co2-savings/assessment-co2-savings.service'
import { IntegratedAssessment, IntegratedEnergyOptions, ModificationEnergyOption } from '../shared/assessment-integration/assessment-integration.service';
import { EnergyUseItem } from '../shared/models/treasure-hunt';
import { Co2SavingsData } from '../calculator/utilities/co2-savings/co2-savings.service';
import { getNewIdString } from '../shared/helperFunctions';


@Injectable()
export class FsatService {
  mainTab: BehaviorSubject<string>;
  stepTab: BehaviorSubject<string>;
  assessmentTab: BehaviorSubject<string>;
  openNewModal: BehaviorSubject<boolean>;
  openModificationModal: BehaviorSubject<boolean>;
  modalOpen: BehaviorSubject<boolean>;
  updateData: BehaviorSubject<boolean>;
  calculatorTab: BehaviorSubject<string>;
  showExportModal: BehaviorSubject<boolean>;

  assessment: BehaviorSubject<Assessment>;
  fsat: BehaviorSubject<FSAT>;
  settings: BehaviorSubject<Settings>;
  modificationIndex: BehaviorSubject<number>;
  modificationExists: BehaviorSubject<boolean>;
  containerHeight: BehaviorSubject<number>;
  sankeyOptions: BehaviorSubject<Array<{ name: string, fsat: FSAT }>>;
  selectedSankeyFsatOption: BehaviorSubject<{ fsat: FSAT, name: string }>;
  sankeyLabelStyle: BehaviorSubject<string>;
  showSankeyLabelOptions: BehaviorSubject<boolean>;
  showUpdateUnitsModal: BehaviorSubject<{ show: boolean, oldSettings?: Settings }>;
  smallScreenTab: BehaviorSubject<string>;

  fsatEdited: Subject<FSAT>;
  settingsEdited: Subject<Settings>;
  addNewModRequested: Subject<{ exploreOpportunities: boolean }>;

  //Baseline tabs
  stepTabs: Array<string> = [
    'baseline',
    'fan-operations',
    'fan-setup',
    'fan-motor',
    'fan-field-data'
  ];

  constructor
  (private convertFsatService: ConvertFsatService, private router: Router,
    private settingsDbService: SettingsDbService, private settingsService: SettingsService,
    private fansSuiteApiService: FansSuiteApiService, private assessmentCo2Service: AssessmentCo2SavingsService, private convertUnitsService: ConvertUnitsService, private fanFieldDataService: FanFieldDataService, private convertFanAnalysisService: ConvertFanAnalysisService, private fsatFluidService: FsatFluidService, private fanSetupService: FanSetupService, private fanMotorService: FanMotorService, private fanOperationsService: OperationsService) {
    this.initData();
    /**
     * banner/footer navigation only ever has to call router.navigate(), never mainTab.next() directly.
     */
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      const mainView: string = this.getActiveMainView();
      if (mainView) {
        this.mainTab.next(mainView);
      }
    });
  }

  private getActiveMainView(): string | undefined {
    let snapshot = this.router.routerState.snapshot.root;
    let mainView: string | undefined;
    while (snapshot) {
      if (snapshot.data && (snapshot.data as { mainView?: string }).mainView) {
        mainView = (snapshot.data as { mainView?: string }).mainView;
      }
      snapshot = snapshot.firstChild;
    }
    return mainView;
  }

  initData() {
    this.mainTab = new BehaviorSubject<string>('baseline');
    this.stepTab = new BehaviorSubject<string>('baseline');
    this.assessmentTab = new BehaviorSubject<string>('explore-opportunities');
    this.calculatorTab = new BehaviorSubject<string>('fan-efficiency');
    this.openNewModal = new BehaviorSubject<boolean>(false);
    this.openModificationModal = new BehaviorSubject<boolean>(false);
    this.modalOpen = new BehaviorSubject<boolean>(false);
    this.updateData = new BehaviorSubject<boolean>(false);
    this.showExportModal = new BehaviorSubject<boolean>(false);
    this.assessment = new BehaviorSubject<Assessment>(undefined);
    this.fsat = new BehaviorSubject<FSAT>(undefined);
    this.settings = new BehaviorSubject<Settings>(undefined);
    this.modificationIndex = new BehaviorSubject<number>(undefined);
    this.modificationExists = new BehaviorSubject<boolean>(false);
    this.containerHeight = new BehaviorSubject<number>(undefined);
    this.sankeyOptions = new BehaviorSubject<Array<{ name: string, fsat: FSAT }>>(undefined);
    this.selectedSankeyFsatOption = new BehaviorSubject<{ fsat: FSAT, name: string }>(undefined);
    this.sankeyLabelStyle = new BehaviorSubject<string>('both');
    this.showSankeyLabelOptions = new BehaviorSubject<boolean>(false);
    this.showUpdateUnitsModal = new BehaviorSubject<{ show: boolean, oldSettings?: Settings }>({ show: false });
    this.smallScreenTab = new BehaviorSubject<string>('form');
    this.fsatEdited = new Subject<FSAT>();
    this.settingsEdited = new Subject<Settings>();
    this.addNewModRequested = new Subject<{ exploreOpportunities: boolean }>();
  }

  /**
   * Called once by FsatAssessmentResolver before any child route renders. Does not trigger
   * fsatEdited — seeding is not an edit and must never cause a save.
   */
  seedAssessment(assessment: Assessment, fsat: FSAT, settings: Settings) {
    this.assessment.next(assessment);
    this.fsat.next(fsat);
    this.settings.next(settings);
    this.initSankeyList(fsat);
  }

  /**
   * Settings lookup-or-create for the resolver to await before seeding, so fsatService.settings
   * is never transiently undefined for a first-time assessment — relocated from FsatComponent's
   * former getSettings()/addSettings()/setSettingsUnitType()/checkHasMatchingUnitTypes().
   */
  async initAssessmentSettings(assessment: Assessment): Promise<Settings> {
    let settings: Settings = this.settingsDbService.getByAssessmentId(assessment, true);
    if (settings) {
      return settings;
    }
    const defaultSettings: Settings = this.settingsDbService.getByAssessmentId(assessment, false);
    let newSettings: Settings = this.settingsService.getNewSettingFromSetting(defaultSettings);
    newSettings = this.setSettingsUnitType(newSettings);
    newSettings.assessmentId = assessment.id;
    await firstValueFrom(this.settingsDbService.addWithObservable(newSettings));
    const updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());
    this.settingsDbService.setAll(updatedSettings);
    return this.settingsDbService.getByAssessmentId(assessment, true);
  }

  private setSettingsUnitType(settings: Settings): Settings {
    const hasImperialUnits: boolean = this.checkHasMatchingUnitTypes(settings, FanImperialDefaults);
    const hasMetricUnits: boolean = this.checkHasMatchingUnitTypes(settings, FanImperialDefaults);
    if (settings.unitsOfMeasure === 'Custom' && hasImperialUnits) {
      settings.unitsOfMeasure = 'Imperial';
    } else if (settings.unitsOfMeasure === 'Custom' && hasMetricUnits) {
      settings.unitsOfMeasure = 'Metric';
    } else if (!hasMetricUnits && !hasImperialUnits) {
      settings.unitsOfMeasure = 'Custom';
    }
    return settings;
  }

  private checkHasMatchingUnitTypes(settings: Settings, unitDefaults: any): boolean {
    const hasMatchingDensityMeasurement: boolean = settings.densityMeasurement === unitDefaults.densityMeasurement;
    const hasMatchingFanPowerMeasurement: boolean = settings.fanPowerMeasurement === unitDefaults.fanPowerMeasurement;
    const hasMatchingFanFlowRate: boolean = settings.fanFlowRate === unitDefaults.fanFlowRate;
    const hasMatchingFanPressureMeasurement: boolean = settings.fanPressureMeasurement === unitDefaults.fanPressureMeasurement;
    const hasMatchingFanBarometricPressure: boolean = settings.fanBarometricPressure === unitDefaults.fanBarometricPressure;
    const hasMatchingFanSpecificHeatGas: boolean = settings.fanSpecificHeatGas === unitDefaults.fanSpecificHeatGas;
    const hasMatchingFanTemperatureMeasurement: boolean = settings.fanTemperatureMeasurement === unitDefaults.fanTemperatureMeasurement;
    return hasMatchingDensityMeasurement
      && hasMatchingFanPowerMeasurement
      && hasMatchingFanFlowRate
      && hasMatchingFanPressureMeasurement
      && hasMatchingFanBarometricPressure
      && hasMatchingFanSpecificHeatGas
      && hasMatchingFanTemperatureMeasurement;
  }

  /**
   * Replaces FsatComponent's per-field saveFanMotor/saveFanSetup/saveGasDensity/saveFieldData/
   * saveFsatOperations methods with one generic, immutable update.
   */
  updateFsatProperty<K extends keyof FSAT>(key: K, value: FSAT[K]) {
    const current: FSAT = this.fsat.getValue();
    if (!current) {
      return;
    }
    const updated: FSAT = { ...current, [key]: value };
    this.fsat.next(updated);
    this.fsatEdited.next(updated);
    this.initSankeyList(updated);
  }

  /** For the few call sites that replace the whole working copy (explore-opportunities/modify-conditions emit an already-rebuilt FSAT, not a single field). */
  setFsat(fsat: FSAT) {
    this.fsat.next(fsat);
    this.fsatEdited.next(fsat);
    this.initSankeyList(fsat);
  }

  /** Settings equivalent of setFsat — used by the baseline tab's explicit settings save. */
  updateSettings(settings: Settings) {
    this.settings.next(settings);
    this.settingsEdited.next(settings);
  }

  continue() {
    let tmpStepTab: string = this.stepTab.getValue();
    if (tmpStepTab === 'fan-field-data') {
      this.goToMainTab('assessment');
    } else {
      let assessmentTabIndex: number = this.stepTabs.indexOf(tmpStepTab);
      let nextTab: string = this.stepTabs[assessmentTabIndex + 1];
      this.stepTab.next(nextTab);
    }
  }

  back() {
    let tmpStepTab: string = this.stepTab.getValue();
    if (tmpStepTab !== 'baseline' && this.mainTab.getValue() == 'baseline') {
      let assessmentTabIndex: number = this.stepTabs.indexOf(tmpStepTab);
      let nextTab: string = this.stepTabs[assessmentTabIndex - 1];
      this.stepTab.next(nextTab);
    } else if (this.mainTab.getValue() == 'assessment') {
      this.goToMainTab('baseline');
    }
  }


  goToMainTab(tab: string) {
    const assessmentId: number = this.assessment.getValue()?.id;
    if (assessmentId) {
      this.router.navigate(['/fsat', assessmentId, tab]);
    }
  }


  initSankeyList(fsat: FSAT) {
    const fsatOptions: Array<{ name: string, fsat: FSAT }> = [{ name: 'Baseline', fsat: fsat }];
    if (fsat.modifications) {
      fsat.modifications.forEach(mod => {
        fsatOptions.push({ name: mod.fsat.name, fsat: mod.fsat });
      });
    }
    this.sankeyOptions.next(fsatOptions);
    const selectedSankeyFsatOption = fsatOptions[0];
    this.selectedSankeyFsatOption.next(selectedSankeyFsatOption);
    // * we need isFinishedBaseline because setupDone can be true but not valid? ??
    const isFinishedBaseline = selectedSankeyFsatOption.name == 'Baseline' && selectedSankeyFsatOption.fsat.setupDone;
    const isValidFsat = selectedSankeyFsatOption.fsat.valid && selectedSankeyFsatOption.fsat.valid.isValid;
    this.showSankeyLabelOptions.next(isFinishedBaseline || isValidFsat);
  }

  setSelectedSankeyFsatOption(option: { fsat: FSAT, name: string }) {
    this.selectedSankeyFsatOption.next(option);
  }

  setSankeyLabelStyle(style: string) {
    this.sankeyLabelStyle.next(style);
  }

  getCanContinueFromStep(fsat: FSAT, settings: Settings): boolean {
    const currentStepTab: string = this.stepTab.getValue();
    if (currentStepTab === 'baseline') {
      return true;
    } else if (currentStepTab === 'fan-operations') {
      return this.fanOperationsService.getFormFromObj(fsat.fsatOperations).valid;
    } else if (currentStepTab === 'fsat-fluid') {
      return this.fsatFluidService.isFanFluidValid(fsat.baseGasDensity, settings);
    } else if (currentStepTab === 'fan-setup') {
      return this.fanSetupService.isFanSetupValid(fsat.fanSetup, false);
    } else if (currentStepTab === 'fan-motor') {
      return this.fanMotorService.isFanMotorValid(fsat.fanMotor);
    } else if (currentStepTab === 'fan-field-data') {
      return this.fanFieldDataService.isFanFieldDataValid(fsat.fieldData);
    }
  }

  fan203(input: Fan203Inputs, settings: Settings): Fan203Results {
    let inputCpy: Fan203Inputs = JSON.parse(JSON.stringify(input));
    inputCpy = this.convertFanAnalysisService.convertFan203DataForCalculations(inputCpy, settings);
    inputCpy.FanShaftPower.sumSEF = inputCpy.PlaneData.inletSEF + inputCpy.PlaneData.outletSEF;
    let results: Fan203Results = this.fansSuiteApiService.fan203(inputCpy);
    results = this.convertFanAnalysisService.convertFan203Results(results, settings);
    return results;
  }

  getPsychrometricDewPoint(inputs: BaseGasDensity, settings: Settings): PsychrometricResults {
    inputs = this.convertFanAnalysisService.convertGasDensityForCalculations(inputs, settings);
    let psychrometricResults: PsychrometricResults = this.fansSuiteApiService.getBaseGasDensityDewPoint(inputs);
    psychrometricResults = this.convertFanAnalysisService.convertPsychrometricResults(psychrometricResults, settings);
    return psychrometricResults;
  }

  getPsychrometricRelativeHumidity(inputs: BaseGasDensity, settings: Settings): PsychrometricResults {
    inputs = this.convertFanAnalysisService.convertGasDensityForCalculations(inputs, settings);
    let psychrometricResults: PsychrometricResults = this.fansSuiteApiService.getBaseGasDensityRelativeHumidity(inputs);
    psychrometricResults = this.convertFanAnalysisService.convertPsychrometricResults(psychrometricResults, settings);
    
    return psychrometricResults;
  }

  getPsychrometricWetBulb(inputs: BaseGasDensity, settings: Settings): PsychrometricResults {
    inputs = this.convertFanAnalysisService.convertGasDensityForCalculations(inputs, settings);
    //hard coded per issue 5224
    inputs.specificHeatGas = .24;
    let psychrometricResults: PsychrometricResults = this.fansSuiteApiService.getBaseGasDensityWetBulb(inputs);
    psychrometricResults = this.convertFanAnalysisService.convertPsychrometricResults(psychrometricResults, settings);
    return psychrometricResults;
  }

  getPsychrometricResults(fsat: FSAT, settings: Settings): PsychrometricResults {
    let psychrometricResults: PsychrometricResults = {
      gasDensity: undefined,
      absolutePressure: undefined,
      saturatedHumidity: undefined,
      saturationDegree: undefined,
      humidityRatio: undefined,
      specificVolume: undefined,
      enthalpy: undefined,
      dewPoint: undefined,
      relativeHumidity: undefined,
      saturationPressure: undefined,
      wetBulbTemp: undefined,
      barometricPressure:undefined,
      dryBulbTemp:undefined,
    };
    let results: PsychrometricResults;
    if (fsat.baseGasDensity.inputType === 'relativeHumidity') {
      results = this.getPsychrometricRelativeHumidity(fsat.baseGasDensity, settings);
    } else if (fsat.baseGasDensity.inputType === 'wetBulb') {
      results = this.getPsychrometricWetBulb(fsat.baseGasDensity, settings);
    } else if (fsat.baseGasDensity.inputType === 'dewPoint') {
      results = this.getPsychrometricDewPoint(fsat.baseGasDensity, settings);
    }

    if (results) {
      psychrometricResults = results;
      psychrometricResults.dryBulbTemp = fsat.baseGasDensity.dryBulbTemp;
      psychrometricResults.barometricPressure = fsat.baseGasDensity.barometricPressure;
    }


    return psychrometricResults;
  }

  getVelocityPressureData(inputs: Plane, settings: Settings): VelocityResults {
    inputs = this.convertFanAnalysisService.convertPlaneForCalculations(inputs, settings);
    let results: VelocityResults = this.fansSuiteApiService.getVelocityPressureData(inputs);
    if (settings.fanPressureMeasurement !== 'inH2o') {
      results.pv3 = this.convertUnitsService.value(results.pv3).from('inH2o').to(settings.fanPressureMeasurement);
    }
    return results;
  }

  getPlaneResults(input: Fan203Inputs, settings: Settings): PlaneResults {
    let inputCpy: Fan203Inputs = JSON.parse(JSON.stringify(input));
    inputCpy = this.convertFanAnalysisService.convertFan203DataForCalculations(inputCpy, settings);
    let results: PlaneResults = this.fansSuiteApiService.getPlaneResults(inputCpy);
    results = this.convertFanAnalysisService.convertPlaneResults(results, settings);
    return results;
  }

  getInput(fsat: FSAT, settings: Settings) {
    let input: FsatInput = {
      fanSpeed: fsat.fanSetup.fanSpeed,
      drive: fsat.fanSetup.drive,
      specifiedDriveEfficiency: fsat.fanSetup.specifiedDriveEfficiency | 100,
      lineFrequency: fsat.fanMotor.lineFrequency,
      motorRatedPower: fsat.fanMotor.motorRatedPower,
      motorRpm: fsat.fanMotor.motorRpm,
      efficiencyClass: fsat.fanMotor.efficiencyClass,
      fanEfficiency: fsat.fanSetup.fanEfficiency,
      //motor
      specifiedEfficiency: fsat.fanMotor.specifiedEfficiency,
      motorRatedVoltage: fsat.fanMotor.motorRatedVoltage,
      fullLoadAmps: fsat.fanMotor.fullLoadAmps,
      sizeMargin: 1,
      measuredVoltage: fsat.fieldData.measuredVoltage,
      //???????
      measuredAmps: fsat.fieldData.motorPower,
      flowRate: fsat.fieldData.flowRate,
      inletPressure: fsat.fieldData.inletPressure,
      velocityPressure: fsat.fieldData.inletVelocityPressure,
      outletPressure: fsat.fieldData.outletPressure,
      compressibilityFactor: fsat.fieldData.compressibilityFactor,
      operatingHours: fsat.fsatOperations.operatingHours,
      unitCost: fsat.fsatOperations.cost,
      airDensity: fsat.baseGasDensity.gasDensity
    };

    input = this.convertFsatService.convertInputDataForCalculations(input, settings);
    return input;
  }

  //fsat results
  getResults(fsat: FSAT, isBaseline: boolean, settings: Settings): FsatOutput {
    let fsatValid: FsatValid = this.checkValid(fsat, isBaseline, settings)
    if (fsatValid.isValid) {
      if (!fsat.fsatOperations.operatingHours && fsat.fsatOperations.operatingFraction) {
        fsat.fsatOperations.operatingHours = fsat.fsatOperations.operatingFraction * 8760;
      }
      let input: FsatInput = {
        fanSpeed: fsat.fanSetup.fanSpeed,
        drive: fsat.fanSetup.drive,
        specifiedDriveEfficiency: fsat.fanSetup.drive === 4 ? fsat.fanSetup.specifiedDriveEfficiency : 100,
        lineFrequency: fsat.fanMotor.lineFrequency,
        motorRatedPower: fsat.fanMotor.motorRatedPower,
        motorRpm: fsat.fanMotor.motorRpm,
        efficiencyClass: fsat.fanMotor.efficiencyClass,
        fanEfficiency: fsat.fanSetup.fanEfficiency,
        //motor
        specifiedEfficiency: fsat.fanMotor.specifiedEfficiency,
        motorRatedVoltage: fsat.fanMotor.motorRatedVoltage,
        fullLoadAmps: fsat.fanMotor.fullLoadAmps,
        measuredVoltage: fsat.fieldData.measuredVoltage,
        //???????
        measuredAmps: fsat.fieldData.motorPower,
        flowRate: fsat.fieldData.flowRate,
        inletPressure: fsat.fieldData.inletPressure,
        velocityPressure: fsat.fieldData.inletVelocityPressure,
        outletPressure: fsat.fieldData.outletPressure,
        compressibilityFactor: fsat.fieldData.compressibilityFactor,
        operatingHours: fsat.fsatOperations.operatingHours,
        unitCost: fsat.fsatOperations.cost,
        airDensity: fsat.baseGasDensity.gasDensity,
        sizeMargin: 1,
        cO2SavingsData: fsat.fsatOperations.cO2SavingsData
      };
      input = this.convertFsatService.convertInputDataForCalculations(input, settings);
      let fsatOutputs: FsatOutput;
      if (isBaseline || !fsat.whatIfScenario) {
        input.loadEstimationMethod = fsat.fieldData.loadEstimatedMethod;
        input.measuredPower = fsat.fieldData.motorPower;
        fsatOutputs = this.fanResultsExisting(input);
      } else {
        input.fanType = fsat.fanSetup.fanType;
        fsatOutputs = this.fanResultsModified(input);
      }
      fsatOutputs = this.setCo2SavingsEmissionsResult(input, fsatOutputs, settings);
      fsatOutputs = this.convertFsatService.convertFsatOutput(fsatOutputs, settings);
      fsatOutputs.annualCost = fsatOutputs.annualCost * 1000;
      fsatOutputs.psychrometricResults = this.getPsychrometricResults(fsat, settings);
      let fan203InputsForPlaneResults: Fan203Inputs = this.getFan203InputForPlaneResults(fsat);
      if (fan203InputsForPlaneResults) {
        fsat.fan203InputsForPlaneResults = fan203InputsForPlaneResults;
        fsatOutputs.planeResults = this.getPlaneResults(fan203InputsForPlaneResults, settings);
      }
      return  fsatOutputs;
    } else {
      return this.getEmptyResults();
    }
  }

  setIntegratedAssessmentData(integratedAssessment: IntegratedAssessment, settings: Settings) {
    let energyOptions: IntegratedEnergyOptions = {
      baseline: undefined,
      modifications: []
    }

    let fsat: FSAT = integratedAssessment.assessment.fsat;
    let baselineOutputs: FsatOutput = this.getResults(fsat, true, settings);
    baselineOutputs.annualEnergy = this.convertUnitsService.value(baselineOutputs.annualEnergy).from('MWh').to('kWh');
    baselineOutputs.annualEnergy = this.convertUnitsService.roundVal(baselineOutputs.annualEnergy, 0)

    energyOptions.baseline = {
      name: fsat.name,
      annualEnergy: baselineOutputs.annualEnergy,
      annualCost: baselineOutputs.annualCost,
      co2EmissionsOutput: baselineOutputs.co2EmissionsOutput,
      energyThDisplayUnits: 'kWh'
    };

    let baselineEnergy: EnergyUseItem = {
      type: 'Electricity',
      amount: baselineOutputs.annualEnergy,
      integratedEnergyCost: baselineOutputs.annualCost,
      integratedEmissionRate: baselineOutputs.co2EmissionsOutput
    };

    integratedAssessment.hasModifications = integratedAssessment.assessment.fsat.modifications && integratedAssessment.assessment.fsat.modifications.length !== 0;
    if (integratedAssessment.hasModifications) {
      let modificationEnergyOptions: Array<ModificationEnergyOption> = [];
      fsat.modifications.forEach(modification => {
        let modificationOutputs: FsatOutput = this.getResults(modification.fsat, false, settings);
        modificationOutputs.annualEnergy = this.convertUnitsService.value(modificationOutputs.annualEnergy).from('MWh').to('kWh');
        modificationOutputs.annualEnergy = this.convertUnitsService.roundVal(modificationOutputs.annualEnergy, 0)

        energyOptions.modifications.push({
          name: modification.fsat.name,
          annualEnergy: modificationOutputs.annualEnergy,
          annualCost: modificationOutputs.annualCost,
          modificationId: modification.id,
          co2EmissionsOutput: modificationOutputs.co2EmissionsOutput
        });


        let modificationEnergy: EnergyUseItem = {
          type: 'Electricity',
          amount: modificationOutputs.annualEnergy,
          integratedEnergyCost: modificationOutputs.annualCost,
          integratedEmissionRate: modificationOutputs.co2EmissionsOutput
        }

        modificationEnergyOptions.push(
          {
            modificationId: modification.id,
            energies: [modificationEnergy]
          })
      });
      integratedAssessment.modificationEnergyUseItems = modificationEnergyOptions;
    }
    integratedAssessment.assessmentType = 'FSAT';
    integratedAssessment.baselineEnergyUseItems = [baselineEnergy];
    integratedAssessment.thEquipmentType = 'fan';
    integratedAssessment.energyOptions = energyOptions; 
    integratedAssessment.navigation = {
      queryParams: undefined,
      url: '/fsat/' + integratedAssessment.assessment.id
    }

  }

  getFan203InputForPlaneResults(fsat: FSAT): Fan203Inputs {
    let hasFanRatedInfo: boolean = fsat.fieldData.fanRatedInfo !== undefined;
    let hasBaseGasDensity: boolean = fsat.baseGasDensity !== undefined;
    let hasPlaneData: boolean = fsat.fieldData.planeData !== undefined;
    let fan203Inputs: Fan203Inputs;
    if (hasFanRatedInfo && hasBaseGasDensity && hasPlaneData) {
      fan203Inputs = {
        FanRatedInfo: fsat.fieldData.fanRatedInfo,
        BaseGasDensity: fsat.baseGasDensity,
        FanShaftPower: undefined,
        PlaneData: fsat.fieldData.planeData,
      }
    }
    return fan203Inputs;
  }

  fanResultsExisting(input: FsatInput): FsatOutput {
    return this.fansSuiteApiService.calculateExisting(input);
  }
  fanResultsModified(input: FsatInput): FsatOutput {
    return this.fansSuiteApiService.calculateModified(input);
  }

  getSavingsPercentage(baselineCost: number, modificationCost: number): number {
    let tmpSavingsPercent = Number(Math.round(((((baselineCost - modificationCost) * 100) / baselineCost) * 100) / 100).toFixed(0));
    return tmpSavingsPercent;
  }

  getPaybackPeriod(annualCostSavings: number, implementationCosts: number): number {
    if (!implementationCosts || (annualCostSavings ?? 0) <= 0) return 0;
    return (implementationCosts / annualCostSavings) * 12;
  }

  checkValid(fsat: FSAT, isBaseline: boolean, settings): FsatValid {
    let fsatOperationsValid: boolean = this.fanOperationsService.isOperationsDataValid(fsat.fsatOperations);
    let fsatFluidValid: boolean = this.fsatFluidService.isFanFluidValid(fsat.baseGasDensity, settings);
    let fieldDataValid: boolean = this.fanFieldDataService.isFanFieldDataValid(fsat.fieldData);
    let fanSetupValid: boolean = this.fanSetupService.isFanSetupValid(fsat.fanSetup, !isBaseline);
    let fanMotorValid: boolean = this.fanMotorService.isFanMotorValid(fsat.fanMotor);
    return {
      isValid: fieldDataValid && fanSetupValid && fanMotorValid && fsatFluidValid && fsatOperationsValid,
      fluidValid: fsatFluidValid,
      fanValid: fanSetupValid,
      motorValid: fanMotorValid,
      fieldDataValid: fieldDataValid,
      fsatOperationsValid:fsatOperationsValid 

    };
  }

  optimalFanEfficiency(inputs: FanEfficiencyInputs, settings: Settings): number {
    if (settings.fanFlowRate !== 'ft3/min') {
      inputs.flowRate = this.convertUnitsService.value(inputs.flowRate).from('m3').to('ft3');
    }
    inputs.inletPressure = this.convertUnitsService.value(inputs.inletPressure).from(settings.fanPressureMeasurement).to('inH2o');
    inputs.outletPressure = this.convertUnitsService.value(inputs.outletPressure).from(settings.fanPressureMeasurement).to('inH2o');
    return this.fansSuiteApiService.optimalFanEfficiency(inputs);
  }

  setCo2SavingsEmissionsResult(fsatInputs: FsatInput, fsatOutputs: FsatOutput, settings: Settings): FsatOutput {
    if (fsatInputs.cO2SavingsData != undefined) {
      fsatInputs.cO2SavingsData.electricityUse = fsatOutputs.annualEnergy;
      fsatOutputs.co2EmissionsOutput = this.assessmentCo2Service.getCo2EmissionsResult(fsatInputs.cO2SavingsData, settings);
    } else {
      let co2SavingsData: Co2SavingsData = this.assessmentCo2Service.getCo2SavingsDataFromSettingsObject(settings);
      fsatInputs.cO2SavingsData = co2SavingsData;
      fsatInputs.cO2SavingsData.electricityUse = fsatOutputs.annualEnergy;
      fsatOutputs.co2EmissionsOutput = this.assessmentCo2Service.getCo2EmissionsResult(fsatInputs.cO2SavingsData, settings);
    }
    return fsatOutputs;
  }

  getEmptyResults(): FsatOutput {
    let emptyResults: FsatOutput = {
      fanEfficiency: 0,
      motorRatedPower: 0,
      motorShaftPower: 0,
      fanShaftPower: 0,
      motorEfficiency: 0,
      motorPowerFactor: 0,
      motorCurrent: 0,
      motorPower: 0,
      loadFactor: 0,
      driveEfficiency: 0,
      annualEnergy: 0,
      annualCost: 0,
      fanEnergyIndex: 0,
      //modified
      estimatedFLA: 0,
      percentSavings: 0,
      energySavings: 0,
      annualSavings: 0,
      co2EmissionsOutput: 0,
      emissionsSavings: 0
    };
    return emptyResults;
  }

  calculateInletVelocityPressure(calculationInputs: InletVelocityPressureInputs, settings: Settings): number {
    let flowRate: number = this.convertUnitsService.value(calculationInputs.flowRate).from(settings.fanFlowRate).to('m3/s');
    let ductArea: number = calculationInputs.ductArea;

    if (settings.unitsOfMeasure === 'Imperial') {
      ductArea = this.convertUnitsService.value(calculationInputs.ductArea).from('ft2').to('m2');
    }
    let gasDensity: number = this.convertUnitsService.value(calculationInputs.gasDensity).from(settings.densityMeasurement).to('kgNm3');
    let flowVelocity: number = (flowRate / ductArea);

    // units == Pa
    let inletVelocityPressure: number = .5 * gasDensity * Math.pow(flowVelocity, 2);
    inletVelocityPressure = this.convertUnitsService.value(inletVelocityPressure).from('Pa').to(settings.fanPressureMeasurement);

    if (isNaN(inletVelocityPressure) || !isFinite(inletVelocityPressure)) {
      inletVelocityPressure = undefined;
    } else {
      inletVelocityPressure = Number(inletVelocityPressure.toFixed(5));
    }
    return inletVelocityPressure;
  }


  getNewMod(fsat: FSAT, settings: Settings): Modification {
    let modNum: number = 1;
    if (fsat.modifications) {
      modNum = fsat.modifications.length + 1;
    }
    let modName: string = 'Scenario ' + modNum;
    let tmpModification: Modification = {
      fsat: {
        name: modName,
        notes: {
          fieldDataNotes: '',
          fanMotorNotes: '',
          fanSetupNotes: '',
          fluidNotes: ''
        }
      },
      id: getNewIdString(),
      exploreOpportunities: (this.assessmentTab.value === 'explore-opportunities')
    };
    let tmpBaselineResults: FsatOutput = this.getResults(fsat, true, settings);
    let fsatCopy: FSAT = (JSON.parse(JSON.stringify(fsat)));
    tmpModification.fsat.baseGasDensity = fsatCopy.baseGasDensity;
    tmpModification.fsat.fanMotor = fsatCopy.fanMotor;
    tmpModification.fsat.fanSetup = fsatCopy.fanSetup;
    //specified, set efficiency to calculated baseline efficiency
    tmpModification.fsat.fanSetup.fanType = 12;
    tmpModification.fsat.fanSetup.fanEfficiency = this.convertUnitsService.roundVal(tmpBaselineResults.fanEfficiency, 2);
    tmpModification.fsat.fieldData = fsatCopy.fieldData;
    tmpModification.fsat.whatIfScenario = true;
    tmpModification.fsat.fsatOperations = fsatCopy.fsatOperations;
    tmpModification.fsat.fsatOperations.cO2SavingsData = fsatCopy.fsatOperations.cO2SavingsData;
    if (fsatCopy.fsatOperations.cO2SavingsData) {
      tmpModification.fsat.fsatOperations.cO2SavingsData.userEnteredModificationEmissions = fsatCopy.fsatOperations.cO2SavingsData.userEnteredBaselineEmissions;
    }
    return tmpModification;
  }
}

export interface InletVelocityPressureInputs {
  gasDensity: number,
  flowRate: number,
  ductArea: number
}