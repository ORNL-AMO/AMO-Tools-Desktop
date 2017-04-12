import { Component, OnInit, Input } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { PsatService } from '../../psat.service';

@Component({
  selector: 'app-input-summary',
  templateUrl: './input-summary.component.html',
  styleUrls: ['./input-summary.component.css']
})
export class InputSummaryComponent implements OnInit {
  @Input()
  psat: PSAT;
  constructor(private psatService: PsatService) { }

  ngOnInit() {
  }

  getPumpType(num: number) {
    return this.psatService.getPumpStyleFromEnum(num);
  }

  getDrive(num: number) {
    return this.psatService.getDriveFromEnum(num);
  }

  getLineFreq(num: number) {
    return this.psatService.getLineFreqFromEnum(num);
  }

  getEfficiencyClass(num: number) {
    return this.psatService.getEfficiencyClassFromEnum(num);
  }

  getFixedSpeed(num: number) {
    return this.psatService.getFixedSpeedFromEnum(num);
  }

  getLoadMethod(num: number) {
    return this.psatService.getLoadEstimationFromEnum(num);
  }
}
