import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-extended-surface-losses-help',
    templateUrl: './extended-surface-losses-help.component.html',
    styleUrls: ['./extended-surface-losses-help.component.css'],
    standalone: false
})
export class ExtendedSurfaceLossesHelpComponent implements OnInit {
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
