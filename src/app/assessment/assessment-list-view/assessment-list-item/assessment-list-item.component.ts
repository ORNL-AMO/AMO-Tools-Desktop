import { Component, OnInit, Input, SimpleChanges, ViewChild, Output, EventEmitter } from '@angular/core';
import { Assessment } from '../../../shared/models/assessment';
import { Router } from '@angular/router';
import { AssessmentService } from '../../assessment.service';
import { PsatService } from '../../../psat/psat.service';
import { Directory } from '../../../shared/models/directory';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import * as _ from 'lodash';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
  selector: 'app-assessment-list-item',
  templateUrl: './assessment-list-item.component.html',
  styleUrls: ['./assessment-list-item.component.css']
})
export class AssessmentListItemComponent implements OnInit {
  @Input()
  assessment: Assessment;
  @Input()
  isChecked: any;
  @Output('changeDirectory')
  changeDirectory = new EventEmitter<boolean>();

  isFirstChange: boolean = true;
  @ViewChild('editModal') public editModal: ModalDirective;

  directories: Array<Directory>;

  editForm: FormGroup;
  isSetup: boolean;

  showReport: boolean = false;

  @ViewChild('reportModal') public reportModal: ModalDirective;
  constructor(private assessmentService: AssessmentService, private router: Router, private indexedDbService: IndexedDbService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    if (this.assessment.phast) {
      this.isSetup = this.assessment.phast.setupDone;
    } else if (this.assessment.psat) {
      this.isSetup = this.assessment.psat.setupDone;
    }
    if (this.isChecked) {
      this.assessment.selected = this.isChecked;
    }

    this.indexedDbService.getAllDirectories().then(dirs => {
      this.directories = dirs;
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.isChecked && !this.isFirstChange) {
      this.assessment.selected = this.isChecked;
    }
    else {
      this.isFirstChange = false;
    }
  }

  goToAssessment(assessment: Assessment, str?: string, str2?: string) {
    this.assessmentService.tab = str;
    this.assessmentService.subTab = str2;
    if (assessment.type == 'PSAT') {
      this.router.navigateByUrl('/psat/' + this.assessment.id);
    } else if (assessment.type == 'PHAST') {
      this.router.navigateByUrl('/phast/' + this.assessment.id);
    }
  }

  setDelete() {
    // this.assessment.selected = this.isChecked;
  }
  showEditModal() {
    this.editForm = this.formBuilder.group({
      'name': [this.assessment.name],
      'directoryId': [this.assessment.directoryId]
    })
    this.editModal.show();
  }

  hideEditModal() {
    this.editModal.hide();
  }

  getParentDirStr(id: number) {
    let parentDir = _.find(this.directories, (dir) => { return dir.id == id });
    let str = parentDir.name + '/';
    while (parentDir.parentDirectoryId) {
      parentDir = _.find(this.directories, (dir) => { return dir.id == parentDir.parentDirectoryId });
      str = parentDir.name + '/' + str;
    }
    return str;
  }

  save() {
    this.assessment.name = this.editForm.controls.name.value;
    this.assessment.directoryId = this.editForm.controls.directoryId.value;
    this.indexedDbService.putAssessment(this.assessment).then(val => {
      this.changeDirectory.emit(true);
      this.hideEditModal();
    })
  }

  showReportModal() {
    this.showReport = true;
    this.reportModal.show();
  }

  hideReportModal() {
    this.reportModal.hide();
    this.showReport = false;
  }
}
