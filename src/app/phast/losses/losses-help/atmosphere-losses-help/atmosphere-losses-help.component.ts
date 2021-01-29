import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-atmosphere-losses-help',
  templateUrl: './atmosphere-losses-help.component.html',
  styleUrls: ['./atmosphere-losses-help.component.css']
})
export class AtmosphereLossesHelpComponent implements OnInit {
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
