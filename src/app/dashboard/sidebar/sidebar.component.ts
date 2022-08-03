import { Component, OnInit, Output, EventEmitter } from '@angular/core';
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
  googleTranslateAvailable: boolean;
  showNewDropdown: boolean = false;
  constructor(private assessmentService: AssessmentService, private directoryDbService: DirectoryDbService,
    private directoryDashboardService: DirectoryDashboardService, private dashboardService: DashboardService,
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
    })
    try {
      google;
      this.googleTranslateAvailable = true;
    } catch{
      this.googleTranslateAvailable = false;
    }
  }

  ngOnDestroy() {
    this.updateSub.unsubscribe();
    this.updateDashboardDataSub.unsubscribe();
    this.selectedDirectoryIdSub.unsubscribe();
  }

  showCreateAssessment() {
    this.directoryDashboardService.createFolder.next(false);
    this.dashboardService.createInventory.next(false);
    this.showNewDropdown = false;
    this.dashboardService.createAssessment.next(true);
  }

  showCreateInventory(){
    this.dashboardService.createAssessment.next(false);
    this.directoryDashboardService.createFolder.next(false);
    this.showNewDropdown = false;
    this.dashboardService.createInventory.next(true);
  }

  showCreateFolder(){
    this.dashboardService.createAssessment.next(false);
    this.dashboardService.createInventory.next(false);
    this.showNewDropdown = false;
    this.directoryDashboardService.createFolder.next(true);
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

  emitTranslate(){
    this.coreService.showTranslateModal.next(true);
  }

  toggleNewDropdown(){
    this.showNewDropdown = !this.showNewDropdown;
  }  
}
