import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Settings } from '../shared/models/settings';
import { ActivatedSludgeData, AeratorPerformanceData, SystemBasics, WasteWater, WasteWaterData, WasteWaterResults, WasteWaterTreatmentInputData } from '../shared/models/waste-water';
import { ActivatedSludgeFormService } from './activated-sludge-form/activated-sludge-form.service';
import { AeratorPerformanceFormService } from './aerator-performance-form/aerator-performance-form.service';
import { ConvertWasteWaterService } from './convert-waste-water.service';
import { SystemBasicsService } from './system-basics/system-basics.service';

declare var wasteWaterAddon: any;
@Injectable()
export class WasteWaterService {

  wasteWater: BehaviorSubject<WasteWater>;
  mainTab: BehaviorSubject<string>;
  setupTab: BehaviorSubject<string>;
  assessmentTab: BehaviorSubject<string>;
  settings: BehaviorSubject<Settings>;
  showAddModificationModal: BehaviorSubject<boolean>;
  showModificationListModal: BehaviorSubject<boolean>;
  isModalOpen: BehaviorSubject<boolean>;
  modifyConditionsTab: BehaviorSubject<string>;
  selectedModificationId: BehaviorSubject<string>;
  constructor(private activatedSludgeFormService: ActivatedSludgeFormService, private aeratorPerformanceFormService: AeratorPerformanceFormService, private systemBasicsService: SystemBasicsService,
    private convertWasteWaterService: ConvertWasteWaterService) {
    this.mainTab = new BehaviorSubject<string>('system-setup');
    this.setupTab = new BehaviorSubject<string>('system-basics');
    this.assessmentTab = new BehaviorSubject<string>('modify-conditions');
    this.settings = new BehaviorSubject<Settings>(undefined);
    this.wasteWater = new BehaviorSubject<WasteWater>(undefined);
    this.showAddModificationModal = new BehaviorSubject<boolean>(false);
    this.showModificationListModal = new BehaviorSubject<boolean>(false);
    this.isModalOpen = new BehaviorSubject<boolean>(false);
    this.modifyConditionsTab = new BehaviorSubject<string>('activated-sludge');
    this.selectedModificationId = new BehaviorSubject<string>(undefined);
  }


  calculateResults(activatedSludgeData: ActivatedSludgeData, aeratorPerformanceData: AeratorPerformanceData, systemBasics: SystemBasics, settings: Settings): WasteWaterResults {
    let isDataValid: boolean = this.checkWasteWaterValid(activatedSludgeData, aeratorPerformanceData, systemBasics);
    if (isDataValid) {
      let activatedSludgeCopy: ActivatedSludgeData = JSON.parse(JSON.stringify(activatedSludgeData));
      let aeratorPerformanceCopy: AeratorPerformanceData = JSON.parse(JSON.stringify(aeratorPerformanceData));
      if (settings.unitsOfMeasure != 'Imperial') {
        console.log('convert');
        let settingsCopy: Settings = JSON.parse(JSON.stringify(settings));
        settingsCopy.unitsOfMeasure = 'Imperial';
        activatedSludgeCopy = this.convertWasteWaterService.convertActivatedSludgeData(activatedSludgeCopy, settings, settingsCopy);
        aeratorPerformanceCopy = this.convertWasteWaterService.convertAeratorPerformanceData(aeratorPerformanceCopy, settings, settingsCopy)
      }
      let inputData: WasteWaterTreatmentInputData = {
        Temperature: activatedSludgeCopy.Temperature,
        So: activatedSludgeCopy.So,
        Volume: activatedSludgeCopy.Volume,
        FlowRate: activatedSludgeCopy.FlowRate,
        InertVSS: activatedSludgeCopy.InertVSS,
        OxidizableN: activatedSludgeCopy.OxidizableN,
        Biomass: activatedSludgeCopy.Biomass,
        InfluentTSS: activatedSludgeCopy.InfluentTSS,
        InertInOrgTSS: activatedSludgeCopy.InertInOrgTSS,
        EffluentTSS: activatedSludgeCopy.EffluentTSS,
        RASTSS: activatedSludgeCopy.RASTSS,
        MLSSpar: activatedSludgeCopy.MLSSpar,
        FractionBiomass: activatedSludgeCopy.FractionBiomass,
        BiomassYeild: activatedSludgeCopy.BiomassYeild,
        HalfSaturation: activatedSludgeCopy.HalfSaturation,
        MicrobialDecay: activatedSludgeCopy.MicrobialDecay,
        MaxUtilizationRate: activatedSludgeCopy.MaxUtilizationRate,
        MaxDays: systemBasics.MaxDays,
        TimeIncrement: systemBasics.TimeIncrement,
        OperatingDO: aeratorPerformanceCopy.OperatingDO,
        Alpha: aeratorPerformanceCopy.Alpha,
        Beta: aeratorPerformanceCopy.Beta,
        SOTR: aeratorPerformanceCopy.SOTR,
        Aeration: aeratorPerformanceCopy.Aeration,
        Elevation: aeratorPerformanceCopy.Elevation,
        OperatingTime: aeratorPerformanceCopy.OperatingTime,
        TypeAerators: aeratorPerformanceCopy.TypeAerators,
        Speed: aeratorPerformanceCopy.Speed,
        EnergyCostUnit: aeratorPerformanceCopy.EnergyCostUnit
      }
      console.log(inputData);
      let wasteWaterResults: WasteWaterResults = wasteWaterAddon.WasteWaterTreatment(inputData);
      return wasteWaterResults;
    }
    return {
      TotalAverageDailyFlowRate: undefined,
      VolumeInService: undefined,
      InfluentBOD5Concentration: undefined,
      InfluentBOD5MassLoading: undefined,
      SecWWOxidNLoad: undefined,
      SecWWTSSLoad: undefined,
      FM_ratio: undefined,
      SolidsRetentionTime: undefined,
      MLSS: undefined,
      MLVSS: undefined,
      TSSSludgeProduction: undefined,
      TSSInActivatedSludgeEffluent: undefined,
      TotalOxygenRequirements: undefined,
      TotalOxygenReqWDenit: undefined,
      TotalOxygenSupplied: undefined,
      MixingIntensityInReactor: undefined,
      RASFlowRate: undefined,
      RASRecyclePercentage: undefined,
      WASFlowRate: undefined,
      RASTSSConcentration: undefined,
      TotalSludgeProduction: undefined,
      ReactorDetentionTime: undefined,
      VOLR: undefined,
      EffluentCBOD5: undefined,
      EffluentTSS: undefined,
      EffluentAmmonia_N: undefined,
      EffluentNO3_N: undefined,
      EffluentNO3_N_W_Denit: undefined,
      AeEnergy: undefined,
      AeCost: undefined,
      FieldOTR: undefined
    };
  }


  checkWasteWaterValid(activatedSludgeData: ActivatedSludgeData, aeratorPerformanceData: AeratorPerformanceData, systemBasics: SystemBasics): boolean {
    let activatedSludgeForm: FormGroup = this.activatedSludgeFormService.getFormFromObj(activatedSludgeData);
    let aeratorPerformanceForm: FormGroup = this.aeratorPerformanceFormService.getFormFromObj(aeratorPerformanceData);
    let systemBasicsForm: FormGroup = this.systemBasicsService.getFormFromObj(systemBasics);
    return activatedSludgeForm.valid && aeratorPerformanceForm.valid && systemBasicsForm.valid;
  }

  getModificationFromId(): WasteWaterData {
    let selectedModificationId: string = this.selectedModificationId.getValue();
    let wasteWater: WasteWater = this.wasteWater.getValue();
    let selectedModification: WasteWaterData = wasteWater.modifications.find(modification => { return modification.id == selectedModificationId });
    return selectedModification;
  }
}
