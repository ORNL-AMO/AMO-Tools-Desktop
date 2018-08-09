import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PsatService } from '../../../../psat/psat.service';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-motor-performance-form',
  templateUrl: './motor-performance-form.component.html',
  styleUrls: ['./motor-performance-form.component.css']
})
export class MotorPerformanceFormComponent implements OnInit {
  @Input()
  performanceForm: FormGroup;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Input()
  settings: Settings;
  @Output('changeField')
  changeField = new EventEmitter<string>();

  horsePowers: Array<string> = ['5', '7.5', '10', '15', '20', '25', '30', '40', '50', '60', '75', '100', '125', '150', '200', '250', '300', '350', '400', '450', '500', '600', '700', '800', '900', '1000', '1250', '1750', '2000', '2250', '2500', '3000', '3500', '4000', '4500', '5000', '5500', '6000', '7000', '8000', '9000', '10000', '11000', '12000', '13000', '14000', '15000', '16000', '17000', '18000', '19000', '20000', '22500', '25000', '27500', '30000', '35000', '40000', '45000', '50000'];
  horsePowersPremium: Array<string> = ['5', '7.5', '10', '15', '20', '25', '30', '40', '50', '60', '75', '100', '125', '150', '200', '250', '300', '350', '400', '450', '500'];

  kWatts: Array<string> = ['3', '3.7', '4', '4.5', '5.5', '6', '7.5', '9.2', '11', '13', '15', '18.5', '22', '26', '30', '37', '45', '55', '75', '90', '110', '132', '150', '160', '185', '200', '225', '250', '280', '300', '315', '335', '355', '400', '450', '500', '560', '630', '710', '800', '900', '1000', '1250', '1500', '1750', '2000', '2250', '2500', '3000', '3500', '4000', '4500', '5000', '5500', '6000', '7000', '8000', '9000', '10000', '11000', '12000', '13000', '14000', '15000', '16000', '17000', '18000', '19000', '20000', '22500', '25000', '27500', '30000', '35000', '40000'];
  kWattsPremium: Array<string> = ['3', '3.7', '4', '4.5', '5.5', '6', '7.5', '9.2', '11', '13', '15', '18.5', '22', '26', '30', '37', '45', '55', '75', '90', '110', '132', '150', '160', '185', '200', '225', '250', '280', '300', '315', '335', '355'];

  frequencies: Array<string> = [
    '50 Hz',
    '60 Hz'
  ];

  options: Array<any>;

  efficiencyClasses: Array<string> = [
    'Standard Efficiency',
    'Energy Efficient',
    'Premium Efficient',
    'Specified'
  ];


  constructor(private psatService: PsatService) {
  }

  ngOnInit() {
    if (this.settings.powerMeasurement == 'hp') {
      this.options = this.horsePowers;
    } else {
      this.options = this.kWatts;
    }
    this.setRpmValidation();
  }

  modifyPowerArrays() {
    if (this.performanceForm.controls.efficiencyClass.value === 'Premium Efficient') {
      if (this.settings.powerMeasurement === 'hp') {
        if (this.performanceForm.controls.horsePower.value > 500) {
          this.performanceForm.patchValue({
            horsePower: this.horsePowersPremium[this.horsePowersPremium.length - 1]
          })
        }
        this.options = this.horsePowersPremium;
      } else {
        if (this.performanceForm.controls.horsePower.value > 355) {
          this.performanceForm.patchValue({
            horsePower: this.kWattsPremium[this.kWattsPremium.length - 1]
          })
        }
        this.options = this.kWattsPremium;
      }
    } else {
      if (this.settings.powerMeasurement === 'hp') {
        this.options = this.horsePowers;
      } else {
        this.options = this.kWatts;
      }
    }

    if(this.performanceForm.controls.efficiencyClass.value == 'Specified'){
      this.performanceForm.controls.efficiency.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
    }
    this.setRpmValidation();
  }

  changePowerArrays() {
    this.modifyPowerArrays();
    this.emitChange();
  }

  emitChange() {
    this.calculate.emit(true);
  }

  calculateFullLoadAmps() {
    let tmpFullLoadAmps: number = this.psatService.estFLA(
      this.performanceForm.controls.horsePower.value,
      this.performanceForm.controls.motorRPM.value,
      this.performanceForm.controls.frequency.value,
      this.performanceForm.controls.efficiencyClass.value,
      this.performanceForm.controls.efficiency.value,
      this.performanceForm.controls.motorVoltage.value,
      this.settings
    );
    this.performanceForm.patchValue({
      fullLoadAmps: tmpFullLoadAmps
    })
    this.emitChange();
  }

  setRpmValidation() {
    if (this.performanceForm.controls.efficiencyClass.value == 'Standard Efficiency' || this.performanceForm.controls.efficiencyClass.value == 'Energy Efficient') {
      if (this.performanceForm.controls.frequency.value == '60 Hz') {
        this.performanceForm.controls.motorRPM.setValidators([Validators.required, Validators.min(540)]);
        this.performanceForm.controls.motorRPM.reset(this.performanceForm.controls.motorRPM.value);
        if (this.performanceForm.controls.motorRPM.value) {
          this.performanceForm.controls.motorRPM.markAsDirty();
        }
      } else if (this.performanceForm.controls.frequency.value == '50 Hz') {
        this.performanceForm.controls.motorRPM.setValidators([Validators.required, Validators.min(450)]);
        this.performanceForm.controls.motorRPM.reset(this.performanceForm.controls.motorRPM.value);
        if (this.performanceForm.controls.motorRPM.value) {
          this.performanceForm.controls.motorRPM.markAsDirty();
        }
      }
    } else if (this.performanceForm.controls.efficiencyClass.value == 'Premium Efficient') {
      if (this.performanceForm.controls.frequency.value == '60 Hz') {
        this.performanceForm.controls.motorRPM.setValidators([Validators.required, Validators.min(1080)]);
        this.performanceForm.controls.motorRPM.reset(this.performanceForm.controls.motorRPM.value);
        if (this.performanceForm.controls.motorRPM.value) {
          this.performanceForm.controls.motorRPM.markAsDirty();
        }
      } else if (this.performanceForm.controls.frequency.value == '50 Hz') {
        this.performanceForm.controls.motorRPM.setValidators([Validators.required, Validators.min(900)]);
        this.performanceForm.controls.motorRPM.reset(this.performanceForm.controls.motorRPM.value);
        if (this.performanceForm.controls.motorRPM.value) {
          this.performanceForm.controls.motorRPM.markAsDirty();
        }
      }
    }

  }

  focusField(str: string) {
    this.changeField.emit(str);
  }
}
