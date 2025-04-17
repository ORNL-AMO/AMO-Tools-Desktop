import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-charge-material-help',
    templateUrl: './charge-material-help.component.html',
    styleUrls: ['./charge-material-help.component.css'],
    standalone: false
})
export class ChargeMaterialHelpComponent implements OnInit {
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
