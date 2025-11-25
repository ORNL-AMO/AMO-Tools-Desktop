import { Injectable } from '@angular/core';
import { CompressedAirInventoryService } from './compressed-air-inventory.service';
import { CompressedAirCatalogService } from './compressed-air-inventory-setup/compressed-air-catalog/compressed-air-catalog.service';
import { CompressedAirInventoryData, CompressedAirItem, CompressorDataGroup, PerformancePoint } from './compressed-air-inventory';
import { Settings } from '../shared/models/settings';
import { PerformancePointsCalculationsService } from './compressed-air-inventory-setup/compressed-air-catalog/performance-points-catalog/calculations/performance-points-calculations.service';
import { CompressorControls } from '../shared/models/compressed-air-assessment';
import { GenericCompressor } from '../shared/generic-compressor-db.service';

@Injectable()
export class CompressorDataManagementService {

  constructor(private compressedAirInventoryService: CompressedAirInventoryService,
    private compressedAirCatalogService: CompressedAirCatalogService, private performancePointCalculationsService: PerformancePointsCalculationsService) { }


  //update from generic compressor
  setCompressorDataFromGenericCompressorDb(genericCompressor: GenericCompressor) {
    let selectedCompressor: CompressedAirItem = this.compressedAirCatalogService.selectedCompressedAirItem.getValue();
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
    this.updateCatalogFromDependentCompressorItem(selectedCompressor, true)
  }

  updateCatalogFromDependentCompressorItem(selectedCompressor: CompressedAirItem, performancePointUpdateNeeded: boolean) {
    if (performancePointUpdateNeeded) {
      let compressedAirInventoryData: CompressedAirInventoryData = this.compressedAirInventoryService.compressedAirInventoryData.getValue();
      let settings: Settings = this.compressedAirInventoryService.settings.getValue();
      selectedCompressor.compressedAirPerformancePointsProperties = this.performancePointCalculationsService.updatePerformancePoints(selectedCompressor, compressedAirInventoryData.systemInformation.atmosphericPressure, settings);
    }
    this.compressedAirInventoryService.updateCompressedAirInventoryData(selectedCompressor);
    this.compressedAirCatalogService.selectedCompressedAirItem.next(selectedCompressor);
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

  updateControlDataAndPoints(compressorControls: CompressorControls, isControlTypeChange?: boolean) {
    let selectedCompressor: CompressedAirItem = this.compressedAirCatalogService.selectedCompressedAirItem.getValue();
    selectedCompressor.compressedAirControlsProperties = compressorControls;
    if (isControlTypeChange && selectedCompressor.compressedAirControlsProperties.controlType == 11) {
      selectedCompressor.compressedAirDesignDetailsProperties.noLoadPowerUL = 5;
    }
    this.updateCatalogFromDependentCompressorItem(selectedCompressor, true);
  }

  updateCompressorPropertyAndPoints<K extends CompressorDataGroup>(key: K, compressedAirItemGroupData: CompressedAirItem[K]) {
    let selectedCompressor: CompressedAirItem = this.compressedAirCatalogService.selectedCompressedAirItem.getValue();
    selectedCompressor[key] = compressedAirItemGroupData;
    this.updateCatalogFromDependentCompressorItem(selectedCompressor, true);
  }

  updateBlowoff(blowoff: PerformancePoint) {
    let selectedCompressor: CompressedAirItem = this.compressedAirCatalogService.selectedCompressedAirItem.getValue();
    selectedCompressor.compressedAirPerformancePointsProperties.blowoff = blowoff;
    this.compressedAirInventoryService.updateCompressedAirInventoryData(selectedCompressor);
    this.compressedAirCatalogService.selectedCompressedAirItem.next(selectedCompressor);
  }

  updateFullLoad(fullLoad: PerformancePoint) {
    let selectedCompressor: CompressedAirItem = this.compressedAirCatalogService.selectedCompressedAirItem.getValue();
    selectedCompressor.compressedAirPerformancePointsProperties.fullLoad = fullLoad;
    this.compressedAirInventoryService.updateCompressedAirInventoryData(selectedCompressor);
    this.compressedAirCatalogService.selectedCompressedAirItem.next(selectedCompressor);
  }

  updateMaxFullFlow(maxFullFlow: PerformancePoint) {
    let selectedCompressor: CompressedAirItem = this.compressedAirCatalogService.selectedCompressedAirItem.getValue();
    selectedCompressor.compressedAirPerformancePointsProperties.maxFullFlow = maxFullFlow;
    this.compressedAirInventoryService.updateCompressedAirInventoryData(selectedCompressor);
    this.compressedAirCatalogService.selectedCompressedAirItem.next(selectedCompressor);
  }

  updateMidturndown(midTurndown: PerformancePoint) {
    let selectedCompressor: CompressedAirItem = this.compressedAirCatalogService.selectedCompressedAirItem.getValue();
    selectedCompressor.compressedAirPerformancePointsProperties.midTurndown = midTurndown;
    this.compressedAirInventoryService.updateCompressedAirInventoryData(selectedCompressor);
    this.compressedAirCatalogService.selectedCompressedAirItem.next(selectedCompressor);
  }

  updateTurndown(turndown: PerformancePoint) {
    let selectedCompressor: CompressedAirItem = this.compressedAirCatalogService.selectedCompressedAirItem.getValue();
    selectedCompressor.compressedAirPerformancePointsProperties.turndown = turndown;
    this.compressedAirInventoryService.updateCompressedAirInventoryData(selectedCompressor);
    this.compressedAirCatalogService.selectedCompressedAirItem.next(selectedCompressor);
  }

  updateNoLoad(noLoad: PerformancePoint) {
    let selectedCompressor: CompressedAirItem = this.compressedAirCatalogService.selectedCompressedAirItem.getValue();
    selectedCompressor.compressedAirPerformancePointsProperties.noLoad = noLoad;
    this.compressedAirInventoryService.updateCompressedAirInventoryData(selectedCompressor);
    this.compressedAirCatalogService.selectedCompressedAirItem.next(selectedCompressor);
  }

  updateUnloadPoint(unloadPoint: PerformancePoint) {
    let selectedCompressor: CompressedAirItem = this.compressedAirCatalogService.selectedCompressedAirItem.getValue();
    selectedCompressor.compressedAirPerformancePointsProperties.unloadPoint = unloadPoint;
    this.compressedAirInventoryService.updateCompressedAirInventoryData(selectedCompressor);
    this.compressedAirCatalogService.selectedCompressedAirItem.next(selectedCompressor);
  }

}
