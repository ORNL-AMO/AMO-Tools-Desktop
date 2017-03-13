import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import * as _ from 'lodash';

@Component({
  selector: 'app-opening-losses',
  templateUrl: './opening-losses.component.html',
  styleUrls: ['./opening-losses.component.css']
})
export class OpeningLossesComponent implements OnInit {

  openingLosses: Array<any>;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    if(!this.openingLosses){
      this.openingLosses = new Array();
    }
  }

  addLoss() {
    let tmpFixedForm = this.initForm();
    let tmpVariableForm = this.initForm();
    let tmpName = 'Opening Loss #' + (this.openingLosses.length + 1);
    this.openingLosses.push({ fixedForm: tmpFixedForm, variableForm: tmpVariableForm, name: tmpName, showfixed: false, showVariable: false });
  }

  removeLoss(str: string) {
    this.openingLosses = _.remove(this.openingLosses, fixture => {
      return fixture.name != str;
    });
    this.renameLosses();
  }

  renameLosses() {
    let index = 1;
    this.openingLosses.forEach(fixture => {
      fixture.name = 'Openeing #' + index;
      index++;
    })
  }

  showFixed(loss: any){
    loss.showFixed = true;
  }

  showVariable(loss: any){
    loss.showVariable = true;
  }

  hideCalc(loss: any){
    loss.showFixed = false;
    loss.showVariable = false;
  }

  initForm() {
    return this.formBuilder.group({
      'openingType': [''],
      'baselineWallThickness': [''],
      'baselineLengthOfOpenings': [''],
      'baselineHeightOfOpenings': [''],
      'baselineViewFactor': [''],
      'baselineTotalOpeningArea': [''],
      'baselineInsideTemp': [''],
      'baselineOutsideTemp': [''],
      'baselinePercentTimeOpen': [''],
      'baselineOpeningLosses': [{ value: '', disabled: true }],
      'modifiedWallThickness': [''],
      'modifiedLengthOfOpenings': [''],
      'modifiedHeightOfOpenings': [''],
      'modifiedViewFactor': [''],
      'modifiedTotalOpeningArea': [''],
      'modifiedInsideTemp': [''],
      'modifiedOutsideTemp': [''],
      'modifiedPercentTimeOpen': [''],
      'modifiedOpeningLosses': [{ value: '', disabled: true }]
    })
  }

}
