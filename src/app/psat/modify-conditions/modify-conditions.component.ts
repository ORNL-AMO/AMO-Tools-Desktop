import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { PSAT, PsatInputs, Modification, PsatOutputs } from '../../shared/models/psat';
import * as _ from 'lodash';
import { PsatService } from '../psat.service';
import { Settings } from '../../shared/models/settings';
import { AssessmentService } from '../../assessment/assessment.service';
import { Assessment } from '../../shared/models/assessment';
import { CompareService } from '../compare.service';

@Component({
  selector: 'app-modify-conditions',
  templateUrl: './modify-conditions.component.html',
  styleUrls: ['./modify-conditions.component.css']
})
export class ModifyConditionsComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Input()
  saveClicked: boolean;
  @Input()
  settings: Settings;
  @Output('saved')
  saved = new EventEmitter<boolean>();
  @Input()
  assessment: Assessment;
  // @Input()
  // emitPrint: boolean;

  modifyTab: string = 'field-data';
  _modifications: Array<Modification>;
  baselineSelected: boolean = true;
  modifiedSelected: boolean = false;
  isFirstChange: boolean = true;
  showNotes: boolean = false;
  isDropdownOpen: boolean = false;
  modificationIndex: number = 0;
  showEditModification: boolean = false;
  editModification: Modification;
  isModalOpen: boolean = false;
  constructor(private psatService: PsatService, private assessmentService: AssessmentService, private compareService: CompareService) { }

  ngOnInit() {
    this._modifications = new Array<Modification>();
    if (this.psat.modifications) {
      this._modifications = (JSON.parse(JSON.stringify(this.psat.modifications)));
      this.togglePanel(false);
    }else{
      this.addModification();
    }
    let tmpTab = this.assessmentService.getSubTab();
    if (tmpTab) {
      this.modifyTab = tmpTab;
    }
  }

  ngOnDestroy() {
    this.compareService.baselinePSAT = null;
    this.compareService.modifiedPSAT = null;
  }

  save() {
    console.log('save mod conditions')
    this.psat.modifications = (JSON.parse(JSON.stringify(this._modifications)));
    this.saved.emit(true);
    this.showEditModification = false;
    this.editModification = null;
  }

  addModification() {
    this._modifications.unshift({
      psat: {
        name: 'Modification ' + (this._modifications.length + 1),
        inputs: (JSON.parse(JSON.stringify(this.psat.inputs))),
      },
      notes: {
        systemBasicsNotes: '',
        pumpFluidNotes: '',
        motorNotes: '',
        fieldDataNotes: ''
      }
    });
    this.modificationIndex = this._modifications.length - 1;
    this.modifiedSelected = true;
    this.baselineSelected = false;
  }

  selectModification(modification: Modification) {
    let tmpIndex = 0;
    this._modifications.forEach(mod => {
      if (mod == modification) {
        this.modificationIndex = tmpIndex;
        return;
      } else {
        tmpIndex++;
      }
    });
    this.changeTab(this.modifyTab);
    this.isDropdownOpen = false;
  }

  changeTab(str: string) {
    this.modifyTab = str;
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    this.showNotes = false;
  }
  toggleNotes() {
    this.showNotes = !this.showNotes;
    this.isDropdownOpen = false;
  }

  togglePanel(bool: boolean) {
    if (bool == this.baselineSelected) {
      this.baselineSelected = true;
      this.modifiedSelected = false;
    }
    else if (bool == this.modifiedSelected) {
      this.modifiedSelected = true;
      this.baselineSelected = false;
    }
  }
  dispEditModification(mod: Modification) {
    this.editModification = mod;
    this.showEditModification = true;
  }

  hideEditModification() {
    this.showEditModification = false;
  }

  cancelEdit() {
    this.hideEditModification();
    this.editModification = null;
  }

  deleteModification() {
    this.modificationIndex = 0;
    _.remove(this._modifications, (mod) => {
      return mod.psat.name == this.editModification.psat.name;
    });
    this.hideEditModification();
    this.editModification = null;
    this.save();
  }

  modalOpen() {
    this.isModalOpen = true;
  }
  modalClose() {
    this.isModalOpen = false;
  }
}
