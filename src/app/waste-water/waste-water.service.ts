import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Settings } from '../shared/models/settings';
import { ActivatedSludgeData, AeratorPerformanceData, ModelingOptions, WasteWater, WasteWaterResults } from '../shared/models/waste-water';
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
  constructor(private activatedSludgeFormService: ActivatedSludgeFormService, private aeratorPerformanceFormService: AeratorPerformanceFormService, private modelingOptionsFormService: ModelingOptionsFormService) {
    this.mainTab = new BehaviorSubject<string>('system-setup');
    this.setupTab = new BehaviorSubject<string>('system-basics');
    this.assessmentTab = new BehaviorSubject<string>('modify-conditions');
    this.settings = new BehaviorSubject<Settings>(undefined);
    this.wasteWater = new BehaviorSubject<WasteWater>(undefined);
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
    return undefined;
  }


  checkWasteWaterValid(activatedSludgeData: ActivatedSludgeData, aeratorPerformanceData: AeratorPerformanceData, modelingOptions: ModelingOptions): boolean {
    let activatedSludgeForm: FormGroup = this.activatedSludgeFormService.getFormFromObj(activatedSludgeData);
    let aeratorPerformanceForm: FormGroup = this.aeratorPerformanceFormService.getFormFromObj(aeratorPerformanceData);
    let modelingOptionsForm: FormGroup = this.modelingOptionsFormService.getFormFromObj(modelingOptions);
    return activatedSludgeForm.valid && aeratorPerformanceForm.valid && modelingOptionsForm.valid;
  }
}
