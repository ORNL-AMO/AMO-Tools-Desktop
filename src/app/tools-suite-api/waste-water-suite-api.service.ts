import { Injectable } from '@angular/core';
import { WasteWaterResults, WasteWaterTreatmentInputData } from '../shared/models/waste-water';
import { SuiteApiHelperService } from './suite-api-helper.service';
import { ToolsSuiteApiService } from './tools-suite-api.service';
import {
  type CalculationsTable,
  type CalculationsTableV,
  type DoubleVector,
  type WasteWater_Treatment,
  type WasteWater_TreatmentOutput,
  type WasteWater_TreatmentOutputWithoutTable
} from 'measur-tools-suite';

type WasteWaterTreatmentSuiteOutput = (WasteWater_TreatmentOutput | WasteWater_TreatmentOutputWithoutTable) & {
  AeEnergyAnnual?: number;
  costSavings?: number;
  energySavings?: number;
  percentCostSavings?: number;
};

@Injectable()
export class WasteWaterSuiteApiService {

  constructor(private suiteApiHelperService: SuiteApiHelperService, private toolsSuiteApiService: ToolsSuiteApiService) { }
  wasteWaterTreatment(inputData: WasteWaterTreatmentInputData, hasGivenSRT: boolean = false): WasteWaterResults{
    // null on new assessment?
    inputData.DefinedSRT = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.DefinedSRT);
    let WasteWaterTreatmentInstance: WasteWater_Treatment = new this.toolsSuiteApiService.ToolsSuiteModule.WasteWater_Treatment(
      inputData.Temperature,
      inputData.So,
      inputData.Volume,
      inputData.FlowRate,
      inputData.InertVSS,
      inputData.OxidizableN,
      inputData.Biomass,
      inputData.InfluentTSS,
      inputData.InertInOrgTSS,
      inputData.EffluentTSS,
      inputData.RASTSS,
      inputData.MLSSpar,
      inputData.FractionBiomass,
      inputData.BiomassYeild,
      inputData.HalfSaturation,
      inputData.MicrobialDecay,
      inputData.MaxUtilizationRate,
      inputData.MaxDays,
      inputData.TimeIncrement,
      inputData.OperatingDO,
      inputData.Alpha,
      inputData.Beta,
      inputData.SOTR,
      inputData.Aeration,
      inputData.Elevation,
      inputData.OperatingTime,
      inputData.TypeAerators,
      inputData.Speed,
      inputData.EnergyCostUnit,
      inputData.DefinedSRT
    );
    let wasteWaterTreatmentOutput: WasteWaterTreatmentSuiteOutput | undefined;
    let calculationsTable: CalculationsTableV | undefined;

    try {
      if (hasGivenSRT) {
        wasteWaterTreatmentOutput = WasteWaterTreatmentInstance.calculateGivenSRT();
      } else {
        wasteWaterTreatmentOutput = WasteWaterTreatmentInstance.calculate();
      }

      const wasteWaterTreatmentResults: WasteWaterResults = this.getWasteWaterResultsFromOutputObject(wasteWaterTreatmentOutput);
      if ('calculationsTable' in wasteWaterTreatmentOutput) {
        calculationsTable = wasteWaterTreatmentOutput.calculationsTable;
        if (calculationsTable) {
          wasteWaterTreatmentResults.calculationsTable = this.getConvertedCalculationsTableArray(calculationsTable);
        }
      }
      return wasteWaterTreatmentResults;
    } finally {
      calculationsTable?.delete();
      wasteWaterTreatmentOutput?.delete();
      WasteWaterTreatmentInstance.delete();
    }
  }

  getConvertedCalculationsTableArray(resultArray: CalculationsTableV): Array<Array<number>> {
    const convertedCalculationsTable: Array<Array<number>> = [];
    for (let i: number = 0; i < resultArray.size(); ++i) {
      const calculationRow: CalculationsTable = resultArray.get(i);
      let rowVector: DoubleVector | undefined;
      try {
        rowVector = calculationRow.getArray();
        convertedCalculationsTable.push(this.suiteApiHelperService.extractWASMArray(rowVector));
      } finally {
        rowVector?.delete();
        calculationRow.delete();
      }
    }
    return convertedCalculationsTable;
  }

  getWasteWaterResultsFromOutputObject(output: WasteWaterTreatmentSuiteOutput): WasteWaterResults {
    let wasteWaterResults: WasteWaterResults = {
      co2EmissionsOutput: undefined,
      co2EmissionsSavings: undefined,
      TotalAverageDailyFlowRate: output.TotalAverageDailyFlowRate,
      VolumeInService: output.VolumeInService,
      InfluentBOD5Concentration: output.InfluentBOD5Concentration,
      InfluentBOD5MassLoading: output.InfluentBOD5MassLoading,
      SecWWOxidNLoad: output.SecWWOxidNLoad,
      SecWWTSSLoad: output.SecWWTSSLoad,
      FM_ratio: output.FM_ratio,
      SolidsRetentionTime: output.SolidsRetentionTime,
      MLSS: output.MLSS,
      MLVSS: output.MLVSS,
      TSSSludgeProduction: output.TSSSludgeProduction,
      TSSInActivatedSludgeEffluent: output.TSSInActivatedSludgeEffluent,
      TotalOxygenRequirements: output.TotalOxygenRequirements,
      TotalOxygenReqWDenit: output.TotalOxygenReqWDenit,
      TotalOxygenSupplied: output.TotalOxygenSupplied,
      MixingIntensityInReactor: output.MixingIntensityInReactor,
      RASFlowRate: output.RASFlowRate,
      RASRecyclePercentage: output.RASRecyclePercentage,
      WASFlowRate: output.WASFlowRate,
      RASTSSConcentration: output.RASTSSConcentration,
      TotalSludgeProduction: output.TotalSludgeProduction,
      ReactorDetentionTime: output.ReactorDetentionTime,
      VOLR: output.VOLR,
      EffluentCBOD5: output.EffluentCBOD5,
      EffluentTSS: output.EffluentTSS,
      EffluentAmmonia_N: output.EffluentAmmonia_N,
      EffluentNO3_N: output.EffluentNO3_N,
      EffluentNO3_N_W_Denit: output.EffluentNO3_N_W_Denit,
      AeEnergy: output.AeEnergy,
      AeEnergyAnnual: output.AeEnergyAnnual,
      AeCost: output.AeCost,
      FieldOTR: output.FieldOTR,
      costSavings: output.costSavings,
      energySavings: output.energySavings,
      percentCostSavings: output.percentCostSavings,
      calculationsTable: undefined,
      calculationsTableMapped: undefined
    }
    return wasteWaterResults;
  }
 
}
