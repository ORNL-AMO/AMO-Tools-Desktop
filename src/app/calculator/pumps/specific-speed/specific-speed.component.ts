import { Component, OnInit, Input } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { PsatService } from '../../../psat/psat.service';

@Component({
  selector: 'app-specific-speed',
  templateUrl: './specific-speed.component.html',
  styleUrls: ['./specific-speed.component.css']
})
export class SpecificSpeedComponent implements OnInit {
  @Input()
  psat: PSAT;

  speedForm: any;
  specificSpeed: number;
  efficiencyCorrection: number;
  toggleCalculate: boolean = true;
  constructor(private psatService: PsatService) { }

  ngOnInit() {
    if (!this.psat) {
      this.speedForm = this.psatService.initForm();
    } else {
      this.speedForm = this.psatService.getFormFromPsat(this.psat.inputs);
    }
  }

  calculate() {
    this.toggleCalculate = !this.toggleCalculate;
  }

}
