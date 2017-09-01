import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PsatService } from '../../../../psat/psat.service';
import { Settings } from '../../../../shared/models/settings';
@Component({
  selector: 'app-motor-performance-form',
  templateUrl: './motor-performance-form.component.html',
  styleUrls: ['./motor-performance-form.component.css']
})
export class MotorPerformanceFormComponent implements OnInit {
  @Input()
  performanceForm: any;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Input()
  settings: Settings;

  horsePowers: Array<string> = ['5', '7.5', '10', '15', '20', '25', '30', '40', '50', '60', '75', '100', '125', '150', '200', '250', '300', '350', '400', '450', '500', '600', '700', '800', '900', '1000', '1250', '1750', '2000', '2250', '2500', '3000', '3500', '4000', '4500', '5000', '5500', '6000', '7000', '8000', '9000', '10000', '11000', '12000', '13000', '14000', '15000', '16000', '17000', '18000', '19000', '20000', '22500', '25000', '27500', '30000', '35000', '40000', '45000', '50000'];

  kWatts: Array<string> = ['3', '3.7', '4', '4.5', '5.5', '6', '7.5', '9.2', '11', '13', '15', '18.5', '22', '26', '30', '37', '45', '55', '75', '90', '110', '132', '150', '160', '185', '200', '225', '250', '280', '300', '315', '335', '355', '400', '450', '500', '560', '630', '710', '800', '900', '1000', '1250', '1500', '1750', '2000', '2250', '2500', '3000', '3500', '4000', '4500', '5000', '5500', '6000', '7000', '8000', '9000', '10000', '11000', '12000', '13000', '14000', '15000', '16000', '17000', '18000', '19000', '20000', '22500', '25000', '27500', '30000', '35000', '40000'];

  frequencies: Array<string> = [
    '50 Hz',
    '60 Hz'
  ];

  options: Array<any>;

  efficiencyClasses: Array<string> = [
    'Standard Efficiency',
    'Energy Efficient',
    // When the user chooses specified, they need a place to put the efficiency value
    'Specified'
  ];
  efficiencyError: string=null;
  tmpFrequency: string;
  tmpHorsePower: string;
  tmpMotorRpm: number;
  tmpEfficiencyClass: string;

  tmpEfficiency: number;
  tmpMotorVoltage: number;
  tmpFullLoadAmps: number;
  constructor(private psatService: PsatService) { }

  ngOnInit() {
    if (this.performanceForm) {
      this.tmpFrequency = this.performanceForm.value.frequency;
      this.tmpHorsePower = this.performanceForm.value.horsePower;
      this.tmpEfficiencyClass = this.performanceForm.value.efficiencyClass;
      this.tmpEfficiency = this.performanceForm.value.efficiency;
      this.tmpMotorVoltage = this.performanceForm.value.motorVoltage;
      this.tmpFullLoadAmps = this.performanceForm.value.fullLoadAmps;
      this.tmpMotorRpm = this.performanceForm.value.motorRPM
    }
    if (this.settings.powerMeasurement == 'hp') {
      this.options = this.horsePowers;
    } else {
      this.options = this.kWatts;
    }
  }

  emitChange() {
    this.performanceForm.patchValue({
      frequency: this.tmpFrequency,
      horsePower: this.tmpHorsePower,
      efficiencyClass: this.tmpEfficiencyClass,
      efficiency: this.tmpEfficiency,
      motorVoltage: this.tmpMotorVoltage,
      fullLoadAmps: this.tmpFullLoadAmps,
      motorRPM: this.tmpMotorRpm
    })
    this.calculate.emit(true);
  }

  addNum(str: string) {
    if (str == 'motorRPM') {
      if (this.tmpMotorRpm) {
        this.tmpMotorRpm++;
        this.emitChange();
      } else {
        this.tmpMotorRpm = 1;
        this.emitChange();
      }
    }
  }

  subtractNum(str: string) {
    if (str == 'motorRPM' && this.tmpMotorRpm) {
      if (this.tmpMotorRpm != 0) {
        this.tmpMotorRpm--;
        this.emitChange();
      }
    }
  }
  checkEfficiency() {
    if (this.tmpEfficiency > 100) {
      this.efficiencyError = "Unrealistic efficiency, shouldn't be greater then 100%";
      return false;
    }
    else if (this.tmpEfficiency == 0) {
      this.efficiencyError = "Cannot have 0% efficiency";
      return false;
    }
    else if (this.tmpEfficiency < 0) {
      this.efficiencyError = "Cannot have negative efficiency";
      return false;
    }
    else {
      this.efficiencyError = null;
      return true;
    }
  }
}
