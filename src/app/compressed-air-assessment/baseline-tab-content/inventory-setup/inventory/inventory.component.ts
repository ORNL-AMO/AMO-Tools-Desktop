import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorInventoryItem } from '../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { InventoryService } from './inventory.service';
import * as _ from 'lodash';
import { CompressedAirDataManagementService } from '../../../compressed-air-data-management.service';
@Component({
    selector: 'app-inventory',
    templateUrl: './inventory.component.html',
    styleUrls: ['./inventory.component.css'],
    standalone: false
})
export class InventoryComponent implements OnInit {

  hasInventoryItems: boolean;
  form: UntypedFormGroup;
  selectedCompressorSub: Subscription;
  isFormChange: boolean = false;
  compressorType: number;
  controlType: number;
  showCompressorModal: boolean = false;
  hasValidCompressors: boolean = true;
  selectedCompressor: CompressorInventoryItem;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private inventoryService: InventoryService, private cd: ChangeDetectorRef,
    private compressedAirDataManagementService: CompressedAirDataManagementService) { }

  ngOnInit(): void {
    this.initializeInventory();
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(val => {
      if (val) {
        this.selectedCompressor = val;
        this.hasInventoryItems = true;
        let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
        this.hasValidCompressors = this.inventoryService.hasValidCompressors(compressedAirAssessment);
        this.compressorType = val.nameplateData.compressorType;
        this.controlType = val.compressorControls.controlType;
        if (this.isFormChange == false) {
          this.form = this.inventoryService.getGeneralInformationFormFromObj(val.name, val.description);
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
      this.hasValidCompressors = this.inventoryService.hasValidCompressors(compressedAirAssessment);
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
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let result: { newInventoryItem: CompressorInventoryItem, compressedAirAssessment: CompressedAirAssessment } = this.inventoryService.addNewCompressor(compressedAirAssessment);
    this.compressedAirAssessmentService.updateCompressedAir(result.compressedAirAssessment, true);
    this.inventoryService.selectedCompressor.next(result.newInventoryItem);
    this.hasInventoryItems = true;
  }

  save() {
    this.isFormChange = true;
    this.compressedAirDataManagementService.updateNameAndDescription(this.form.controls.name.value, this.form.controls.description.value);
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
}
