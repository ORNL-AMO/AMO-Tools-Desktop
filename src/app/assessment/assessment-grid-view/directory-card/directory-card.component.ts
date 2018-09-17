import { Component, OnInit, Input, SimpleChanges, ViewChild, Output, EventEmitter } from '@angular/core';
import { Directory, DirectoryDbRef } from '../../../shared/models/directory';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { Assessment } from '../../../shared/models/assessment';
import { AssessmentService } from '../../assessment.service';
import { Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap';
import * as _ from 'lodash';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DirectoryDbService } from '../../../indexedDb/directory-db.service';
import { AssessmentDbService } from '../../../indexedDb/assessment-db.service';
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
  constructor(private indexedDbService: IndexedDbService, private directoryDbService: DirectoryDbService, private assessmentDbService: AssessmentDbService, private assessmentService: AssessmentService, private router: Router, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.populateDirectories(this.directory);
    this.directory.selected = false;
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
    directory.assessments = this.assessmentDbService.getByDirectoryId(directory.id);
    directory.subDirectory = this.directoryDbService.getSubDirectoriesById(directory.id);
  }

  goToAssessment(assessment: Assessment) {
    this.assessmentService.goToAssessment(assessment);
  }

  showEditModal() {
    this.indexedDbService.getAllDirectories().then(dirs => {
      this.directories = dirs;
      _.remove(this.directories, (dir) => { return dir.id == this.directory.id });
      _.remove(this.directories, (dir) => { return dir.parentDirectoryId == this.directory.id });
      this.editForm = this.formBuilder.group({
        'name': [this.directory.name],
        'directoryId': [this.directory.parentDirectoryId]
      })
      this.editModal.show();
    })
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
      this.directoryDbService.setAll().then(() => {
        this.updateDirectory.emit(true);
        this.assessmentService.updateSidebarData.next(true);
        this.hideEditModal();
      })
    })
  }
}
