import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { Directory } from '../shared/models/directory';
import { Assessment } from '../shared/models/assessment';
import { AssessmentService } from '../assessment/assessment.service';
declare const packageJson;
import { ElectronService } from 'ngx-electron';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @Output('directoryChange')
  directoryChange = new EventEmitter();
  @Output('selectCalculator')
  selectCalculator = new EventEmitter<string>();
  @Input()
  directory: Directory;
  @Input()
  workingDirectory: Directory;
  @Input()
  selectedCalculator: string;
  @Output('emitGoHome')
  emitGoHome = new EventEmitter<boolean>();
  @Input()
  newDirEventToggle: boolean;
  @Output('emitShowTutorials')
  emitShowTutorials = new EventEmitter<boolean>();
  @Output('emitShowAbout')
  emitShowAbout = new EventEmitter<boolean>();
  @Output('emitShowAcknowledgments')
  emitShowAcknowledgments = new EventEmitter<boolean>();
  @Input()
  dashboardView: string;
  @Output('emitGoToSettings')
  emitGoToSettings = new EventEmitter<boolean>();
  @Output('emitGoToContact')
  emitGoToContact = new EventEmitter<boolean>();

  selectedDirectoryId: number;
  firstChange: boolean = true;
  createAssessment: boolean = false;
  versionNum: any;
  isUpdateAvailable: boolean;
  showModal: boolean;
  showVersionModal: boolean;
  constructor(private assessmentService: AssessmentService, private electronService: ElectronService) { }

  ngOnInit() {
    this.versionNum = packageJson.version;
    this.directory.collapsed = false;
    this.selectedDirectoryId = this.directory.id;
    this.assessmentService.updateAvailable.subscribe(val => {
      this.isUpdateAvailable = val;
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.workingDirectory && !this.firstChange) {
      if (changes.workingDirectory.currentValue) {
        if (changes.workingDirectory.previousValue.id != changes.workingDirectory.currentValue.id) {
          this.toggleSelected(changes.workingDirectory.currentValue);
        }
      }
    } else if (changes.selectedCalculator && !this.firstChange) {
      if (this.selectedCalculator != '') {
        this.selectedDirectoryId = null;
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
      this.selectedCalculator = '';
      this.selectedDirectoryId = dir.id;
      this.directoryChange.emit(dir);
    } else {
      this.selectedCalculator = '';
      this.selectedDirectoryId = null;
    }
  }
  chooseCalculator(str: string) {
    this.selectCalculator.emit(str);
  }

  getDirectory() {
    return this.directory;
  }

  goToSettings() {
    this.emitGoToSettings.emit(true);
  }

  goHome() {
    this.emitGoHome.emit(true);
  }

  showAbout() {
    this.emitShowAbout.emit(true);
  }

  showAcknowledgments() {
    this.emitShowAcknowledgments.emit(true);
  }

  showTutorials() {
    this.emitShowTutorials.emit(true);
  }

  showCreateAssessment() {
    this.assessmentService.createAssessment.next(true);
  }

  showContact() {
    this.emitGoToContact.emit(true);
  }

  closeModal() {
    this.showModal = false;
  }

  openModal() {
    this.showModal = true;
  }

  openVersionModal() {
    this.showVersionModal = true;
  }

  closeVersionModal() {
    this.showVersionModal = false;
  }
}
