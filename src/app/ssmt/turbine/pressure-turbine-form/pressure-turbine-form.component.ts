import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../../shared/models/settings';
import { Quantity } from '../../../shared/models/steam';
import { PressureTurbineOperationTypes } from '../../../shared/models/ssmt';

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

  turbineTypeOptions: Array<Quantity>;
  constructor() {
  }

  ngOnInit() {
    this.turbineTypeOptions = PressureTurbineOperationTypes;
  }

  save() {

  }

  focusField() {

  }

  focusOut() {

  }

}
