import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';


@Component({
    selector: 'app-stack-loss-help',
    templateUrl: './stack-loss-help.component.html',
    styleUrls: ['./stack-loss-help.component.css'],
    standalone: false
})
export class StackLossHelpComponent implements OnInit {
  @Input()
  currentField: string;
  displaySuggestions: boolean = false;
  @Input()
  settings: Settings;

  constructor() { }

  ngOnInit() {
  }

  toggleSuggestions() {
    this.displaySuggestions = !this.displaySuggestions;
  }
}
