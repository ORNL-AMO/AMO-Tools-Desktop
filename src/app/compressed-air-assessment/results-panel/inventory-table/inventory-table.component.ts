import { ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { ConfirmDeleteData } from '../../../shared/confirm-delete-modal/confirmDeleteData';
import { CompressedAirAssessment, CompressorInventoryItem, Modification, ProfileSummary, ReplaceCompressorsEEM } from '../../../shared/models/compressed-air-assessment';
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
  inModifiedInventory: boolean;

  compressedAirAssessmentSub: Subscription;
  compressorInventoryItems: Array<CompressorInventoryItem>;

  selectedCompressor: CompressorInventoryItem;
  selectedCompressorSub: Subscription;
  replaceCompressorsEEM: ReplaceCompressorsEEM;

  showConfirmDeleteModal: boolean = false;
  deleteSelectedId: string;
  hasInvalidCompressors: boolean = false;
  confirmDeleteCompressorInventoryData: ConfirmDeleteData;

  showExpandedTableRow: boolean = false;
  expandedTableRowIndex: number = 0;
  settings: Settings;
  selectedModificationIndex: number;

  @ViewChild('replacementModal', { static: false }) public replacementModal: ModalDirective;
  @ViewChild('modalDialog', { static: false }) public modalDialog: ElementRef;
  @ViewChild('inventoryTable', { static: false }) public inventoryTable: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getBodyHeightForReplacementModal();
  }
  showReplacementModal: boolean = false;
  modalSub: Subscription;
  bodyHeight: number = 0;
  componentWidth: number = 0;
  compressedAirAssessment: CompressedAirAssessment;
  modifiedCompressorInventoryItems: CompressorInventoryItem[];
  
  constructor(private inventoryService: InventoryService, 
    private cd: ChangeDetectorRef, private compressedAirAssessmentService: CompressedAirAssessmentService,
    private systemProfileService: SystemProfileService, private performancePointsFormService: PerformancePointsFormService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.compressorInventoryItems = this.compressedAirAssessmentService.compressedAirAssessment.getValue().compressorInventoryItems;
    
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(val => {
      this.selectedCompressor = val;
      this.showExpandedTableRow = false;
      if (this.inModifiedInventory) {
        this.setReplacementCompressorDisplayData();
      }
      this.cd.detectChanges();
    });

    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      this.compressedAirAssessment = val;
      if (this.compressedAirAssessment) {
        this.compressorInventoryItems = val.compressorInventoryItems;
        if (this.inModifiedInventory) {
          this.setModifiedInventory();
          this.setReplaceCompressorEEM();
        } else if (this.isSelectingReplacement || this.isSelectingReplaced) {
          this.setModifiedInventory();
          this.setAvailableReplacementInventoryOptions()
        }

        this.compressorInventoryItems.forEach(compressor => {
          compressor.isValid = this.inventoryService.isCompressorValid(compressor, val.systemInformation);
        });
        this.hasInvalidCompressors = this.compressorInventoryItems.some(compressor => !compressor.isValid);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.isSelectingReplacement && !changes.isSelectingReplacement.firstChange) {
      this.setModifiedInventory();
      this.setAvailableReplacementInventoryOptions();
    }
  }

  ngAfterViewInit() {
    this.modalSub = this.replacementModal.onShown.subscribe(() => {
      this.getBodyHeightForReplacementModal();
    });
  }

  ngOnDestroy() {
    this.selectedCompressorSub.unsubscribe();
    this.compressedAirAssessmentSub.unsubscribe();
    this.modalSub.unsubscribe();
  }

  setReplacementCompressorDisplayData() {
    // update related names
    if (this.selectedCompressor.compressorReplacementData) {
      let relatedCompressor: CompressorInventoryItem;
      if (this.selectedCompressor.compressorReplacementData.isReplacement) {
        relatedCompressor = this.compressorInventoryItems.find(item => item.compressorReplacementData && item.compressorReplacementData.replacedByCompressorId === this.selectedCompressor.itemId);
        this.selectedCompressor.compressorReplacementData.replacesCompressorName = relatedCompressor.name;
      }
      if (this.selectedCompressor.compressorReplacementData.isReplaced) {
        relatedCompressor = this.compressorInventoryItems.find(item => item.compressorReplacementData && item.compressorReplacementData.replacesCompressorId === this.selectedCompressor.itemId)
        this.selectedCompressor.compressorReplacementData.replacedByCompressorName = relatedCompressor.name;
      }
    }
  }


  setModifiedInventory() {
    this.selectedModificationIndex = this.compressedAirAssessment.modifications.findIndex(mod => { return mod.modificationId == this.compressedAirAssessmentService.selectedModificationId.getValue() });
    let modification = this.compressedAirAssessment.modifications[this.selectedModificationIndex];
    if (modification.modifiedCompressorInventoryItems) {
      this.compressorInventoryItems = this.compressedAirAssessment.compressorInventoryItems.concat(modification.modifiedCompressorInventoryItems);   
    }
  }

  setAvailableReplacementInventoryOptions() {
      this.compressorInventoryItems = this.compressorInventoryItems.filter(item => {
        if (item.compressorReplacementData && (item.compressorReplacementData.isReplaced || item.compressorReplacementData.isReplacement)) {
          return false;
        } 
        if (this.isSelectingReplaced && item.isNewModified) {
          return false;
        }
        return true;
      });
  }


  setReplaceCompressorEEM() {
    if (this.compressedAirAssessment && this.selectedModificationIndex != undefined && this.compressedAirAssessment.modifications[this.selectedModificationIndex]) {
      this.replaceCompressorsEEM = JSON.parse(JSON.stringify(this.compressedAirAssessment.modifications[this.selectedModificationIndex].replaceCompressorsEEM));
    }
  }

  selectItem(item: CompressorInventoryItem) {
    this.inventoryService.selectedCompressor.next(item);
  }

  addNewCompressor() {
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let result: { newInventoryItem: CompressorInventoryItem, compressedAirAssessment: CompressedAirAssessment }
    if (this.inModifiedInventory) {
      result = this.inventoryService.addNewCompressor(compressedAirAssessment, undefined, this.compressedAirAssessmentService.selectedModificationId.getValue());
    } else {
      result = this.inventoryService.addNewCompressor(compressedAirAssessment, undefined);
    }
    this.compressedAirAssessmentService.updateCompressedAir(result.compressedAirAssessment, !this.inModifiedInventory);
    this.inventoryService.selectedCompressor.next(result.newInventoryItem);
  }

  deleteItem() {
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();

    if (!this.inModifiedInventory) {
      let itemIndex: number = compressedAirAssessment.compressorInventoryItems.findIndex(inventoryItem => { return inventoryItem.itemId == this.deleteSelectedId });
      compressedAirAssessment.compressorInventoryItems.splice(itemIndex, 1);

      // 4841 Below not implemented for modified compressors?
      compressedAirAssessment.modifications.forEach(modification => {
        modification.reduceRuntime.runtimeData = modification.reduceRuntime.runtimeData.filter(data => { return data.compressorId != this.deleteSelectedId });
        modification.adjustCascadingSetPoints.setPointData = modification.adjustCascadingSetPoints.setPointData.filter(data => { return data.compressorId != this.deleteSelectedId });
        modification.useAutomaticSequencer.profileSummary = modification.useAutomaticSequencer.profileSummary.filter(summary => { return summary.compressorId != this.deleteSelectedId })
      });
  
      let numberOfHourIntervals: number = compressedAirAssessment.systemProfile.systemProfileSetup.numberOfHours / compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval;
      compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
        itemIndex = compressedAirAssessment.systemProfile.profileSummary.findIndex(summary => { return summary.compressorId == this.deleteSelectedId && summary.dayTypeId == dayType.dayTypeId });
        let removedSummary: Array<ProfileSummary> = compressedAirAssessment.systemProfile.profileSummary.splice(itemIndex, 1);
        if (compressedAirAssessment.systemInformation.multiCompressorSystemControls == 'targetPressureSequencer') {
          compressedAirAssessment.systemProfile.profileSummary = this.systemProfileService.updateCompressorOrderingSequencer(compressedAirAssessment.systemProfile.profileSummary, dayType, removedSummary[0], numberOfHourIntervals);
        } else if (compressedAirAssessment.systemInformation.multiCompressorSystemControls == 'cascading') {
          compressedAirAssessment.systemProfile.profileSummary = this.systemProfileService.updateCompressorOrderingCascading(compressedAirAssessment.systemProfile.profileSummary, dayType, numberOfHourIntervals);
        } else if (compressedAirAssessment.systemInformation.multiCompressorSystemControls == 'isentropicEfficiency') {
          compressedAirAssessment.systemProfile.profileSummary = this.systemProfileService.updateCompressorOrderingIsentropicEfficiency(compressedAirAssessment.systemProfile.profileSummary, dayType, numberOfHourIntervals, compressedAirAssessment.compressorInventoryItems, this.settings, compressedAirAssessment.systemInformation);
        } else if (compressedAirAssessment.systemInformation.multiCompressorSystemControls == 'baseTrim') {
          compressedAirAssessment.systemProfile.profileSummary = this.systemProfileService.updateCompressorOrderingCascading(compressedAirAssessment.systemProfile.profileSummary, dayType, numberOfHourIntervals);
        }
      });
  
      if (compressedAirAssessment.systemInformation.multiCompressorSystemControls == 'baseTrim') {
        compressedAirAssessment.systemInformation.trimSelections.forEach(selection => {
          if (selection.compressorId == this.deleteSelectedId) {
            selection.compressorId = undefined;
          }
        })
      }
    } else {
      let modification = this.compressedAirAssessment.modifications[this.selectedModificationIndex];
      let itemIndex: number = modification.modifiedCompressorInventoryItems.findIndex(inventoryItem => { return inventoryItem.itemId == this.deleteSelectedId });

      let deletedCompressor: CompressorInventoryItem = modification.modifiedCompressorInventoryItems[itemIndex];
      if (deletedCompressor.compressorReplacementData && deletedCompressor.compressorReplacementData.isReplacement) {
        let relatedCompressorIndex: number = this.compressorInventoryItems.findIndex(item => item.compressorReplacementData && item.compressorReplacementData.replacedByCompressorId === deletedCompressor.itemId);
        if (relatedCompressorIndex) {
          relatedCompressorIndex = compressedAirAssessment.compressorInventoryItems.findIndex(item => item.compressorReplacementData && item.compressorReplacementData.replacedByCompressorId === deletedCompressor.itemId);
          this.compressedAirAssessment.compressorInventoryItems[relatedCompressorIndex].compressorReplacementData = undefined; 
          this.setModifiedInventory();
        }
      }

      modification.modifiedCompressorInventoryItems.splice(itemIndex, 1);
    }

    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment, !this.inModifiedInventory);


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

  expandReplacedCompressorData(index: number) {
    this.showExpandedTableRow = !this.showExpandedTableRow;
    this.expandedTableRowIndex = index;
  }

  getPressureMinMax(compressor: CompressorInventoryItem): string {
    let minMax: { min: number, max: number } = this.performancePointsFormService.getCompressorPressureMinMax(compressor.compressorControls.controlType, compressor.performancePoints);
    let unit: string = ' psig';
    if (this.settings.unitsOfMeasure == 'Metric') {
      unit = ' barg';
    }

    return minMax.min + ' - ' + minMax.max + unit;
  }

  createCopy(compressor: CompressorInventoryItem) {
    let compressorCpy: CompressorInventoryItem = JSON.parse(JSON.stringify(compressor));
    compressorCpy.itemId = Math.random().toString(36).substr(2, 9);
    compressorCpy.name = compressorCpy.name + ' (copy)';
    this.inventoryService.addNewCompressor(this.compressedAirAssessment, compressorCpy, this.compressedAirAssessmentService.selectedModificationId.getValue());
    if (this.inModifiedInventory) {
      this.setModifiedInventory();
    }

    this.compressedAirAssessmentService.updateCompressedAir(this.compressedAirAssessment, !this.inModifiedInventory);
  }

  getBodyHeightForReplacementModal() {
    if (this.modalDialog) {
      this.bodyHeight = this.modalDialog.nativeElement.clientHeight;
    }
    if (this.inventoryTable) {
      this.componentWidth = this.inventoryTable.nativeElement.offsetWidth;
    }
    this.cd.detectChanges();
  }

  selectCompressorForReplacement() {
    this.showReplacementModal = true;
    this.replacementModal.show();
    this.compressedAirAssessmentService.modalOpen.next(true);
  }

  closeReplacementModal(replaceCompressorsData: ReplaceCompressorsEEM) {
    if (replaceCompressorsData) {
      this.compressedAirAssessment.modifications[this.selectedModificationIndex].replaceCompressorsEEM = replaceCompressorsData;
      this.compressedAirAssessmentService.updateCompressedAir(this.compressedAirAssessment, false);
      this.selectedCompressor = replaceCompressorsData.replacementCompressors[0]? replaceCompressorsData.replacementCompressors[0] : this.selectedCompressor; 
    // this.exploreOpportunitiesValidationService.replaceCompressorsValid.next(this.form.valid);
    }
    this.compressedAirAssessmentService.modalOpen.next(false);
    this.showReplacementModal = false;
    this.replacementModal.hide();
  }
}
