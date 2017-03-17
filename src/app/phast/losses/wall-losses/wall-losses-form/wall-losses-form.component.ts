import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-wall-losses-form',
  templateUrl: './wall-losses-form.component.html',
  styleUrls: ['./wall-losses-form.component.css']
})
export class WallLossesFormComponent implements OnInit {
  @Input()
  wallLossesForm: any;
  @Output('calculateBaseline')
  calculateBaseline = new EventEmitter<boolean>();
  @Output('calculateModified')
  calculateModified = new EventEmitter<boolean>();
  constructor() { }

  ngOnInit() {
    console.log(this.wallLossesForm);
  }

  checkBaseline() {
    if (
      this.wallLossesForm.controls.baselineSurfaceArea.status == 'VALID' &&
      this.wallLossesForm.controls.baselineAvgSurfaceTemp.status == 'VALID' &&
      this.wallLossesForm.controls.baselineAmbientTemp.status == 'VALID' &&
      this.wallLossesForm.controls.baselineCorrectionFactor.status == 'VALID'
      ){
        this.calculateBaseline.emit(true);
      }
  }

  checkModified() {
    if (
      this.wallLossesForm.controls.modifiedSurfaceArea.status == 'VALID' &&
      this.wallLossesForm.controls.modifiedAvgSurfaceTemp.status == 'VALID' &&
      this.wallLossesForm.controls.modifiedAvgSurfaceTemp.status == 'VALID' &&
      this.wallLossesForm.controls.modifiedCorrectionFactor.status == 'VALID'
      ){
        this.calculateModified.emit(true);
      }
  }


}
