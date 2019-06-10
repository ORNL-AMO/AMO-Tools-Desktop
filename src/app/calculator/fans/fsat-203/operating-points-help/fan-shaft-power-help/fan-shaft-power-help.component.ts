import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-fan-shaft-power-help',
  templateUrl: './fan-shaft-power-help.component.html',
  styleUrls: ['./fan-shaft-power-help.component.css']
})
export class FanShaftPowerHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
