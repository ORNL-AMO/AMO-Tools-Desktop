import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-operating-hours',
  templateUrl: 'operating-hours.component.html',
  styleUrls: ['operating-hours.component.css']
})
export class OperatingHoursComponent implements OnInit {
  @Output('continue')
  continue = new EventEmitter<string>();

  hoursForm: any;
  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.hoursForm = this.initForm();
  }

  initForm(){
    return this.formBuilder.group({
      'weeksPerYear': [''],
      'daysPerWeek': [''],
      'shiftsPerDay': [''],
      'hoursPerShift': [''],
      'totalHoursPerYear': [''],
    })
  }

  saveContinue(){
    //TODO: Save Logic

    this.continue.emit('losses');
  }

  back(){
    this.continue.emit('system-basics');
  }

}
