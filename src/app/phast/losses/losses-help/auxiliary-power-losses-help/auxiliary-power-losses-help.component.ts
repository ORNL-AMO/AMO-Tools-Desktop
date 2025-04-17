import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-auxiliary-power-losses-help',
    templateUrl: './auxiliary-power-losses-help.component.html',
    styleUrls: ['./auxiliary-power-losses-help.component.css'],
    standalone: false
})
export class AuxiliaryPowerLossesHelpComponent implements OnInit {
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
