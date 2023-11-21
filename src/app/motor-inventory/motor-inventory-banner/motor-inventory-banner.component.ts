import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { MotorInventoryService } from '../motor-inventory.service';
import { MotorCatalogService } from '../motor-inventory-setup/motor-catalog/motor-catalog.service';
import { MotorInventoryData } from '../motor-inventory';
import { InventoryItem } from '../../shared/models/inventory/inventory';
import { SecurityAndPrivacyService } from '../../shared/security-and-privacy/security-and-privacy.service';
import { DashboardService } from '../../dashboard/dashboard.service';
import _ from 'lodash';

@Component({
  selector: 'app-motor-inventory-banner',
  templateUrl: './motor-inventory-banner.component.html',
  styleUrls: ['./motor-inventory-banner.component.css']
})
export class MotorInventoryBannerComponent implements OnInit {
  @Input()
  motorInventoryItem: InventoryItem;
  
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
  bannerCollapsed: boolean = true;
  constructor(private motorInventoryService: MotorInventoryService, 
    private dashboardService: DashboardService, private motorCatalogService: MotorCatalogService, private securityAndPrivacyService: SecurityAndPrivacyService ) { }

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

  showSecurityAndPrivacyModal() {
    this.securityAndPrivacyService.modalOpen.next(true);
    this.securityAndPrivacyService.showSecurityAndPrivacyModal.next(true);
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
  
  navigateHome() {
    this.dashboardService.navigateWithSidebarOptions('/landing-screen', {shouldCollapse: false});
  }

  selectedDepartment(departmentId: string) {
    this.motorCatalogService.selectedDepartmentId.next(departmentId);
  }

  setMainTab(str: string) {
    this.motorInventoryService.mainTab.next(str);
    this.collapseBanner();
  }

  setSummaryTab(str: string) {
    this.motorInventoryService.summaryTab.next(str);
  }

  collapseBanner() {
    this.bannerCollapsed = !this.bannerCollapsed;
    window.dispatchEvent(new Event("resize"));
  }

  back(){
    if (this.mainTab == 'analysis') {
      this.motorInventoryService.mainTab.next('summary');
    } else if (this.mainTab == 'summary') {
      this.motorInventoryService.mainTab.next('setup');
    } 
  }

  continue() {
    if (this.mainTab == 'setup') {
      this.motorInventoryService.mainTab.next('summary');
    } else if (this.mainTab == 'summary') {
      this.motorInventoryService.mainTab.next('analysis');
    } 
  }

  backSetupTabs(){
    if (this.setupTab == 'motor-catalog') {
      this.motorInventoryService.setupTab.next('motor-properties');
    } else if (this.setupTab == 'motor-properties') {
      this.motorInventoryService.setupTab.next('department-setup');
    } else if (this.setupTab == 'department-setup') {
      this.motorInventoryService.setupTab.next('plant-setup');
    } 
  }

  continueSetupTabs(){
    if (this.setupTab == 'plant-setup') {
      this.motorInventoryService.setupTab.next('department-setup');
    } else if (this.setupTab == 'department-setup') {
      this.motorInventoryService.setupTab.next('motor-properties');
    } else if (this.setupTab == 'motor-properties') {
      this.motorInventoryService.setupTab.next('motor-catalog');
    } 
  }

  continueMotorCatalogTabs(){
    let currentIndex: number = _.findIndex(this.motorInventoryData.departments, (department) => {return department.id == this.selectedDepartmentId});
    if (currentIndex != this.motorInventoryData.departments.length - 1) {
      let nextID: string = this.motorInventoryData.departments[currentIndex + 1].id;
      this.motorCatalogService.selectedDepartmentId.next(nextID);      
    }
  }

  backMotorCatalogTabs(){
    let currentIndex: number = _.findIndex(this.motorInventoryData.departments, (department) => {return department.id == this.selectedDepartmentId});
    if (currentIndex != 0) {
      let nextID: string = this.motorInventoryData.departments[currentIndex - 1].id;
      this.motorCatalogService.selectedDepartmentId.next(nextID);      
    }
  }

  continueSummaryTabs(){
    if (this.summaryTab == 'overview') {
      this.motorInventoryService.summaryTab.next('graphs');
    } else if (this.summaryTab == 'graphs') {
      this.motorInventoryService.summaryTab.next('table');
    } else if (this.summaryTab == 'table') {
      this.motorInventoryService.summaryTab.next('motor-details');
    }
  }

  backSummaryTabs(){
    if (this.summaryTab == 'motor-details') {
      this.motorInventoryService.summaryTab.next('table');
    } else if (this.summaryTab == 'table') {
      this.motorInventoryService.summaryTab.next('graphs');
    } else if (this.summaryTab == 'graphs') {
      this.motorInventoryService.summaryTab.next('overview');
    }
  }
  
  openExportModal(){
    this.motorInventoryService.showExportModal.next(true);
  }

}
