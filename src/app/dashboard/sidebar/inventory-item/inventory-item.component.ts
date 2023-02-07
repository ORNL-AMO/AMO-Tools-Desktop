import { Component, OnInit, Input } from '@angular/core';
import { InventoryItem } from '../../../shared/models/inventory/inventory';
import { Router } from '@angular/router';
import { DashboardService } from '../../dashboard.service';

@Component({
  selector: 'app-inventory-item',
  templateUrl: './inventory-item.component.html',
  styleUrls: ['./inventory-item.component.css']
})
export class InventoryItemComponent implements OnInit {
  @Input()
  inventoryItem: InventoryItem;

  constructor(private router: Router, private dashboardService: DashboardService) { }

  ngOnInit(): void {
  }

  goToInventoryItem() {
    this.dashboardService.navigateWithSidebarOptions('/motor-inventory/' + this.inventoryItem.id, {shouldCollapse: true})
  }
}
