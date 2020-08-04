import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MotorInventoryService } from '../motor-inventory.service';
import { MotorCatalogService } from '../motor-inventory-setup/motor-catalog/motor-catalog.service';
import { MotorInventoryData } from '../motor-inventory';

@Component({
  selector: 'app-motor-inventory-banner',
  templateUrl: './motor-inventory-banner.component.html',
  styleUrls: ['./motor-inventory-banner.component.css']
})
export class MotorInventoryBannerComponent implements OnInit {

  setupTab: string;
  setupTabSub: Subscription;
  summaryTab: string;
  summaryTabSub: Subscription;
  mainTab: string;
  mainTabSub: Subscription;
  motorInventoryData: MotorInventoryData;
  motorInventoryDataSub: Subscription;
  selectedDepartmentId: string;
  selectedDepartmentIdSub: Subscription;
  constructor(private motorInventoryService: MotorInventoryService, private motorCatalogService: MotorCatalogService) { }

  ngOnInit(): void {
    this.mainTabSub = this.motorInventoryService.mainTab.subscribe(val => {
      this.mainTab = val;
    });

    this.setupTabSub = this.motorInventoryService.setupTab.subscribe(val => {
      this.setupTab = val;
    });

    this.motorInventoryDataSub = this.motorInventoryService.motorInventoryData.subscribe(val => {
      this.motorInventoryData = val;
    });

    this.selectedDepartmentIdSub = this.motorCatalogService.selectedDepartmentId.subscribe(val => {
      this.selectedDepartmentId = val;
    });

    this.summaryTabSub = this.motorInventoryService.summaryTab.subscribe(val => {
      this.summaryTab = val;
    });
  }

  ngOnDestroy() {
    this.setupTabSub.unsubscribe();
    this.motorInventoryDataSub.unsubscribe();
    this.selectedDepartmentIdSub.unsubscribe();
    this.mainTabSub.unsubscribe();
    this.summaryTabSub.unsubscribe();
  }

  setSetupTab(str: string) {
    this.motorInventoryService.setupTab.next(str);
  }

  selectedDepartment(departmentId: string) {
    this.motorCatalogService.selectedDepartmentId.next(departmentId);
  }

  setMainTab(str: string) {
    this.motorInventoryService.mainTab.next(str);
  }

  setSummaryTab(str: string) {
    this.motorInventoryService.summaryTab.next(str);
  }
}
