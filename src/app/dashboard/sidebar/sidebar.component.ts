import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Directory } from '../../shared/models/directory';
import { AssessmentService } from '../assessment.service';
declare const packageJson;
import { Subscription } from 'rxjs';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { DirectoryDashboardService } from '../directory-dashboard/directory-dashboard.service';
import { DashboardService } from '../dashboard.service';
import { CoreService } from '../../core/core.service';
declare var google: any;
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @Output('openModal')
  openModal = new EventEmitter<boolean>();

  versionNum: any;
  isUpdateAvailable: boolean;
  showModal: boolean;
  showVersionModal: boolean;
  updateSub: Subscription;
  updateDashboardDataSub: Subscription;
  rootDirectory: Directory;
  selectedDirectoryId: number;
  selectedDirectoryIdSub: Subscription;
  showNewDropdown: boolean = false;
  isSidebarCollapsed: boolean = false;
  collapseSidebarSub: Subscription;

  collapsedXWidth: number = 40;
  expandedXWidth: number = 300;
  constructor(private assessmentService: AssessmentService, private directoryDbService: DirectoryDbService,
    private directoryDashboardService: DirectoryDashboardService, private dashboardService: DashboardService,
    private cd: ChangeDetectorRef,
    private coreService: CoreService) { }

  ngOnInit() {
    this.versionNum = packageJson.version;
    this.updateSub = this.assessmentService.updateAvailable.subscribe(val => {
      this.isUpdateAvailable = val;
    });

    this.updateDashboardDataSub = this.dashboardService.updateDashboardData.subscribe(val => {
      this.rootDirectory = this.directoryDbService.getById(1);
      this.rootDirectory.collapsed = false;
    });

    this.selectedDirectoryIdSub = this.directoryDashboardService.selectedDirectoryId.subscribe(val => {
      this.selectedDirectoryId = val;
    });

    this.collapseSidebarSub = this.dashboardService.collapseSidebar.subscribe(shouldCollapse => {
      if (shouldCollapse !== undefined) {
        this.collapseSidebar(shouldCollapse);
      }  
    })

    this.initSidebarView();
  }

  ngOnDestroy() {
    this.updateSub.unsubscribe();
    this.updateDashboardDataSub.unsubscribe();
    this.selectedDirectoryIdSub.unsubscribe();
  }

  showCreateAssessment() {
    this.directoryDashboardService.createFolder.next(false);
    this.dashboardService.showCreateInventory.next(undefined);
    this.showNewDropdown = false;
    this.dashboardService.createAssessment.next(true);
  }

  showCreateInventory(){
    this.dashboardService.createAssessment.next(false);
    this.directoryDashboardService.createFolder.next(false);
    this.showNewDropdown = false;
    this.dashboardService.showCreateInventory.next('motorInventory');
  }

  showCreateFolder(){
    this.dashboardService.createAssessment.next(false);
    this.dashboardService.showCreateInventory.next(undefined);
    this.showNewDropdown = false;
    this.directoryDashboardService.createFolder.next(true);
  }

  initSidebarView() {
    let totalScreenWidth: number = this.dashboardService.totalScreenWidth.getValue();
    if (totalScreenWidth < 1024) {
      this.dashboardService.sidebarX.next(40);
      this.isSidebarCollapsed = true;
      this.cd.detectChanges();
    } 
  }

  navigateWithSidebarOptions(url: string) {
    this.dashboardService.navigateWithSidebarOptions(url);
  }

  collapseSidebar(isNavigationCollapse?: boolean) {
    if (isNavigationCollapse !== undefined) {
      this.isSidebarCollapsed = isNavigationCollapse;
    } else {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }

    // let totalScreenWidth: number = this.dashboardService.totalScreenWidth.getValue();
    // if (totalScreenWidth < 1024) {
    //   this.expandedXWidth = totalScreenWidth/4;
    // } 
  
    if (this.isSidebarCollapsed == true) {
      this.dashboardService.sidebarX.next(this.collapsedXWidth);
    } else {
      this.dashboardService.sidebarX.next(this.expandedXWidth);
    }
    window.dispatchEvent(new Event("resize"));

  }

  openUpdateModal() {
    this.assessmentService.updateAvailable.next(true);
  }

  openVersionModal() {
    this.openModal.emit(true);
    this.showVersionModal = true;
  }

  closeVersionModal() {
    this.openModal.emit(false);
    this.showVersionModal = false;
  }

  toggleNewDropdown(){
    this.showNewDropdown = !this.showNewDropdown;
  }
}
