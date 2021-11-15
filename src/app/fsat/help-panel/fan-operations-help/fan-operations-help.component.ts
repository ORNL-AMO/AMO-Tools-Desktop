import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-fan-operations-help',
  templateUrl: './fan-operations-help.component.html',
  styleUrls: ['./fan-operations-help.component.css']
})
export class FanOperationsHelpComponent implements OnInit {
  @Input()
  currentField: string;

  constructor() { }

  ngOnInit() {
  }

}
