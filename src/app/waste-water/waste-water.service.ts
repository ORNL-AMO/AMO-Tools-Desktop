import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Settings } from '../shared/models/settings';
import { ActivatedSludgeData, AeratorPerformanceData, ModelingOptions, WasteWater, WasteWaterData, WasteWaterResults } from '../shared/models/waste-water';
import { ActivatedSludgeFormService } from './activated-sludge-form/activated-sludge-form.service';
import { AeratorPerformanceFormService } from './aerator-performance-form/aerator-performance-form.service';
import { ModelingOptionsFormService } from './modeling-options-form/modeling-options-form.service';

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
  constructor(private activatedSludgeFormService: ActivatedSludgeFormService, private aeratorPerformanceFormService: AeratorPerformanceFormService, private modelingOptionsFormService: ModelingOptionsFormService) {
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


  calculateResults(activatedSludgeData: ActivatedSludgeData, aeratorPerformanceData: AeratorPerformanceData, modelingOptions: ModelingOptions): WasteWaterResults {
    let isDataValid: boolean = this.checkWasteWaterValid(activatedSludgeData, aeratorPerformanceData, modelingOptions);
    if (isDataValid) {
      let wasteWaterResults: WasteWaterResults = wasteWaterAddon.WasteWaterTreatment(
        {
          Temperature: activatedSludgeData.Temperature,
          So: activatedSludgeData.So,
          Volume: activatedSludgeData.Volume,
          FlowRate: activatedSludgeData.FlowRate,
          InertVSS: activatedSludgeData.InertVSS,
          OxidizableN: activatedSludgeData.OxidizableN,
          Biomass: activatedSludgeData.Biomass,
          InfluentTSS: activatedSludgeData.InfluentTSS,
          InertInOrgTSS: activatedSludgeData.InertInOrgTSS,
          EffluentTSS: activatedSludgeData.EffluentTSS,
          RASTSS: activatedSludgeData.RASTSS,
          MLSSpar: activatedSludgeData.MLSSpar,
          FractionBiomass: activatedSludgeData.FractionBiomass,
          BiomassYeild: activatedSludgeData.BiomassYeild,
          HalfSaturation: activatedSludgeData.HalfSaturation,
          MicrobialDecay: activatedSludgeData.MicrobialDecay,
          MaxUtilizationRate: activatedSludgeData.MaxUtilizationRate,
          MaxDays: modelingOptions.MaxDays,
          TimeIncrement: modelingOptions.TimeIncrement,
          OperatingDO: aeratorPerformanceData.OperatingDO,
          Alpha: aeratorPerformanceData.Alpha,
          Beta: aeratorPerformanceData.Beta,
          SOTR: aeratorPerformanceData.SOTR,
          Aeration: aeratorPerformanceData.Aeration,
          Elevation: aeratorPerformanceData.Elevation,
          OperatingTime: aeratorPerformanceData.OperatingTime,
          TypeAerators: aeratorPerformanceData.TypeAerators,
          Speed: aeratorPerformanceData.Speed,
          EnergyCostUnit: aeratorPerformanceData.EnergyCostUnit
        }
      );
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


  checkWasteWaterValid(activatedSludgeData: ActivatedSludgeData, aeratorPerformanceData: AeratorPerformanceData, modelingOptions: ModelingOptions): boolean {
    let activatedSludgeForm: FormGroup = this.activatedSludgeFormService.getFormFromObj(activatedSludgeData);
    let aeratorPerformanceForm: FormGroup = this.aeratorPerformanceFormService.getFormFromObj(aeratorPerformanceData);
    let modelingOptionsForm: FormGroup = this.modelingOptionsFormService.getFormFromObj(modelingOptions);
    return activatedSludgeForm.valid && aeratorPerformanceForm.valid && modelingOptionsForm.valid;
  }

  getModificationFromId(): WasteWaterData {
    let selectedModificationId: string = this.selectedModificationId.getValue();
    let wasteWater: WasteWater = this.wasteWater.getValue();
    let selectedModification: WasteWaterData = wasteWater.modifications.find(modification => { return modification.id == selectedModificationId });
    return selectedModification;
  }
}
