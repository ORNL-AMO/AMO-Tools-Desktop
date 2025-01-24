import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Directory } from '../../shared/models/directory';
import { combineLatestWith, Observable, Subscription } from 'rxjs';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { DirectoryDashboardService } from '../directory-dashboard/directory-dashboard.service';
import { DashboardService } from '../dashboard.service';
import { environment } from '../../../environments/environment';
import { ExportService } from '../../shared/import-export/export.service';
import { ApplicationInstanceData, ApplicationInstanceDbService } from '../../indexedDb/application-instance-db.service';
import { MeasurSurveyService } from '../../shared/measur-survey/measur-survey.service';
import { UpdateApplicationService } from '../../shared/update-application/update-application.service';
import { ElectronService } from '../../electron/electron.service';
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
  applicationInstanceDataSubscription: Subscription;
  showSurveyLink: boolean;
  constructor(private directoryDbService: DirectoryDbService,
    private exportService: ExportService,
    private updateApplicationService: UpdateApplicationService,
    private measurSurveyService: MeasurSurveyService,
    private applicationInstanceDbService: ApplicationInstanceDbService,
    private electronService: ElectronService,
    private directoryDashboardService: DirectoryDashboardService, private dashboardService: DashboardService,
    private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.versionNum = environment.version;

    let isUpdateAvailable: Observable<any> = this.electronService.updateAvailable
      .pipe(
        combineLatestWith(this.updateApplicationService.webUpdateAvailable)
      );

    this.updateSub = isUpdateAvailable.subscribe(hasUpdate => {
      this.isUpdateAvailable = hasUpdate;
    });

    this.updateDashboardDataSub = this.dashboardService.updateDashboardData.subscribe(val => {
      this.rootDirectory = this.directoryDbService.getById(1);
      this.rootDirectory.collapsed = false;
    });

    this.selectedDirectoryIdSub = this.directoryDashboardService.selectedDirectoryId.subscribe(val => {
      this.selectedDirectoryId = val;
    });
    
    this.applicationInstanceDataSubscription = this.applicationInstanceDbService.applicationInstanceData.subscribe((applicationData: ApplicationInstanceData) => {
      this.showSurveyLink = !applicationData?.isSurveyDone;
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
    this.collapseSidebarSub.unsubscribe();
    this.applicationInstanceDataSubscription.unsubscribe();
  }

  downloadData() {
    this.exportService.exportAll = true;
    this.directoryDashboardService.showExportModal.next(true);
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

  showSurvey() {
    this.measurSurveyService.showSurveyModal.next(true);
  }

  initSidebarView() {
    let totalScreenWidth: number = this.dashboardService.totalScreenWidth.getValue();
    if (totalScreenWidth < 1024) {
      this.dashboardService.sidebarX.next(40);
      this.isSidebarCollapsed = true;
      this.cd.detectChanges();
    } 
  }

  navigateWithSidebarOptions(url: string, shouldCollapse?: boolean) {
    this.dashboardService.navigateWithSidebarOptions(url, {shouldCollapse: shouldCollapse})

  }

  collapseSidebar(isNavigationCollapse?: boolean) {
    if (isNavigationCollapse !== undefined) {
      this.isSidebarCollapsed = isNavigationCollapse;
    } else {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }

    let totalScreenWidth: number = this.dashboardService.totalScreenWidth.getValue();
    if (totalScreenWidth < 1024) {
      this.expandedXWidth = totalScreenWidth;
    }
    else {
      this.expandedXWidth = 300;
    } 
  
    if (this.isSidebarCollapsed == true) {
      this.dashboardService.sidebarX.next(this.collapsedXWidth);
    } else {
      this.dashboardService.sidebarX.next(this.expandedXWidth);
    }
    window.dispatchEvent(new Event("resize"));
  }

  openUpdateModal() {
    this.updateApplicationService.showUpdateToast.next(true);
  }

  openVersionModal() {
    this.updateApplicationService.showReleaseNotesModal.next(true);
  }

  toggleNewDropdown(){
    this.showNewDropdown = !this.showNewDropdown;
  }
}
