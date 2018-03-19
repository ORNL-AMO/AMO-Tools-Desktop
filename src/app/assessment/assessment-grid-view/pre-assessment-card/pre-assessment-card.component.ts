import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Calculator } from '../../../shared/models/calculators';
import { Directory } from '../../../shared/models/directory';
import { ModalDirective } from 'ngx-bootstrap';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import * as _ from 'lodash';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PreAssessmentService } from '../../../calculator/furnaces/pre-assessment/pre-assessment.service';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-pre-assessment-card',
  templateUrl: './pre-assessment-card.component.html',
  styleUrls: ['./pre-assessment-card.component.css', '../assessment-grid-view.component.css']
})
export class PreAssessmentCardComponent implements OnInit {
  @Input()
  calculator: Calculator;
  @Input()
  directory: Directory;
  @Output('viewPreAssessment')
  viewPreAssessment = new EventEmitter<boolean>();
  @Output('updateDirectory')
  updateDirectory = new EventEmitter();
  @Input()
  settings: Settings;

  @ViewChild('editModal') public editModal: ModalDirective;
  directories: Array<Directory>;
  editForm: FormGroup;
  numFurnaces: number = 0;
  energyUsed: number = 0;
  constructor(private indexedDbService: IndexedDbService, private formBuilder: FormBuilder, private preAssessmentService: PreAssessmentService) { }

  ngOnInit() {
    this.populateDirArray();
    if (this.calculator.preAssessments) {
      this.numFurnaces = this.calculator.preAssessments.length;
      let tmpResults = this.preAssessmentService.getResults(this.calculator.preAssessments, 'MMBtu');
      console.log(tmpResults);
      this.energyUsed = _.sumBy(tmpResults, 'value');
    }
  }

  populateDirArray() {
    this.indexedDbService.getAllDirectories().then(dirs => {
      this.directories = dirs;
    })
  }

  showPreAssessment() {
    this.viewPreAssessment.emit(true);
  }

  showEditModal() {
    this.editForm = this.formBuilder.group({
      'name': [this.calculator.name],
      'directoryId': [this.calculator.directoryId]
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
    this.calculator.name = this.editForm.controls.name.value;
    this.calculator.directoryId = this.editForm.controls.directoryId.value;
    this.indexedDbService.putCalculator(this.calculator).then(val => {
      this.updateDirectory.emit(true);
      this.populateDirArray();
      this.hideEditModal();
    })
  }
}
