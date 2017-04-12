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

  motorPerformanceResults: any = {
    efficiency: 0,
    motor_current: 0,
    motor_power_factor: 0
  }
  constructor(private psatService: PsatService) { }

  ngOnInit() {
    if (!this.psat) {
      this.performanceForm = this.psatService.initForm();
    } else {
      this.performanceForm = this.psatService.getFormFromPsat(this.psat.inputs);
    }
  }


  calculate() {
    let efficiency = this.psatService.getEfficiencyFromForm(this.performanceForm);
    let results = this.psatService.motorPerformance(
      this.performanceForm.value.frequency,
      this.performanceForm.value.efficiencyClass,
      this.performanceForm.value.horsePower,
      this.performanceForm.value.motorRPM,
      efficiency,
      this.performanceForm.value.motorVoltage,
      this.performanceForm.value.fullLoadAmps
    );
    this.motorPerformanceResults.efficiency = results.efficiency;
    this.motorPerformanceResults.motor_current = results.motor_current;
    this.motorPerformanceResults.motor_power_factor = results.motor_power_factor;
  }

  
}
