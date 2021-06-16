import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorInventoryItem, PerformancePoints } from '../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { GenericCompressor, GenericCompressorDbService } from '../../../generic-compressor-db.service';
import { InventoryService } from '../../inventory.service';
import { PerformancePointCalculationsService } from '../../performance-point-calculations.service';
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
    private compressedAirAssessmentService: CompressedAirAssessmentService, private performancePointCalculationsService: PerformancePointCalculationsService) { }

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

    selectedCompressor.centrifugalSpecifics.minFullLoadPressure = genericCompressor.MinStonewallPressure;
    selectedCompressor.centrifugalSpecifics.minFullLoadCapacity = genericCompressor.MinPressStonewallFlow;
    selectedCompressor.centrifugalSpecifics.surgeAirflow = genericCompressor.DesignSurgeFlow;
    selectedCompressor.centrifugalSpecifics.maxFullLoadPressure = genericCompressor.MaxSurgePressure;
    selectedCompressor.centrifugalSpecifics.maxFullLoadCapacity = genericCompressor.MaxPressSurgeFlow;
    //TODO: Alex Question.. EffFL and AmpsFL not listed in xcel (round 3)
    //I believe these were added later on and should be accurate
    selectedCompressor.designDetails.designEfficiency = genericCompressor.EffFL;
    selectedCompressor.nameplateData.fullLoadAmps = genericCompressor.AmpsFL;

    selectedCompressor.performancePoints = this.performancePointCalculationsService.setPerformancePoints(selectedCompressor, genericCompressor);
    return selectedCompressor;
  }
}
