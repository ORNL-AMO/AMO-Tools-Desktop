import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { InventoryService } from './inventory/inventory.service';
import { CompressedAirAssessmentValidationService } from '../../compressed-air-assessment-validation/compressed-air-assessment-validation.service';

@Component({
  selector: 'app-inventory-setup',
  templateUrl: './inventory-setup.component.html',
  styleUrl: './inventory-setup.component.css',
  standalone: false
})
export class InventorySetupComponent {

  tabSelect: 'inventory' | 'replacementInventory' | 'help' = 'inventory';
  isModalOpen: boolean = false;
  isModalOpenSub: Subscription;

  hasInvalidBaselineCompressors: boolean = false;
  hasInvalidReplacementCompressors: boolean = false
  validationStatusSub: Subscription;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private inventoryService: InventoryService,
    private compressedAirAssessmentValidationService: CompressedAirAssessmentValidationService
  ) { }

  ngOnInit() {
    this.tabSelect = this.inventoryService.tabSelect.getValue();
    this.isModalOpenSub = this.compressedAirAssessmentService.modalOpen.subscribe(val => {
      this.isModalOpen = val;
    });

    this.validationStatusSub = this.compressedAirAssessmentValidationService.validationStatus.subscribe(val => {
      if (val) {
        this.hasInvalidBaselineCompressors = val.compressorItemValidations.some(validation => {
          return validation.isReplacement == false && !validation.isValid;
        });
        this.hasInvalidReplacementCompressors = val.compressorItemValidations.some(validation => {
          return validation.isReplacement == true && !validation.isValid;
        });
      } else {
        this.hasInvalidBaselineCompressors = false;
        this.hasInvalidReplacementCompressors = false;
      }

    });
  }

  ngOnDestroy() {
    this.isModalOpenSub.unsubscribe();
    this.validationStatusSub.unsubscribe();
  }

  setTab(str: 'inventory' | 'replacementInventory' | 'help') {
    this.tabSelect = str;
    this.inventoryService.tabSelect.next(str)
  }
}
