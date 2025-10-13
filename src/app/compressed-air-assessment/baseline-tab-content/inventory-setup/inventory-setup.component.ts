import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { InventoryService } from './inventory/inventory.service';

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
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private inventoryService: InventoryService
  ) { }

  ngOnInit() {
    this.tabSelect = this.inventoryService.tabSelect.getValue();
    this.isModalOpenSub = this.compressedAirAssessmentService.modalOpen.subscribe(val => {
      this.isModalOpen = val;
    });
  }

  ngOnDestroy() {
    this.isModalOpenSub.unsubscribe();
  }

  setTab(str: 'inventory' | 'replacementInventory' | 'help') {
    this.tabSelect = str;
    this.inventoryService.tabSelect.next(str)
  }
}
