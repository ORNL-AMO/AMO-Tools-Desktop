import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { PsatService } from '../../../../psat/psat.service';
@Component({
  selector: 'app-specific-speed-graph',
  templateUrl: './specific-speed-graph.component.html',
  styleUrls: ['./specific-speed-graph.component.css']
})
export class SpecificSpeedGraphComponent implements OnInit {
  @Input()
  speedForm: any;
  // @Input()
  // toggleCalculate: boolean;
  // specificSpeed: number = 0;
  // efficiencyCorrection: number = 0;
  constructor(private psatService: PsatService) { }

  ngOnInit() {
  }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes.toggleCalculate) {
  //     this.getValues();
  //   }
  // }

  // getValues(specificSpeed?: number) {
  //   if (this.checkForm()) {
  //     this.efficiencyCorrection = this.psatService.achievableEfficiency(this.speedForm.value.pumpType, this.getSpecificSpeed(this.speedForm));
  //   }
  // }

  getEfficiencyCorrection() {
    if (this.checkForm()) {
      return this.psatService.achievableEfficiency(this.speedForm.value.pumpType, this.getSpecificSpeed());
    } else {
      return 0;
    }
  }

  getSpecificSpeed(): number {
    if (this.checkForm()) {
      return this.speedForm.value.pumpRPM * Math.pow(this.speedForm.value.flowRate, 0.5) / Math.pow(this.speedForm.value.head, .75);
    } else {
      return 0;
    }
  }

  checkForm() {
    if (
      this.speedForm.controls.pumpType.status == 'VALID' &&
      this.speedForm.controls.flowRate.status == 'VALID' &&
      this.speedForm.controls.head.status == 'VALID' &&
      this.speedForm.controls.pumpRPM.status == 'VALID' &&
      this.speedForm.value.pumpType != 'Specified Optimal Efficiency'
    ) {
      return true;
    } else {
      return false;
    }
  }
}
