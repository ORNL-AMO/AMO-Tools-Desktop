import { Component } from '@angular/core';

@Component({
  selector: 'app-inventory-setup',
  templateUrl: './inventory-setup.component.html',
  styleUrl: './inventory-setup.component.css',
  standalone: false
})
export class InventorySetupComponent {

  tabSelect: 'inventory' | 'replacementInventory' | 'help' = 'inventory';
  setTab(str: 'inventory' | 'replacementInventory' | 'help') {
    this.tabSelect = str;
  }
}
