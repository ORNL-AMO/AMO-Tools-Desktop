import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-flow-pressures-help',
  templateUrl: './flow-pressures-help.component.html',
  styleUrls: ['./flow-pressures-help.component.css']
})
export class FlowPressuresHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
