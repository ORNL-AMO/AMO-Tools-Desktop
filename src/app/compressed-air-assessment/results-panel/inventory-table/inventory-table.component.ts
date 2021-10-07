import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfirmDeleteData } from '../../../shared/confirm-delete-modal/confirmDeleteData';
import { CompressedAirAssessment, CompressorInventoryItem, ProfileSummary } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { InventoryService } from '../../inventory/inventory.service';
import { PerformancePointsFormService } from '../../inventory/performance-points/performance-points-form.service';
import { SystemProfileService } from '../../system-profile/system-profile.service';

@Component({
  selector: 'app-inventory-table',
  templateUrl: './inventory-table.component.html',
  styleUrls: ['./inventory-table.component.css']
})
export class InventoryTableComponent implements OnInit {

  compressedAirAssessmentSub: Subscription;
  compressorInventoryItems: Array<CompressorInventoryItem>;

  selectedCompressor: CompressorInventoryItem;
  selectedCompressorSub: Subscription;

  showConfirmDeleteModal: boolean = false;
  deleteSelectedId: string;
  hasInvalidCompressors: boolean = false;
  confirmDeleteCompressorInventoryData: ConfirmDeleteData;


  constructor(private inventoryService: InventoryService, private compressedAirAssessmentService: CompressedAirAssessmentService,
    private systemProfileService: SystemProfileService, private performancePointsFormService: PerformancePointsFormService) { }

  ngOnInit(): void {
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(val => {
      this.selectedCompressor = val;
    })
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      if (val) {
        this.compressorInventoryItems = val.compressorInventoryItems;
        this.compressorInventoryItems.forEach(compressor => {
          compressor.isValid = this.inventoryService.isCompressorValid(compressor);
        });
        this.hasInvalidCompressors = this.compressorInventoryItems.some(compressor => !compressor.isValid);
      }
    });
  }

  ngOnDestroy() {
    this.selectedCompressorSub.unsubscribe();
    this.compressedAirAssessmentSub.unsubscribe();
  }

  selectItem(item: CompressorInventoryItem) {
    this.inventoryService.selectedCompressor.next(item);
  }

  addNewCompressor() {
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    this.inventoryService.addNewCompressor(compressedAirAssessment.systemProfile.systemProfileSetup.numberOfHours / compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval);
  }

  deleteItem() {
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let itemIndex: number = compressedAirAssessment.compressorInventoryItems.findIndex(inventoryItem => { return inventoryItem.itemId == this.deleteSelectedId });
    compressedAirAssessment.compressorInventoryItems.splice(itemIndex, 1);

    compressedAirAssessment.modifications.forEach(modification => {
      modification.reduceRuntime.runtimeData = modification.reduceRuntime.runtimeData.filter(data => { return data.compressorId != this.deleteSelectedId });
      modification.adjustCascadingSetPoints.setPointData = modification.adjustCascadingSetPoints.setPointData.filter(data => { return data.compressorId != this.deleteSelectedId });
      modification.useAutomaticSequencer.profileSummary = modification.useAutomaticSequencer.profileSummary.filter(summary => { return summary.compressorId != this.deleteSelectedId })
    });
    
    let numberOfHourIntervals: number = compressedAirAssessment.systemProfile.systemProfileSetup.numberOfHours / compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval;
    compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
      itemIndex = compressedAirAssessment.systemProfile.profileSummary.findIndex(summary => { return summary.compressorId == this.deleteSelectedId && summary.dayTypeId == dayType.dayTypeId });
      let removedSummary: Array<ProfileSummary> = compressedAirAssessment.systemProfile.profileSummary.splice(itemIndex, 1);
      if (compressedAirAssessment.systemInformation.isSequencerUsed) {
        compressedAirAssessment.systemProfile.profileSummary = this.systemProfileService.updateCompressorOrderingSequencer(compressedAirAssessment.systemProfile.profileSummary, dayType, removedSummary[0], numberOfHourIntervals);
      } else {
        compressedAirAssessment.systemProfile.profileSummary = this.systemProfileService.updateCompressorOrderingNoSequencer(compressedAirAssessment.systemProfile.profileSummary, dayType, numberOfHourIntervals);
      }
    });
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment);
    this.inventoryService.selectedCompressor.next(compressedAirAssessment.compressorInventoryItems[0]);
  }

  openConfirmDeleteModal(item: CompressorInventoryItem) {
    this.confirmDeleteCompressorInventoryData = {
      modalTitle: 'Delete Compressor Inventory Item',
      confirmMessage: `Are you sure you want to delete '${item.name}'?`
    }
    this.showConfirmDeleteModal = true;
    this.deleteSelectedId = item.itemId;
    this.compressedAirAssessmentService.modalOpen.next(true);
  }

  onConfirmDeleteClose(deleteInventoryItem: boolean) {
    if (deleteInventoryItem) {
      this.deleteItem();
    }
    this.showConfirmDeleteModal = false;
    this.compressedAirAssessmentService.modalOpen.next(false);
  }

  getPressureMinMax(compressor: CompressorInventoryItem): string {
    let minMax: { min: number, max: number } = this.performancePointsFormService.getPressureMinMax(compressor.compressorControls.controlType, compressor.performancePoints);
    return minMax.min + ' - ' + minMax.max + ' psig';
  }

  createCopy(compressor: CompressorInventoryItem){
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let numberOfHourIntervals: number = compressedAirAssessment.systemProfile.systemProfileSetup.numberOfHours / compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval;
    let compressorCpy: CompressorInventoryItem = JSON.parse(JSON.stringify(compressor));
    compressorCpy.itemId = Math.random().toString(36).substr(2, 9);
    compressorCpy.name = compressorCpy.name + ' (copy)';
    this.inventoryService.addNewCompressor(numberOfHourIntervals, compressorCpy);
  }
}
