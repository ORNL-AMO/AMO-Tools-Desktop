import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorInventoryItem, PerformancePoints } from '../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { GenericCompressor, GenericCompressorDbService } from '../../../generic-compressor-db.service';
import { InventoryService } from '../../inventory.service';
import { FilterCompressorOptions } from '../filter-compressors.pipe';

@Component({
  selector: 'app-compressor-options-table',
  templateUrl: './compressor-options-table.component.html',
  styleUrls: ['./compressor-options-table.component.css']
})
export class CompressorOptionsTableComponent implements OnInit {
  @Output('emitClose')
  emitClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  genericCompressors: Array<GenericCompressor>;
  filterCompressorOptionsSub: Subscription;
  filterCompressorOptions: FilterCompressorOptions
  constructor(private genericCompressorDbService: GenericCompressorDbService, private inventoryService: InventoryService,
    private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.genericCompressors = this.genericCompressorDbService.genericCompressors;
    this.filterCompressorOptionsSub = this.inventoryService.filterCompressorOptions.subscribe(val => {
      this.filterCompressorOptions = val;
    });
  }

  ngOnDestroy() {
    this.filterCompressorOptionsSub.unsubscribe();
  }

  selectCompressor(genericCompressor: GenericCompressor) {
    let selectedCompressor: CompressorInventoryItem = this.inventoryService.selectedCompressor.getValue();
    selectedCompressor = this.setCompressorData(selectedCompressor, genericCompressor);
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let compressorIndex: number = compressedAirAssessment.compressorInventoryItems.findIndex(item => { return item.itemId == selectedCompressor.itemId });
    compressedAirAssessment.compressorInventoryItems[compressorIndex] = selectedCompressor;
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment);
    this.inventoryService.selectedCompressor.next(selectedCompressor);
    this.emitClose.emit(true);
  }

  setCompressorData(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): CompressorInventoryItem {
    selectedCompressor.compressorLibId = genericCompressor.IDCompLib;

    selectedCompressor.nameplateData.compressorType = genericCompressor.IDCompType;
    selectedCompressor.compressorControls.controlType = genericCompressor.IDControlType;

    selectedCompressor.nameplateData.motorPower = genericCompressor.HP;
    selectedCompressor.compressorControls.unloadPointCapacity = genericCompressor.UnloadPoint;
    selectedCompressor.compressorControls.numberOfUnloadSteps = genericCompressor.UnloadSteps;
    selectedCompressor.designDetails.blowdownTime = genericCompressor.BlowdownTime;
    selectedCompressor.designDetails.modulatingPressureRange = genericCompressor.ModulatingPressRange;
    selectedCompressor.inletConditions.temperature = genericCompressor.DesignInTemp;
    selectedCompressor.designDetails.inputPressure = genericCompressor.DesignInPressure;
    selectedCompressor.designDetails.unloadSlumpPressure = genericCompressor.MinULSumpPressure;
    selectedCompressor.nameplateData.fullLoadOperatingPressure = genericCompressor.RatedPressure;
    selectedCompressor.nameplateData.fullLoadRatedCapacity = genericCompressor.RatedCapacity;

    //TODO: Alex Question.. EffFL and AmpsFL not listed in xcel (round 3)
    //I believe these were added later on and should be accurate
    selectedCompressor.designDetails.designEfficiency = genericCompressor.EffFL;
    selectedCompressor.nameplateData.fullLoadAmps = genericCompressor.AmpsFL;


    if (selectedCompressor.compressorControls.controlType == 2) {
      //lube mod with unloading
      selectedCompressor.performancePoints = this.setWithUnloadingPerformancePoints(selectedCompressor.performancePoints, genericCompressor);
    } else if (selectedCompressor.compressorControls.controlType == 3) {
      //variable displacement
      selectedCompressor.performancePoints = this.setVariableDisplacementPerformancePoints(selectedCompressor.performancePoints, genericCompressor);
    } else if (selectedCompressor.compressorControls.controlType == 4 && selectedCompressor.nameplateData.compressorType != 6) {
      //load/unload non centrifugal
      selectedCompressor.performancePoints = this.setLubricatedLoadUnloadPerformancePoints(selectedCompressor.performancePoints, genericCompressor);
    }







    //MaxFullFlowPressure = "cut-out" performance point
    // selectedCompressor.performancePoints.unloadPoint.dischargePressure = genericCompressor.MaxFullFlowPressure;
    // if (selectedCompressor.compressorControls.controlType != 2 && selectedCompressor.compressorControls.controlType != 3) {
    //   selectedCompressor.performancePoints.maxFullFlow.dischargePressure = genericCompressor.MaxFullFlowPressure;
    // }

    // selectedCompressor.performancePoints.blowoff.airflow = genericCompressor.MaxPressSurgeFlow;
    // selectedCompressor.performancePoints.blowoff.dischargePressure = genericCompressor.MaxSurgePressure;


    // selectedCompressor.centrifugalSpecifics.minFullLoadPressure = genericCompressor.MinStonewallPressure;
    // selectedCompressor.centrifugalSpecifics.minFullLoadCapacity = genericCompressor.MinPressStonewallFlow;
    // selectedCompressor.centrifugalSpecifics.surgeAirflow = genericCompressor.DesignSurgeFlow;
    // selectedCompressor.centrifugalSpecifics.maxFullLoadPressure = genericCompressor.MaxSurgePressure;
    // selectedCompressor.centrifugalSpecifics.maxFullLoadCapacity = genericCompressor.MaxPressSurgeFlow;

    // //fullLoad.power = 'kW', PowerFLBHP = HP
    // // selectedCompressor.performancePoints.fullLoad.power = genericCompressor.PowerFLBHP;

    // // SpecPackagePower?
    // //TotPackageInputPower
    // // NoLoadPowerFM: number,
    // // NoLoadPowerUL: number,
    // if (selectedCompressor.compressorControls.controlType == 4 || selectedCompressor.compressorControls.controlType == 7 || selectedCompressor.compressorControls.controlType == 2 || selectedCompressor.compressorControls.controlType == 3 || selectedCompressor.compressorControls.controlType == 9 || selectedCompressor.compressorControls.controlType == 11) {
    //   selectedCompressor.performancePoints.noLoad.power = 0;
    // } else if (selectedCompressor.compressorControls.controlType == 6) {
    //   selectedCompressor.performancePoints.noLoad.power = genericCompressor.NoLoadPowerUL;
    // } else if (selectedCompressor.compressorControls.controlType == 1) {
    //   selectedCompressor.performancePoints.noLoad.power = genericCompressor.NoLoadPowerFM;
    // }

    return selectedCompressor;
  }


  setWithUnloadingPerformancePoints(performancePoints: PerformancePoints, genericCompressor: GenericCompressor): PerformancePoints {
    performancePoints.fullLoad.dischargePressure = genericCompressor.RatedPressure;
    performancePoints.fullLoad.airflow = genericCompressor.RatedCapacity;
    performancePoints.fullLoad.power = genericCompressor.TotPackageInputPower;

    performancePoints.maxFullFlow.dischargePressure = genericCompressor.MaxFullFlowPressure;
    //TODO: calculated airflow and power
    performancePoints.maxFullFlow.airflow = genericCompressor.RatedCapacity;
    performancePoints.maxFullFlow.power = genericCompressor.TotPackageInputPower;


    performancePoints.unloadPoint.dischargePressure = genericCompressor.MaxFullFlowPressure + (genericCompressor.ModulatingPressRange * (1 - genericCompressor.UnloadPoint / 100));
    performancePoints.unloadPoint.airflow = (genericCompressor.UnloadPoint / 100) * genericCompressor.RatedCapacity;
    performancePoints.unloadPoint.power = ((genericCompressor.NoLoadPowerFM / 100) * (1 - (genericCompressor.UnloadPoint / 100)) + (genericCompressor.UnloadPoint / 100)) * performancePoints.maxFullFlow.power;

    performancePoints.noLoad.dischargePressure = genericCompressor.MinULSumpPressure;
    performancePoints.noLoad.airflow = 0;

    if (genericCompressor.NoLoadPowerUL < 25) {
      performancePoints.noLoad.power = genericCompressor.NoLoadPowerUL * genericCompressor.TotPackageInputPower / (genericCompressor.NoLoadPowerUL / (genericCompressor.NoLoadPowerUL - 25 + 2521.834 / genericCompressor.EffFL) / genericCompressor.EffFL) / 10000;
    } else {
      performancePoints.noLoad.power = genericCompressor.NoLoadPowerUL * genericCompressor.TotPackageInputPower / 1 / 10000;
    }
    return performancePoints;
  }

  setVariableDisplacementPerformancePoints(performancePoints: PerformancePoints, genericCompressor: GenericCompressor): PerformancePoints {
    performancePoints.fullLoad.dischargePressure = genericCompressor.RatedPressure;
    performancePoints.fullLoad.airflow = genericCompressor.RatedCapacity;
    performancePoints.fullLoad.power = genericCompressor.TotPackageInputPower;

    performancePoints.maxFullFlow.dischargePressure = genericCompressor.MaxFullFlowPressure;
    //TODO: calculate airflow and power?
    performancePoints.maxFullFlow.airflow = genericCompressor.RatedCapacity;
    performancePoints.maxFullFlow.power = genericCompressor.TotPackageInputPower;

    performancePoints.unloadPoint.dischargePressure = genericCompressor.MaxFullFlowPressure + (genericCompressor.ModulatingPressRange * (1 - (genericCompressor.UnloadPoint / 100)));
    performancePoints.unloadPoint.airflow = genericCompressor.RatedCapacity * (genericCompressor.UnloadPoint / 100);
    performancePoints.unloadPoint.power = ((genericCompressor.NoLoadPowerFM / 100) * (1 - Math.pow((genericCompressor.UnloadPoint / 100), 2)) + Math.pow((genericCompressor.UnloadPoint / 100), 2)) * performancePoints.maxFullFlow.power;

    performancePoints.noLoad.dischargePressure = genericCompressor.MinULSumpPressure;
    performancePoints.noLoad.airflow = 0
    if (genericCompressor.NoLoadPowerUL < 25) {
      performancePoints.noLoad.power = genericCompressor.NoLoadPowerUL * genericCompressor.TotPackageInputPower / (genericCompressor.NoLoadPowerUL / (genericCompressor.NoLoadPowerUL - 25 + 2521.834 / genericCompressor.EffFL) / genericCompressor.EffFL) / 10000;
    } else {
      performancePoints.noLoad.power = genericCompressor.NoLoadPowerUL * genericCompressor.TotPackageInputPower / 1 / 10000;
    }
    return performancePoints;
  }

  setLubricatedLoadUnloadPerformancePoints(performancePoints: PerformancePoints, genericCompressor: GenericCompressor): PerformancePoints {
    performancePoints.fullLoad.dischargePressure = genericCompressor.RatedPressure;
    performancePoints.fullLoad.airflow = genericCompressor.RatedCapacity;
    performancePoints.fullLoad.power = genericCompressor.TotPackageInputPower;

    performancePoints.maxFullFlow.dischargePressure = genericCompressor.MaxFullFlowPressure;
    //TODO: calculate airflow and power?
    performancePoints.maxFullFlow.airflow = genericCompressor.RatedCapacity;
    performancePoints.maxFullFlow.power = genericCompressor.TotPackageInputPower;

    performancePoints.noLoad.dischargePressure = genericCompressor.MinULSumpPressure;
    performancePoints.noLoad.airflow = 0
    if (genericCompressor.NoLoadPowerUL < 25) {
      performancePoints.noLoad.power = genericCompressor.NoLoadPowerUL * genericCompressor.TotPackageInputPower / (genericCompressor.NoLoadPowerUL / (genericCompressor.NoLoadPowerUL - 25 + 2521.834 / genericCompressor.EffFL) / genericCompressor.EffFL) / 10000;
    } else {
      performancePoints.noLoad.power = genericCompressor.NoLoadPowerUL * genericCompressor.TotPackageInputPower / 1 / 10000;
    }
    return performancePoints;
  }

}
