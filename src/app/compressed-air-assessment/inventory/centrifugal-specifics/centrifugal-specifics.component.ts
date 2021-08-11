import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CentrifugalSpecifics } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { CompressedAirDataManagementService } from '../../compressed-air-data-management.service';
import { InventoryService } from '../inventory.service';

@Component({
  selector: 'app-centrifugal-specifics',
  templateUrl: './centrifugal-specifics.component.html',
  styleUrls: ['./centrifugal-specifics.component.css']
})
export class CentrifugalSpecificsComponent implements OnInit {

  selectedCompressorSub: Subscription;
  form: FormGroup;
  isFormChange: boolean = false;
  constructor(private inventoryService: InventoryService,
    private compressedAirAssessmentService: CompressedAirAssessmentService,
    private compressedAirDataManagementService: CompressedAirDataManagementService) { }

  ngOnInit(): void {
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(compressor => {
      if (compressor) {
        if (this.isFormChange == false) {
          this.form = this.inventoryService.getCentrifugalFormFromObj(compressor);
        } else {
          this.isFormChange = false;
        }
      }
    });
  }

  ngOnDestroy() {
    this.selectedCompressorSub.unsubscribe();
  }

  save() {
    this.isFormChange = true;
    let centrifugalSpecifics: CentrifugalSpecifics = this.inventoryService.getCentrifugalObjFromForm(this.form);
    this.compressedAirDataManagementService.updateCentrifugalSpecifics(centrifugalSpecifics, true);
  }

  focusField(str: string) {
    this.compressedAirAssessmentService.focusedField.next(str);
  }
}
