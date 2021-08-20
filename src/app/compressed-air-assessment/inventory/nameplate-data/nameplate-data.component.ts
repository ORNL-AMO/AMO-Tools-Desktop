import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorInventoryItem, CompressorNameplateData } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { CompressedAirDataManagementService } from '../../compressed-air-data-management.service';
import { InventoryService } from '../inventory.service';
import { CompressorTypeOptions } from '../inventoryOptions';
import { PerformancePointCalculationsService } from '../performance-points/calculations/performance-point-calculations.service';

@Component({
  selector: 'app-nameplate-data',
  templateUrl: './nameplate-data.component.html',
  styleUrls: ['./nameplate-data.component.css']
})
export class NameplateDataComponent implements OnInit {

  selectedCompressorSub: Subscription;
  form: FormGroup;
  isFormChange: boolean = false;
  compressorTypeOptions: Array<{ value: number, label: string }> = CompressorTypeOptions;
  constructor(private inventoryService: InventoryService, private compressedAirAssessmentService: CompressedAirAssessmentService,
    private performancePointCalculationsService: PerformancePointCalculationsService,
    private compressedAirDataManagementService: CompressedAirDataManagementService) { }

  ngOnInit(): void {
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(val => {
      if (val) {
        if (this.isFormChange == false) {
          this.form = this.inventoryService.getNameplateDataFormFromObj(val.nameplateData);
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
    let nameplateData: CompressorNameplateData = this.inventoryService.getNameplateDataFromFrom(this.form);
    this.compressedAirDataManagementService.updateNameplateData(nameplateData, true);
  }

  focusField(str: string) {
    this.compressedAirAssessmentService.focusedField.next(str);
  }

}
