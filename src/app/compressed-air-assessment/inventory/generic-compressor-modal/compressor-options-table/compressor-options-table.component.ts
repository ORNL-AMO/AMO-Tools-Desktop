import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorInventoryItem } from '../../../../shared/models/compressed-air-assessment';
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
    selectedCompressor.nameplateData.motorPower = genericCompressor.HP;
    selectedCompressor.nameplateData.fullLoadOperatingPressure = genericCompressor.RatedPressure;
    selectedCompressor.nameplateData.fullLoadRatedCapacity = genericCompressor.RatedCapacity;
    selectedCompressor.nameplateData.fullLoadAmps = genericCompressor.AmpsFL;

    selectedCompressor.compressorControls.unloadPointCapacity = genericCompressor.UnloadPoint;
    selectedCompressor.compressorControls.numberOfUnloadSteps = genericCompressor.UnloadSteps;

    selectedCompressor.compressorControls.controlType = genericCompressor.IDControlType;


    selectedCompressor.designDetails.inputPressure = genericCompressor.DesignInPressure;
    selectedCompressor.designDetails.blowdownTime = genericCompressor.BlowdownTime;
    selectedCompressor.designDetails.unloadSlumpPressure = genericCompressor.MinULSumpPressure;
    selectedCompressor.designDetails.modulatingPressureRange = genericCompressor.ModulatingPressRange;
    selectedCompressor.designDetails.designEfficiency = genericCompressor.EffFL;

    selectedCompressor.inletConditions.temperature = genericCompressor.DesignInTemp;

    //MaxFullFlowPressure = "cut-out" performance point
    selectedCompressor.performancePoints.unloadPoint.dischargePressure = genericCompressor.MaxFullFlowPressure;
    if (selectedCompressor.compressorControls.controlType != 2 && selectedCompressor.compressorControls.controlType != 3) {
      selectedCompressor.performancePoints.maxFullFlow.dischargePressure = genericCompressor.MaxFullFlowPressure;
    }

    selectedCompressor.performancePoints.blowoff.airflow = genericCompressor.MaxPressSurgeFlow;
    selectedCompressor.performancePoints.blowoff.dischargePressure = genericCompressor.MaxSurgePressure;


    selectedCompressor.centrifugalSpecifics.minFullLoadPressure = genericCompressor.MinStonewallPressure;
    selectedCompressor.centrifugalSpecifics.minFullLoadCapacity = genericCompressor.MinPressStonewallFlow;
    selectedCompressor.centrifugalSpecifics.surgeAirflow = genericCompressor.DesignSurgeFlow;
    selectedCompressor.centrifugalSpecifics.maxFullLoadPressure = genericCompressor.MaxSurgePressure;
    selectedCompressor.centrifugalSpecifics.maxFullLoadCapacity = genericCompressor.MaxPressSurgeFlow;

    //fullLoad.power = 'kW', PowerFLBHP = HP
    // selectedCompressor.performancePoints.fullLoad.power = genericCompressor.PowerFLBHP;

    // SpecPackagePower?
    //TotPackageInputPower
    // NoLoadPowerFM: number,
    // NoLoadPowerUL: number,
    if (selectedCompressor.compressorControls.controlType == 4 || selectedCompressor.compressorControls.controlType == 7 || selectedCompressor.compressorControls.controlType == 2 || selectedCompressor.compressorControls.controlType == 3 || selectedCompressor.compressorControls.controlType == 9 || selectedCompressor.compressorControls.controlType == 11) {
      selectedCompressor.performancePoints.noLoad.power = 0;
    } else if (selectedCompressor.compressorControls.controlType == 6) {
      selectedCompressor.performancePoints.noLoad.power = genericCompressor.NoLoadPowerUL;
    } else if (selectedCompressor.compressorControls.controlType == 1) {
      selectedCompressor.performancePoints.noLoad.power = genericCompressor.NoLoadPowerFM;
    }

    return selectedCompressor;
  }
}
