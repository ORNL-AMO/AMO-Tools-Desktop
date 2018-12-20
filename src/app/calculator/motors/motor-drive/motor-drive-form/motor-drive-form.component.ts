import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { MotorDriveInputs } from '../motor-drive.component';
import { FormGroup } from '@angular/forms';
import { MotorDriveService } from '../motor-drive.service';

@Component({
  selector: 'app-motor-drive-form',
  templateUrl: './motor-drive-form.component.html',
  styleUrls: ['./motor-drive-form.component.css']
})
export class MotorDriveFormComponent implements OnInit {
  @Input()
  data: MotorDriveInputs;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<MotorDriveInputs>();
  @Output('changeField')
  changeField = new EventEmitter<string>();

  form: FormGroup;

  horsePowers: Array<number> = [5, 7.5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1250, 1750, 2000, 2250, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 22500, 25000, 27500, 30000, 35000, 40000, 45000, 50000];

  constructor(private motorDriveServce: MotorDriveService) { }

  ngOnInit() {
    this.form = this.motorDriveServce.getFormFromObj(this.data);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data) {
      this.form = this.motorDriveServce.getFormFromObj(this.data);
    }
  }


  calculate() {
    this.data = this.motorDriveServce.getObjFromForm(this.form);
    this.emitCalculate.emit(this.data);
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }
}
