import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AdjustedUnloadingCompressor, CompressedAirAssessment, CompressorInventoryItem, Modification, UseUnloadingControls } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { InventoryService } from '../../inventory/inventory.service';
import { ExploreOpportunitiesService } from '../explore-opportunities.service';

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
  selectedModificationIndex: number;
  orderOptions: Array<number>;
  compressedAirAssessmentSub: Subscription;
  compressedAirAssessment: CompressedAirAssessment;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private exploreOpportunitiesService: ExploreOpportunitiesService,
    private inventoryService: InventoryService) { }

  ngOnInit(): void {
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(compressedAirAssessment => {
      if (compressedAirAssessment && !this.isFormChange) {
        this.compressedAirAssessment = JSON.parse(JSON.stringify(compressedAirAssessment));
        this.setOrderOptions();
        this.setData()
      } else {
        this.isFormChange = false;
      }
    });
    this.selectedModificationIdSub = this.compressedAirAssessmentService.selectedModificationId.subscribe(val => {
      if (val && !this.isFormChange) {
        this.inventoryItems = this.compressedAirAssessment.compressorInventoryItems;
        this.selectedModificationIndex = this.compressedAirAssessment.modifications.findIndex(mod => { return mod.modificationId == val });
        this.setData();
        if (!this.selectedAdjustedCompressor && this.useUnloadingControls.selected) {
          this.initializeSelectedCompressor();
        }
      } else {
        this.isFormChange = false;
      }
      this.setOrderOptions();
    });
  }

  ngOnDestroy() {
    this.selectedModificationIdSub.unsubscribe();
  }

  focusField(str: string) {
    this.compressedAirAssessmentService.focusedField.next(str);
  }
  setData() {
    if (this.compressedAirAssessment && this.selectedModificationIndex != undefined) {
      this.useUnloadingControls = JSON.parse(JSON.stringify(this.compressedAirAssessment.modifications[this.selectedModificationIndex].useUnloadingControls));
    }
  }

  setOrderOptions() {
    if (this.compressedAirAssessment && this.selectedModificationIndex != undefined) {
      this.orderOptions = new Array();
      let modification: Modification = this.compressedAirAssessment.modifications[this.selectedModificationIndex];
      let allOrders: Array<number> = [
        modification.addPrimaryReceiverVolume.order,
        modification.adjustCascadingSetPoints.order,
        modification.improveEndUseEfficiency.order,
        modification.reduceRuntime.order,
        modification.reduceSystemAirPressure.order,
        modification.reduceAirLeaks.order,
        modification.useAutomaticSequencer.order
      ];
      allOrders = allOrders.filter(order => { return order != 100 });
      let numOrdersOn: number = allOrders.length;
      for (let i = 1; i <= numOrdersOn + 1; i++) {
        this.orderOptions.push(i);
      }
    }
  }

  save(isOrderChange: boolean) {
    this.isFormChange = true;
    let previousOrder: number = JSON.parse(JSON.stringify(this.compressedAirAssessment.modifications[this.selectedModificationIndex].useUnloadingControls.order));
    this.compressedAirAssessment.modifications[this.selectedModificationIndex].useUnloadingControls = this.useUnloadingControls;
    if (isOrderChange) {
      this.isFormChange = false;
      let newOrder: number = this.useUnloadingControls.order;
      this.compressedAirAssessment.modifications[this.selectedModificationIndex] = this.exploreOpportunitiesService.setOrdering(this.compressedAirAssessment.modifications[this.selectedModificationIndex], 'useUnloadingControls', previousOrder, newOrder);
    }
    this.compressedAirAssessmentService.updateCompressedAir(this.compressedAirAssessment);
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
    this.setSelectedCompressor();
  }

}
