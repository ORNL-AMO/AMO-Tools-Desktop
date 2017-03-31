import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-motor',
  templateUrl: './motor.component.html',
  styleUrls: ['./motor.component.css']
})
export class MotorComponent implements OnInit {
  @Input()
  psatForm: any;
  @Output('changeField')
  changeField = new EventEmitter<string>();

  efficiencyClasses: Array<string> = [
    'Standard Efficiency',
    'Energy Efficient',
    // When the user chooses specified, they need a place to put the efficiency value
    'Specified'
  ];

  frequencies: Array<string> = [
    '50 Hz',
    '60 Hz'
  ];

  constructor() { }

  ngOnInit() {
  }

  addNum(str: string) {
    if (str == 'motorRPM') {
      this.psatForm.value.motorRPM++;
    } else if (str == 'sizeMargin') {
      this.psatForm.value.sizeMargin++;
    }
  }

  subtractNum(str: string) {
    if (str == 'motorRPM') {
      if (this.psatForm.value.motorRPM != 0) {
        this.psatForm.value.motorRPM--;
      }
    } else if (str == 'sizeMargin') {
      if (this.psatForm.value.sizeMargin != 0) {
        this.psatForm.value.sizeMargin--;
      }
    }
  }

  focusField(str: string){
    this.changeField.emit(str);
  }
}
