import { Component, OnInit, Input } from '@angular/core';
import { PneumaticValve } from '../../../../shared/models/standalone';

@Component({
  selector: 'app-flow-factor-form',
  templateUrl: './flow-factor-form.component.html',
  styleUrls: ['./flow-factor-form.component.css']
})
export class FlowFactorFormComponent implements OnInit {
  @Input()
  inputs: PneumaticValve;
  
  constructor() { }

  ngOnInit() {
  }

}
