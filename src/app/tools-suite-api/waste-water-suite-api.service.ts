import { Injectable } from '@angular/core';
import { WasteWaterResults, WasteWaterTreatmentInputData } from '../shared/models/waste-water';

declare var Module: any;
@Injectable()
export class WasteWaterSuiteApiService {

  constructor() { }
  
  wasteWaterTreatment(inputData: WasteWaterTreatmentInputData, hasGivenSRT: boolean = false): WasteWaterResults{
    let WasteWaterTreatmentInstance = new Module.WasteWater_Treatment(
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
    let wasteWaterTreatmentResults: WasteWaterResults;
    let wasteWaterTreatmentOutput;
    
    if (hasGivenSRT) {
      wasteWaterTreatmentOutput = WasteWaterTreatmentInstance.calculateGivenSRT();
    } else {
      wasteWaterTreatmentOutput = WasteWaterTreatmentInstance.calculate();
    }

    wasteWaterTreatmentResults = this.getWasteWaterResultsFromOutputObject(wasteWaterTreatmentOutput);
    if (wasteWaterTreatmentOutput.calculationsTable) {
      wasteWaterTreatmentResults.calculationsTable = this.getConvertedCalculationsTableArray(wasteWaterTreatmentOutput.calculationsTable);
    }

    WasteWaterTreatmentInstance.delete();
    return wasteWaterTreatmentResults;
  }

  getConvertedCalculationsTableArray(resultArray: any): Array<Array<number>> {
    let convertedCalculationsTable: Array<Array<number>> = [];
    for (let i = 0; i < resultArray.size(); ++i) {
      let tempArray = resultArray.get(i).getArray();
      if (tempArray) {
        let calcTable: Array<number> = [];
        for(let j = 0; j < tempArray.size(); j++){
          calcTable.push(tempArray.get(j));
        }
        convertedCalculationsTable.push(calcTable);
      }
      
    }
    return convertedCalculationsTable;
  }

  getWasteWaterResultsFromOutputObject(output) {
    let wasteWaterResults: WasteWaterResults = {
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
