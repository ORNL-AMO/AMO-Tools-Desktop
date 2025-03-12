import { Injectable } from '@angular/core';
import { GenericCompressor } from './existing-compressor-db.service';
import { CompressedAirInventoryService } from './compressed-air-inventory.service';
import { CompressedAirCatalogService } from './compressed-air-inventory-setup/compressed-air-catalog/compressed-air-catalog.service';
import { PerformancePointsCatalogService } from './compressed-air-inventory-setup/compressed-air-catalog/performance-points-catalog/performance-points-catalog.service';
import { CompressedAirInventoryData, CompressedAirItem } from './compressed-air-inventory';
import { Settings } from '../shared/models/settings';

@Injectable()
export class CompressorDataManagementService {

  constructor(private compressedAirAssessmentService: CompressedAirInventoryService,
    private inventoryService: CompressedAirCatalogService, private performancePointCalculationsService: PerformancePointsCatalogService) { }


  //update from generic compressor
  setCompressorDataFromGenericCompressorDb(genericCompressor: GenericCompressor) {
    let selectedCompressor: CompressedAirItem = this.inventoryService.selectedCompressedAirItem.getValue();
    ///selectedCompressor.modifiedDate = new Date();
    selectedCompressor.compressorLibId = genericCompressor.IDCompLib;

    selectedCompressor.nameplateData.compressorType = genericCompressor.IDCompType;
    selectedCompressor.compressedAirControlsProperties.controlType = genericCompressor.IDControlType;

    selectedCompressor.compressedAirMotor.motorPower = genericCompressor.HP;

    selectedCompressor.nameplateData.totalPackageInputPower = Number(genericCompressor.TotPackageInputPower.toFixed(1));
    selectedCompressor.compressedAirDesignDetailsProperties.noLoadPowerFM = this.overrideGenericDbValueForDisplay(genericCompressor.NoLoadPowerFM);
    selectedCompressor.compressedAirControlsProperties.unloadSumpPressure = this.overrideGenericDbValueForDisplay(genericCompressor.MinULSumpPressure);
    selectedCompressor.compressedAirDesignDetailsProperties.noLoadPowerUL = genericCompressor.NoLoadPowerUL;
    selectedCompressor.compressedAirDesignDetailsProperties.maxFullFlowPressure = genericCompressor.MaxFullFlowPressure;


    selectedCompressor.compressedAirControlsProperties.unloadPointCapacity = genericCompressor.UnloadPoint;
    selectedCompressor.compressedAirControlsProperties.numberOfUnloadSteps = genericCompressor.UnloadSteps;
    selectedCompressor.compressedAirDesignDetailsProperties.blowdownTime = this.overrideGenericDbValueForDisplay(genericCompressor.BlowdownTime);
    selectedCompressor.compressedAirDesignDetailsProperties.modulatingPressureRange = this.overrideGenericDbValueForDisplay(genericCompressor.ModulatingPressRange);
    selectedCompressor.compressedAirDesignDetailsProperties.inputPressure = genericCompressor.DesignInPressure;
    selectedCompressor.nameplateData.fullLoadOperatingPressure = genericCompressor.RatedPressure;
    selectedCompressor.nameplateData.fullLoadRatedCapacity = genericCompressor.RatedCapacity;

    selectedCompressor.centrifugalSpecifics.minFullLoadPressure = this.overrideGenericDbValueForDisplay(genericCompressor.MinStonewallPressure);
    selectedCompressor.centrifugalSpecifics.minFullLoadCapacity = this.overrideGenericDbValueForDisplay(genericCompressor.MinPressStonewallFlow);
    selectedCompressor.centrifugalSpecifics.surgeAirflow = this.overrideGenericDbValueForDisplay(genericCompressor.DesignSurgeFlow);
    selectedCompressor.centrifugalSpecifics.maxFullLoadPressure = this.overrideGenericDbValueForDisplay(genericCompressor.MaxSurgePressure);
    selectedCompressor.centrifugalSpecifics.maxFullLoadCapacity = this.overrideGenericDbValueForDisplay(genericCompressor.MaxPressSurgeFlow);
    selectedCompressor.compressedAirDesignDetailsProperties.designEfficiency = this.roundVal(genericCompressor.EffFL, 1);
    selectedCompressor.compressedAirMotor.motorFullLoadAmps = genericCompressor.AmpsFL;

    selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.isDefaultAirFlow = true;
    selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.isDefaultPower = true;
    selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.isDefaultPressure = true;

    selectedCompressor.compressedAirPerformancePointsProperties.maxFullFlow.isDefaultAirFlow = true;
    selectedCompressor.compressedAirPerformancePointsProperties.maxFullFlow.isDefaultPower = true;
    selectedCompressor.compressedAirPerformancePointsProperties.maxFullFlow.isDefaultPressure = true;


    selectedCompressor.compressedAirPerformancePointsProperties.midTurndown = {
      isDefaultAirFlow: true,
      airflow: undefined,
      isDefaultPower: true,
      power: undefined,
      isDefaultPressure: true,
      dischargePressure: undefined,
    }

    selectedCompressor.compressedAirPerformancePointsProperties.turndown = {
      isDefaultAirFlow: true,
      airflow: undefined,
      isDefaultPower: true,
      power: undefined,
      isDefaultPressure: true,
      dischargePressure: undefined,
    }

    selectedCompressor.compressedAirPerformancePointsProperties.noLoad.isDefaultAirFlow = true;
    selectedCompressor.compressedAirPerformancePointsProperties.noLoad.isDefaultPower = true;
    selectedCompressor.compressedAirPerformancePointsProperties.noLoad.isDefaultPressure = true;

    selectedCompressor.compressedAirPerformancePointsProperties.unloadPoint.isDefaultAirFlow = true;
    selectedCompressor.compressedAirPerformancePointsProperties.unloadPoint.isDefaultPower = true;
    selectedCompressor.compressedAirPerformancePointsProperties.unloadPoint.isDefaultPressure = true;
    this.updateCatalogFromDependentCompressorItem(selectedCompressor, true, true)
  }

  updateCatalogFromDependentCompressorItem(selectedCompressor: CompressedAirItem, modificationsNeedUpdate: boolean, performancePointUpdateNeeded: boolean) {
    // //update performance points
    // if (performancePointUpdateNeeded) {
    //   let compressedAirInventoryData: CompressedAirInventoryData = this.compressedAirAssessmentService.compressedAirInventoryData.getValue();
    //   let settings: Settings = this.compressedAirAssessmentService.settings.getValue();
    //   //selectedCompressor.compressedAirPerformancePointsProperties = this.performancePointCalculationsService.updatePerformancePoints(selectedCompressor, compressedAirAssessment.systemInformation.atmosphericPressure, settings);
    // }
    // //update assessment
    // let compressedAirInventoryData: CompressedAirInventoryData = this.compressedAirAssessmentService.compressedAirInventoryData.getValue();
    // let compressorIndex: number = compressedAirInventoryData.systems.findIndex(system => { return system.id == selectedCompressor.id });
    // compressedAirInventoryData.systems[compressorIndex] = selectedCompressor;
    // // if (modificationsNeedUpdate) {
    // //   compressedAirAssessment.modifications = this.updateModifications(selectedCompressor, compressedAirAssessment.modifications);
    // // };
    // //update system profile ordering
    // let recalculateOrdering: boolean = false;
    // compressedAirInventoryData.systemProfile.profileSummary.forEach(summary => {
    //   if (summary.compressorId == selectedCompressor.itemId) {
    //     if (summary.fullLoadPressure != selectedCompressor.performancePoints.fullLoad.dischargePressure) {
    //       summary.fullLoadPressure = selectedCompressor.performancePoints.fullLoad.dischargePressure;
    //       recalculateOrdering = true;
    //     }
    //   }
    // });
    // //TODO: Recalculate other control types??
    // //issue 6969 updated to include baseTrim
    // if (recalculateOrdering && (compressedAirAssessment.systemInformation.multiCompressorSystemControls == 'cascading' || compressedAirAssessment.systemInformation.multiCompressorSystemControls == 'baseTrim')) {
    //   let numberOfHourIntervals: number = compressedAirAssessment.systemProfile.systemProfileSetup.numberOfHours / compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval;
    //   compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
    //     compressedAirAssessment.systemProfile.profileSummary = this.systemProfileService.updateCompressorOrderingCascading(compressedAirAssessment.systemProfile.profileSummary, dayType, numberOfHourIntervals);
    //   })
    // } else if (compressedAirAssessment.systemInformation.multiCompressorSystemControls == 'isentropicEfficiency') {
    //   let numberOfHourIntervals: number = compressedAirAssessment.systemProfile.systemProfileSetup.numberOfHours / compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval;
    //   let settings: Settings = this.compressedAirAssessmentService.settings.getValue();
    //   compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
    //     compressedAirAssessment.systemProfile.profileSummary = this.systemProfileService.updateCompressorOrderingIsentropicEfficiency(compressedAirAssessment.systemProfile.profileSummary, dayType, numberOfHourIntervals, compressedAirAssessment.compressorInventoryItems, settings, compressedAirAssessment.systemInformation);
    //   })
    // }
    // //update assessment
    // this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment, true);
    // //update selected compressor
    // this.inventoryService.selectedCompressedAirItem.next(selectedCompressor);
  }

  overrideGenericDbValueForDisplay(databaseVal: number) {
    if (databaseVal === -9999) {
      return null;
    }
    return databaseVal;
  }

  roundVal(val: number, digits: number) {
    return Number((Math.round(val * 100) / 100).toFixed(digits));
  }

}
