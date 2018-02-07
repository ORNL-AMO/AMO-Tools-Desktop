import { Component, OnInit, Input, SimpleChanges, ViewChild, Output, EventEmitter } from '@angular/core';
import { Assessment } from '../../../shared/models/assessment';
import { Router } from '@angular/router';
import { AssessmentService } from '../../assessment.service';
import { ModalDirective } from 'ngx-bootstrap';
import { Directory } from '../../../shared/models/directory';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import * as _ from 'lodash';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-assessment-card',
  templateUrl: './assessment-card.component.html',
  styleUrls: ['./assessment-card.component.css', '../assessment-grid-view.component.css']
})

export class AssessmentCardComponent implements OnInit {
  @Input()
  assessment: Assessment;
  @Input()
  isChecked: boolean;
  @Output('changeDirectory')
  changeDirectory = new EventEmitter<boolean>();

  isFirstChange: boolean = true;
  @ViewChild('editModal') public editModal: ModalDirective;

  directories: Array<Directory>;

  editForm: FormGroup;
  constructor(private assessmentService: AssessmentService, private router: Router, private indexedDbService: IndexedDbService, private formBuilder: FormBuilder) { }


  ngOnInit() {
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

  goToAssessment(assessment: Assessment) {
    this.assessmentService.tab = 'system-setup';
    if (assessment.type == 'PSAT') {
      if (assessment.psat.setupDone) {
        this.assessmentService.tab = 'assessment';
      }
      this.router.navigateByUrl('/psat/' + assessment.id);
    } else if (assessment.type == 'PHAST') {
      if (assessment.phast.setupDone) {
        this.assessmentService.tab = 'assessment';
      }
      this.router.navigateByUrl('/phast/' + assessment.id);
    }
  }

  setDelete() {
    this.assessment.selected = this.isChecked;
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
}
