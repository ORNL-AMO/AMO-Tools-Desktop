import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { PsatService } from '../../../../psat/psat.service';

@Component({
  selector: 'app-motor-performance-graph',
  templateUrl: './motor-performance-graph.component.html',
  styleUrls: ['./motor-performance-graph.component.css']
})
export class MotorPerformanceGraphComponent implements OnInit {
  @Input()
  performanceForm: any;
  @Input()
  toggleCalculate: boolean;

  motorPerformanceResults: any = {
    efficiency: 0,
    motor_current: 0,
    motor_power_factor: 0
  };
  firstChange: boolean = true;

  constructor(private psatService: PsatService) { }

  ngOnInit() {

  }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (!this.firstChange) {
  //     if (changes.toggleCalculate) {
  //       this.drawGraph();
  //     }
  //   } else {
  //     this.firstChange = false;
  //   }
  // }

  calculateEfficiency(loadFactor: number) {
    if (this.checkForm()) {
      let efficiency = this.psatService.getEfficiencyFromForm(this.performanceForm);
      let results = this.psatService.motorPerformance(
        this.performanceForm.value.frequency,
        this.performanceForm.value.efficiencyClass,
        this.performanceForm.value.horsePower,
        this.performanceForm.value.motorRPM,
        efficiency,
        this.performanceForm.value.motorVoltage,
        this.performanceForm.value.fullLoadAmps,
        loadFactor
      );
      return results.efficiency;
    }
  }

  calculateCurrent(loadFactor: number) {
    if (this.checkForm()) {
      let efficiency = this.psatService.getEfficiencyFromForm(this.performanceForm);
      let results = this.psatService.motorPerformance(
        this.performanceForm.value.frequency,
        this.performanceForm.value.efficiencyClass,
        this.performanceForm.value.horsePower,
        this.performanceForm.value.motorRPM,
        efficiency,
        this.performanceForm.value.motorVoltage,
        this.performanceForm.value.fullLoadAmps,
        loadFactor
      );
      return results.motor_current;
    } else {
      return 0;
    }
  }

  calculatePowerFactor(loadFactor: number) {
    if (this.checkForm()) {
      let efficiency = this.psatService.getEfficiencyFromForm(this.performanceForm);
      let results = this.psatService.motorPerformance(
        this.performanceForm.value.frequency,
        this.performanceForm.value.efficiencyClass,
        this.performanceForm.value.horsePower,
        this.performanceForm.value.motorRPM,
        efficiency,
        this.performanceForm.value.motorVoltage,
        this.performanceForm.value.fullLoadAmps,
        loadFactor
      );
      return results.motor_power_factor;
    } else {
      return 0;
    }
  }

  checkForm() {
    if (this.performanceForm.controls.frequency.status == 'VALID' &&
      this.performanceForm.controls.horsePower.status == 'VALID' &&
      this.performanceForm.controls.motorRPM.status == 'VALID' &&
      this.performanceForm.controls.efficiencyClass.status == 'VALID' &&
      this.performanceForm.controls.motorVoltage.status == 'VALID' &&
      this.performanceForm.controls.fullLoadAmps.status == 'VALID'
    ) {
      if (this.performanceForm.value.efficiencyClass == 'Specified') {
        if (
          this.performanceForm.controls.efficiencyClassSpecified.status == 'VALID' &&
          this.performanceForm.controls.efficiencyClass.status == 'VALID'
        ) {
          return true;
        }
      } else {
        return true;
      }
    }
  }

  drawGraph() {
    this.motorPerformanceResults.efficiency = this.calculateEfficiency(1);
    this.motorPerformanceResults.motor_current = this.calculateCurrent(1);
    this.motorPerformanceResults.motor_power_factor = this.calculatePowerFactor(1);
  }

}
