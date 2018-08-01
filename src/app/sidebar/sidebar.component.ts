import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { Directory } from '../shared/models/directory';
import { AssessmentService } from '../assessment/assessment.service';
declare const packageJson;
import { Subscription } from 'rxjs';
import { CalculatorService } from '../calculator/calculator.service';
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
  constructor(private assessmentService: AssessmentService, private calculatorService: CalculatorService) { }

  ngOnInit() {
    this.versionNum = packageJson.version;
    this.directory.collapsed = false;
    this.selectedDirectoryId = this.directory.id;
    if (!this.workingDirectory.collapsed) {
      this.toggleDirectoryCollapse(this.workingDirectory);
    }
    this.updateSub = this.assessmentService.updateAvailable.subscribe(val => {
      this.isUpdateAvailable = val;
    })

  }

  ngOnDestroy() {
    this.updateSub.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.workingDirectory && !this.firstChange) {
      if (changes.workingDirectory.currentValue) {
        if (changes.workingDirectory.previousValue.id != changes.workingDirectory.currentValue.id) {
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
    if (dir) {
      if (dir.collapsed == true) {
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

  closeUpdateModal() {
    this.openModal.emit(false);
    this.showModal = false;
  }

  openUpdateModal() {
    this.openModal.emit(true);
    this.showModal = true;
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
