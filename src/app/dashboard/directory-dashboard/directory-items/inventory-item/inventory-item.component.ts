import { Component, OnInit, Input } from '@angular/core';
import { InventoryItem } from '../../../../shared/models/inventory/inventory';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DirectoryDashboardService } from '../../directory-dashboard.service';

@Component({
  selector: 'app-inventory-item',
  templateUrl: './inventory-item.component.html',
  styleUrls: ['./inventory-item.component.css']
})
export class InventoryItemComponent implements OnInit {
  @Input()
  inventoryItem: InventoryItem;
  
  dropdownOpen: boolean = false;
  dashboardViewSub: Subscription;
  dashboardView: string;
  constructor(private router: Router, private directoryDashboardService: DirectoryDashboardService) { }

  ngOnInit(): void {
    this.dashboardViewSub = this.directoryDashboardService.dashboardView.subscribe(val => {
      this.dashboardView = val;
    });
  }

  ngOnDestroy(){
    this.dashboardViewSub.unsubscribe();
  }

  goToInventoryItem() {
    this.router.navigateByUrl('/motor-inventory/' + this.inventoryItem.id);
  }

  showDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }
}
