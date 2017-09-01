import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
@Component({
  selector: 'app-nema-energy-efficiency-form',
  templateUrl: './nema-energy-efficiency-form.component.html',
  styleUrls: ['./nema-energy-efficiency-form.component.css']
})
export class NemaEnergyEfficiencyFormComponent implements OnInit {
  @Input()
  nemaForm: any;
  @Input()
  settings: Settings;

  horsePowers: Array<string> = ['5', '7.5', '10', '15', '20', '25', '30', '40', '50', '60', '75', '100', '125', '150', '200', '250', '300', '350', '400', '450', '500', '600', '700', '800', '900', '1000', '1250', '1750', '2000', '2250', '2500', '3000', '3500', '4000', '4500', '5000', '5500', '6000', '7000', '8000', '9000', '10000', '11000', '12000', '13000', '14000', '15000', '16000', '17000', '18000', '19000', '20000', '22500', '25000', '27500', '30000', '35000', '40000', '45000', '50000'];
  
  kWatts: Array<string> = ['3', '3.7', '4', '4.5', '5.5', '6', '7.5', '9.2', '11', '13', '15', '18.5', '22', '26', '30', '37', '45', '55', '75', '90', '110', '132', '150', '160', '185', '200', '225', '250', '280', '300', '315', '335', '355', '400', '450', '500', '560', '630', '710', '800', '900', '1000', '1250', '1500', '1750', '2000', '2250', '2500', '3000', '3500', '4000', '4500', '5000', '5500', '6000', '7000', '8000', '9000', '10000', '11000', '12000', '13000', '14000', '15000', '16000', '17000', '18000', '19000', '20000', '22500', '25000', '27500', '30000', '35000', '40000'];

  frequencies: Array<string> = [
    '50 Hz',
    '60 Hz'
  ];

  efficiencyClasses: Array<string> = [
    'Standard Efficiency',
    'Energy Efficient',
    // When the user chooses specified, they need a place to put the efficiency value
    'Specified'
  ];
  efficiencyError: string = null;
  options: Array<any>;
  constructor() { }

  ngOnInit() {
    if(this.settings.powerMeasurement == 'hp'){
      this.options = this.horsePowers;
    }else{
      this.options = this.kWatts;
    }
  }

  addNum(str: string) {
    if (str == 'motorRPM') {
      this.nemaForm.value.motorRPM++;
    }
  }

  subtractNum(str: string) {
    if (str == 'motorRPM') {
      if (this.nemaForm.value.motorRPM != 1) {
        this.nemaForm.value.motorRPM--;
      }
    }
  }



  checkEfficiency() {
    if (this.nemaForm.value.efficiency > 100) {
      this.efficiencyError = "Unrealistic efficiency, shouldn't be greater then 100%";
      return false;
    }
    else if (this.nemaForm.value.efficiency == 0) {
      this.efficiencyError = "Cannot have 0% efficiency";
      return false;
    }
    else if (this.nemaForm.value.efficiency < 0) {
      this.efficiencyError = "Cannot have negative efficiency";
      return false;
    }
    else {
      this.efficiencyError = null;
      return true;
    }
  }
}
