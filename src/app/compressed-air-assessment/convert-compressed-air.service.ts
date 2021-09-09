import { Injectable } from '@angular/core';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { CompressedAirAssessment, CompressorControls, CompressorInventoryItem, CompressorNameplateData, DesignDetails, InletConditions, PerformancePoint, PerformancePoints, ProfileSummary, ProfileSummaryData, SystemInformation, SystemProfile } from '../shared/models/compressed-air-assessment';
import { Settings } from '../shared/models/settings';

@Injectable()
export class ConvertCompressedAirService {

  constructor(private convertUnitsService: ConvertUnitsService) { }

  convertCompressedAir(compressedAirAssessment: CompressedAirAssessment, oldSettings: Settings, newSettings: Settings): CompressedAirAssessment {
    compressedAirAssessment = this.convertCompressedAirAssessmentData(compressedAirAssessment, oldSettings, newSettings);
    // if (compressedAirAssessment.modifications && compressedAirAssessment.modifications.length > 0) {
    //   compressedAirAssessment.modifications.forEach(modification => {
    //     modification = this.convertCompressedAirAssessmentData(modification, oldSettings, newSettings);
    //   });
    // }
    return compressedAirAssessment;
  }

  convertCompressedAirAssessmentData(compressedAirData: CompressedAirAssessment, oldSettings: Settings, newSettings: Settings): CompressedAirAssessment {
    compressedAirData.systemInformation = this.convertSystemInformation(compressedAirData.systemInformation, oldSettings, newSettings);
    compressedAirData.compressorInventoryItems = this.convertCompressorInventoryItems(compressedAirData.compressorInventoryItems, oldSettings, newSettings);
    compressedAirData.systemProfile = this.convertSystemProfile(compressedAirData.systemProfile, oldSettings, newSettings);
    return compressedAirData;
  }
  
  convertSystemInformation(systemInformation: SystemInformation, oldSettings: Settings, newSettings: Settings): SystemInformation {
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      systemInformation.systemElevation = this.convertUnitsService.value(systemInformation.systemElevation).from('m').to('ft');
      // dbl check
      systemInformation.totalAirStorage = this.convertUnitsService.value(systemInformation.totalAirStorage).from('m3').to('gal');
      systemInformation.targetPressure = this.convertUnitsService.value(systemInformation.targetPressure).from('barg').to('psig');
      systemInformation.variance = this.convertUnitsService.value(systemInformation.variance).from('barg').to('psig');
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      systemInformation.systemElevation = this.convertUnitsService.value(systemInformation.systemElevation).from('ft').to('m');
      systemInformation.totalAirStorage = this.convertUnitsService.value(systemInformation.totalAirStorage).from('gal').to('m3');
      systemInformation.targetPressure = this.convertUnitsService.value(systemInformation.targetPressure).from('psig').to('barg');
      systemInformation.variance = this.convertUnitsService.value(systemInformation.variance).from('psig').to('barg');
    }
    systemInformation.systemElevation = this.convertUnitsService.roundVal(systemInformation.systemElevation, 2);
    systemInformation.totalAirStorage = this.convertUnitsService.roundVal(systemInformation.totalAirStorage, 2);
    systemInformation.targetPressure = this.convertUnitsService.roundVal(systemInformation.targetPressure, 2);
    systemInformation.variance = this.convertUnitsService.roundVal(systemInformation.variance, 2);
    return systemInformation;
  }

  convertCompressorInventoryItems(compressorInventoryItems: Array<CompressorInventoryItem>, oldSettings: Settings, newSettings: Settings): Array<CompressorInventoryItem> {
    compressorInventoryItems.forEach((compressorItem: CompressorInventoryItem) => {
      compressorItem.nameplateData = this.convertNamePlateData(compressorItem.nameplateData, oldSettings, newSettings);
      compressorItem.compressorControls = this.convertControls(compressorItem.compressorControls, oldSettings, newSettings);
      compressorItem.inletConditions = this.convertInletConditions(compressorItem.inletConditions, oldSettings, newSettings);
      compressorItem.designDetails = this.convertDesignDetails(compressorItem.designDetails, oldSettings, newSettings);
      compressorItem.performancePoints = this.convertPerformancePoints(compressorItem.performancePoints, oldSettings, newSettings);
    });
    return compressorInventoryItems;
  }

  convertNamePlateData(namePlateData: CompressorNameplateData, oldSettings: Settings, newSettings: Settings): CompressorNameplateData {
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      namePlateData.motorPower = this.convertUnitsService.value(namePlateData.motorPower).from('kW').to('hp');
      namePlateData.fullLoadOperatingPressure = this.convertUnitsService.value(namePlateData.fullLoadOperatingPressure).from('barg').to('psig');
      namePlateData.fullLoadRatedCapacity = this.convertUnitsService.value(namePlateData.fullLoadRatedCapacity).from('m3/min').to('ft3/min');

    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      namePlateData.motorPower = this.convertUnitsService.value(namePlateData.motorPower).from('hp').to('kW');
      namePlateData.fullLoadOperatingPressure = this.convertUnitsService.value(namePlateData.fullLoadOperatingPressure).from('psig').to('barg');
      namePlateData.fullLoadRatedCapacity = this.convertUnitsService.value(namePlateData.fullLoadRatedCapacity).from('ft3/min').to('m3/min');
    }
    namePlateData.motorPower = this.convertUnitsService.roundVal(namePlateData.motorPower, 2);
    namePlateData.fullLoadOperatingPressure = this.convertUnitsService.roundVal(namePlateData.fullLoadOperatingPressure, 2);
    namePlateData.fullLoadRatedCapacity = this.convertUnitsService.roundVal(namePlateData.fullLoadRatedCapacity, 2);

    return namePlateData;
  }

  convertControls(controls: CompressorControls, oldSettings: Settings, newSettings: Settings): CompressorControls {
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      controls.unloadSumpPressure = this.convertUnitsService.value(controls.unloadSumpPressure).from('barg').to('psig');
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      controls.unloadSumpPressure = this.convertUnitsService.value(controls.unloadSumpPressure).from('psig').to('barg');
    }
    controls.unloadSumpPressure = this.convertUnitsService.roundVal(controls.unloadSumpPressure, 2);
    return controls;
  }

  convertInletConditions(inletConditions: InletConditions, oldSettings: Settings, newSettings: Settings): InletConditions {
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      inletConditions.atmosphericPressure = this.convertUnitsService.value(inletConditions.atmosphericPressure).from('barg').to('psig');
      inletConditions.temperature = this.convertUnitsService.value(inletConditions.temperature).from('C').to('F');
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      inletConditions.atmosphericPressure = this.convertUnitsService.value(inletConditions.atmosphericPressure).from('psig').to('barg');
      inletConditions.temperature = this.convertUnitsService.value(inletConditions.temperature).from('F').to('C');
    }
    inletConditions.atmosphericPressure = this.convertUnitsService.roundVal(inletConditions.atmosphericPressure, 2);
    inletConditions.temperature = this.convertUnitsService.roundVal(inletConditions.temperature, 2);
    return inletConditions;
  }

  convertDesignDetails(designDetails: DesignDetails, oldSettings: Settings, newSettings: Settings): DesignDetails {
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      designDetails.modulatingPressureRange = this.convertUnitsService.value(designDetails.modulatingPressureRange).from('barg').to('psig');
      designDetails.maxFullFlowPressure = this.convertUnitsService.value(designDetails.maxFullFlowPressure).from('barg').to('psig');
      designDetails.inputPressure = this.convertUnitsService.value(designDetails.inputPressure).from('bara').to('psia');
      
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      designDetails.modulatingPressureRange = this.convertUnitsService.value(designDetails.modulatingPressureRange).from('psig').to('barg');
      designDetails.maxFullFlowPressure = this.convertUnitsService.value(designDetails.maxFullFlowPressure).from('psig').to('barg');
      designDetails.inputPressure = this.convertUnitsService.value(designDetails.inputPressure).from('psia').to('bara');
    }
    designDetails.modulatingPressureRange = this.convertUnitsService.roundVal(designDetails.modulatingPressureRange, 2);
    designDetails.maxFullFlowPressure = this.convertUnitsService.roundVal(designDetails.maxFullFlowPressure, 2);
    designDetails.inputPressure = this.convertUnitsService.roundVal(designDetails.inputPressure, 2);

    return designDetails;
  }

  convertPerformancePoints(performancePoints: PerformancePoints, oldSettings: Settings, newSettings: Settings): PerformancePoints {
    performancePoints.fullLoad = this.convertPerformancePoint(performancePoints.fullLoad, oldSettings, newSettings);
    performancePoints.maxFullFlow = this.convertPerformancePoint(performancePoints.maxFullFlow, oldSettings, newSettings);
    performancePoints.unloadPoint = this.convertPerformancePoint(performancePoints.unloadPoint, oldSettings, newSettings);
    performancePoints.noLoad = this.convertPerformancePoint(performancePoints.noLoad, oldSettings, newSettings);
    performancePoints.blowoff = this.convertPerformancePoint(performancePoints.blowoff, oldSettings, newSettings);

    return performancePoints;
  }

  convertPerformancePoint(performancePoint: PerformancePoint, oldSettings: Settings, newSettings: Settings): PerformancePoint {
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      performancePoint.dischargePressure = this.convertUnitsService.value(performancePoint.dischargePressure).from('barg').to('psig');
      performancePoint.airflow = this.convertUnitsService.value(performancePoint.airflow).from('m3/min').to('ft3/min');
          
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      performancePoint.dischargePressure = this.convertUnitsService.value(performancePoint.dischargePressure).from('psig').to('barg');
      performancePoint.airflow = this.convertUnitsService.value(performancePoint.airflow).from('ft3/min').to('m3/min');
    }
    performancePoint.dischargePressure = this.convertUnitsService.roundVal(performancePoint.dischargePressure, 2);
    performancePoint.airflow = this.convertUnitsService.roundVal(performancePoint.airflow, 2);

    return performancePoint;
  }


  convertSystemProfile(systemProfile: SystemProfile, oldSettings: Settings, newSettings: Settings): SystemProfile {
    systemProfile.profileSummary.forEach((summary: ProfileSummary) => {
      if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
        summary.fullLoadPressure = this.convertUnitsService.value(summary.fullLoadPressure).from('barg').to('psig');
        summary.fullLoadCapacity = this.convertUnitsService.value(summary.fullLoadCapacity).from('m3/min').to('ft3/min');
      } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
        summary.fullLoadPressure = this.convertUnitsService.value(summary.fullLoadPressure).from('psig').to('barg');
        summary.fullLoadCapacity = this.convertUnitsService.value(summary.fullLoadCapacity).from('ft3/min').to('m3/min');
      }
      summary.fullLoadPressure = this.convertUnitsService.roundVal(summary.fullLoadPressure, 2);
      summary.fullLoadCapacity = this.convertUnitsService.roundVal(summary.fullLoadCapacity, 2);

    summary.profileSummaryData = this.convertSystemProfileSummaryData(summary.profileSummaryData, oldSettings, newSettings);
  });
    return systemProfile;
  }

  convertSystemProfileSummaryData(profileSummaryData: Array<ProfileSummaryData>, oldSettings: Settings, newSettings: Settings): Array<ProfileSummaryData> {
    profileSummaryData.forEach((data: ProfileSummaryData) => {
      if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
        data.airflow = this.convertUnitsService.value(data.airflow).from('ft3/min').to('m3/min');
      } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
        data.airflow = this.convertUnitsService.value(data.airflow).from('m3/min').to('ft3/min');
      }
      data.airflow = this.convertUnitsService.roundVal(data.airflow, 2);
    });
    return profileSummaryData
}

  // convertResultsToMetric(wasteWaterResults: WasteWaterResults): WasteWaterResults {
  //   // TotalAverageDailyFlowRate: metric = m3/day, imperial = mgd 
  //   wasteWaterResults.TotalAverageDailyFlowRate = this.convertUnitsService.value(wasteWaterResults.TotalAverageDailyFlowRate).from('Mgal').to('m3');
  //   // VolumeInService: metric = m3, imperial = Mgal
  //   wasteWaterResults.VolumeInService = this.convertUnitsService.value(wasteWaterResults.VolumeInService).from('Mgal').to('m3');
  //   // InfluentBOD5MassLoading: metric = kg, imperial = lb
  //   wasteWaterResults.InfluentBOD5MassLoading = this.convertUnitsService.value(wasteWaterResults.InfluentBOD5MassLoading).from('lb').to('kg');
  //   // SecWWOxidNLoad: metric = kg, imperial = lb
  //   wasteWaterResults.SecWWOxidNLoad = this.convertUnitsService.value(wasteWaterResults.SecWWOxidNLoad).from('lb').to('kg');
  //   // SecWWTSSLoad: metric = kg, imperial = lb
  //   wasteWaterResults.SecWWTSSLoad = this.convertUnitsService.value(wasteWaterResults.SecWWTSSLoad).from('lb').to('kg');
  //   // TSSSludgeProduction: metric = kg, imperial = lb
  //   wasteWaterResults.TSSSludgeProduction = this.convertUnitsService.value(wasteWaterResults.TSSSludgeProduction).from('lb').to('kg');
  //   // TSSInActivatedSludgeEffluent: metric = kg, imperial = lb
  //   wasteWaterResults.TSSInActivatedSludgeEffluent = this.convertUnitsService.value(wasteWaterResults.TSSInActivatedSludgeEffluent).from('lb').to('kg');
  //   // TotalOxygenRequirements: metric = kg, imperial = lb
  //   wasteWaterResults.TotalOxygenRequirements = this.convertUnitsService.value(wasteWaterResults.TotalOxygenRequirements).from('lb').to('kg');
  //   // TotalOxygenReqWDenit: metric = kg, imperial = lb
  //   wasteWaterResults.TotalOxygenReqWDenit = this.convertUnitsService.value(wasteWaterResults.TotalOxygenReqWDenit).from('lb').to('kg');
  //   // TotalOxygenSupplied: metric = kg, imperial = lb
  //   wasteWaterResults.TotalOxygenSupplied = this.convertUnitsService.value(wasteWaterResults.TotalOxygenSupplied).from('lb').to('kg');

  //   // MixingIntensityInReactor: metric = kW/m3, imperial = hp/Mgal
  //   wasteWaterResults.MixingIntensityInReactor = this.convertUnitsService.value(wasteWaterResults.MixingIntensityInReactor).from('hpMgal').to('kWm3');

  //   // RASFlowRate: metric = m3/day, imperial = mgd 
  //   wasteWaterResults.RASFlowRate = this.convertUnitsService.value(wasteWaterResults.RASFlowRate).from('Mgal').to('m3');
  //   // WASFlowRate: metric = m3/day, imperial = mgd 
  //   wasteWaterResults.WASFlowRate = this.convertUnitsService.value(wasteWaterResults.WASFlowRate).from('Mgal').to('m3');
  //   // TotalSludgeProduction: metric = kg, imperial = lb
  //   wasteWaterResults.TotalSludgeProduction = this.convertUnitsService.value(wasteWaterResults.TotalSludgeProduction).from('lb').to('kg');

  //   // VOLR: metric = kg/m3, imperial = lb/kft3
  //   wasteWaterResults.VOLR = this.convertUnitsService.value(wasteWaterResults.VOLR).from('lbkft3').to('kgNm3');
  //   return wasteWaterResults;
  // }

  // convertResultsCosts(wasteWaterResults: WasteWaterResults, settings: Settings): WasteWaterResults {
  //   if (settings.currency !== "$") {
  //     wasteWaterResults.AeCost = this.convertUnitsService.value(wasteWaterResults.AeCost).from("$").to(settings.currency);
  //     wasteWaterResults.costSavings = this.convertUnitsService.value(wasteWaterResults.costSavings).from("$").to(settings.currency);
  //   }
  //   return wasteWaterResults
  // }

  roundPressureForPresentation(dischargePressure: number) {
    dischargePressure = this.roundVal(dischargePressure, 1);
    return dischargePressure;
  }

  roundAirFlowForPresentation(airflow: number) {
    airflow = this.roundVal(airflow, 0);
    return airflow;
  }

  roundPowerForPresentation(power: number) {
    power = this.roundVal(power, 1);
    return power;
  }

  roundVal(val: number, digits: number) {
    return Number((Math.round(val * 100) / 100).toFixed(digits));
  }
}
