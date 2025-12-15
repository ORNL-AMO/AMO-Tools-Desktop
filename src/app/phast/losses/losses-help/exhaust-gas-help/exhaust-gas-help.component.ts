import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { environment } from '../../../../../environments/environment';
@Component({
    selector: 'app-exhaust-gas-help',
    templateUrl: './exhaust-gas-help.component.html',
    styleUrls: ['./exhaust-gas-help.component.css'],
    standalone: false
})
export class ExhaustGasHelpComponent implements OnInit {
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
