import { Component, OnInit, Input, Output, EventEmitter, ViewChild, SimpleChanges } from '@angular/core';
import { Calculator } from '../../../shared/models/calculators';
import { Directory } from '../../../shared/models/directory';
import { ModalDirective } from 'ngx-bootstrap';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import * as _ from 'lodash';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PreAssessmentService } from '../../../calculator/furnaces/pre-assessment/pre-assessment.service';
import { Settings } from '../../../shared/models/settings';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';

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
  @Input()
  isChecked: boolean;

  @ViewChild('editModal') public editModal: ModalDirective;
  directories: Array<Directory>;
  editForm: FormGroup;
  numFurnaces: number = 0;
  energyUsed: number = 0;
  energyCost: number = 0;
  isFirstChange: boolean = true;
  constructor(private indexedDbService: IndexedDbService, private formBuilder: FormBuilder, private preAssessmentService: PreAssessmentService, private calculatorDbService: CalculatorDbService) { }

  ngOnInit() {
  //  this.populateDirArray();
    this.getData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.isChecked && !this.isFirstChange) {
      this.calculator.selected = this.isChecked;
    } else if (changes.calculator && !this.isFirstChange) {
      this.getData();
    }
    else {
      this.isFirstChange = false;
    }
  }

  getData() {
    if (this.calculator.preAssessments) {
      this.numFurnaces = this.calculator.preAssessments.length;
      let tmpResults = this.preAssessmentService.getResults(this.calculator.preAssessments, this.settings, 'MMBtu');
      this.energyUsed = _.sumBy(tmpResults, 'value');
      this.energyCost = _.sumBy(tmpResults, 'energyCost');
    } else {
      this.energyCost = 0;
      this.energyUsed = 0;
      this.numFurnaces = 0;
    }
  }

  checkPreAssessment() {
    if (this.calculator.preAssessments) {
      if (this.calculator.preAssessments.length > 0) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  // populateDirArray() {
  //   this.indexedDbService.getAllDirectories().then(dirs => {
  //     this.directories = dirs;
  //   })
  // }

  showPreAssessment() {
    this.viewPreAssessment.emit(true);
  }

  showEditModal() {
    this.indexedDbService.getAllDirectories().then(dirs => {
      this.directories = dirs;
      this.editForm = this.formBuilder.group({
        'name': [this.calculator.name],
        'directoryId': [this.calculator.directoryId]
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
    this.calculator.name = this.editForm.controls.name.value;
    this.calculator.directoryId = this.editForm.controls.directoryId.value;
    this.indexedDbService.putCalculator(this.calculator).then(val => {
      this.calculatorDbService.setAll().then(()=> {
        this.updateDirectory.emit(true);
        this.hideEditModal();
      })
    })
  }
}
