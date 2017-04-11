import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { PSAT } from '../../shared/models/psat';
import { Assessment } from '../../shared/models/assessment';

@Component({
  selector: 'app-psat-report',
  templateUrl: './psat-report.component.html',
  styleUrls: ['./psat-report.component.css']
})
export class PsatReportComponent implements OnInit {
  @Input()
  assessment: Assessment;
  @Output('closeReport')
  closeReport = new EventEmitter();
  constructor() { }

  ngOnInit() {
    this.setOutputs();
  }

  closeAssessment() {
    this.closeReport.emit(true);
  }

  //TEMP FOR DEMO
  setOutputs() {
    // this.assessment.psat.outputs = {
    //   pump_efficiency: 0,
    //   motor_rated_power: 0,
    //   motor_shaft_power: 0,
    //   pump_shaft_power: 0,
    //   motor_efficiency: 0,
    //   motor_power_factor: 0,
    //   motor_current: 0,
    //   motor_power: 0,
    //   annual_energy: 0,
    //   annual_cost: 0
    // }
    // this.assessment.psat.modifications.forEach(modification => {
    //   modification.psat.outputs = {
    //     pump_efficiency: 0,
    //     motor_rated_power: 0,
    //     motor_shaft_power: 0,
    //     pump_shaft_power: 0,
    //     motor_efficiency: 0,
    //     motor_power_factor: 0,
    //     motor_current: 0,
    //     motor_power: 0,
    //     annual_energy: 0,
    //     annual_cost: 0
    //   }
    // })
  }
}
