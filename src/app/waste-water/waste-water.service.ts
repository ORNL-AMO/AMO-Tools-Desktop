import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Settings } from '../shared/models/settings';
import { ActivatedSludgeData, AeratorPerformanceData, CalculationsTableRow, SystemBasics, WasteWater, WasteWaterData, WasteWaterResults, WasteWaterTreatmentInputData } from '../shared/models/waste-water';
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
  focusedField: BehaviorSubject<string>;
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
    this.focusedField = new BehaviorSubject<string>('default');
  }


  calculateResults(activatedSludgeData: ActivatedSludgeData, aeratorPerformanceData: AeratorPerformanceData, systemBasics: SystemBasics, settings: Settings, baselineResults?: WasteWaterResults): WasteWaterResults {
    let isDataValid: boolean = this.checkWasteWaterValid(activatedSludgeData, aeratorPerformanceData, systemBasics);
    if (isDataValid) {
      let activatedSludgeCopy: ActivatedSludgeData = JSON.parse(JSON.stringify(activatedSludgeData));
      let aeratorPerformanceCopy: AeratorPerformanceData = JSON.parse(JSON.stringify(aeratorPerformanceData));
      if (settings.unitsOfMeasure != 'Imperial') {
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
      let wasteWaterResults: WasteWaterResults = wasteWaterAddon.WasteWaterTreatment(inputData);
      wasteWaterResults.calculationsTableMapped = this.mapCalculationsTable(wasteWaterResults.calculationsTable);
      console.log(wasteWaterResults);
      if (settings.unitsOfMeasure != 'Imperial') {
        wasteWaterResults = this.convertWasteWaterService.convertResultsToMetric(wasteWaterResults);
      }
      if (baselineResults != undefined) {
        wasteWaterResults = this.setSavingsResults(wasteWaterResults, baselineResults);
      }
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
      FieldOTR: undefined,
      costSavings: 0,
      energySavings: 0,
      percentCostSavings: 0,
      calculationsTable: new Array(new Array()),
      calculationsTableMapped: new Array()
    };
  }

  setSavingsResults(modificationResults: WasteWaterResults, baselineResults: WasteWaterResults): WasteWaterResults {
    modificationResults.costSavings = baselineResults.AeCost - modificationResults.AeCost;
    modificationResults.energySavings = baselineResults.AeEnergy - modificationResults.AeEnergy;
    modificationResults.percentCostSavings = (modificationResults.costSavings / baselineResults.AeCost) * 100;
    return modificationResults;
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

  mapCalculationsTable(calculationsTable: Array<Array<number>>): Array<CalculationsTableRow> {
    let calculationsTableMapped: Array<CalculationsTableRow> = new Array();
    let index: number = 0
    calculationsTable.forEach(row => {
      let mappedRow: CalculationsTableRow = this.getCalculationsTableRow(row, index);
      calculationsTableMapped.push(mappedRow);
      index++;
    });
    return calculationsTableMapped;
  }


  getCalculationsTableRow(row: Array<number>, index: number): CalculationsTableRow {
    return {
      index: index,
      Se: row[0],
      HeterBio: row[1],
      CellDeb: row[2],
      InterVes: row[3],
      MLVSS: row[4],
      MLSS: row[5],
      BiomassProd: row[6],
      SludgeProd: row[7],
      SolidProd: row[8],
      Effluent: row[9],
      IntentWaste: row[10],
      OxygenRqd: row[11],
      FlowMgd: row[12],
      NRemoved: row[13],
      NRemovedMgl: row[14],
      NitO2Dem: row[15],
      O2Reqd: row[16],
      EffNH3N: row[17],
      EffNo3N: row[18],
      TotalO2Rqd: row[19],
      WAS: row[20],
      EstimatedEff: row[21],
      EstimRas: row[22],
      FmRatio: row[23],
      Diff_MLSS: row[24],
      SRT: row[25]
    }
  }
}
