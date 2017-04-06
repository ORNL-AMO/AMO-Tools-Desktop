import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { PsatService } from '../psat.service';
import { PSAT } from '../../shared/models/psat';

@Component({
  selector: 'app-motor',
  templateUrl: './motor.component.html',
  styleUrls: ['./motor.component.css']
})
export class MotorComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Input()
  saveClicked: boolean;
  @Input()
  isValid: boolean;
  @Output('saved')
  saved = new EventEmitter<boolean>();
  @Input()
  selected: boolean;

  efficiencyClasses: Array<string> = [
    'Standard Efficiency',
    'Energy Efficient',
    // When the user chooses specified, they need a place to put the efficiency value
    'Specified'
  ];

  horsePowers: Array<number> = [5, 7.5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1250, 1750, 2000, 2250, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 22500, 25000, 27500, 30000, 35000, 40000, 45000, 50000];
  kWatts: Array<number> = [3, 3.7, 4, 4.5, 5.5, 6, 7.5, 9.2, 11, 13, 15, 18.5, 22, 26, 30, 37, 45, 55, 75, 90, 110, 132, 150, 160, 185, 200, 225, 250, 280, 300, 315, 335, 355, 400, 450, 500, 560, 630, 710, 800, 900, 1000, 1250, 1500, 1750, 2000, 2250, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 22500, 25000, 27500, 30000, 35000, 40000];

  frequencies: Array<string> = [
    '50 Hz',
    '60 Hz'
  ];

  psatForm: any;
  isFirstChange: boolean = true;
  constructor(private psatService: PsatService) { }

  ngOnInit() {
    this.psatForm = this.psatService.getFormFromPsat(this.psat.inputs);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.isFirstChange) {
      if (changes.saveClicked) {
        this.savePsat(this.psatForm);
      }
    }
    else {
      this.isFirstChange = false;
    }
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

  focusField(str: string) {
    this.changeField.emit(str);
  }

  savePsat(form: any) {
    this.isValid = this.psatService.isMotorFormValid(form);
    if (this.isValid) {
      this.psat.inputs = this.psatService.getPsatInputsFromForm(form);
      this.saved.emit(this.selected);
    }
  }
}
