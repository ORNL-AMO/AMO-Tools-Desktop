import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-fan-motor-help',
  templateUrl: './fan-motor-help.component.html',
  styleUrls: ['./fan-motor-help.component.css']
})
export class FanMotorHelpComponent implements OnInit {
  @Input()
  currentField: string;

  constructor() { }

  ngOnInit() {
  }


}
