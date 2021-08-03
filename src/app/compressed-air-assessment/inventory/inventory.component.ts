import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorInventoryItem, ProfileSummaryData } from '../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service';
import { InventoryService } from './inventory.service';
import * as _ from 'lodash';
import { SystemProfileService } from '../system-profile/system-profile.service';
@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {

  hasInventoryItems: boolean;
  form: FormGroup;
  selectedCompressorSub: Subscription;
  isFormChange: boolean = false;
  compressorType: number;
  controlType: number;
  showCompressorModal: boolean = false;
  hasValidCompressors: boolean = true;
  selectedCompressor: CompressorInventoryItem;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private inventoryService: InventoryService, private cd: ChangeDetectorRef, private systemProfileService: SystemProfileService) { }

  ngOnInit(): void {
    this.initializeInventory();
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(val => {
      if (val) {
        this.selectedCompressor = val;
        this.hasInventoryItems = true;
        this.compressorType = val.nameplateData.compressorType;
        this.controlType = val.compressorControls.controlType;
        if (this.isFormChange == false) {
          this.form = this.inventoryService.getGeneralInformationFormFromObj(val.name, val.description);
          this.checkSystemProfile();
        } else {
          this.isFormChange = false;
        }
      } else {
        this.compressorType = undefined;
        this.controlType = undefined;
        this.hasInventoryItems = false;
      }
    });
  }

  ngOnDestroy() {
    this.selectedCompressorSub.unsubscribe();
  }

  initializeInventory() {
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    this.hasInventoryItems = (compressedAirAssessment.compressorInventoryItems.length != 0);
    if (this.hasInventoryItems) {
      this.hasValidCompressors = this.inventoryService.hasValidCompressors();
      let selectedCompressor: CompressorInventoryItem = this.inventoryService.selectedCompressor.getValue();
      if (selectedCompressor) {
        let compressorExist: CompressorInventoryItem = compressedAirAssessment.compressorInventoryItems.find(item => { return item.itemId == selectedCompressor.itemId });
        if (!compressorExist) {
          let lastItemModified: CompressorInventoryItem = _.maxBy(compressedAirAssessment.compressorInventoryItems, 'modifiedDate');
          this.inventoryService.selectedCompressor.next(lastItemModified);
        }
      } else {
        let lastItemModified: CompressorInventoryItem = _.maxBy(compressedAirAssessment.compressorInventoryItems, 'modifiedDate');
        this.inventoryService.selectedCompressor.next(lastItemModified);
      }
    }
  }

  addInventoryItem() {
    this.inventoryService.addNewCompressor();
    this.hasInventoryItems = true;
  }


  save() {
    let selectedCompressor: CompressorInventoryItem = this.inventoryService.selectedCompressor.getValue();
    selectedCompressor.modifiedDate = new Date();
    selectedCompressor.name = this.form.controls.name.value;
    selectedCompressor.description = this.form.controls.description.value;
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let compressorIndex: number = compressedAirAssessment.compressorInventoryItems.findIndex(item => { return item.itemId == selectedCompressor.itemId });
    compressedAirAssessment.compressorInventoryItems[compressorIndex] = selectedCompressor;
    compressedAirAssessment.systemProfile.profileSummary.forEach(summary => {
      if (summary.compressorId == this.selectedCompressor.itemId) {
        summary.compressorName = this.selectedCompressor.name;
      }
    });
    this.isFormChange = true;
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment);
    this.inventoryService.selectedCompressor.next(selectedCompressor);
  }

  openCompressorModal() {
    this.showCompressorModal = true;
    this.cd.detectChanges();
  }

  closeCompressorModal() {
    this.showCompressorModal = false;
    this.cd.detectChanges();
  }

  focusField(str: string) {
    this.compressedAirAssessmentService.focusedField.next(str);
  }

  checkSystemProfile() {
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let recalculateOrdering: boolean = false;
    compressedAirAssessment.systemProfile.profileSummary.forEach(summary => {
      if (summary.compressorId == this.selectedCompressor.itemId) {
        if (summary.fullLoadPressure != this.selectedCompressor.performancePoints.fullLoad.dischargePressure) {
          summary.fullLoadPressure = this.selectedCompressor.performancePoints.fullLoad.dischargePressure;
          recalculateOrdering = true;
        }
      }
    });
    if (recalculateOrdering && !compressedAirAssessment.systemInformation.isSequencerUsed) {
      compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
        compressedAirAssessment.systemProfile.profileSummary = this.systemProfileService.updateCompressorOrderingNoSequencer(compressedAirAssessment.systemProfile.profileSummary, dayType);
      })
      this.isFormChange = true;
      this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment);
      this.inventoryService.selectedCompressor.next(this.selectedCompressor);
    }
  }
}
