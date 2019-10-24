import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { Directory } from '../shared/models/directory';
import { AssessmentService } from '../assessment/assessment.service';
declare const packageJson;
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @Output('directoryChange')
  directoryChange = new EventEmitter();
  @Input()
  directory: Directory;
  @Input()
  workingDirectory: Directory;
  @Input()
  newDirEventToggle: boolean;
  @Input()
  dashboardView: string;

  @Output('openModal')
  openModal = new EventEmitter<boolean>();

  selectedDirectoryId: number;
  firstChange: boolean = true;
  createAssessment: boolean = false;
  versionNum: any;
  isUpdateAvailable: boolean;
  showModal: boolean;
  showVersionModal: boolean;
  updateSub: Subscription;
  dashboardViewSub: Subscription;
  currentDashboardView: string;
  constructor(private assessmentService: AssessmentService) { }

  ngOnInit() {
    this.versionNum = packageJson.version;
    this.directory.collapsed = false;
    this.selectedDirectoryId = this.directory.id;
    if (!this.workingDirectory.collapsed) {
      this.toggleDirectoryCollapse(this.workingDirectory);
    }
    this.updateSub = this.assessmentService.updateAvailable.subscribe(val => {
      this.isUpdateAvailable = val;
    });

    this.dashboardViewSub = this.assessmentService.dashboardView.subscribe(val => {
      this.currentDashboardView = val;
    })
  }

  ngOnDestroy() {
    this.updateSub.unsubscribe();
    this.dashboardViewSub.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.workingDirectory && !this.firstChange) {
      if (changes.workingDirectory.currentValue) {
        if (changes.workingDirectory.previousValue.id !== changes.workingDirectory.currentValue.id && this.currentDashboardView == 'assessment-dashboard') {
          this.toggleSelected(this.workingDirectory);
          if (this.workingDirectory.collapsed) {
            this.toggleDirectoryCollapse(this.workingDirectory);
          }
        }
      }
    }
    if (this.firstChange) {
      this.firstChange = false;
    }
  }

  toggleDirectoryCollapse(dir: Directory) {
    dir.collapsed = !dir.collapsed;
  }

  toggleSelected(dir: Directory) {
    this.assessmentService.dashboardView.next('assessment-dashboard');
    if (dir) {
      if (dir.collapsed === true) {
        dir.collapsed = false;
      }
      this.selectedDirectoryId = dir.id;
      this.directoryChange.emit(dir);
    } else {
      this.selectedDirectoryId = null;
    }
  }

  getDirectory() {
    return this.directory;
  }

  changeDashboardView(str: string) {
    this.assessmentService.dashboardView.next(str);
  }

  showCreateAssessment() {
    this.assessmentService.createAssessment.next(true);
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
