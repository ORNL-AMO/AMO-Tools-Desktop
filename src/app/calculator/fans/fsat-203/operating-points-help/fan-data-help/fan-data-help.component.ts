import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-fan-data-help',
  templateUrl: './fan-data-help.component.html',
  styleUrls: ['./fan-data-help.component.css']
})
export class FanDataHelpComponent implements OnInit {
  @Input()
  currentField: string;
  @Input()
  currentPlane: string;
  constructor() { }

  ngOnInit() {
  }

}
