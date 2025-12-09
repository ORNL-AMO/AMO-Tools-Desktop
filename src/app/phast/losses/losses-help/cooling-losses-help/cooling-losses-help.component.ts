import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { environment } from '../../../../../environments/environment';
@Component({
    selector: 'app-cooling-losses-help',
    templateUrl: './cooling-losses-help.component.html',
    styleUrls: ['./cooling-losses-help.component.css'],
    standalone: false
})
export class CoolingLossesHelpComponent implements OnInit {
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
