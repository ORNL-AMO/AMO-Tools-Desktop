import { Injectable } from '@angular/core';
import { GenericCompressor } from './existing-compressor-db.service';
import { CompressedAirInventoryService } from './compressed-air-inventory.service';
import { CompressedAirCatalogService } from './compressed-air-inventory-setup/compressed-air-catalog/compressed-air-catalog.service';
import { CompressedAirInventoryData, CompressedAirItem, PerformancePoint } from './compressed-air-inventory';
import { Settings } from '../shared/models/settings';
import { PerformancePointsCalculationsService } from './compressed-air-inventory-setup/compressed-air-catalog/performance-points-catalog/calculations/performance-points-calculations.service';

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
    //update performance points
    if (performancePointUpdateNeeded) {
      let compressedAirInventoryData: CompressedAirInventoryData = this.compressedAirInventoryService.compressedAirInventoryData.getValue();
      let settings: Settings = this.compressedAirInventoryService.settings.getValue();
      selectedCompressor.compressedAirPerformancePointsProperties = this.performancePointCalculationsService.updatePerformancePoints(selectedCompressor, compressedAirInventoryData.systemInformation.atmosphericPressure, settings);
    }
    //update assessment
    let compressedAirInventoryData: CompressedAirInventoryData = this.compressedAirInventoryService.compressedAirInventoryData.getValue();
    let selectedSystemId: string = this.compressedAirCatalogService.selectedSystemId.getValue();
    let systemIndex: number = compressedAirInventoryData.systems.findIndex(system => { return system.id == selectedSystemId });

    let selectedCompressedAirItem: CompressedAirItem = this.compressedAirCatalogService.selectedCompressedAirItem.getValue();
    let itemIndex: number = compressedAirInventoryData.systems[systemIndex].catalog.findIndex(item => { return item.id == selectedCompressedAirItem.id });

    compressedAirInventoryData.systems[systemIndex].catalog[itemIndex] = selectedCompressor;

    // //update assessment
    // this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment, true);
    // //update selected compressor
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


  updateBlowoff(blowoff: PerformancePoint) {
    let selectedCompressor: CompressedAirItem = this.compressedAirCatalogService.selectedCompressedAirItem.getValue();
    selectedCompressor.compressedAirPerformancePointsProperties.blowoff = blowoff;
    this.compressedAirInventoryService.updateCompressedAirItem(selectedCompressor);
    this.compressedAirCatalogService.selectedCompressedAirItem.next(selectedCompressor);
  }

  updateFullLoad(fullLoad: PerformancePoint) {
    let selectedCompressor: CompressedAirItem = this.compressedAirCatalogService.selectedCompressedAirItem.getValue();
    selectedCompressor.compressedAirPerformancePointsProperties.fullLoad = fullLoad;
    this.compressedAirInventoryService.updateCompressedAirItem(selectedCompressor);
    this.compressedAirCatalogService.selectedCompressedAirItem.next(selectedCompressor);
  }

  updateMaxFullFlow(maxFullFlow: PerformancePoint) {
    let selectedCompressor: CompressedAirItem = this.compressedAirCatalogService.selectedCompressedAirItem.getValue();
    selectedCompressor.compressedAirPerformancePointsProperties.maxFullFlow = maxFullFlow;
    this.compressedAirInventoryService.updateCompressedAirItem(selectedCompressor);
    this.compressedAirCatalogService.selectedCompressedAirItem.next(selectedCompressor);
  }

  updateMidturndown(midTurndown: PerformancePoint) {
    let selectedCompressor: CompressedAirItem = this.compressedAirCatalogService.selectedCompressedAirItem.getValue();
    selectedCompressor.compressedAirPerformancePointsProperties.midTurndown = midTurndown;
    this.compressedAirInventoryService.updateCompressedAirItem(selectedCompressor);
    this.compressedAirCatalogService.selectedCompressedAirItem.next(selectedCompressor);
  }

  updateTurndown(turndown: PerformancePoint) {
    let selectedCompressor: CompressedAirItem = this.compressedAirCatalogService.selectedCompressedAirItem.getValue();
    selectedCompressor.compressedAirPerformancePointsProperties.turndown = turndown;
    this.compressedAirInventoryService.updateCompressedAirItem(selectedCompressor);
    this.compressedAirCatalogService.selectedCompressedAirItem.next(selectedCompressor);
  }

  updateNoLoad(noLoad: PerformancePoint) {
    let selectedCompressor: CompressedAirItem = this.compressedAirCatalogService.selectedCompressedAirItem.getValue();
    selectedCompressor.compressedAirPerformancePointsProperties.noLoad = noLoad;
    this.compressedAirInventoryService.updateCompressedAirItem(selectedCompressor);
    this.compressedAirCatalogService.selectedCompressedAirItem.next(selectedCompressor);
  }

  updateUnloadPoint(unloadPoint: PerformancePoint) {
    let selectedCompressor: CompressedAirItem = this.compressedAirCatalogService.selectedCompressedAirItem.getValue();
    selectedCompressor.compressedAirPerformancePointsProperties.unloadPoint = unloadPoint;
    this.compressedAirInventoryService.updateCompressedAirItem(selectedCompressor);
    this.compressedAirCatalogService.selectedCompressedAirItem.next(selectedCompressor);
  }

}
