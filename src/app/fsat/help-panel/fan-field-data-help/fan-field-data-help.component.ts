import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-fan-field-data-help',
  templateUrl: './fan-field-data-help.component.html',
  styleUrls: ['./fan-field-data-help.component.css']
})
export class FanFieldDataHelpComponent implements OnInit {
  @Input()
  currentField: string;

  constructor() { }

  ngOnInit() {
  }

}
