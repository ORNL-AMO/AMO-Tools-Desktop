import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorInventoryItem, UseUnloadingControls } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { ControlTypes } from '../../inventory/inventoryOptions';

@Component({
  selector: 'app-use-unloading-controls',
  templateUrl: './use-unloading-controls.component.html',
  styleUrls: ['./use-unloading-controls.component.css']
})
export class UseUnloadingControlsComponent implements OnInit {

  selectedModificationIdSub: Subscription;
  useUnloadingControls: UseUnloadingControls
  isFormChange: boolean = false;
  controlTypeOptions: Array<{ value: number, label: string, compressorTypes: Array<number> }>;
  inventoryItems: Array<CompressorInventoryItem>;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.controlTypeOptions = ControlTypes.filter(type => { return type.value == 2 || type.value == 3 });
    this.selectedModificationIdSub = this.compressedAirAssessmentService.selectedModificationId.subscribe(val => {
      if (val && !this.isFormChange) {
        let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
        this.inventoryItems = compressedAirAssessment.compressorInventoryItems;
        let modificationIndex: number = compressedAirAssessment.modifications.findIndex(mod => { return mod.modificationId == val });
        this.useUnloadingControls = compressedAirAssessment.modifications[modificationIndex].useUnloadingControls;
        // this.checkCanAddUnloadingControls(compressedAirAssessment);
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

  // checkCanAddUnloadingControls(compressedAirAssessment: CompressedAirAssessment) {
  //   let selectedCompressor: CompressorInventoryItem = compressedAirAssessment.compressorInventoryItems.find(item => { return item.itemId == this.useUnloadingControls.compressorId });
  //   if (selectedCompressor && (selectedCompressor.nameplateData.compressorType == 1 || selectedCompressor.nameplateData.compressorType == 2)) {
  //     this.canAddUnloadingControls = true;
  //   } else {
  //     this.canAddUnloadingControls = false;
  //   }
  // }

  // changeCompressor() {
  //   let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
  //   this.checkCanAddUnloadingControls(compressedAirAssessment);
  //   let selectedCompressor: CompressorInventoryItem = compressedAirAssessment.compressorInventoryItems.find(item => { return item.itemId == this.useUnloadingControls.compressorId });
  //   if (selectedCompressor) {
  //     let compressorCopy: CompressorInventoryItem = JSON.parse(JSON.stringify(selectedCompressor));
  //     this.useUnloadingControls.performancePoints = compressorCopy.performancePoints;
  //     this.useUnloadingControls.unloadPointCapacity = compressorCopy.compressorControls.unloadPointCapacity;
  //   }
  //   this.save();
  // }

}
