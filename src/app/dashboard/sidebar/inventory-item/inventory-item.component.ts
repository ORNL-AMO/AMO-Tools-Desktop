import { Component, OnInit, Input } from '@angular/core';
import { InventoryItem } from '../../../shared/models/inventory/inventory';
import { DashboardService } from '../../dashboard.service';
import { InventoryType, RecentlyAccessedService } from '../../../shared/recently-accessed/recently-accessed.service';

@Component({
    selector: 'app-inventory-item',
    templateUrl: './inventory-item.component.html',
    styleUrls: ['./inventory-item.component.css'],
    standalone: false
})
export class InventoryItemComponent implements OnInit {
  @Input()
  inventoryItem: InventoryItem;

  constructor(private dashboardService: DashboardService, private recentlyAccessedService: RecentlyAccessedService) { }

  ngOnInit(): void {
  }

  goToInventoryItem() {
    const type = this.inventoryItem.type as InventoryType;
    const route = this.recentlyAccessedService.getRouteForInventory(type, this.inventoryItem.id);
    this.recentlyAccessedService.record({
      id: this.inventoryItem.id,
      name: this.inventoryItem.name,
      itemType: 'inventory',
      inventoryType: type,
      route
    });
    this.dashboardService.navigateWithSidebarOptions(route, { shouldCollapse: true });
  }
}
