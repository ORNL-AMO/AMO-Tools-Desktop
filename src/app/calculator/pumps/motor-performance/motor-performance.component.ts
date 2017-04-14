import { Component, OnInit, Input } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { PsatService } from '../../../psat/psat.service';

@Component({
  selector: 'app-motor-performance',
  templateUrl: './motor-performance.component.html',
  styleUrls: ['./motor-performance.component.css']
})
export class MotorPerformanceComponent implements OnInit {
  @Input()
  psat: PSAT;

  performanceForm: any;

  toggleCalculate: boolean = false;

  constructor(private psatService: PsatService) { }

  ngOnInit() {
    if (!this.psat) {
      this.performanceForm = this.psatService.initForm();
    } else {
      this.performanceForm = this.psatService.getFormFromPsat(this.psat.inputs);
    }
  }

  calculate(){
    this.toggleCalculate = !this.toggleCalculate;
  }
  
}
