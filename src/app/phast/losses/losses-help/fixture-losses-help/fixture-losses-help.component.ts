import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-fixture-losses-help',
    templateUrl: './fixture-losses-help.component.html',
    styleUrls: ['./fixture-losses-help.component.css'],
    standalone: false
})
export class FixtureLossesHelpComponent implements OnInit {
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
