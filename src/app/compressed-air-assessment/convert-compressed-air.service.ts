import { Injectable } from '@angular/core';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { CompressedAirAssessment, CompressorControls, CompressorInventoryItem, CompressorNameplateData, DesignDetails, InletConditions, PerformancePoint, PerformancePoints, ProfileSummary, ProfileSummaryData, SystemInformation, SystemProfile } from '../shared/models/compressed-air-assessment';
import { Settings } from '../shared/models/settings';
import { CentrifugalInput, CompressorCalcResult, CompressorsCalcInput } from './compressed-air-calculation.service';

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
      systemInformation.atmosphericPressure = this.convertUnitsService.value(systemInformation.atmosphericPressure).from('kpaa').to('psia');
      // dbl check
      systemInformation.totalAirStorage = this.convertUnitsService.value(systemInformation.totalAirStorage).from('m3').to('gal');
      systemInformation.targetPressure = this.convertUnitsService.value(systemInformation.targetPressure).from('barg').to('psig');
      systemInformation.variance = this.convertUnitsService.value(systemInformation.variance).from('barg').to('psig');
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      systemInformation.atmosphericPressure = this.convertUnitsService.value(systemInformation.atmosphericPressure).from('psia').to('kpaa');
      systemInformation.systemElevation = this.convertUnitsService.value(systemInformation.systemElevation).from('ft').to('m');
      systemInformation.totalAirStorage = this.convertUnitsService.value(systemInformation.totalAirStorage).from('gal').to('m3');
      systemInformation.targetPressure = this.convertUnitsService.value(systemInformation.targetPressure).from('psig').to('barg');
      systemInformation.variance = this.convertUnitsService.value(systemInformation.variance).from('psig').to('barg');
    }
    systemInformation.atmosphericPressure = this.convertUnitsService.roundVal(systemInformation.atmosphericPressure, 2);
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
      inletConditions.temperature = this.convertUnitsService.value(inletConditions.temperature).from('C').to('F');
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      inletConditions.temperature = this.convertUnitsService.value(inletConditions.temperature).from('F').to('C');
    }
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


  convertInputObject(inputObj: CompressorsCalcInput): CompressorsCalcInput {
    //capacity measured: 'm3/min'->'ft3/min'
    if (inputObj.computeFrom == 3) {
      inputObj.computeFromVal = this.convertUnitsService.value(inputObj.computeFromVal).from('m3/min').to('ft3/min');
    }
    inputObj.dischargePsiFullLoad = this.convertUnitsService.value(inputObj.dischargePsiFullLoad).from('barg').to('psig');
    inputObj.capacityAtFullLoad = this.convertUnitsService.value(inputObj.capacityAtFullLoad).from('m3/min').to('ft3/min');
    inputObj.capacityAtMaxFullFlow = this.convertUnitsService.value(inputObj.capacityAtMaxFullFlow).from('m3/min').to('ft3/min');
    inputObj.pressureAtUnload = this.convertUnitsService.value(inputObj.pressureAtUnload).from('barg').to('psig');
    inputObj.capacityAtUnload = this.convertUnitsService.value(inputObj.capacityAtUnload).from('m3/min').to('ft3/min');
    inputObj.dischargePsiMax = this.convertUnitsService.value(inputObj.dischargePsiMax).from('barg').to('psig');
    inputObj.modulatingPsi = this.convertUnitsService.value(inputObj.modulatingPsi).from('barg').to('psig');
    inputObj.atmosphericPsi = this.convertUnitsService.value(inputObj.atmosphericPsi).from('kpaa').to('psia');
    inputObj.unloadPointCapacity = this.convertUnitsService.value(inputObj.unloadPointCapacity).from('m3/min').to('ft3/min');
    inputObj.receiverVolume = this.convertUnitsService.value(inputObj.unloadPointCapacity).from('m3').to('ft3');
    //if lubricant free, hardcoded to 15 no conversion
    if (inputObj.lubricantType != 1) {
      inputObj.unloadSumpPressure = this.convertUnitsService.value(inputObj.unloadSumpPressure).from('barg').to('psig');
    }
    return inputObj;
  }

  convertCentrifugalInputObject(inputObj: CentrifugalInput): CentrifugalInput {
    //capacity measured: 'm3/min'->'ft3/min'
    if (inputObj.computeFrom == 3) {
      inputObj.computeFromVal = this.convertUnitsService.value(inputObj.computeFromVal).from('m3/min').to('ft3/min');
    }
    inputObj.fullLoadPressure = this.convertUnitsService.value(inputObj.fullLoadPressure).from('barg').to('psig');
    inputObj.capacityAtFullLoad = this.convertUnitsService.value(inputObj.capacityAtFullLoad).from('m3/min').to('ft3/min');
    inputObj.capacityAtMinFullLoadPressure = this.convertUnitsService.value(inputObj.capacityAtMinFullLoadPressure).from('m3/min').to('ft3/min');
    inputObj.capacityAtMaxFullLoadPressure = this.convertUnitsService.value(inputObj.capacityAtMaxFullLoadPressure).from('m3/min').to('ft3/min');
    inputObj.minFullLoadPressure = this.convertUnitsService.value(inputObj.minFullLoadPressure).from('barg').to('psig');
    inputObj.maxFullLoadPressure = this.convertUnitsService.value(inputObj.maxFullLoadPressure).from('barg').to('psig');
    inputObj.surgeFlow = this.convertUnitsService.value(inputObj.surgeFlow).from('m3/min').to('ft3/min');
    inputObj.maxPressure = this.convertUnitsService.value(inputObj.maxPressure).from('barg').to('psig');
    inputObj.capacityAtMaxFullFlow = this.convertUnitsService.value(inputObj.capacityAtMaxFullFlow).from('m3/min').to('ft3/min');
    inputObj.capacityAtUnload = this.convertUnitsService.value(inputObj.capacityAtUnload).from('m3/min').to('ft3/min');
    return inputObj;
  }

  convertResults(result: CompressorCalcResult): CompressorCalcResult {
    result.capacityCalculated = this.convertUnitsService.value(result.capacityCalculated).from('ft3/min').to('m3/min');
    result.reRatedFlow = this.convertUnitsService.value(result.reRatedFlow).from('ft3/min').to('m3/min');
    result.reRatedFlowMax = this.convertUnitsService.value(result.reRatedFlowMax).from('ft3/min').to('m3/min');
    result.capacityAtFullLoadAdjusted = this.convertUnitsService.value(result.capacityAtFullLoadAdjusted).from('ft3/min').to('m3/min');
    result.capacityAtMaxFullFlowAdjusted = this.convertUnitsService.value(result.capacityAtMaxFullFlowAdjusted).from('ft3/min').to('m3/min');
    result.surgeFlow = this.convertUnitsService.value(result.surgeFlow).from('ft3/min').to('m3/min');
    return result;
  }
}
