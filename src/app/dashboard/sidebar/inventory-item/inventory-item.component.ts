import { Component, OnInit, Input } from '@angular/core';
import { InventoryItem } from '../../../shared/models/inventory/inventory';
import { Router } from '@angular/router';
import { DashboardService } from '../../dashboard.service';

@Component({
    selector: 'app-inventory-item',
    templateUrl: './inventory-item.component.html',
    styleUrls: ['./inventory-item.component.css'],
    standalone: false
})
export class InventoryItemComponent implements OnInit {
  @Input()
  inventoryItem: InventoryItem;

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
  }

  goToInventoryItem() {
    if (this.inventoryItem.type === 'pumpInventory') {
      this.dashboardService.navigateWithSidebarOptions('/pump-inventory/' + this.inventoryItem.id, {shouldCollapse: true})
    }
    if (this.inventoryItem.type === 'motorInventory') {
      this.dashboardService.navigateWithSidebarOptions('/motor-inventory/' + this.inventoryItem.id, {shouldCollapse: true})
    }
  }
}
