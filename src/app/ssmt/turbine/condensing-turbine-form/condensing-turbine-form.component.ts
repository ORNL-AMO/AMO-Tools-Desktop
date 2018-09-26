import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-condensing-turbine-form',
  templateUrl: './condensing-turbine-form.component.html',
  styleUrls: ['./condensing-turbine-form.component.css']
})
export class CondensingTurbineFormComponent implements OnInit {
  @Input()
  turbineForm: FormGroup;
  @Input()
  selected: boolean;
  @Input()
  settings: Settings;

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
