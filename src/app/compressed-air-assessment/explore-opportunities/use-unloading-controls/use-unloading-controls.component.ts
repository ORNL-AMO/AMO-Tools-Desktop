import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AdjustedUnloadingCompressor, CompressedAirAssessment, CompressorInventoryItem, UseUnloadingControls } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { InventoryService } from '../../inventory/inventory.service';

@Component({
  selector: 'app-use-unloading-controls',
  templateUrl: './use-unloading-controls.component.html',
  styleUrls: ['./use-unloading-controls.component.css']
})
export class UseUnloadingControlsComponent implements OnInit {

  selectedModificationIdSub: Subscription;
  useUnloadingControls: UseUnloadingControls
  isFormChange: boolean = false;

  inventoryItems: Array<CompressorInventoryItem>;
  selectedAdjustedCompressor: AdjustedUnloadingCompressor;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private inventoryService: InventoryService) { }

  ngOnInit(): void {
    this.selectedModificationIdSub = this.compressedAirAssessmentService.selectedModificationId.subscribe(val => {
      if (val && !this.isFormChange) {
        let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
        this.inventoryItems = compressedAirAssessment.compressorInventoryItems;
        let modificationIndex: number = compressedAirAssessment.modifications.findIndex(mod => { return mod.modificationId == val });
        this.useUnloadingControls = compressedAirAssessment.modifications[modificationIndex].useUnloadingControls;
        if (!this.selectedAdjustedCompressor && this.useUnloadingControls.selected) {
          this.initializeSelectedCompressor();
        }
      } else {
        this.isFormChange = false;
      }
    });
  }

  ngOnDestroy() {
    this.selectedModificationIdSub.unsubscribe();
  }

  focusField(str: string) {
    this.compressedAirAssessmentService.focusedField.next(str);
  }

  setUseUnloadingControls() {
    this.save();
  }

  save() {
    this.isFormChange = true;
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let selectedModificationId: string = this.compressedAirAssessmentService.selectedModificationId.getValue();
    let modificationIndex: number = compressedAirAssessment.modifications.findIndex(mod => { return mod.modificationId == selectedModificationId });
    compressedAirAssessment.modifications[modificationIndex].useUnloadingControls = this.useUnloadingControls;
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment);
  }

  setSelectedCompressor() {
    let selectedCompressor: CompressorInventoryItem = this.inventoryItems.find(item => { return item.itemId == this.selectedAdjustedCompressor.compressorId });
    let selectedCompressorCopy: CompressorInventoryItem = JSON.parse(JSON.stringify(selectedCompressor));
    selectedCompressorCopy.performancePoints = this.selectedAdjustedCompressor.performancePoints;
    selectedCompressorCopy.compressorControls.controlType = this.selectedAdjustedCompressor.controlType;
    selectedCompressorCopy.compressorControls.unloadPointCapacity = this.selectedAdjustedCompressor.unloadPointCapacity;
    selectedCompressorCopy.compressorControls.automaticShutdown = this.selectedAdjustedCompressor.automaticShutdown;
    this.inventoryService.selectedCompressor.next(selectedCompressorCopy);
  }

  initializeSelectedCompressor() {
    this.useUnloadingControls.adjustedCompressors.forEach(compressor => {
      if (compressor.originalControlType != compressor.controlType) {
        this.selectedAdjustedCompressor = compressor;
      }
    });
    if (!this.selectedAdjustedCompressor) {
      this.selectedAdjustedCompressor = this.useUnloadingControls.adjustedCompressors[0];
    }
  }

}
