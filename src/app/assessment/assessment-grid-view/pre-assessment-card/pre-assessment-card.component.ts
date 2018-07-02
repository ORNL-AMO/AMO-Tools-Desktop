import { Component, OnInit, Input, Output, EventEmitter, ViewChild, SimpleChanges } from '@angular/core';
import { Calculator } from '../../../shared/models/calculators';
import { Directory } from '../../../shared/models/directory';
import { ModalDirective } from 'ngx-bootstrap';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import * as _ from 'lodash';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PreAssessmentService } from '../../../calculator/utilities/pre-assessment/pre-assessment.service';
import { Settings } from '../../../shared/models/settings';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';

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
  viewPreAssessment = new EventEmitter<number>();
  @Output('updateDirectory')
  updateDirectory = new EventEmitter();
  @Input()
  settings: Settings;
  @Input()
  isChecked: boolean;
  @Input()
  index: number;

  @ViewChild('editModal') public editModal: ModalDirective;
  @ViewChild('deleteModal') public deleteModal: ModalDirective;
  @ViewChild('copyModal') public copyModal: ModalDirective;

  directories: Array<Directory>;
  editForm: FormGroup;
  copyForm: FormGroup;
  numUnits: number = 0;
  energyUsed: number = 0;
  energyCost: number = 0;
  isFirstChange: boolean = true;
  preAssessmentExists: boolean;
  dropdownOpen: boolean = false;

  calculatorCopy: Calculator;
  settingsCopy: Settings;
  constructor(private indexedDbService: IndexedDbService, private settingsDbService: SettingsDbService, private formBuilder: FormBuilder, private preAssessmentService: PreAssessmentService, private calculatorDbService: CalculatorDbService) { }

  ngOnInit() {
    //  this.populateDirArray();
    this.getData();
    this.calculatorCopy = JSON.parse(JSON.stringify(this.calculator));
    delete this.calculatorCopy.id;
    this.settingsCopy = JSON.parse(JSON.stringify(this.settings));
    delete this.settingsCopy.id;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.isChecked && !this.isFirstChange) {
      this.calculator.selected = this.isChecked;
    } else {
      this.isFirstChange = false;
    }
    if (changes.calculator) {
      this.checkPreAssessment();
      this.getData();
    }
  }

  getData() {
    if (this.preAssessmentExists) {
      this.numUnits = this.calculator.preAssessments.length;
      let tmpResults = this.preAssessmentService.getResults(this.calculator.preAssessments, this.settings, 'MMBtu');
      this.energyUsed = _.sumBy(tmpResults, 'value');
      this.energyCost = _.sumBy(tmpResults, 'energyCost');
    } else {
      this.energyCost = 0;
      this.energyUsed = 0;
      this.numUnits = 0;
    }
  }

  checkPreAssessment() {
    if (this.calculator) {
      if (this.calculator.preAssessments) {
        if (this.calculator.preAssessments.length > 0) {
          this.preAssessmentExists = true;
        } else {
          this.preAssessmentExists = false;
        }
      } else {
        this.preAssessmentExists = false;
      }
    }
  }

  deletePreAssessment() {
    this.indexedDbService.deleteCalculator(this.calculator.id).then(() => {
      this.calculatorDbService.setAll().then(() => {
        this.hideDeleteModal();
        this.updateDirectory.emit(true);
      })
    })
  }

  // populateDirArray() {
  //   this.indexedDbService.getAllDirectories().then(dirs => {
  //     this.directories = dirs;
  //   })
  // }

  showPreAssessment() {
    if (this.preAssessmentExists) {
      this.viewPreAssessment.emit(this.index);
    } else {
      this.viewPreAssessment.emit(undefined);
    }
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
      this.calculatorDbService.setAll().then(() => {
        this.updateDirectory.emit(true);
        this.hideEditModal();
      })
    })
  }

  showDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  showDeleteModal() {
    this.deleteModal.show();
  }

  hideDeleteModal() {
    this.deleteModal.hide();
  }

  showCopyModal() {
    this.indexedDbService.getAllDirectories().then(dirs => {
      this.directories = dirs;
      this.copyForm = this.formBuilder.group({
        'name': [this.calculator.name + ' (copy)', Validators.required],
        'directoryId': [this.calculator.directoryId, Validators.required]
      })
      this.copyModal.show();
    })
  }

  hideCopyModal() {
    this.copyModal.hide();
  }

  createCopy() {
    this.calculatorCopy.name = this.copyForm.controls.name.value;
    this.calculatorCopy.directoryId = this.copyForm.controls.directoryId.value;
    // this.calculatorCopy.createdDate = new Date();
    // this.calculatorCopy.modifiedDate = new Date();

    this.indexedDbService.addCalculator(this.calculatorCopy).then(newAssessmentId => {
      this.settingsCopy.assessmentId = newAssessmentId;
      this.indexedDbService.addSettings(this.settingsCopy).then(() => {
        this.settingsDbService.setAll().then(() => {
          this.calculatorDbService.setAll().then(() => {
            this.updateDirectory.emit(true);
            this.hideCopyModal();
          })
        })
      })
    })
  }
}
