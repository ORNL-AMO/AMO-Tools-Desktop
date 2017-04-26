import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PsatService } from '../../../../psat/psat.service';
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

  horsePowers: Array<string> = ['5', '7.5', '10', '15', '20', '25', '30', '40', '50', '60', '75', '100', '125', '150', '200', '250', '300', '350', '400', '450', '500', '600', '700', '800', '900', '1000', '1250', '1750', '2000', '2250', '2500', '3000', '3500', '4000', '4500', '5000', '5500', '6000', '7000', '8000', '9000', '10000', '11000', '12000', '13000', '14000', '15000', '16000', '17000', '18000', '19000', '20000', '22500', '25000', '27500', '30000', '35000', '40000', '45000', '50000'];


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

  constructor(private psatService: PsatService) { }

  ngOnInit() {

  }

  emitChange() {
    this.calculate.emit(true);
  }

  addNum(str: string) {
    if (str == 'motorRPM') {
      this.performanceForm.value.motorRPM++;
    }
  }

  subtractNum(str: string) {
    if (str == 'motorRPM') {
      if (this.performanceForm.value.motorRPM != 0) {
        this.performanceForm.value.motorRPM--;
      }
    }
  }

  getFullLoadAmps() {
    let tmpEfficiency = this.psatService.getEfficiencyFromForm(this.performanceForm);
    let estEfficiency = this.psatService.estFLA(
      this.performanceForm.value.horsePower,
      this.performanceForm.value.motorRPM,
      this.performanceForm.value.frequency,
      this.performanceForm.value.efficiencyClass,
      tmpEfficiency,
      this.performanceForm.value.motorVoltage
    );
    this.performanceForm.patchValue({
      fullLoadAmps: estEfficiency
    });
  }

}
