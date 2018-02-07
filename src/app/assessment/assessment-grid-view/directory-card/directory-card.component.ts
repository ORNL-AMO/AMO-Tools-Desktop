import { Component, OnInit, Input, SimpleChanges, ViewChild, Output, EventEmitter } from '@angular/core';
import { Directory, DirectoryDbRef } from '../../../shared/models/directory';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { Assessment } from '../../../shared/models/assessment';
import { AssessmentService } from '../../assessment.service';
import { Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap';
import * as _ from 'lodash';
import { FormBuilder, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-directory-card',
  templateUrl: './directory-card.component.html',
  styleUrls: ['./directory-card.component.css', '../assessment-grid-view.component.css']
})
export class DirectoryCardComponent implements OnInit {
  @Input()
  directory: Directory;
  @Output('directoryChange')
  directoryChange = new EventEmitter();
  @Input()
  isChecked: boolean;
  @Output('updateDirectory')
  updateDirectory = new EventEmitter();

  isFirstChange: boolean = true;
  editForm: FormGroup;
  directories: Array<Directory>;
  @ViewChild('editModal') public editModal: ModalDirective;
  constructor(private indexedDbService: IndexedDbService, private assessmentService: AssessmentService, private router: Router, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.populateDirectories(this.directory);
    // this.directory.assessments = tmpDirectory.assessments;
    // this.directory.subDirectory = tmpDirectory.subDirectory;
    // this.directory.collapsed = tmpDirectory.collapsed;
    if (this.isChecked) {
      this.directory.selected = this.isChecked;
    }
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes.isChecked && !this.isFirstChange) {
      this.directory.selected = this.isChecked;
    }
    else {
      this.isFirstChange = false;
    }
  }

  goToDirectory(dir) {
    this.directoryChange.emit(dir)
  }

  populateDirectories(directory: Directory) {
    // let tmpDirectory: Directory = {
    //   name: directoryRef.name,
    //   createdDate: directoryRef.createdDate,
    //   modifiedDate: directoryRef.modifiedDate,
    //   id: directoryRef.id,
    //   collapsed: false,
    //   parentDirectoryId: directoryRef.id
    // }
    this.indexedDbService.getDirectoryAssessments(directory.id).then(
      results => {
        directory.assessments = results;
      }
    );

    this.indexedDbService.getChildrenDirectories(directory.id).then(
      results => {
        directory.subDirectory = results;
      }
    );
    this.indexedDbService.getAllDirectories().then(dirs => {
      this.directories = dirs;
      _.remove(this.directories, (dir) => { return dir.id == this.directory.id });
    })
  }

  setDelete() {
    this.directory.selected = this.isChecked;
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

  showEditModal() {
    this.editForm = this.formBuilder.group({
      'name': [this.directory.name],
      'directoryId': [this.directory.parentDirectoryId]
    })
    this.editModal.show();
  }

  hideEditModal() {
    this.editModal.hide();
  }

  getParentDirStr(id: number) {
    let parentDir = _.find(this.directories, (dir) => { return dir.id == id });
    if (parentDir) {
      let str = parentDir.name + '/';
      while (parentDir.parentDirectoryId) {
        parentDir = _.find(this.directories, (dir) => { return dir.id == parentDir.parentDirectoryId });
        str = parentDir.name + '/' + str;
      }
      return str;
    } else {
      return '';
    }
  }

  save() {
    this.directory.name = this.editForm.controls.name.value;
    this.directory.parentDirectoryId = this.editForm.controls.directoryId.value;
    this.indexedDbService.putDirectory(this.directory).then(val => {
      this.updateDirectory.emit(true);
      this.hideEditModal();
    })
  }
}
