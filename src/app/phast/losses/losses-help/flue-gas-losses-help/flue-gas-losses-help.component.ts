import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-flue-gas-losses-help',
    templateUrl: './flue-gas-losses-help.component.html',
    styleUrls: ['./flue-gas-losses-help.component.css'],
    standalone: false
})
export class FlueGasLossesHelpComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  currentField: string;
  displaySuggestions: boolean = false;

  docsLink: string = environment.measurDocsUrl;
  constructor() { }

  ngOnInit() {
  }

  toggleSuggestions() {
    this.displaySuggestions = !this.displaySuggestions;
  }
}
