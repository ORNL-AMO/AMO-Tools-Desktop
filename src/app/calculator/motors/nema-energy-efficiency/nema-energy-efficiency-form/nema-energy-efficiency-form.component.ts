import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
@Component({
  selector: 'app-nema-energy-efficiency-form',
  templateUrl: './nema-energy-efficiency-form.component.html',
  styleUrls: ['./nema-energy-efficiency-form.component.css']
})
export class NemaEnergyEfficiencyFormComponent implements OnInit {
  @Input()
  nemaForm: FormGroup;
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

  efficiencyClasses: Array<string> = [
    'Standard Efficiency',
    'Energy Efficient',
    'Premium',
    'Specified'
  ];
  efficiencyError: string = null;
  options: Array<any>;
  constructor() { }

  ngOnInit() {
    this.modifyPowerArrays();
  }

  addNum(str: string) {
    if (str == 'motorRPM') {
      this.nemaForm.patchValue({
        'motorRPM': this.nemaForm.controls.motorRPM.value + 1
      })
    }
  }

  subtractNum(str: string) {
    if (str == 'motorRPM') {
      if (this.nemaForm.controls.motorRPM.value != 1) {
        this.nemaForm.patchValue({
          'motorRPM': this.nemaForm.controls.motorRPM.value - 1
        })
      }
    }
  }

  checkEfficiency() {
    if (this.nemaForm.controls.efficiency.value > 100) {
      this.efficiencyError = "Unrealistic efficiency, shouldn't be greater then 100%";
      return false;
    }
    else if (this.nemaForm.controls.efficiency.value == 0) {
      this.efficiencyError = "Cannot have 0% efficiency";
      return false;
    }
    else if (this.nemaForm.controls.efficiency.value < 0) {
      this.efficiencyError = "Cannot have negative efficiency";
      return false;
    }
    else {
      this.efficiencyError = null;
      return true;
    }
  }

  modifyPowerArrays() {
    if (this.nemaForm.controls.efficiencyClass.value === 'Premium') {
        if (this.settings.powerMeasurement === 'hp') {
          if (this.nemaForm.controls.horsePower.value > 500) {
            this.nemaForm.patchValue({
              'horsePower': this.horsePowersPremium[this.horsePowersPremium.length - 1]
            });
          }
          this.options = this.horsePowersPremium;
        } else {
          if (this.nemaForm.controls.horsePower.value > 355) {
            this.nemaForm.patchValue({
              'horsePower': this.kWattsPremium[this.kWattsPremium.length - 1]
            });
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
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }
}
