import { Component, OnInit, Input } from '@angular/core';
import { FanEfficiencyInputs } from '../fan-efficiency.component';
import { Settings } from 'http2';

@Component({
  selector: 'app-fan-efficiency-form',
  templateUrl: './fan-efficiency-form.component.html',
  styleUrls: ['./fan-efficiency-form.component.css']
})
export class FanEfficiencyFormComponent implements OnInit {
  @Input()
  inputs: FanEfficiencyInputs;
  @Input()
  settings: Settings;

  constructor() { }

  ngOnInit() {
  }

}
