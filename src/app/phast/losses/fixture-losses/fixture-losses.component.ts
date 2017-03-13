import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import * as _ from 'lodash';

@Component({
  selector: 'app-fixture-losses',
  templateUrl: './fixture-losses.component.html',
  styleUrls: ['./fixture-losses.component.css']
})
export class FixtureLossesComponent implements OnInit {

  fixtureLosses: Array<any>;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    if (!this.fixtureLosses) {
      this.fixtureLosses = new Array();
    }
  }

  addLoss() {
    let tmpForm = this.initForm();
    let tmpName = 'Loss #' + (this.fixtureLosses.length + 1);
    this.fixtureLosses.push({ form: tmpForm, name: tmpName });
  }

  removeLoss(str: string) {
    this.fixtureLosses = _.remove(this.fixtureLosses, fixture => {
      return fixture.name != str;
    });
    this.renameLosses();
  }

  renameLosses() {
    let index = 1;
    this.fixtureLosses.forEach(fixture => {
      fixture.name = 'Fixture #' + index;
      index++;
    })
  }

  initForm() {
    return this.formBuilder.group({
      'baselineType': [''],
      'baselineFixtureWeight': [''],
      'baselineInitialTemp': [''],
      'baselineFinalTemp': [''],
      'baselineCorrectionFactor': [''],
      'baselineHeatRequired': [{ value: '', disabled: true }],
      'modifiedType': [''],
      'modifiedFixtureWeight': [''],
      'modifiedInitialTemp': [''],
      'modifiedFinalTemp': [''],
      'modifiedCorrectionFactor': [''],
      'modifiedHeatRequired': [{ value: '', disabled: true }],
    })
  }

}
