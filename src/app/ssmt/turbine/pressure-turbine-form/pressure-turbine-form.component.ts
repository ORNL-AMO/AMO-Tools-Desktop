import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-pressure-turbine-form',
  templateUrl: './pressure-turbine-form.component.html',
  styleUrls: ['./pressure-turbine-form.component.css']
})
export class PressureTurbineFormComponent implements OnInit {
  @Input()
  turbineForm: FormGroup;
  @Input()
  selected: boolean;
  @Input()
  settings: Settings;
  @Input()
  turbineTitle: string;

  constructor() { }

  ngOnInit() {
  }

  save(){

  }

  focusField(){

  }

  focusOut(){
    
  }

}
