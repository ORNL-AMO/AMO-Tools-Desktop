import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-gas-density-help',
  templateUrl: './gas-density-help.component.html',
  styleUrls: ['./gas-density-help.component.css']
})
export class GasDensityHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
