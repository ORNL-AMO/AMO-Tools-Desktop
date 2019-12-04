import { Component, OnInit, Input, SimpleChanges, ViewChild, Output, EventEmitter } from '@angular/core';
import { Directory } from '../../../../shared/models/directory';
import { ModalDirective } from 'ngx-bootstrap';
import * as _ from 'lodash';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IndexedDbService } from '../../../../indexedDb/indexed-db.service';
import { DirectoryDbService } from '../../../../indexedDb/directory-db.service';
import { AssessmentService } from '../../../../assessment/assessment.service';
import { DashboardService } from '../../../dashboard.service';

@Component({
  selector: 'app-directory-list-item',
  templateUrl: './directory-list-item.component.html',
  styleUrls: ['./directory-list-item.component.css']
})
export class DirectoryListItemComponent implements OnInit {
  @Input()
  directory: Directory;

  isFirstChange: boolean = true;
  editForm: FormGroup;
  directories: Array<Directory>;
  @ViewChild('editModal', { static: false }) public editModal: ModalDirective;
  constructor(private indexedDbService: IndexedDbService, private formBuilder: FormBuilder, private directoryDbService: DirectoryDbService, private dashboardService: DashboardService) { }

  ngOnInit() {
    this.indexedDbService.getAllDirectories().then(dirs => {
      this.directories = dirs;
      _.remove(this.directories, (dir) => { return dir.id === this.directory.id; });
    });
  }

  showEditModal() {
    this.editForm = this.formBuilder.group({
      'name': [this.directory.name],
      'directoryId': [this.directory.parentDirectoryId]
    });
    this.editModal.show();
  }

  hideEditModal() {
    this.editModal.hide();
  }

  getParentDirStr(id: number) {
    let parentDir = _.find(this.directories, (dir) => { return dir.id === id; });
    if (parentDir) {
      let str = parentDir.name + '/';
      while (parentDir.parentDirectoryId) {
        parentDir = _.find(this.directories, (dir) => { return dir.id === parentDir.parentDirectoryId; });
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
        this.dashboardService.updateSidebarData.next(true);
        this.hideEditModal();
      });
    });
  }
}
