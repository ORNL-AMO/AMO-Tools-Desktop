import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfirmDeleteData } from '../../../shared/confirm-delete-modal/confirmDeleteData';
import { CompressedAirAssessment, CompressorInventoryItem, ProfileSummary } from '../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../shared/models/settings';
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
  @Input()
  isSelectingReplacement: boolean;
  @Input()
  isSelectingReplaced: boolean;
  @Input()
  isShowingModifiedInventory: boolean;

  compressedAirAssessmentSub: Subscription;
  compressorInventoryItems: Array<CompressorInventoryItem>;

  selectedCompressor: CompressorInventoryItem;
  selectedReplacement: CompressorInventoryItem;
  selectedCompressorSub: Subscription;

  showConfirmDeleteModal: boolean = false;
  deleteSelectedId: string;
  hasInvalidCompressors: boolean = false;
  confirmDeleteCompressorInventoryData: ConfirmDeleteData;

  showExpandedTableRow: boolean;

  settings: Settings;
  constructor(private inventoryService: InventoryService, 
    private cd: ChangeDetectorRef, private compressedAirAssessmentService: CompressedAirAssessmentService,
    private systemProfileService: SystemProfileService, private performancePointsFormService: PerformancePointsFormService) { }

  ngOnInit(): void {
    console.log(this.isShowingModifiedInventory);
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(val => {
      this.selectedCompressor = val;
      this.cd.detectChanges();
    })
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      console.log('sub compressedAirAssessment', val)
      if (val) {
        this.compressorInventoryItems = val.compressorInventoryItems;
        
        if (this.isSelectingReplaced || this.isSelectingReplacement) {
          this.inventoryService.selectedCompressor.next(this.compressorInventoryItems[0]);
        }

        this.compressorInventoryItems.forEach(compressor => {
          compressor.isValid = this.inventoryService.isCompressorValid(compressor);
        });
        this.hasInvalidCompressors = this.compressorInventoryItems.some(compressor => !compressor.isValid);
        console.log((this.selectedCompressor || this.isSelectingReplacement || this.isSelectingReplaced) && this.compressorInventoryItems)
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
    let result: { newInventoryItem: CompressorInventoryItem, compressedAirAssessment: CompressedAirAssessment } = this.inventoryService.addNewCompressor(compressedAirAssessment);
    this.compressedAirAssessmentService.updateCompressedAir(result.compressedAirAssessment, true);
    debugger;
    this.inventoryService.selectedCompressor.next(result.newInventoryItem);
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
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment, true);
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

  expandReplacedCompressorData() {
    this.showExpandedTableRow
  }

  getPressureMinMax(compressor: CompressorInventoryItem): string {
    let minMax: { min: number, max: number } = this.performancePointsFormService.getCompressorPressureMinMax(compressor.compressorControls.controlType, compressor.performancePoints);
    let unit: string = ' psig';
    if(this.settings.unitsOfMeasure == 'Metric'){
      unit = ' barg';
    }
    
    return minMax.min + ' - ' + minMax.max + unit;
  }

  createCopy(compressor: CompressorInventoryItem){
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let compressorCpy: CompressorInventoryItem = JSON.parse(JSON.stringify(compressor));
    compressorCpy.itemId = Math.random().toString(36).substr(2, 9);
    compressorCpy.name = compressorCpy.name + ' (copy)';
    this.inventoryService.addNewCompressor(compressedAirAssessment, compressorCpy);
  }
}
