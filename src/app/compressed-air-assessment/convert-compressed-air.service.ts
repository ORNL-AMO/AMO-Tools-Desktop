import { Injectable } from '@angular/core';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { AddPrimaryReceiverVolume, AdjustCascadingSetPoints, CompressedAirAssessment, CompressorControls, CompressorInventoryItem, CompressorNameplateData, DesignDetails, EndUse, EndUseData, ImproveEndUseEfficiency, InletConditions, Modification, PerformancePoint, PerformancePoints, ProfileSummary, ProfileSummaryData, ReduceAirLeaks, ReduceRuntime, ReduceSystemAirPressure, SystemInformation, SystemProfile, UseAutomaticSequencer } from '../shared/models/compressed-air-assessment';
import { Settings } from '../shared/models/settings';
import { CentrifugalInput, CompressorCalcResult, CompressorsCalcInput } from './compressed-air-calculation.service';

@Injectable()
export class ConvertCompressedAirService {

  constructor(private convertUnitsService: ConvertUnitsService) { }

  convertCompressedAir(compressedAirAssessment: CompressedAirAssessment, oldSettings: Settings, newSettings: Settings): CompressedAirAssessment {
    compressedAirAssessment = this.convertCompressedAirAssessmentData(compressedAirAssessment, oldSettings, newSettings);
    if (compressedAirAssessment.modifications) {
      compressedAirAssessment.modifications.forEach(modification => {
        modification = this.convertModification(modification, oldSettings, newSettings);
      });
    }
    return compressedAirAssessment;
  }

  convertCompressedAirAssessmentData(compressedAirData: CompressedAirAssessment, oldSettings: Settings, newSettings: Settings): CompressedAirAssessment {
    compressedAirData.systemInformation = this.convertSystemInformation(compressedAirData.systemInformation, oldSettings, newSettings);
    compressedAirData.compressorInventoryItems = this.convertCompressorInventoryItems(compressedAirData.compressorInventoryItems, oldSettings, newSettings);
    compressedAirData.systemProfile = this.convertSystemProfile(compressedAirData.systemProfile, oldSettings, newSettings);
    compressedAirData.endUseData = this.convertEndUses(compressedAirData.endUseData, oldSettings, newSettings);
    return compressedAirData;
  }

  convertSystemInformation(systemInformation: SystemInformation, oldSettings: Settings, newSettings: Settings): SystemInformation {
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      systemInformation.systemElevation = this.convertUnitsService.value(systemInformation.systemElevation).from('m').to('ft');
      systemInformation.atmosphericPressure = this.convertUnitsService.value(systemInformation.atmosphericPressure).from('kPaa').to('psia');
      // dbl check
      systemInformation.totalAirStorage = this.convertUnitsService.value(systemInformation.totalAirStorage).from('m3').to('gal');
      systemInformation.targetPressure = this.convertUnitsService.value(systemInformation.targetPressure).from('barg').to('psig');
      systemInformation.variance = this.convertUnitsService.value(systemInformation.variance).from('bara').to('psia');
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      systemInformation.atmosphericPressure = this.convertUnitsService.value(systemInformation.atmosphericPressure).from('psia').to('kPaa');
      systemInformation.systemElevation = this.convertUnitsService.value(systemInformation.systemElevation).from('ft').to('m');
      systemInformation.totalAirStorage = this.convertUnitsService.value(systemInformation.totalAirStorage).from('gal').to('m3');
      systemInformation.targetPressure = this.convertUnitsService.value(systemInformation.targetPressure).from('psig').to('barg');
      systemInformation.variance = this.convertUnitsService.value(systemInformation.variance).from('psia').to('bara');
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

  convertEndUses(endUseData: EndUseData, oldSettings: Settings, newSettings: Settings): EndUseData {
    endUseData.endUses.forEach((endUse: EndUse) => {
      endUse.dayTypeEndUses.map(dayTypeUse => {
        if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
          dayTypeUse.requiredPressure = this.convertUnitsService.value(dayTypeUse.requiredPressure).from('barg').to('psig');
          dayTypeUse.measuredPressure = this.convertUnitsService.value(dayTypeUse.measuredPressure).from('barg').to('psig');
          dayTypeUse.averageAirflow = this.convertUnitsService.value(dayTypeUse.averageAirflow).from('m3/min').to('ft3/min');
    
        } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
          dayTypeUse.requiredPressure = this.convertUnitsService.value(dayTypeUse.requiredPressure).from('psig').to('barg');
          dayTypeUse.measuredPressure = this.convertUnitsService.value(dayTypeUse.measuredPressure).from('psig').to('barg');
          dayTypeUse.averageAirflow = this.convertUnitsService.value(dayTypeUse.averageAirflow).from('ft3/min').to('m3/min');
        }
        dayTypeUse.requiredPressure = this.convertUnitsService.roundVal(dayTypeUse.requiredPressure, 2);
        dayTypeUse.measuredPressure = this.convertUnitsService.roundVal(dayTypeUse.measuredPressure, 2);
        dayTypeUse.averageAirflow = this.convertUnitsService.roundVal(dayTypeUse.averageAirflow, 2);
    
      });
    });
    return endUseData;
  }

  convertDayTypeEndUse(namePlateData: CompressorNameplateData, oldSettings: Settings, newSettings: Settings): CompressorNameplateData {
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
        data.airflow = this.convertUnitsService.value(data.airflow).from('m3/min').to('ft3/min');
      } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
        data.airflow = this.convertUnitsService.value(data.airflow).from('ft3/min').to('m3/min');
      }
      data.airflow = this.convertUnitsService.roundVal(data.airflow, 2);
    });
    return profileSummaryData
  }

  roundPressureForPresentation(dischargePressure: number, settings: Settings) {
    if (settings.unitsOfMeasure == 'Imperial') {
      dischargePressure = this.convertUnitsService.roundVal(dischargePressure, 1);
    } else {
      dischargePressure = this.convertUnitsService.roundVal(dischargePressure, 2);
    }
    return dischargePressure;
  }

  roundAirFlowForPresentation(airflow: number, settings: Settings) {
    if (settings.unitsOfMeasure == 'Imperial') {
      airflow = this.convertUnitsService.roundVal(airflow, 0);
    } else {
      airflow = this.convertUnitsService.roundVal(airflow, 3);
    }
    return airflow;
  }

  roundPowerForPresentation(power: number) {
    power = this.convertUnitsService.roundVal(power, 1);
    return power;
  }

  convertInputObject(inputObj: CompressorsCalcInput, controlType: number): CompressorsCalcInput {
    //capacity measured: 'm3/min'->'ft3/min'
    if (inputObj.computeFrom == 3) {
      inputObj.computeFromVal = this.convertUnitsService.value(inputObj.computeFromVal).from('m3/min').to('ft3/min');
    }
    inputObj.dischargePsiFullLoad = this.convertPressure(inputObj.dischargePsiFullLoad);
    inputObj.noLoadDischargePressure = this.convertPressure(inputObj.noLoadDischargePressure);
    inputObj.capacityAtFullLoad = this.convertUnitsService.value(inputObj.capacityAtFullLoad).from('m3/min').to('ft3/min');
    inputObj.capacityAtMaxFullFlow = this.convertUnitsService.value(inputObj.capacityAtMaxFullFlow).from('m3/min').to('ft3/min');
    inputObj.pressureAtUnload = this.convertPressure(inputObj.pressureAtUnload);
    inputObj.capacityAtUnload = this.convertUnitsService.value(inputObj.capacityAtUnload).from('m3/min').to('ft3/min');
    inputObj.dischargePsiMax = this.convertPressure(inputObj.dischargePsiMax);
    // inputObj.modulatingPsi = this.convertUnitsService.value(inputObj.modulatingPsi).from('barg').to('psig');
    inputObj.atmosphericPsi = this.convertUnitsService.value(inputObj.atmosphericPsi).from('kPaa').to('psia');
    inputObj.receiverVolume = this.convertUnitsService.value(inputObj.receiverVolume).from('m3').to('ft3');

    if (controlType != 1 && (inputObj.pressureAtUnload && inputObj.dischargePsiMax)) {
      inputObj.modulatingPsi = (inputObj.pressureAtUnload - inputObj.dischargePsiMax) / (1 - (inputObj.unloadPointCapacity / 100))
    } else if (inputObj.noLoadDischargePressure && inputObj.dischargePsiFullLoad) {
      inputObj.modulatingPsi = inputObj.noLoadDischargePressure - inputObj.dischargePsiFullLoad;
    }
    if (isNaN(inputObj.modulatingPsi)) {
      inputObj.modulatingPsi = -9999;
    }
    //if lubricant free, hardcoded to 15 no conversion
    if (inputObj.lubricantType != 1) {
      inputObj.unloadSumpPressure = this.convertPressure(inputObj.unloadSumpPressure);
    }
    return inputObj;
  }

  convertPressure(val: number): number {
    if (val) {
      val = this.convertUnitsService.value(val).from('barg').to('psig');
    }
    return val;
  }

  convertCentrifugalInputObject(inputObj: CentrifugalInput): CentrifugalInput {
    //capacity measured: 'm3/min'->'ft3/min'
    if (inputObj.computeFrom == 3) {
      inputObj.computeFromVal = this.convertUnitsService.value(inputObj.computeFromVal).from('m3/min').to('ft3/min');
    }
    inputObj.fullLoadPressure = this.convertPressure(inputObj.fullLoadPressure);
    inputObj.capacityAtFullLoad = this.convertUnitsService.value(inputObj.capacityAtFullLoad).from('m3/min').to('ft3/min');
    inputObj.capacityAtMinFullLoadPressure = this.convertUnitsService.value(inputObj.capacityAtMinFullLoadPressure).from('m3/min').to('ft3/min');
    inputObj.capacityAtMaxFullLoadPressure = this.convertUnitsService.value(inputObj.capacityAtMaxFullLoadPressure).from('m3/min').to('ft3/min');
    inputObj.minFullLoadPressure = this.convertPressure(inputObj.minFullLoadPressure);
    inputObj.maxFullLoadPressure = this.convertPressure(inputObj.maxFullLoadPressure);
    inputObj.surgeFlow = this.convertUnitsService.value(inputObj.surgeFlow).from('m3/min').to('ft3/min');
    inputObj.maxPressure = this.convertPressure(inputObj.maxPressure);
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

  convertModification(modification: Modification, oldSettings: Settings, newSettings: Settings): Modification {
    modification.addPrimaryReceiverVolume = this.convertAddPrimaryReceiverVolume(modification.addPrimaryReceiverVolume, oldSettings, newSettings);
    modification.adjustCascadingSetPoints = this.convertAdjustCascadingSetPoints(modification.adjustCascadingSetPoints, oldSettings, newSettings);
    modification.improveEndUseEfficiency = this.convertImproveEndUseEfficiency(modification.improveEndUseEfficiency, oldSettings, newSettings);
    modification.reduceAirLeaks = this.convertAirLeaks(modification.reduceAirLeaks, oldSettings, newSettings);
    modification.reduceRuntime = this.convertReduceRuntime(modification.reduceRuntime, oldSettings, newSettings);
    modification.reduceSystemAirPressure = this.convertReduceSystemAirPressure(modification.reduceSystemAirPressure, oldSettings, newSettings);
    modification.useAutomaticSequencer = this.convertUseAutomaticSequencer(modification.useAutomaticSequencer, oldSettings, newSettings);
    return modification;
  }


  convertAddPrimaryReceiverVolume(addPrimaryReceiverVolume: AddPrimaryReceiverVolume, oldSettings: Settings, newSettings: Settings): AddPrimaryReceiverVolume {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      addPrimaryReceiverVolume.increasedVolume = this.convertUnitsService.value(addPrimaryReceiverVolume.increasedVolume).from('gal').to('m3');
      addPrimaryReceiverVolume.increasedVolume = this.convertUnitsService.roundVal(addPrimaryReceiverVolume.increasedVolume, 2);
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      addPrimaryReceiverVolume.increasedVolume = this.convertUnitsService.value(addPrimaryReceiverVolume.increasedVolume).from('m3').to('gal');
      addPrimaryReceiverVolume.increasedVolume = this.convertUnitsService.roundVal(addPrimaryReceiverVolume.increasedVolume, 2);
    }
    return addPrimaryReceiverVolume;
  }

  convertAdjustCascadingSetPoints(adjustCascadingSetPoints: AdjustCascadingSetPoints, oldSettings: Settings, newSettings: Settings): AdjustCascadingSetPoints {
    adjustCascadingSetPoints.setPointData.forEach(dataPoint => {
      if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
        dataPoint.fullLoadDischargePressure = this.convertUnitsService.value(dataPoint.fullLoadDischargePressure).from('psig').to('barg');
        dataPoint.maxFullFlowDischargePressure = this.convertUnitsService.value(dataPoint.maxFullFlowDischargePressure).from('psig').to('barg');
      } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
        dataPoint.fullLoadDischargePressure = this.convertUnitsService.value(dataPoint.fullLoadDischargePressure).from('barg').to('psig');
        dataPoint.maxFullFlowDischargePressure = this.convertUnitsService.value(dataPoint.maxFullFlowDischargePressure).from('barg').to('psig');
      }
      dataPoint.fullLoadDischargePressure = this.convertUnitsService.roundVal(dataPoint.fullLoadDischargePressure, 2);
      dataPoint.maxFullFlowDischargePressure = this.convertUnitsService.roundVal(dataPoint.maxFullFlowDischargePressure, 2);
    });
    return adjustCascadingSetPoints;
  }

  convertImproveEndUseEfficiency(improveEndUseEfficiency: ImproveEndUseEfficiency, oldSettings: Settings, newSettings: Settings): ImproveEndUseEfficiency {
    improveEndUseEfficiency.endUseEfficiencyItems.forEach(efficiencyItem => {
      if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
        efficiencyItem.airflowReduction = this.convertUnitsService.value(efficiencyItem.airflowReduction).from('ft3/min').to('m3/min');
        efficiencyItem.reductionData.forEach(dataItem => {
          dataItem.data.forEach(data => {
            if (isNaN(data.reductionAmount) == false) {
              data.reductionAmount = this.convertUnitsService.value(data.reductionAmount).from('ft3/min').to('m3/min');
              data.reductionAmount = this.convertUnitsService.roundVal(data.reductionAmount, 2);
            }
          });
        })
      } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
        efficiencyItem.airflowReduction = this.convertUnitsService.value(efficiencyItem.airflowReduction).from('m3/min').to('ft3/min');
        efficiencyItem.reductionData.forEach(dataItem => {
          dataItem.data.forEach(data => {
            if (isNaN(data.reductionAmount) == false) {
              data.reductionAmount = this.convertUnitsService.value(data.reductionAmount).from('m3/min').to('ft3/min');
              data.reductionAmount = this.convertUnitsService.roundVal(data.reductionAmount, 2);
            }
          });
        })
      }
      efficiencyItem.airflowReduction = this.convertUnitsService.roundVal(efficiencyItem.airflowReduction, 2);
    })
    return improveEndUseEfficiency;
  }

  convertAirLeaks(reduceAirLeaks: ReduceAirLeaks, oldSettings: Settings, newSettings: Settings): ReduceAirLeaks {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      reduceAirLeaks.leakFlow = this.convertUnitsService.value(reduceAirLeaks.leakFlow).from('ft3/min').to('m3/min');
      reduceAirLeaks.leakFlow = this.convertUnitsService.roundVal(reduceAirLeaks.leakFlow, 2);
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      reduceAirLeaks.leakFlow = this.convertUnitsService.value(reduceAirLeaks.leakFlow).from('m3/min').to('ft3/min');
      reduceAirLeaks.leakFlow = this.convertUnitsService.roundVal(reduceAirLeaks.leakFlow, 2);
    }
    return reduceAirLeaks;
  }

  convertReduceRuntime(reduceRuntime: ReduceRuntime, oldSettings: Settings, newSettings: Settings): ReduceRuntime {
    reduceRuntime.runtimeData.forEach(dataItem => {
      if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
        dataItem.fullLoadCapacity = this.convertUnitsService.value(dataItem.fullLoadCapacity).from('ft3/min').to('m3/min');
      } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
        dataItem.fullLoadCapacity = this.convertUnitsService.value(dataItem.fullLoadCapacity).from('m3/min').to('ft3/min');
      }
      dataItem.fullLoadCapacity = this.convertUnitsService.roundVal(dataItem.fullLoadCapacity, 2);
    });
    return reduceRuntime;
  }

  convertReduceSystemAirPressure(reduceSystemAirPressure: ReduceSystemAirPressure, oldSettings: Settings, newSettings: Settings): ReduceSystemAirPressure {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      reduceSystemAirPressure.averageSystemPressureReduction = this.convertUnitsService.value(reduceSystemAirPressure.averageSystemPressureReduction).from('psig').to('barg');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      reduceSystemAirPressure.averageSystemPressureReduction = this.convertUnitsService.value(reduceSystemAirPressure.averageSystemPressureReduction).from('barg').to('psig');
    }
    reduceSystemAirPressure.averageSystemPressureReduction = this.convertUnitsService.roundVal(reduceSystemAirPressure.averageSystemPressureReduction, 2);
    return reduceSystemAirPressure;
  }

  convertUseAutomaticSequencer(useAutomaticSequencer: UseAutomaticSequencer, oldSettings: Settings, newSettings: Settings): UseAutomaticSequencer {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      useAutomaticSequencer.targetPressure = this.convertUnitsService.value(useAutomaticSequencer.targetPressure).from('psig').to('barg');
      useAutomaticSequencer.variance = this.convertUnitsService.value(useAutomaticSequencer.variance).from('psia').to('bara');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      useAutomaticSequencer.targetPressure = this.convertUnitsService.value(useAutomaticSequencer.targetPressure).from('barg').to('psig');
      useAutomaticSequencer.variance = this.convertUnitsService.value(useAutomaticSequencer.variance).from('bara').to('psia');
    }
    useAutomaticSequencer.targetPressure = this.convertUnitsService.roundVal(useAutomaticSequencer.targetPressure, 2);
    useAutomaticSequencer.variance = this.convertUnitsService.roundVal(useAutomaticSequencer.variance, 2);
    return useAutomaticSequencer;
  }
}
