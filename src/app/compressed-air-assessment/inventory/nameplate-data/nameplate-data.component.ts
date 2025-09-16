import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorNameplateData } from '../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { CompressedAirDataManagementService } from '../../compressed-air-data-management.service';
import { InventoryService } from '../inventory.service';
import { CompressorTypeOptions } from '../inventoryOptions';

@Component({
    selector: 'app-nameplate-data',
    templateUrl: './nameplate-data.component.html',
    styleUrls: ['./nameplate-data.component.css'],
    standalone: false
})
export class NameplateDataComponent implements OnInit {
  settings: Settings;
  selectedCompressorSub: Subscription;

  form: UntypedFormGroup;
  isFormChange: boolean = false;
  @ViewChild('fullLoadAmpsModal', { static: false }) public fullLoadAmpsModal: ModalDirective;

  showFullLoadAmpsModal: boolean = false;

  compressorTypeOptions: Array<{ value: number, label: string }> = CompressorTypeOptions;
  invalidCompressorType: boolean;
  constructor(private inventoryService: InventoryService, private compressedAirAssessmentService: CompressedAirAssessmentService,
    private compressedAirDataManagementService: CompressedAirDataManagementService) { }

  ngOnInit(): void {
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(val => {
      if (val) {
        if (this.isFormChange == false) {
          this.form = this.inventoryService.getNameplateDataFormFromObj(val.nameplateData);
        } else {
          this.isFormChange = false;
        }
        this.setInvalidCompressorType();
      }
    });
    this.settings = this.compressedAirAssessmentService.settings.getValue();
  }

  ngOnDestroy() {
    this.selectedCompressorSub.unsubscribe();
  }

  save() {
    this.isFormChange = true;
    let nameplateData: CompressorNameplateData = this.inventoryService.getNameplateDataFromFrom(this.form);
    this.compressedAirDataManagementService.updateNameplateData(nameplateData, true);
  }

  focusField(str: string) {
    this.compressedAirAssessmentService.focusedField.next(str);
  }

  openFullLoadAmpsModal() {
    this.fullLoadAmpsModal.show();
    this.compressedAirAssessmentService.modalOpen.next(true);
    this.showFullLoadAmpsModal = true;
  }

  closeFullLoadAmpsModal(fullLoadAmps?: number) {
    if (fullLoadAmps) {
      this.form.patchValue({
        fullLoadAmps: fullLoadAmps
      });
    }
    this.compressedAirAssessmentService.modalOpen.next(false);
    this.showFullLoadAmpsModal = false;
    this.fullLoadAmpsModal.hide();
    this.save();
  }

  setInvalidCompressorType() {
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    if (compressedAirAssessment.systemInformation.multiCompressorSystemControls == 'loadSharing' && this.form.controls.compressorType.value) {
      this.invalidCompressorType = (this.form.controls.compressorType.value != 6);
    } else {
      this.invalidCompressorType = false;
    }
  }
}
