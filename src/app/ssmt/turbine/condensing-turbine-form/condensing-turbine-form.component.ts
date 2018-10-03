import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../../shared/models/settings';
import { Quantity } from '../../../shared/models/steam/steam-inputs';
import { CondensingTurbineOperationTypes } from '../../../shared/models/steam/ssmt';

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

  turbineOptionTypes: Array<Quantity>;
  constructor() { 
  }

  ngOnInit() {
    this.turbineOptionTypes = CondensingTurbineOperationTypes;
  }

  save(){

  }

  focusField(){

  }

  focusOut(){
    
  }
}
