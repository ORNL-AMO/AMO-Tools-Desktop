import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorInventoryItem, Modification, ReplaceCompressorsEEM } from '../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { InventoryService } from '../../../inventory/inventory.service';

@Component({
  selector: 'app-replace-compressor-modal',
  templateUrl: './replace-compressor-modal.component.html',
  styleUrls: ['./replace-compressor-modal.component.css']
})
export class ReplaceCompressorModalComponent {
  stepTab: string = 'select-old';
  @Output('saveReplaceCompressorsEEMData')
  saveReplaceCompressorsEEMData = new EventEmitter<ReplaceCompressorsEEM>();
  @Input()
  bodyHeight: number = 0;
  @Input() 
  replaceCompressorsEEM: ReplaceCompressorsEEM;
  @Input()
  modifiedCompressorInventoryItems: Array<CompressorInventoryItem>;
  
  compressorToReplaceId: string;
  replacementCompressorId: string;
  selectedCompressorSub: Subscription;
  selectedCompressor: CompressorInventoryItem;
  constructor(private inventoryService: InventoryService) { }

  ngOnInit() {
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(selectedCompressor => {
      if (this.stepTab === 'select-new'){
        this.replacementCompressorId = selectedCompressor.itemId;
      }
      this.selectedCompressor = selectedCompressor;
    })
  }
  
  ngOnDestroy() {
    this.selectedCompressorSub.unsubscribe();
  }

  changeStepTab(newTab: string) {
    if (this.stepTab === 'select-old' && newTab === 'select-new') {
      this.compressorToReplaceId = this.inventoryService.selectedCompressor.getValue().itemId;
    }
    this.stepTab = newTab;
  }
  

  saveReplacementData() {
    if (this.replacementCompressorId !== this.compressorToReplaceId) {
      let compressorToReplace: CompressorInventoryItem = this.modifiedCompressorInventoryItems.find(compressor => compressor.itemId === this.compressorToReplaceId);
      compressorToReplace.compressorReplacementData = {
        isReplaced: true,
        replacedByCompressorId: this.replacementCompressorId,
      }
      let replacementCompressor: CompressorInventoryItem = this.modifiedCompressorInventoryItems.find(compressor => compressor.itemId === this.replacementCompressorId);
      replacementCompressor.compressorReplacementData = {
        isReplacement: true,
        replacesCompressorId: this.compressorToReplaceId,
        replacesCompressorName: compressorToReplace.name
      }
      compressorToReplace.compressorReplacementData.replacedByCompressorName = replacementCompressor.name;
      this.replaceCompressorsEEM.replacedCompressors.push(compressorToReplace);
      this.replaceCompressorsEEM.replacementCompressors.push(replacementCompressor);
      this.inventoryService.selectedCompressor.next(replacementCompressor);
      this.saveReplaceCompressorsEEMData.emit(this.replaceCompressorsEEM);
    }
  }


  closeModal() {
    this.saveReplaceCompressorsEEMData.emit(undefined);
  }

}
