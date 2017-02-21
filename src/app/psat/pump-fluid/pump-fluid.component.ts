import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { PSAT } from '../../shared/models/psat';

@Component({
  selector: 'app-pump-fluid',
  templateUrl: './pump-fluid.component.html',
  styleUrls: ['./pump-fluid.component.css']
})
export class PumpFluidComponent implements OnInit {
  @Input()
  psatForm: any;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    //this.pumpFluidForm = this.initForm();
  }

/*  initForm(){
    return this.formBuilder.group({
      'pumpType': [''],
      'pumpRPM': [''],
      'drive': [''],
      'viscosity': [0],
      'gravity': [''],
      'stages': [0],
      'fixedSpeed': ['']
    })
  }*/

  add(num: number){
    num++;
  }

  subtract(num: number){
    num--
  }

}
