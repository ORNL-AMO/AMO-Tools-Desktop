import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { Settings } from '../shared/models/settings';
import { ActivatedSludgeData, AeratorPerformanceData, CalculationsTableRow, SystemBasics, WasteWater, WasteWaterData, WasteWaterResults, WasteWaterTreatmentInputData, WasteWaterValid } from '../shared/models/waste-water';
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
    private convertWasteWaterService: ConvertWasteWaterService, private convertUnitsService: ConvertUnitsService) {
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

  updateWasteWater(wasteWater: WasteWater) {
    wasteWater.baselineData.valid = this.checkWasteWaterValid(wasteWater.baselineData.activatedSludgeData, wasteWater.baselineData.aeratorPerformanceData, wasteWater.systemBasics);
    wasteWater.setupDone = wasteWater.baselineData.valid.isValid;
    wasteWater.modifications.forEach(mod => {
      mod.valid = this.checkWasteWaterValid(mod.activatedSludgeData, mod.aeratorPerformanceData, wasteWater.systemBasics);
    });
    this.wasteWater.next(wasteWater);
  }

  calculateResults(activatedSludgeData: ActivatedSludgeData, aeratorPerformanceData: AeratorPerformanceData, systemBasics: SystemBasics, settings: Settings, needCalculationsTable: boolean, baselineResults?: WasteWaterResults): WasteWaterResults {
    let isDataValid: boolean = this.checkWasteWaterValid(activatedSludgeData, aeratorPerformanceData, systemBasics).isValid;
    if (isDataValid) {
      let activatedSludgeCopy: ActivatedSludgeData = JSON.parse(JSON.stringify(activatedSludgeData));
      let aeratorPerformanceCopy: AeratorPerformanceData = JSON.parse(JSON.stringify(aeratorPerformanceData));
      if (settings.unitsOfMeasure != 'Imperial') {
        let settingsCopy: Settings = JSON.parse(JSON.stringify(settings));
        settingsCopy.unitsOfMeasure = 'Imperial';
        activatedSludgeCopy = this.convertWasteWaterService.convertActivatedSludgeData(activatedSludgeCopy, settings, settingsCopy);
        aeratorPerformanceCopy = this.convertWasteWaterService.convertAeratorPerformanceData(aeratorPerformanceCopy, settings, settingsCopy)
      }
      let inputData: WasteWaterTreatmentInputData = this.mapWasteWaterTreatementInputData(activatedSludgeCopy, aeratorPerformanceCopy, systemBasics);
      let wasteWaterResults: WasteWaterResults;
      if (activatedSludgeCopy.CalculateGivenSRT == true) {
        wasteWaterResults = this.calculateResultsDefinedSRT(inputData);
        if (needCalculationsTable == true) {
          inputData.MLSSpar = wasteWaterResults.MLSS;
          wasteWaterResults = this.calculateResultsDefinedMLSS(inputData);
        }
      } else {
        wasteWaterResults = this.calculateResultsDefinedMLSS(inputData);
      }
      //return per month, convert to years
      wasteWaterResults.AeEnergyAnnual = wasteWaterResults.AeEnergy * systemBasics.operatingMonths;
      wasteWaterResults.AeCost = wasteWaterResults.AeCost * systemBasics.operatingMonths;
      wasteWaterResults.AeEnergyAnnual = this.convertUnitsService.value(wasteWaterResults.AeEnergyAnnual).from('kWh').to('MWh');
      if (settings.unitsOfMeasure != 'Imperial') {
        wasteWaterResults = this.convertWasteWaterService.convertResultsToMetric(wasteWaterResults);
      }
      if (wasteWaterResults.calculationsTable) {
        wasteWaterResults.calculationsTableMapped = this.mapCalculationsTable(wasteWaterResults.calculationsTable, settings);
      }
      if (baselineResults != undefined) {
        wasteWaterResults = this.setSavingsResults(wasteWaterResults, baselineResults);
      }
      return wasteWaterResults;
    }
    return this.getEmptyResults();
  }

  calculateResultsDefinedMLSS(inputData: WasteWaterTreatmentInputData): WasteWaterResults {
    let wasteWaterResults: WasteWaterResults = wasteWaterAddon.WasteWaterTreatment(inputData);
    return wasteWaterResults;
  }

  calculateResultsDefinedSRT(inputData: WasteWaterTreatmentInputData): WasteWaterResults {
    let wasteWaterResults: WasteWaterResults = wasteWaterAddon.WasteWaterTreatmentGivenSRT(inputData);
    return wasteWaterResults;
  }

  mapWasteWaterTreatementInputData(activatedSludge: ActivatedSludgeData, aeratorPerformance: AeratorPerformanceData, systemBasics: SystemBasics): WasteWaterTreatmentInputData {
    let inputData: WasteWaterTreatmentInputData = {
      Temperature: activatedSludge.Temperature,
      So: activatedSludge.So,
      Volume: activatedSludge.Volume,
      FlowRate: activatedSludge.FlowRate,
      InertVSS: activatedSludge.InertVSS,
      OxidizableN: activatedSludge.OxidizableN,
      Biomass: activatedSludge.Biomass,
      InfluentTSS: activatedSludge.InfluentTSS,
      InertInOrgTSS: activatedSludge.InertInOrgTSS,
      EffluentTSS: activatedSludge.EffluentTSS,
      RASTSS: activatedSludge.RASTSS,
      MLSSpar: activatedSludge.MLSSpar,
      FractionBiomass: activatedSludge.FractionBiomass,
      BiomassYeild: activatedSludge.BiomassYeild,
      HalfSaturation: activatedSludge.HalfSaturation,
      MicrobialDecay: activatedSludge.MicrobialDecay,
      MaxUtilizationRate: activatedSludge.MaxUtilizationRate,
      MaxDays: systemBasics.MaxDays,
      TimeIncrement: systemBasics.TimeIncrement,
      OperatingDO: aeratorPerformance.OperatingDO,
      Alpha: aeratorPerformance.Alpha,
      Beta: aeratorPerformance.Beta,
      SOTR: aeratorPerformance.SOTR,
      Aeration: aeratorPerformance.Aeration,
      Elevation: aeratorPerformance.Elevation,
      OperatingTime: aeratorPerformance.OperatingTime,
      TypeAerators: aeratorPerformance.TypeAerators,
      Speed: aeratorPerformance.Speed,
      EnergyCostUnit: aeratorPerformance.EnergyCostUnit,
      DefinedSRT: activatedSludge.DefinedSRT
    }
    return inputData;

  }

  getEmptyResults(): WasteWaterResults {
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
      AeEnergyAnnual: undefined,
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
    modificationResults.energySavings = baselineResults.AeEnergyAnnual - modificationResults.AeEnergyAnnual;
    modificationResults.percentCostSavings = (modificationResults.costSavings / baselineResults.AeCost) * 100;
    return modificationResults;
  }

  checkWasteWaterValid(activatedSludgeData: ActivatedSludgeData, aeratorPerformanceData: AeratorPerformanceData, systemBasics: SystemBasics): WasteWaterValid {
    let activatedSludgeForm: FormGroup = this.activatedSludgeFormService.getFormFromObj(activatedSludgeData);
    let aeratorPerformanceForm: FormGroup = this.aeratorPerformanceFormService.getFormFromObj(aeratorPerformanceData);
    let systemBasicsForm: FormGroup = this.systemBasicsService.getFormFromObj(systemBasics);
    return {
      activatedSludgeValid: activatedSludgeForm.valid,
      aeratorPerformanceValid: aeratorPerformanceForm.valid,
      systemBasicsValid: systemBasicsForm.valid,
      isValid: activatedSludgeForm.valid && aeratorPerformanceForm.valid && systemBasicsForm.valid
    };
  }

  getModificationFromId(): WasteWaterData {
    let selectedModificationId: string = this.selectedModificationId.getValue();
    let wasteWater: WasteWater = this.wasteWater.getValue();
    let selectedModification: WasteWaterData = wasteWater.modifications.find(modification => { return modification.id == selectedModificationId });
    return selectedModification;
  }

  mapCalculationsTable(calculationsTable: Array<Array<number>>, settings: Settings): Array<CalculationsTableRow> {
    let calculationsTableMapped: Array<CalculationsTableRow> = new Array();
    let index: number = 0
    calculationsTable.forEach(row => {
      let mappedRow: CalculationsTableRow = this.getCalculationsTableRow(row, index);
      if (settings.unitsOfMeasure != 'Imperial') {
        mappedRow = this.convertWasteWaterService.convertCalcTableRowResultToMetric(mappedRow);
      }
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
      InertWaste: row[10],
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

  calculateModDo(modificationIndex: number): number {
    let wasteWater: WasteWater = this.wasteWater.getValue();
    let settings: Settings = this.settings.getValue();
    let startingValue: number = wasteWater.modifications[modificationIndex].aeratorPerformanceData.OperatingDO;
    let modification: WasteWaterData = JSON.parse(JSON.stringify(wasteWater.modifications[modificationIndex]));
    if (!modification.aeratorPerformanceData.OperatingDO || modification.aeratorPerformanceData.OperatingDO < 0) {
      modification.aeratorPerformanceData.OperatingDO = 1;
    }
    let modificationResults: WasteWaterResults = this.calculateResults(modification.activatedSludgeData, modification.aeratorPerformanceData, wasteWater.systemBasics, settings, false);
    let definedSRT: number = modificationResults.SolidsRetentionTime;
    let optimalDo: number = modification.aeratorPerformanceData.OperatingDO;
    let difference: number = this.checkDifference(modification, modificationResults);
    let counter: number = 0;
    while (Math.abs(difference) > 1 && counter < 1000 && isNaN(difference) == false) {
      if (difference > 100) {
        optimalDo = optimalDo - .1;
      } else if (difference > 10) {
        optimalDo = optimalDo - .01;
      } else if (difference > 0) {
        optimalDo = optimalDo - .001;
      } else if (difference < 10) {
        optimalDo = optimalDo + .01;
      } else if (difference < 100) {
        optimalDo = optimalDo + .1;
      }
      modification.aeratorPerformanceData.OperatingDO = optimalDo;
      modification.activatedSludgeData.DefinedSRT = definedSRT;
      modification.activatedSludgeData.CalculateGivenSRT = true;
      modificationResults = this.calculateResults(modification.activatedSludgeData, modification.aeratorPerformanceData, wasteWater.systemBasics, settings, false);
      difference = this.checkDifference(modification, modificationResults);
      counter++;
    }
    if (isNaN(difference)) {
      return startingValue;
    } else {
      return Number((optimalDo).toFixed(2));
    }
  }

  calculateModOperatingTime(modificationIndex: number): number {
    let wasteWater: WasteWater = this.wasteWater.getValue();
    let settings: Settings = this.settings.getValue();
    let startingValue: number = wasteWater.modifications[modificationIndex].aeratorPerformanceData.OperatingTime;
    let modification: WasteWaterData = JSON.parse(JSON.stringify(wasteWater.modifications[modificationIndex]));
    if (!modification.aeratorPerformanceData.OperatingTime || modification.aeratorPerformanceData.OperatingTime > 24
      || modification.aeratorPerformanceData.OperatingTime < 0) {
      modification.aeratorPerformanceData.OperatingTime = 24;
    }

    let modificationResults: WasteWaterResults = this.calculateResults(modification.activatedSludgeData, modification.aeratorPerformanceData, wasteWater.systemBasics, settings, false);
    let definedSRT: number = modificationResults.SolidsRetentionTime;
    let operatingTime: number = modification.aeratorPerformanceData.OperatingTime;
    let difference: number = this.checkDifference(modification, modificationResults);
    let counter: number = 0;
    if (!operatingTime) {
      operatingTime = 24;
    }
    while (Math.abs(difference) > 1 && counter < 1000 && isNaN(difference) == false) {
      if (difference > 0 && difference < 10) {
        operatingTime = operatingTime + .01;
      } else if (difference > 0 && difference > 100) {
        operatingTime = operatingTime + 1;
      } else if (difference > 0 && difference > 10) {
        operatingTime = operatingTime + .1;
      } else if (difference < 0 && difference < -100) {
        operatingTime = operatingTime - 1;
      } else if (difference < 0 && difference > -10) {
        operatingTime = operatingTime - .01;
      } else if (difference < 0 && difference < -10) {
        operatingTime = operatingTime - .1;
      }
      modification.aeratorPerformanceData.OperatingTime = operatingTime;
      modification.activatedSludgeData.DefinedSRT = definedSRT;
      modification.activatedSludgeData.CalculateGivenSRT = true;
      modificationResults = this.calculateResults(modification.activatedSludgeData, modification.aeratorPerformanceData, wasteWater.systemBasics, settings, false);
      difference = this.checkDifference(modification, modificationResults);
      counter++;
    }
    if (operatingTime < 16) {
      operatingTime = 16;
    }
    if (operatingTime > 24) {
      operatingTime = 24;
    }
    if (isNaN(difference)) {
      return startingValue;
    } else {
      return Number((operatingTime).toFixed(1));
    }
  }


  checkDifference(inputs: WasteWaterData, results: WasteWaterResults): number {
    if (inputs.aeratorPerformanceData.AnoxicZoneCondition) {
      return results.TotalOxygenReqWDenit - results.TotalOxygenSupplied;
    } else {
      return results.TotalOxygenRequirements - results.TotalOxygenSupplied;
    }
  }

  calculateModSpeed(modificationIndex: number): number {
    let wasteWater: WasteWater = this.wasteWater.getValue();
    let settings: Settings = this.settings.getValue();
    let startingValue: number = wasteWater.modifications[modificationIndex].aeratorPerformanceData.Speed;
    let modification: WasteWaterData = JSON.parse(JSON.stringify(wasteWater.modifications[modificationIndex]));
    if (!modification.aeratorPerformanceData.Speed || modification.aeratorPerformanceData.Speed > 100
      || modification.aeratorPerformanceData.Speed < 0) {
      modification.aeratorPerformanceData.Speed = 100;
    }
    let modificationResults: WasteWaterResults = this.calculateResults(modification.activatedSludgeData, modification.aeratorPerformanceData, wasteWater.systemBasics, settings, false);
    let definedSRT: number = modificationResults.SolidsRetentionTime;
    let speed: number = modification.aeratorPerformanceData.Speed;
    let difference: number = this.checkDifference(modification, modificationResults);
    let counter: number = 0;
    while (Math.abs(difference) > 1 && counter < 1000 && isNaN(difference) == false) {
      if (difference > 0 && difference < 10) {
        speed = speed + .01;
      } else if (difference > 0 && difference > 100) {
        speed = speed + 1;
      } else if (difference > 0 && difference > 10) {
        speed = speed + .1;
      } else if (difference < 0 && difference > -10) {
        speed = speed - .01;
      } else if (difference < 0 && difference < -100) {
        speed = speed - 1;
      } else if (difference < 0 && difference < -10) {
        speed = speed - .1;
      }
      modification.aeratorPerformanceData.Speed = speed;
      modification.activatedSludgeData.DefinedSRT = definedSRT;
      modification.activatedSludgeData.CalculateGivenSRT = true;
      modificationResults = this.calculateResults(modification.activatedSludgeData, modification.aeratorPerformanceData, wasteWater.systemBasics, settings, false);
      difference = this.checkDifference(modification, modificationResults);
      counter++;
    }
    if (speed < 50) {
      speed = 50;
    }
    if (speed > 100) {
      speed = 100;
    }
    if (isNaN(difference)) {
      return startingValue;
    } else {
      return Number((speed).toFixed(1));
    }
  }
}
