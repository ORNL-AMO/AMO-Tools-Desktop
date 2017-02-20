import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-pump-fluid',
  templateUrl: './pump-fluid.component.html',
  styleUrls: ['./pump-fluid.component.css']
})
export class PumpFluidComponent implements OnInit {
  @Output('continue')
  continue = new EventEmitter<string>();

  pumpFluidForm: any;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.pumpFluidForm = this.initForm();
  }

  initForm(){
    return this.formBuilder.group({
      'pumpType': [''],
      'pumpRPM': [''],
      'drive': [''],
      'viscosity': [''],
      'gravity': [''],
      'stages': [''],
      'fixedSpeed': ['']
    })
  }

  saveContinue(){
    //TODO: Save Logic

    this.continue.emit('motor');
  }

  back(){
    this.continue.emit('system-basics');
  }
}
