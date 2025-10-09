import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorInventoryItem } from '../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { InventoryService } from './inventory.service';
import * as _ from 'lodash';
import { CompressedAirDataManagementService } from '../../../compressed-air-data-management.service';
import { CompressedAirAssessmentValidationService } from '../../../compressed-air-assessment-validation/compressed-air-assessment-validation.service';
import { InventoryFormService } from './inventory-form.service';
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

  validationStatusSub: Subscription;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private inventoryService: InventoryService, private cd: ChangeDetectorRef,
    private compressedAirDataManagementService: CompressedAirDataManagementService,
    private compressedAirAssessmentValidationService: CompressedAirAssessmentValidationService,
    private inventoryFormService: InventoryFormService) { }

  ngOnInit(): void {
    this.initializeInventory();

    this.validationStatusSub = this.compressedAirAssessmentValidationService.validationStatus.subscribe(val => {
      this.hasValidCompressors = val?.compressorsValid;
    });

    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(val => {
      if (val) {
        this.selectedCompressor = val;
        this.hasInventoryItems = true;
        this.compressorType = val.nameplateData.compressorType;
        this.controlType = val.compressorControls.controlType;
        if (this.isFormChange == false) {
          this.form = this.inventoryFormService.getGeneralInformationFormFromObj(val.name, val.description);
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
    this.validationStatusSub.unsubscribe();
  }

  initializeInventory() {
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    this.hasInventoryItems = (compressedAirAssessment.compressorInventoryItems.length != 0);
    if (this.hasInventoryItems) {
      let selectedCompressor: CompressorInventoryItem = this.inventoryService.selectedCompressor.getValue();
      if (selectedCompressor) {
        let compressorExist: CompressorInventoryItem = compressedAirAssessment.compressorInventoryItems.find(item => { return item.itemId == selectedCompressor.itemId });
        if (!compressorExist) {
          let lastItemModified: CompressorInventoryItem = _.maxBy(compressedAirAssessment.compressorInventoryItems, 'modifiedDate');
          this.inventoryService.setSelectedCompressor(lastItemModified);
        }
      } else {
        let lastItemModified: CompressorInventoryItem = _.maxBy(compressedAirAssessment.compressorInventoryItems, 'modifiedDate');
        this.inventoryService.setSelectedCompressor(lastItemModified);
      }
    }
  }

  addInventoryItem() {
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let result: { newInventoryItem: CompressorInventoryItem, compressedAirAssessment: CompressedAirAssessment } = this.inventoryService.addNewCompressor(compressedAirAssessment);
    this.compressedAirAssessmentService.updateCompressedAir(result.compressedAirAssessment, true);
    this.inventoryService.setSelectedCompressor(result.newInventoryItem);
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
