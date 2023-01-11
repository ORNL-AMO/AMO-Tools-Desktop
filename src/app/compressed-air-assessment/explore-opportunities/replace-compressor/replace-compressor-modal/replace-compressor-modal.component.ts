import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressorInventoryItem, ReplaceCompressorsEEM } from '../../../../shared/models/compressed-air-assessment';
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
  
  compressorToReplace: CompressorInventoryItem;
  replacementCompressor: CompressorInventoryItem;
  selectedCompressorSub: Subscription;
  isInventoryCollapsed: boolean = false;
  isAddFromExistingCollapsed: boolean = true;
  isNewCompressor: boolean = false;

  constructor(private inventoryService: InventoryService) { }

  ngOnInit() {
    console.log(this.saveReplaceCompressorsEEMData);
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(selectedCompressor => {
      debugger;
      if (this.stepTab === 'select-old') {
        this.setCompressorToReplace(selectedCompressor)
      } else if (this.stepTab === 'select-new'){
        if (selectedCompressor.name == 'New Compressor') {
          this.isNewCompressor = true
        }
        this.setReplacementCompressor(selectedCompressor)
      }
    })
  }
  
  ngOnDestroy() {
    // reset data
  }
  
  saveReplacementData() {
    this.replaceCompressorsEEM.replacedCompressors.push(this.compressorToReplace);
    this.replaceCompressorsEEM.replacementCompressors.push(this.replacementCompressor);
    debugger;
    this.saveReplaceCompressorsEEMData.emit(this.replaceCompressorsEEM);
  }

  setCompressorToReplace(compressor: CompressorInventoryItem) {
    this.compressorToReplace = compressor;
    this.compressorToReplace.compressorReplacement = {
      isReplaced: true
    }
  }
  
  setReplacementCompressor(compressor: CompressorInventoryItem) {
    this.replacementCompressor = compressor;
    if (this.replacementCompressor) {
      this.replacementCompressor.compressorReplacement = {
        isReplacement: true,
        replacesCompressorId: this.compressorToReplace.itemId,
      }
      this.compressorToReplace.compressorReplacement.replacedByCompressorId = this.replacementCompressor.itemId;
    }
  }

  changeStepTab(str: string) {
    this.stepTab = str
  }

  closeModal() {
    this.saveReplaceCompressorsEEMData.emit(undefined);
  }

  toggleIsAddFromExistingCollapsed() {
    this.isAddFromExistingCollapsed = !this.isAddFromExistingCollapsed;
  }
  
  toggleInventoryCollapse() {
    this.isInventoryCollapsed = !this.isInventoryCollapsed;
    
  }


}
