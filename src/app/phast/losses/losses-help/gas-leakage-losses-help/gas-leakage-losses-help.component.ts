import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-gas-leakage-losses-help',
    templateUrl: './gas-leakage-losses-help.component.html',
    styleUrls: ['./gas-leakage-losses-help.component.css'],
    standalone: false
})
export class GasLeakageLossesHelpComponent implements OnInit {
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
