import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { Directory } from '../shared/models/directory';
import { AssessmentService } from '../assessment/assessment.service';
declare const packageJson;
import { Subscription } from 'rxjs';
import { DirectoryDbService } from '../indexedDb/directory-db.service';
import { DirectoryDashboardService } from '../directory-dashboard/directory-dashboard.service';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
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
  rootDirectory: Directory;
  constructor(private assessmentService: AssessmentService, private directoryDbService: DirectoryDbService,
    private directoryDashboardService: DirectoryDashboardService, private assessmentDbService: AssessmentDbService) { }

  ngOnInit() {
    this.rootDirectory = this.directoryDbService.getById(1);
    console.log(this.rootDirectory);
    this.versionNum = packageJson.version;
    this.updateSub = this.assessmentService.updateAvailable.subscribe(val => {
      this.isUpdateAvailable = val;
    });
  }

  ngOnDestroy() {
    this.updateSub.unsubscribe();
  }

  toggleDirectoryCollapse(dir: Directory) {
    dir.collapsed = !dir.collapsed;
  }

  // toggleSelected(dir: Directory) {
  //   this.assessmentService.dashboardView.next('assessment-dashboard');
  //   if (dir) {
  //     if (dir.collapsed === true) {
  //       dir.collapsed = false;
  //     }
  //     this.selectedDirectoryId = dir.id;
  //     this.directoryChange.emit(dir);
  //   } else {
  //     this.selectedDirectoryId = null;
  //   }
  // }

  // getDirectory() {
  //   return this.directory;
  // }

  // changeDashboardView(str: string) {
  //   this.assessmentService.dashboardView.next(str);
  // }

  showCreateAssessment() {
    this.directoryDashboardService.createAssessment.next(true);
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
}
