import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { PsatService } from '../../psat.service';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-motor-help',
  templateUrl: './motor-help.component.html',
  styleUrls: ['./motor-help.component.css']
})
export class MotorHelpComponent implements OnInit {
  @Input()
  currentField: string;
  @Input()
  psat: PSAT;
  @Input()
  settings: Settings;

  rpmMin: number = 0;
  rpmMax: number = 0;


  flaExpectedMin: number = 0;
  flaExpectedMax: number = 0;

  constructor(private psatService: PsatService) { }

  ngOnInit() {
    this.getRpmRange();
   // this.getExpectedRange();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.psat) {
      this.getRpmRange();
     // this.getExpectedRange()
    }
  }

  getRpmRange() {
    let rpmRange = this.psatService.getMotorRpmMinMax(this.psat.inputs.line_frequency);
    this.rpmMax = rpmRange.max;
    this.rpmMin = rpmRange.min;
  }


  getFlaMin() {
    return this.psatService.flaRange.flaMin;
  }

  getFlaMax() {
    return this.psatService.flaRange.flaMax;
  }
}
