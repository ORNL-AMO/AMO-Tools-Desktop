import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { PSAT, PsatInputs, Modification } from '../../shared/models/psat';
import * as _ from 'lodash';

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

  modifyTab: string = 'system-basics';
  _modifications: Array<Modification>;
  baselineSelected: boolean = true;
  modifiedSelected: boolean = false;
  isFirstChange: boolean = true;
  showNotes: boolean = false;
  currentField: string = 'default';
  isDropdownOpen: boolean = false;
  modificationIndex: number = 0;
  constructor() { }

  ngOnInit() {
    this._modifications = new Array<Modification>();
    if (this.psat.modifications) {
      this._modifications = (JSON.parse(JSON.stringify(this.psat.modifications)));
    }
  }


  // ngOnChanges(changes: SimpleChanges) {
  //   if (!this.isFirstChange) {
  //     if (changes.saveClicked) {
  //       this.saveModifications();
  //     }
  //   }
  //   else {
  //     this.isFirstChange = false;
  //   }
  // }

  save(bool: boolean) {
    debugger
    if (bool == this.modifiedSelected) {
      if (this._modifications) {
        this.psat.modifications = (JSON.parse(JSON.stringify(this._modifications)));
        console.log('PSAT MODIFICATION')
        console.log(this.psat);
      }
    }
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

  changeField(str: string) {
    this.currentField = str;
  }
}
