import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-energy-input-exhaust-gas-losses-help',
  templateUrl: './energy-input-exhaust-gas-losses-help.component.html',
  styleUrls: ['./energy-input-exhaust-gas-losses-help.component.css']
})
export class EnergyInputExhaustGasLossesHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
