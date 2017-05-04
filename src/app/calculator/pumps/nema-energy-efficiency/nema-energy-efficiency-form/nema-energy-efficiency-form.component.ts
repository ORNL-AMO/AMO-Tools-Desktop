import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-nema-energy-efficiency-form',
  templateUrl: './nema-energy-efficiency-form.component.html',
  styleUrls: ['./nema-energy-efficiency-form.component.css']
})
export class NemaEnergyEfficiencyFormComponent implements OnInit {
  @Input()
  nemaForm: any;
  
  horsePowers: Array<string> = ['5', '7.5', '10', '15', '20', '25', '30', '40', '50', '60', '75', '100', '125', '150', '200', '250', '300', '350', '400', '450', '500', '600', '700', '800', '900', '1000', '1250', '1750', '2000', '2250', '2500', '3000', '3500', '4000', '4500', '5000', '5500', '6000', '7000', '8000', '9000', '10000', '11000', '12000', '13000', '14000', '15000', '16000', '17000', '18000', '19000', '20000', '22500', '25000', '27500', '30000', '35000', '40000', '45000', '50000'];

  frequencies: Array<string> = [
    '50',
    '60'
  ];

  efficiencyClasses: Array<string> = [
    'Standard Efficiency',
    'Energy Efficient',
    // When the user chooses specified, they need a place to put the efficiency value
    'Specified'
  ];
  constructor() { }

  ngOnInit() {

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

}
