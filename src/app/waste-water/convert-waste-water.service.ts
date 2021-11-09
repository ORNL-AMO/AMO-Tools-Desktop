import { Injectable } from '@angular/core';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { Settings } from '../shared/models/settings';
import { ActivatedSludgeData, AeratorPerformanceData, CalculationsTableRow, WasteWater, WasteWaterData, WasteWaterResults } from '../shared/models/waste-water';

@Injectable()
export class ConvertWasteWaterService {

  constructor(private convertUnitsService: ConvertUnitsService) { }

  convertWasteWater(wasteWater: WasteWater, oldSettings: Settings, newSettings: Settings): WasteWater {
    wasteWater.baselineData = this.convertWasteWaterData(wasteWater.baselineData, oldSettings, newSettings);
    wasteWater.modifications.forEach(modification => {
      modification = this.convertWasteWaterData(modification, oldSettings, newSettings);
    });
    return wasteWater;
  }

  convertWasteWaterData(wasteWaterData: WasteWaterData, oldSettings: Settings, newSettings: Settings): WasteWaterData {
    wasteWaterData.activatedSludgeData = this.convertActivatedSludgeData(wasteWaterData.activatedSludgeData, oldSettings, newSettings);
    wasteWaterData.aeratorPerformanceData = this.convertAeratorPerformanceData(wasteWaterData.aeratorPerformanceData, oldSettings, newSettings);
    return wasteWaterData;
  }

  convertActivatedSludgeData(activatedSludgeData: ActivatedSludgeData, oldSettings: Settings, newSettings: Settings): ActivatedSludgeData {
    //Volume: metric = m3, imperial = Mgal
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      activatedSludgeData.Volume = this.convertUnitsService.value(activatedSludgeData.Volume).from('m3').to('Mgal');
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      activatedSludgeData.Volume = this.convertUnitsService.value(activatedSludgeData.Volume).from('Mgal').to('m3');
    }
    activatedSludgeData.Volume = this.convertUnitsService.roundVal(activatedSludgeData.Volume, 2);
    return activatedSludgeData;
  }

  convertAeratorPerformanceData(aeratorPerformanceData: AeratorPerformanceData, oldSettings: Settings, newSettings: Settings): AeratorPerformanceData {
    //SOTR metric = kg/kWh, imperial lb/hr
    //Aeration metric = kW, imperial = hp
    //Elevation metric = m, imperial = ft
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      aeratorPerformanceData.SOTR = this.convertUnitsService.value(aeratorPerformanceData.SOTR).from('kgkw').to('lbhp');
      aeratorPerformanceData.Aeration = this.convertUnitsService.value(aeratorPerformanceData.Aeration).from('kW').to('hp');
      aeratorPerformanceData.Elevation = this.convertUnitsService.value(aeratorPerformanceData.Elevation).from('m').to('ft');
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      aeratorPerformanceData.SOTR = this.convertUnitsService.value(aeratorPerformanceData.SOTR).from('lbhp').to('kgkw');
      aeratorPerformanceData.Aeration = this.convertUnitsService.value(aeratorPerformanceData.Aeration).from('hp').to('kW');
      aeratorPerformanceData.Elevation = this.convertUnitsService.value(aeratorPerformanceData.Elevation).from('ft').to('m');
    }
    aeratorPerformanceData.SOTR = this.convertUnitsService.roundVal(aeratorPerformanceData.SOTR, 2);
    aeratorPerformanceData.Aeration = this.convertUnitsService.roundVal(aeratorPerformanceData.Aeration, 2);
    aeratorPerformanceData.Elevation = this.convertUnitsService.roundVal(aeratorPerformanceData.Elevation, 2);
    return aeratorPerformanceData;
  }


  convertResultsToMetric(wasteWaterResults: WasteWaterResults): WasteWaterResults {
    // TotalAverageDailyFlowRate: metric = m3/day, imperial = mgd 
    wasteWaterResults.TotalAverageDailyFlowRate = this.convertUnitsService.value(wasteWaterResults.TotalAverageDailyFlowRate).from('Mgal').to('m3');
    // VolumeInService: metric = m3, imperial = Mgal
    wasteWaterResults.VolumeInService = this.convertUnitsService.value(wasteWaterResults.VolumeInService).from('Mgal').to('m3');
    // InfluentBOD5MassLoading: metric = kg, imperial = lb
    wasteWaterResults.InfluentBOD5MassLoading = this.convertUnitsService.value(wasteWaterResults.InfluentBOD5MassLoading).from('lb').to('kg');
    // SecWWOxidNLoad: metric = kg, imperial = lb
    wasteWaterResults.SecWWOxidNLoad = this.convertUnitsService.value(wasteWaterResults.SecWWOxidNLoad).from('lb').to('kg');
    // SecWWTSSLoad: metric = kg, imperial = lb
    wasteWaterResults.SecWWTSSLoad = this.convertUnitsService.value(wasteWaterResults.SecWWTSSLoad).from('lb').to('kg');
    // TSSSludgeProduction: metric = kg, imperial = lb
    wasteWaterResults.TSSSludgeProduction = this.convertUnitsService.value(wasteWaterResults.TSSSludgeProduction).from('lb').to('kg');
    // TSSInActivatedSludgeEffluent: metric = kg, imperial = lb
    wasteWaterResults.TSSInActivatedSludgeEffluent = this.convertUnitsService.value(wasteWaterResults.TSSInActivatedSludgeEffluent).from('lb').to('kg');
    // TotalOxygenRequirements: metric = kg, imperial = lb
    wasteWaterResults.TotalOxygenRequirements = this.convertUnitsService.value(wasteWaterResults.TotalOxygenRequirements).from('lb').to('kg');
    // TotalOxygenReqWDenit: metric = kg, imperial = lb
    wasteWaterResults.TotalOxygenReqWDenit = this.convertUnitsService.value(wasteWaterResults.TotalOxygenReqWDenit).from('lb').to('kg');
    // TotalOxygenSupplied: metric = kg, imperial = lb
    wasteWaterResults.TotalOxygenSupplied = this.convertUnitsService.value(wasteWaterResults.TotalOxygenSupplied).from('lb').to('kg');

    // MixingIntensityInReactor: metric = kW/m3, imperial = hp/Mgal
    wasteWaterResults.MixingIntensityInReactor = this.convertUnitsService.value(wasteWaterResults.MixingIntensityInReactor).from('hpMgal').to('kWm3');

    // RASFlowRate: metric = m3/day, imperial = mgd 
    wasteWaterResults.RASFlowRate = this.convertUnitsService.value(wasteWaterResults.RASFlowRate).from('Mgal').to('m3');
    // WASFlowRate: metric = m3/day, imperial = mgd 
    wasteWaterResults.WASFlowRate = this.convertUnitsService.value(wasteWaterResults.WASFlowRate).from('Mgal').to('m3');
    // TotalSludgeProduction: metric = kg, imperial = lb
    wasteWaterResults.TotalSludgeProduction = this.convertUnitsService.value(wasteWaterResults.TotalSludgeProduction).from('lb').to('kg');

    // VOLR: metric = kg/m3, imperial = lb/kft3
    wasteWaterResults.VOLR = this.convertUnitsService.value(wasteWaterResults.VOLR).from('lbkft3').to('kgNm3');
    return wasteWaterResults;
  }

  convertResultsCosts(wasteWaterResults: WasteWaterResults, settings: Settings): WasteWaterResults {
    if (settings.currency !== "$") {
      wasteWaterResults.AeCost = this.convertUnitsService.value(wasteWaterResults.AeCost).from("$").to(settings.currency);
      wasteWaterResults.costSavings = this.convertUnitsService.value(wasteWaterResults.costSavings).from("$").to(settings.currency);
    }
    return wasteWaterResults
  }

  convertCalcTableRowResultToMetric(row: CalculationsTableRow): CalculationsTableRow {
    //metric = kg, imperial = lb
    row.BiomassProd = this.convertUnitsService.value(row.BiomassProd).from('lb').to('kg');
    row.SludgeProd = this.convertUnitsService.value(row.SludgeProd).from('lb').to('kg');
    row.SolidProd = this.convertUnitsService.value(row.SolidProd).from('lb').to('kg');
    row.Effluent = this.convertUnitsService.value(row.Effluent).from('lb').to('kg');
    row.InertWaste = this.convertUnitsService.value(row.InertWaste).from('lb').to('kg');
    row.OxygenRqd = this.convertUnitsService.value(row.OxygenRqd).from('lb').to('kg');
    row.FlowMgd = this.convertUnitsService.value(row.FlowMgd).from('lb').to('kg');
    row.TotalO2Rqd = this.convertUnitsService.value(row.TotalO2Rqd).from('lb').to('kg');
    row.NRemoved = this.convertUnitsService.value(row.NRemoved).from('lb').to('kg');
    row.NitO2Dem = this.convertUnitsService.value(row.NitO2Dem).from('lb').to('kg');
    row.O2Reqd = this.convertUnitsService.value(row.O2Reqd).from('lb').to('kg');
    //metric = m3, imperial = Mgal
    row.NRemovedMgl = this.convertUnitsService.value(row.NRemovedMgl).from('Mgal').to('m3');
    row.WAS = this.convertUnitsService.value(row.WAS).from('Mgal').to('m3');
    row.EstimRas = this.convertUnitsService.value(row.EstimRas).from('Mgal').to('m3');
    return row;
  }

}
