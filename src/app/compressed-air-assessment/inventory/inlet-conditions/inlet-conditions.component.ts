import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { CompressedAirDataManagementService } from '../../compressed-air-data-management.service';
import { InventoryService } from '../inventory.service';

@Component({
  selector: 'app-inlet-conditions',
  templateUrl: './inlet-conditions.component.html',
  styleUrls: ['./inlet-conditions.component.css']
})
export class InletConditionsComponent implements OnInit {

  selectedCompressorSub: Subscription;
  form: FormGroup;
  isFormChange: boolean = false;
  contentCollapsed: boolean;
  constructor(private inventoryService: InventoryService, private compressedAirAssessmentService: CompressedAirAssessmentService,
    private compressedAirDataManagementService: CompressedAirDataManagementService) { }

  ngOnInit(): void {
    this.contentCollapsed = this.inventoryService.collapseInletConditions;
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(val => {
      if (val) {
        if (this.isFormChange == false) {
          this.form = this.inventoryService.getInletConditionsFormFromObj(val.inletConditions);
        } else {
          this.isFormChange = false;
        }
      }
    });
  }

  ngOnDestroy() {
    this.selectedCompressorSub.unsubscribe();
    this.inventoryService.collapseInletConditions = this.contentCollapsed;
  }

  save(isAtmosphericPressureChange: boolean) {
    this.isFormChange = true;
    let inletConditions = this.inventoryService.getInletConditionsObjFromForm(this.form);
    this.compressedAirDataManagementService.updateInletConditions(inletConditions, isAtmosphericPressureChange);
  }

  focusField(str: string) {
    this.compressedAirAssessmentService.focusedField.next(str);
  }

  toggleCollapse() {
    this.contentCollapsed = !this.contentCollapsed;
  }

}
