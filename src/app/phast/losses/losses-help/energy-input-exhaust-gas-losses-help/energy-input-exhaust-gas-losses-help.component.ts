import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-energy-input-exhaust-gas-losses-help',
    templateUrl: './energy-input-exhaust-gas-losses-help.component.html',
    styleUrls: ['./energy-input-exhaust-gas-losses-help.component.css'],
    standalone: false
})
export class EnergyInputExhaustGasLossesHelpComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  currentField: string;
  displaySuggestions: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  toggleSuggestions() {
    this.displaySuggestions = !this.displaySuggestions;
  }

}
