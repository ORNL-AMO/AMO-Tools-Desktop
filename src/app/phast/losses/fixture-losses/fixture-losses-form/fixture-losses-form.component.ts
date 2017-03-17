import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-fixture-losses-form',
  templateUrl: './fixture-losses-form.component.html',
  styleUrls: ['./fixture-losses-form.component.css']
})
export class FixtureLossesFormComponent implements OnInit {
  @Input()
  lossesForm: any;
  @Output('calculateModified')
  calculateModified = new EventEmitter<boolean>();
  @Output('calculateBaseline')
  calculateBaseline = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
  }

  checkBaseline(){
    if(
      this.lossesForm.controls.baselineType.status == 'VALID' &&
      this.lossesForm.controls.baselineFixtureWeight.status == 'VALID' &&
      this.lossesForm.controls.baselineInitialTemp.status == 'VALID' &&
      this.lossesForm.controls.baselineFinalTemp.status == 'VALID' &&
      this.lossesForm.controls.baselineCorrectionFactor.status == 'VALID'
    ){
      this.calculateBaseline.emit(true);
    }

  }

  checkModified(){
    if(
      this.lossesForm.controls.modifiedType.status == 'VALID' &&
      this.lossesForm.controls.modifiedFixtureWeight.status == 'VALID' &&
      this.lossesForm.controls.modifiedInitialTemp.status == 'VALID' &&
      this.lossesForm.controls.modifiedFinalTemp.status == 'VALID' &&
      this.lossesForm.controls.modifiedCorrectionFactor.status == 'VALID'
    ){
      this.calculateModified.emit(true);
    }
  }
}
