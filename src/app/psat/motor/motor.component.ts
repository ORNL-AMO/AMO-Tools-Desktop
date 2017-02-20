import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder } from '@angular/forms';
@Component({
  selector: 'app-motor',
  templateUrl: './motor.component.html',
  styleUrls: ['./motor.component.css']
})
export class MotorComponent implements OnInit {
  @Output('continue')
  continue = new EventEmitter<string>();

  motorForm: any;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.motorForm = this.initForm();
  }

  initForm(){
    return this.formBuilder.group({
      'frequency': [''],
      'horsePower': [''],
      'motorRPM': [''],
      'efficiencyClass': [''],
      'voltage': [''],
      'fullLoadAmps': [''],
      'sizeMargin': ['']
    })
  }

  saveContinue(){
    //TODO: Save Logic

    this.continue.emit('field-data');
  }

  back(){
    this.continue.emit('pump-fluid');
  }

}
